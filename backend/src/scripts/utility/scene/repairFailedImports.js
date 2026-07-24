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

	class GraphStore {
		constructor(map, totalParents) {
			this.map = map;
			this.status = new Uint8Array(map.size); // 0 unknown, 1 referenced, 2 not referenced, 3 visiting
			this.parentsStart = new Uint32Array(map.size);
			this.parentsSize = new Uint32Array(map.size);
			this.parents = new Uint32Array(totalParents);
			this.parentsChecked = new Uint8Array(map.size);
			this.totalParents = 0;
		}

		setStatus(i, s) { this.status[i] = s; }

		checkedParents(i) { return this.parentsChecked[i]; }

		setCheckedParents(i) { this.parentsChecked[i] = 1; }

		isResolved(i) { return this.status[i] === 1 || this.status[i] === 2; }

		isReferenced(i) { return this.status[i] === 1; }

		isUnknown(i) { return this.status[i] === 0; }

		getIndex(key) { return this.map.get(key); }

		resetParents(i) {
			this.parentsStart[i] = this.totalParents;
			this.parentsSize[i] = 0;
		}

		addParent(i, key) {
			const start = this.parentsStart[i];
			const offset = this.parentsSize[i];
			const index = this.map.get(key);
			if (index === undefined) return;
			this.parents[start + offset] = index;
			this.parentsSize[i]++;
			this.totalParents++;
		}

		hasParents(i) { return this.parentsSize[i] > 0; }

		pushUnknownParents(nodeIndex, stack) {
			const start = this.parentsStart[nodeIndex];
			const end = start + this.parentsSize[nodeIndex];
			for (let i = start; i < end; i++) {
				const parent = this.parents[i];
				if (this.isUnknown(parent)) {
					stack.push(parent);
				}
			}
		}

		hasReferencedParent(nodeIndex) {
			const start = this.parentsStart[nodeIndex];
			const end = start + this.parentsSize[nodeIndex];
			for (let i = start; i < end; i++) {
				const parent = this.parents[i];
				if (this.isReferenced(parent)) {
					return true;
				}
			}
			return false;
		}

		size() { return this.map.size; }
	}

	let store;

	// Prime the contiguous arrays to hold the graph
	{
		logger.logInfo('\t\tPriming graph store...');

		let totalNodes = 0;
		let totalParents = 0;

		const cursor = await findCursor(
			teamspace,
			`${container}.scene`,
			{ rev_id: revision },
			{ _id: 0, shared_id: 1, parents: 1 },
		);

		const map = new Map();

		for await (const document of cursor) {
			totalParents += document.parents ? document.parents.length : 0;
			map.set(getUUIDKey(document.shared_id), totalNodes++);
		}

		store = new GraphStore(map, totalParents);

		logger.logInfo(`\t\tRead ${store.size()} nodes from database.`);
	}

	// Run the query again to dereference the parents
	{
		logger.logInfo('\t\tDereferencing parents...');

		const cursor = await findCursor(
			teamspace,
			`${container}.scene`,
			{ rev_id: revision },
			{ _id: 0, shared_id: 1, parents: 1 },
		);

		for await (const document of cursor) {
			const node = store.getIndex(getUUIDKey(document.shared_id));
			store.resetParents(node);
			if (document.parents) {
				for (const parent of document.parents) {
					store.addParent(node, getUUIDKey(parent));
				}
			}
		}
	}

	logger.logInfo('\t\tSetting initial conditions...');

	const root = store.getIndex(getUUIDKey(rootSharedId));
	store.setStatus(root, 1);

	logger.logInfo('\t\tResolving...');

	const stack = [];
	const resolveNode = (node) => {
		if (store.isResolved(node)) {
			return store.isReferenced(node);
		}

		stack.push(node);

		while (stack.length) {
			const currentNode = stack[stack.length - 1];

			if (store.isResolved(currentNode)) {
				stack.pop();
			} else if (!store.hasParents(currentNode)) {
				store.setStatus(currentNode, 2);
				stack.pop();
			} else if (!store.checkedParents(currentNode)) {
				store.setStatus(currentNode, 3);
				store.setCheckedParents(currentNode);
				store.pushUnknownParents(currentNode, stack);
			} else {
				const isReferenced = store.hasReferencedParent(currentNode);
				store.setStatus(currentNode, isReferenced ? 1 : 2);
				stack.pop();
			}
		}

		return store.isReferenced(node);
	};

	const unreferencedNodes = [];
	for (const [key, value] of store.map) {
		if (!resolveNode(value)) {
			unreferencedNodes.push(getUUIDFromKey(key));
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
