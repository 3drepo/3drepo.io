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
 * This script will only clean up the scene collection. It will not clean up
 * zombie stash files, if bouncer failed during bundle generation. It will also
 * not delete any ref nodes or their binaries on disk - a separate script must
 * be used for that.
 */

const { v5Path } = require('../../../interop');
const { getProjectList } = require('../../../v5/models/projectSettings');
const { getRevisions } = require('../../../v5/models/revisions');
const { getNodesByQuery, getNodesBySharedIds } = require('../../../v5/models/scenes');

const { logger } = require(`${v5Path}/utils/logger`);
const { getTeamspaceList, getCollectionsEndsWith } = require('../../utils');

const Path = require('path');

const { deleteMany } = require(`${v5Path}/handler/db`);
const { getFile } = require(`${v5Path}/services/filesManager`);
const { UUIDToString, stringToUUID } = require(`${v5Path}/utils/helper/uuids`);

const getReferencedIdsFromHierarchy = async (teamspace, project, container, revision, rootSharedId) => {
	const allNodes = await getNodesByQuery(
		teamspace,
		project,
		container,
		{ rev_id: revision },
		{ shared_id: 1, parents: 1 },
	);

	const childrenOf = new Map();
	for (const node of allNodes) {
		const id = UUIDToString(node.shared_id);
		if (node.parents?.length) {
			for (const parent of node.parents) {
				const parentId = UUIDToString(parent);
				if (!childrenOf.has(parentId)) {
					childrenOf.set(parentId, []);
				}
				childrenOf.get(parentId).push(id);
			}
		}
	}

	// Traverse from the known-good root node.
	const referencedIds = new Set();
	const queue = [UUIDToString(rootSharedId)];
	while (queue.length) {
		const id = queue.pop();
		if (referencedIds.has(id)) {
			// eslint-disable-next-line no-continue
			continue;
		}
		referencedIds.add(id);
		const children = childrenOf.get(id);
		if (children) {
			queue.push(...children);
		}
	}

	return { allNodes, referencedIds };
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
			const contents = await getFile(
				teamspace,
				`${container}.stash.json_mpc.ref`,
				`${UUIDToString(revision)}/fulltree.json`,
			);
			const fullTree = JSON.parse(contents);
			return stringToUUID(fullTree.nodes.shared_id);
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

	const { allNodes, referencedIds } = await getReferencedIdsFromHierarchy(
		teamspace,
		project,
		container,
		revision,
		rootSharedId,
	);

	// get the set difference — allNodes already contains every node for the
	// revision so no second query is needed.
	const idsToDelete = allNodes
		.filter((node) => !referencedIds.has(UUIDToString(node.shared_id)))
		.map((node) => node.shared_id);

	if (idsToDelete.length === 0) {
		return;
	}

	logger.logInfo(`\t\tRemoving ${idsToDelete.length} orphaned nodes from ${container}/${UUIDToString(revision)}`);

	// Get the blob references to delete
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

	await deleteMany(teamspace, `${container}.scene`, { rev_id: revision, shared_id: { $in: idsToDelete } });
	await deleteMany(teamspace, `${container}.scene.ref`, { _id: { $in: blobRefNames } });
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
		logger.logInfo(`\t- Checking container ${container}`);
		// eslint-disable-next-line no-await-in-loop
		await processContainer(teamspace, projectLookup[container], container);
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
