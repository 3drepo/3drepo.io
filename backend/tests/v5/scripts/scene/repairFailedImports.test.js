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

const { determineTestGroup } = require('../../helper/utils');
const { db: { reset: resetDB }, generateRandomString, generateRandomBuffer } = require('../../helper/services');
const { utilScripts, src } = require('../../helper/path');

const stashFiles = new Map(); // Map of "${teamspace}/${collection}/${path}" -> content
jest.doMock(`${src}/utils/logger`);
jest.doMock(`${src}/services/filesManager`, () => ({
	// eslint-disable-next-line require-await
	getFile: async (teamspace, collection, path) => {
		const key = `${teamspace}/${collection}/${path}`;
		if (stashFiles.has(key)) {
			return stashFiles.get(key);
		}
		throw new Error(`Stash file not found: ${key}`);
	},
}));

const { disconnect, insertMany, find } = require(`${src}/handler/db`);
const { generateUUID, UUIDToString } = require(`${src}/utils/helper/uuids`);
const RepairFailedImports = require(`${utilScripts}/scene/repairFailedImports`);

/**
 * Builds a connected scene graph with realistic multi-level hierarchy
 * Emulates asymmetric behaviour where nodes have multiple parents across multiple levels
 * @param {string} rootId - The root node shared_id
 * @param {number} iterations - Number of levels to create
 * @param {number} nodesPerIteration - Nodes to add per level
 * @param {number} maxParents - Max parent references per node
 * @returns {Array} Array of node objects
 */
const buildConnectedNodes = (rootId, iterations = 3, nodesPerIteration = 4, maxParents = 100) => {
	const nodes = [{ shared_id: rootId, parents: [] }];

	for (let i = 0; i < iterations; i++) {
		const existingIds = nodes.map((n) => n.shared_id);
		for (let j = 0; j < nodesPerIteration; j++) {
			// Pick a random number of parents (1 to maxParents) from any existing node
			const parentCount = 1 + Math.floor(Math.random() * maxParents);
			const shuffled = [...existingIds].sort(() => Math.random() - 0.5);
			const parents = shuffled.slice(0, Math.min(parentCount, shuffled.length));
			nodes.push({ shared_id: generateUUID(), parents });
		}
	}

	return nodes;
};

/**
 * Creates a history entry for a revision
 * @param {string} teamspace - Teamspace name
 * @param {string} container - Container name
 * @param {Object} options - Configuration options
 * @param {boolean} options.incomplete - Whether to mark revision as incomplete
 * @returns {Object} Object with revisionId and revUUID
 */
const createRevisionHistory = async (teamspace, container, { incomplete = false } = {}) => {
	const revisionId = generateUUID();

	const historyDoc = { _id: revisionId };
	if (incomplete) {
		historyDoc.incomplete = 2;
	}
	await insertMany(teamspace, `${container}.history`, [historyDoc]);

	return { revisionId };
};

/**
 * Adds a successful import (connected nodes) to a revision
 * @param {string} teamspace - Teamspace name
 * @param {string} container - Container name
 * @param {Buffer} revisionId - Revision UUID
 * @returns {Object} Object with nodeIds (shared_ids) and counts
 */
const addSuccessfulImport = async (teamspace, container, revisionId) => {
	const rootId = generateUUID();
	const connectedNodes = buildConnectedNodes(rootId);
	const sceneNodesWithRev = connectedNodes.map((node) => {
		const nodeDoc = {
			_id: generateUUID(),
			shared_id: node.shared_id,
			rev_id: revisionId,
		};
		// Only include parents field if there are parents (script queries for $exists: false)
		if (node.parents && node.parents.length > 0) {
			nodeDoc.parents = node.parents;
		}
		return nodeDoc;
	});

	await insertMany(teamspace, `${container}.scene`, sceneNodesWithRev);

	return {
		nodeIds: sceneNodesWithRev.map((n) => n.shared_id),
		nodeCount: connectedNodes.length,
		orphanCount: 0,
	};
};

/**
 * Adds a failed import (orphaned nodes) to a revision
 * @param {string} teamspace - Teamspace name
 * @param {string} container - Container name
 * @param {Buffer} revisionId - Revision UUID
 * @param {number} orphanCount - Number of orphaned nodes to add
 * @returns {Object} Object with orphanIds (shared_ids) and counts
 */
