/**
 *  Copyright (C) 2026 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * This script is used to clean up scene collections where nodes from multiple
 * imports are associated with one revision id. This can happen if an import is
 * run with the same revision id multiple times. For example, automatically
 * re-trying an import if the process fails.
 *
 * The collection is repaired by identifying the root node of the successful
 * import and removing any nodes that are not part of its hierarchy. The
 * revision must contain at least one successful import for this to be possible.
 *
 * Nodes are found by traversal of the parents array, which will capture both
 * the traditional tree but also material and metadata nodes in one go.
 *
 * This script will only clean up the scene collection and associated blob ref
 * files. It will not clean up zombie stash files, if bouncer failed during
 * bundle generation.
 */

const { JSONParser } = require('@streamparser/json-node');
const Mongo = require('mongodb');

const { v5Path } = require('../../../interop');
const { getProjectList } = require('../../../v5/models/projectSettings');
const { getRevisions } = require('../../../v5/models/revisions');
const { getNodesByQuery, getNodesBySharedIds } = require('../../../v5/models/scenes');
const { removeFilesWithMeta } = require('../../../v5/services/filesManager');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const Path = require('path');

const { deleteMany, findCursor } = require(`${v5Path}/handler/db`);
const FilesManager = require(`${v5Path}/services/filesManager`);
const { UUIDToString, stringToUUID } = require(`${v5Path}/utils/helper/uuids`);

const getUUIDKey = (uuid) => uuid.buffer.toString('latin1');
const getUUIDFromKey = (key) => new Mongo.Binary(Buffer.from(key, 'latin1'), 3);

const getUnreferencedIdsFromHierarchy = async (teamspace, project, container, revision, rootSharedId) => {
	logger.logInfo('\t\tReading nodes...');

	if (process.memoryUsage().rss > 1024 * 1024 * 1024 * 1) {
		logger.logInfo(`\t\tForce garbage collection. Before: ${JSON.stringify(process.memoryUsage())}`);
		global.gc();
		logger.logInfo(`\t\tAfter: ${JSON.stringify(process.memoryUsage())}.`);
	}

	const cursor = await findCursor(
		teamspace,
		`${container}.scene`,
		{ rev_id: revision },
		{ _id: 0, shared_id: 1, parents: 1 },
	);

	const allNodes = [];
	for await (const node of cursor) {
		node.status = 0; // 0 unknown, 1 referenced, 2 not referenced, 3 visiting
		node.checkedParents = false;
		if (node.parents) {
			node.parents = node.parents.map((parent_id) => getUUIDKey(parent_id));
		}
		node.shared_id = getUUIDKey(node.shared_id);
		allNodes.push(node);
	}

	logger.logInfo(`\t\tRead ${allNodes.length} nodes from database.`);

	logger.logInfo('\t\tIndexing nodes...');

	const nodeByKey = new Map();
	for (const node of allNodes) {
		nodeByKey.set(node.shared_id, node);
	}

	logger.logInfo('\t\tDereferencing parents...');

	for (const node of allNodes) {
		if (node.parents) {
			node.parents = node.parents.map((parent_key) => nodeByKey.get(parent_key));
		}
	}

	logger.logInfo('\t\tSetting initial conditions...');

	const root = nodeByKey.get(getUUIDKey(rootSharedId));
	root.status = 1;

	logger.logInfo('\t\tResolving...');

	const resolveNode = (node) => {
		if (node.status === 1 || node.status === 2) {
			return node.status === 1;
		}

		const stack = [node];

		while (stack.length) {
			const currentNode = stack[stack.length - 1];

			if (currentNode.status === 1 || currentNode.status === 2) {
				stack.pop();
			} else if (!currentNode?.parents?.length) {
				currentNode.status = 2;
				stack.pop();
			} else if (!currentNode.checkedParents) {
				currentNode.status = 3;
				currentNode.checkedParents = true;

				for (const parent of currentNode.parents) {
					if (parent) {
						if (parent.status !== 1 && parent.status !== 2 && parent.status !== 3) {
							stack.push(parent);
						}
					}
				}
			} else {
				let isReferenced = false;
				for (const parent of currentNode.parents) {
					if (parent?.status === 1) {
						isReferenced = true;
						break;
					}
				}

				currentNode.status = isReferenced ? 1 : 2;
				stack.pop();
			}
		}

		return node.status === 1;
	};

	const unreferencedNodes = [];
	for (const node of allNodes) {
		if (!resolveNode(node)) {
			unreferencedNodes.push(getUUIDFromKey(node.shared_id));
		}
	}

	return { unreferencedNodes };
};