const addFailedImport = async (teamspace, container, revisionId, orphanCount = 5) => {
	const orphanNodes = [];
	for (let i = 0; i < orphanCount; i++) {
		orphanNodes.push({
			_id: generateUUID(),
			shared_id: generateUUID(),
			parents: [generateUUID()],
			rev_id: revisionId,
		});
	}

	if (orphanNodes.length > 0) {
		await insertMany(teamspace, `${container}.scene`, orphanNodes);
	}

	return {
		orphanIds: orphanNodes.map((n) => n.shared_id),
		nodeCount: 0,
		orphanCount: orphanNodes.length,
	};
};

/**
 * Creates a complete revision by layering import states
 * Only the first import's nodes are marked as good; all subsequent imports' nodes are marked as orphans
 * For multi-import scenarios, stores the first import's root node in stash for getFile to find
 * @param {string} teamspace - Teamspace name
 * @param {string} container - Container name
 * @param {Array<Function>} imports - Array of import builder functions
 * @param {Object} options - Configuration options
 * @param {boolean} options.incomplete - Whether to mark revision as incomplete
 * @returns {Object} Revision object with all metadata and node tracking for testing
 */
const createRevision = async (teamspace, container, imports = [], { incomplete = false } = {}) => {
	const { revisionId } = await createRevisionHistory(teamspace, container, { incomplete });

	const goodNodeIds = [];
	const orphanNodeIds = [];
	let goodNodeCount = 0;
	let orphanCount = 0;

	const stashKey = `${teamspace}/${container}.stash.json_mpc.ref/${UUIDToString(revisionId)}/fulltree.json`;

	for (let i = 0; i < imports.length; i++) {
		const importFn = imports[i];
		// eslint-disable-next-line no-await-in-loop
		const result = await importFn(teamspace, container, revisionId);

		if (i === 0) {
			// First import: all nodes are good
			// Track the root node for stash file to emulate the final import
			if (result.nodeIds && result.nodeIds.length > 0) {
				const fullTreeContent = {
					nodes: {
						shared_id: UUIDToString(result.nodeIds[0]),
					},
				};
				stashFiles.set(stashKey, JSON.stringify(fullTreeContent));
			}
			if (result.nodeIds) {
				goodNodeIds.push(...result.nodeIds);
			}
			goodNodeCount += result.nodeCount;
			// orphanIds from first import still go to orphans
			if (result.orphanIds) {
				orphanNodeIds.push(...result.orphanIds);
			}
			orphanCount += result.orphanCount;
		} else {
			// Subsequent imports: all nodes are orphaned
			if (result.nodeIds) {
				orphanNodeIds.push(...result.nodeIds);
			}
			if (result.orphanIds) {
				orphanNodeIds.push(...result.orphanIds);
			}
			orphanCount += result.nodeCount + result.orphanCount;
		}
	}

	return {
		teamspace,
		container,
		revisionId,
		goodNodeCount,
		orphanCount,
		goodNodeIds,
		orphanNodeIds,
		stashKey,
	};
};

/**
 * Verifies that a revision was repaired (orphaned nodes removed)
 * @param {Object} revision - Revision object with teamspace, container, revisionId, goodNodeIds, orphanNodeIds
 */
const checkRevisionRepaired = async (revision) => {
	const nodes = await find(revision.teamspace, `${revision.container}.scene`, { rev_id: revision.revisionId });

	// Convert all IDs to strings for comparison
	const remainingIds = nodes.map((n) => UUIDToString(n.shared_id));
	const expectedGoodIds = revision.goodNodeIds.map((id) => UUIDToString(id));
	const expectedOrphanIds = revision.orphanNodeIds.map((id) => UUIDToString(id));

	// Verify all remaining nodes are good nodes
	for (const nodeId of remainingIds) {
		expect(expectedGoodIds).toContain(nodeId);
	}

	// Verify all orphan nodes are gone
	for (const orphanId of expectedOrphanIds) {
		expect(remainingIds).not.toContain(orphanId);
	}

	// Verify we have the right count
	expect(nodes.length).toBe(revision.goodNodeCount);
};

/**
 * Verifies that a revision was not modified
 * @param {Object} revision - Revision object with teamspace, container, revisionId, goodNodeIds, orphanNodeIds
 */
const checkRevisionUntouched = async (revision) => {
	const nodes = await find(revision.teamspace, `${revision.container}.scene`, { rev_id: revision.revisionId });

	// Convert all IDs to strings for comparison
	const nodeIds = nodes.map((n) => UUIDToString(n.shared_id));
	const expectedGoodIds = revision.goodNodeIds.map((id) => UUIDToString(id));
	const expectedOrphanIds = revision.orphanNodeIds.map((id) => UUIDToString(id));

	// Verify all good nodes are still there
	for (const goodId of expectedGoodIds) {
		expect(nodeIds).toContain(goodId);
	}

	// Verify all orphan nodes are still there
	for (const orphanId of expectedOrphanIds) {
		expect(nodeIds).toContain(orphanId);
	}

	// Verify we have the right count
	expect(nodes.length).toBe(revision.goodNodeCount + revision.orphanCount);
};

/**
 * Sets up test data with multiple containers and scenarios by composing different import states
 * Creates the same scenarios in both teamspaces to test multi-teamspace behavior
 * @returns {Object} Test data object with revision objects
 */
const setupData = async () => {
	const teamspace1 = `teamspace_${generateRandomString()}`;
	const teamspace2 = `teamspace_${generateRandomString()}`;

	const createScenarios = async (teamspace) => {
		// Scenario 1: Clean container (successful import only)
		const cleanRevision = await createRevision(
			teamspace,
			`clean_${generateRandomString()}`,
			[
				(ts, c, rev) => addSuccessfulImport(ts, c, rev),
			],
		);

		// Scenario 2: Corrupted container (successful import + failed import with orphans)
		const corruptedRevision = await createRevision(
			teamspace,
			`corrupted_${generateRandomString()}`,
			[
				(ts, c, rev) => addSuccessfulImport(ts, c, rev),
				(ts, c, rev) => addFailedImport(ts, c, rev, 5),
			],
		);

		// Scenario 3: Mixed container (2 revisions: one clean, one corrupted)
		const mixedContainer = `mixed_${generateRandomString()}`;
		const mixedCleanRevision = await createRevision(
			teamspace,
			mixedContainer,
			[
				(ts, c, rev) => addSuccessfulImport(ts, c, rev),
			],
		);
		const mixedCorruptedRevision = await createRevision(
			teamspace,
			mixedContainer,
			[
				(ts, c, rev) => addSuccessfulImport(ts, c, rev),
				(ts, c, rev) => addFailedImport(ts, c, rev, 3),
			],
		);

		// Scenario 4: Incomplete container (should not be processed)
		const incompleteRevision = await createRevision(
			teamspace,
			`incomplete_${generateRandomString()}`,
			[
				(ts, c, rev) => addSuccessfulImport(ts, c, rev),
				(ts, c, rev) => addFailedImport(ts, c, rev, 4),
			],
			{ incomplete: true },
		);

		// Scenario 5: Multiple roots container (two successful imports)
		const multiRootRevision = await createRevision(
			teamspace,
			`multiroot_${generateRandomString()}`,
			[
				(ts, c, rev) => addSuccessfulImport(ts, c, rev),
				(ts, c, rev) => addSuccessfulImport(ts, c, rev),
			],
		);

		// Scenario 6: A revision with only failed imports (no root nodes)
		const noRootRevision = await createRevision(
			teamspace,
			`noroot_${generateRandomString()}`,
			[
				(ts, c, rev) => addFailedImport(ts, c, rev),
			],
		);

		// Scenario 7: A revision with a corrupted fulltree response
		const corruptTreeRevision = await createRevision(
			teamspace,
			`noroot_${generateRandomString()}`,
			[
				(ts, c, rev) => addSuccessfulImport(ts, c, rev),
				(ts, c, rev) => addSuccessfulImport(ts, c, rev),

			],
		);

		stashFiles.set(corruptTreeRevision.stashKey, generateRandomBuffer(100));

		return {
			cleanRevision,
			corruptedRevision,
			mixedCleanRevision,
			mixedCorruptedRevision,
			incompleteRevision,
			multiRootRevision,
			noRootRevision,
			corruptTreeRevision,
		};
	};

	const teamspace1Scenarios = await createScenarios(teamspace1);
	const teamspace2Scenarios = await createScenarios(teamspace2);

	return {
		teamspace1: {
			...teamspace1Scenarios,
			teamspace: teamspace1,
		},
		teamspace2: {
			...teamspace2Scenarios,
			teamspace: teamspace2,
		},
	};
};