const getRootNodeSharedId = async (teamspace, project, container, revision) => {
	const rootNodes = await getNodesByQuery(
		teamspace,
		project,
		container,
		{ rev_id: revision, parents: { $exists: false } },
		{ shared_id: 1 },
	);

	if (rootNodes.length === 0) {
		logger.logWarning(`\t\tSkipping ${container}/${UUIDToString(revision)}: revision must have at least one successful import.`);
		return null;
	}

	if (rootNodes.length > 1) {
		// If we have multiple root nodes, get the live one from the tree.
		try {
			const { readStream: stream } = await FilesManager.getFileAsStream(
				teamspace,
				`${container}.stash.json_mpc.ref`,
				`${UUIDToString(revision)}/fulltree.json`,
			);

			const parser = new JSONParser({
				paths: ['$.nodes.shared_id'],
			});

			return await new Promise((resolve) => {
				parser.on('data', ({ value }) => {
					stream.destroy();
					resolve(stringToUUID(value));
				});

				parser.on('error', (err) => {
					logger.logWarning(`\t\tSkipping ${container}/${UUIDToString(revision)}: failed to parse fulltree.json (${err})`);
					resolve(null);
				});

				stream.on('error', (err) => {
					logger.logWarning(`\t\tSkipping ${container}/${UUIDToString(revision)}: failed to read fulltree.json (${err})`);
					resolve(null);
				});

				stream
					.pipe(parser)
					.on('end', () => resolve(null));
			});
		} catch (err) {
			logger.logWarning(`\t\tSkipping ${container}/${UUIDToString(revision)}: failed to read/parse fulltree.json (${err})`);
			return null;
		}
	}

	return rootNodes[0].shared_id;
};

const cleanupOrphanedNodesForRevision = async (teamspace, project, container, revision, rootSharedId) => {
	if (!rootSharedId) {
		return;
	}

	logger.logInfo('\t\tFinding ids to delete...');

	const { unreferencedNodes: idsToDelete } = await getUnreferencedIdsFromHierarchy(
		teamspace,
		project,
		container,
		revision,
		rootSharedId,
	);

	if (idsToDelete.length === 0) {
		return;
	}

	logger.logInfo(`\t\tRemoving ${idsToDelete.length} orphaned nodes from ${container}/${UUIDToString(revision)}`);

	// Get the nodes to delete with their blob references
	const nodesToDelete = await getNodesBySharedIds(
		teamspace,
		project,
		container,
		revision,
		idsToDelete,
		{ _blobRef: 1 },
	);
	// eslint-disable-next-line no-underscore-dangle
	const blobRefNames = [...new Set(nodesToDelete.filter((n) => n._blobRef).map((n) => n._blobRef.buffer.name))];

	await Promise.all([
		deleteMany(teamspace, `${container}.scene`, { rev_id: revision, shared_id: { $in: idsToDelete } }),
		removeFilesWithMeta(teamspace, `${container}.scene`, { _id: { $in: blobRefNames } }),
	]);
};

const processRevision = async (teamspace, project, container, revision) => {
	const rootSharedId = await getRootNodeSharedId(teamspace, project, container, revision);
	await cleanupOrphanedNodesForRevision(teamspace, project, container, revision, rootSharedId);
};

const processContainer = async (teamspace, project, container) => {
	const history = await getRevisions(
		teamspace,
		project,
		container,
		'container',
		true,
		{ _id: 1 },
	);
	logger.logInfo(`\t- Checking ${history.length} revisions...`);
	for (const revision of history) {
		// eslint-disable-next-line no-await-in-loop
		await processRevision(teamspace, project, container, revision._id);
	}
};

const processTeamspace = async (teamspace, specificContainer) => {
	// get the projects and create a lookup for each container to project name..
	const projects = await getProjectList(teamspace, {
		_id: 1,
		models: 1,
	});
	const projectLookup = {};
	for (const project of projects) {
		for (const model of project.models) {
			projectLookup[model] = project._id;
		}
	}
	const collections = await getCollectionsEndsWith(teamspace, '.scene');
	for (const { name: collection } of collections) {
		const container = collection.replace('.scene', '');
		if (specificContainer && container !== specificContainer) {
			// eslint-disable-next-line no-continue
			continue;
		}
		const project = projectLookup[container];
		if (!project) {
			logger.logInfo(`\t\t- Skipping ${container} because it does not have a project.`);
			// eslint-disable-next-line no-continue
			continue;
		}
		logger.logInfo(`\t- Checking container ${teamspace} ${UUIDToString(project)} ${container}`);
		// eslint-disable-next-line no-await-in-loop
		await processContainer(teamspace, project, container);
	}
};

const run = async (specificTeamspace, specificContainer) => {
	logger.logInfo('Looking for damaged revisions...');
	const teamspaces = await getTeamspaceList();
	let processed = 0;
	for (const teamspace of teamspaces) {
		if (specificTeamspace && teamspace !== specificTeamspace) {
			// eslint-disable-next-line no-continue
			continue;
		}
		logger.logInfo(`\t-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace, specificContainer);
		logger.logInfo(`Processed ${++processed}/${teamspaces.length} teamspaces`);
	}
	logger.logInfo('Done');
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	const argsSpec = (subYargs) => subYargs.option('teamspace', {
		describe: 'Run on a specific teamspace. If not supplied runs on all teamspaces.',
		type: 'string',
		default: undefined,
	}).option('container', {
		describe: 'Run on a specific container. If not supplied runs on all containers.',
		type: 'string',
		default: undefined,
	});
	return yargs.command(commandName,
		'Repair imports that have multiple root nodes due to overlapping imports',
		argsSpec,
		(argv) => run(argv.teamspace, argv.container));
};

module.exports = {
	run,
	genYargs,
};