const runTest = () => {
	describe('Repair failed imports', () => {
		let data;

		beforeEach(async () => {
			await resetDB();
			stashFiles.clear(); // Clear stash files from previous tests
			data = await setupData();
		});

		test('Should scope to a specific teamspace when one is provided', async () => {
			await RepairFailedImports.run(data.teamspace1.teamspace);
			// Verify all teamspace1 corrupted revisions are repaired
			await checkRevisionRepaired(data.teamspace1.corruptedRevision);
			await checkRevisionRepaired(data.teamspace1.mixedCorruptedRevision);
			await checkRevisionRepaired(data.teamspace1.multiRootRevision);
			// Verify teamspace1 clean revisions untouched
			await checkRevisionUntouched(data.teamspace1.cleanRevision);
			await checkRevisionUntouched(data.teamspace1.mixedCleanRevision);
			await checkRevisionUntouched(data.teamspace1.incompleteRevision);
			// Verify teamspace2 completely untouched
			await checkRevisionUntouched(data.teamspace2.cleanRevision);
			await checkRevisionUntouched(data.teamspace2.corruptedRevision);
			await checkRevisionUntouched(data.teamspace2.mixedCleanRevision);
			await checkRevisionUntouched(data.teamspace2.mixedCorruptedRevision);
			await checkRevisionUntouched(data.teamspace2.incompleteRevision);
			await checkRevisionUntouched(data.teamspace2.multiRootRevision);
			// Revisions with irrecoverable issues should be ignored
			await checkRevisionUntouched(data.teamspace2.noRootRevision);
			await checkRevisionUntouched(data.teamspace1.noRootRevision);
			await checkRevisionUntouched(data.teamspace2.corruptTreeRevision);
			await checkRevisionUntouched(data.teamspace1.corruptTreeRevision);
		});

		test('Should scope to a specific container when one is provided', async () => {
			await RepairFailedImports.run(
				data.teamspace1.teamspace,
				data.teamspace1.mixedCorruptedRevision.container,
			);
			// Verify only the specified container was modified
			await checkRevisionRepaired(data.teamspace1.mixedCorruptedRevision);
			// Verify other containers in same teamspace untouched
			await checkRevisionUntouched(data.teamspace1.cleanRevision);
			await checkRevisionUntouched(data.teamspace1.mixedCleanRevision);
			await checkRevisionUntouched(data.teamspace1.corruptedRevision);
			await checkRevisionUntouched(data.teamspace1.incompleteRevision);
			await checkRevisionUntouched(data.teamspace1.multiRootRevision);
			// Verify entire teamspace2 untouched
			await checkRevisionUntouched(data.teamspace2.cleanRevision);
			await checkRevisionUntouched(data.teamspace2.corruptedRevision);
			await checkRevisionUntouched(data.teamspace2.mixedCleanRevision);
			await checkRevisionUntouched(data.teamspace2.mixedCorruptedRevision);
			await checkRevisionUntouched(data.teamspace2.incompleteRevision);
			await checkRevisionUntouched(data.teamspace2.multiRootRevision);
		});

		test('Should process all teamspaces when no teamspace is specified', async () => {
			await RepairFailedImports.run();
			// Verify both teamspaces have identical repairs
			await checkRevisionRepaired(data.teamspace1.corruptedRevision);
			await checkRevisionRepaired(data.teamspace1.mixedCorruptedRevision);
			await checkRevisionRepaired(data.teamspace1.multiRootRevision);
			await checkRevisionRepaired(data.teamspace2.corruptedRevision);
			await checkRevisionRepaired(data.teamspace2.mixedCorruptedRevision);
			await checkRevisionRepaired(data.teamspace2.multiRootRevision);
			// Verify all clean/unchanged revisions remain untouched in both teamspaces
			await checkRevisionUntouched(data.teamspace1.cleanRevision);
			await checkRevisionUntouched(data.teamspace1.mixedCleanRevision);
			await checkRevisionUntouched(data.teamspace1.incompleteRevision);
			await checkRevisionUntouched(data.teamspace2.cleanRevision);
			await checkRevisionUntouched(data.teamspace2.mixedCleanRevision);
			await checkRevisionUntouched(data.teamspace2.incompleteRevision);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
