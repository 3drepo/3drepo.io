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

const { Readable } = require('stream');

const { determineTestGroup } = require('../../helper/utils');
const { db, generateRandomString, generateRevisionEntry, generateBasicNode, generateMeshNode, generateTextureNode } = require('../../helper/services');
const { utilScripts, src, srcV4 } = require('../../helper/path');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { uuidToString } = require(`${srcV4}/utils`);
const Scenes = require(`${src}/models/scenes`);
const FilesManager = require(`${src}/services/filesManager`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);

const { disconnect, find, findCursor } = require(`${src}/handler/db`);
const { generateUUID, UUIDToString } = require(`${src}/utils/helper/uuids`);

// Randomise the order of the returned nodes to fully exercise robustness
// to this, since Mongo does not guarantee nodes are returned in the order
// they are inserted, even though this can often happen.
const originalFindCursor = findCursor;
jest.spyOn(require(`${src}/handler/db`), 'findCursor').mockImplementation(async (...args) => {
	const cursor = await originalFindCursor(...args);
	const nodes = [];
	for await (const node of cursor) {
		nodes.push(node);
	}
	const shuffled = [...nodes].sort(() => Math.random() - 0.5);
	return {
		async* [Symbol.asyncIterator]() {
			for (const node of shuffled) {
				yield node;
			}
		},
	};
});

const { getNodesByQuery } = Scenes;
const RepairFailedImports = require(`${utilScripts}/scene/repairFailedImports`);

const buildRandomNode = (revisionId, parents, i, j) => {
	if (i < j / 3) {
		return generateBasicNode(
			generateRandomString(),
			revisionId,
			parents,
		);
	} if (i < ((j / 3) * 2)) {
		return generateMeshNode(
			revisionId,
			parents,
		);
	}
	return generateTextureNode(
		revisionId,
		parents,
	);
};

// eslint-disable-next-line no-underscore-dangle
const getRefNodeNames = async (teamspace, project, container, nodes) => {
	const nn = await getNodesByQuery(
		teamspace,
		project,
		container,
		{ shared_id: { $in: nodes.map((n) => n.shared_id) } },
		{ _blobRef: 1 },
	);
	// eslint-disable-next-line no-underscore-dangle
	return nn.filter((n) => n._blobRef).map((n) => n._blobRef.buffer.name);
};

const getSharedIds = (nodes) => nodes.map((n) => n.shared_id);

/**
 * Adds a successful import (connected nodes) to a revision
 * @param {string} teamspace - Teamspace name
 * @param {string} project - Project ID
 * @param {string} container - Container name
 * @param {Buffer} revisionId - Revision UUID
 * @returns {Object} Object with nodeIds (shared_ids) and counts
 */
const addSuccessfulImport = async (teamspace, project, container, revisionId) => {
	const iterations = 4;
	const nodesPerIteration = 40;
	const maxParents = 100;
	const nodes = [generateBasicNode('transformation', revisionId, undefined)];
	for (let i = 0; i < iterations; i++) {
		const existingIds = nodes.map((n) => n.shared_id);
		for (let j = 0; j < nodesPerIteration; j++) {
			// Pick a random number of parents (1 to maxParents) from any existing node
			const parentCount = 1 + Math.floor(Math.random() * maxParents);
			const shuffled = [...existingIds].sort(() => Math.random() - 0.5);
			const parents = shuffled.slice(0, Math.min(parentCount, shuffled.length));
			nodes.push(buildRandomNode(revisionId, parents, j, nodesPerIteration));
		}
	}

	await db.createScene(
		teamspace,
		project,
		container,
		revisionId,
		nodes,
		undefined,
	);

	return {
		nodes,
	};
};

/**
 * Adds a failed import (orphaned nodes) to a revision
 * @param {string} teamspace - Teamspace name
 * @param {string} project - Project ID
 * @param {string} container - Container name
 * @param {Buffer} revisionId - Revision UUID
 * @param {number} rootCount - Number of orphaned nodes (no parents at all) to add
 * @param {number} orphanCount - Number of orphaned nodes (parent does not exist) to add
 * @returns {Object} Object with orphanIds (shared_ids) and counts
 */
const addFailedImport = async (teamspace, project, container, revisionId, rootCount = 10, orphanCount = 10) => {
	const nodes = [];
	for (let i = 0; i < rootCount; i++) {
		nodes.push(buildRandomNode(revisionId, undefined, i, rootCount));
	}
	for (let i = 0; i < orphanCount; i++) {
		nodes.push(buildRandomNode(revisionId, [generateUUID()], i, orphanCount));
	}

	await db.createScene(
		teamspace,
		project,
		container,
		revisionId,
		nodes,
		undefined,
	);

	return {
		orphanNodes: nodes,
	};
};

/**
 * Creates a complete revision by layering import states
 * Only the first import's nodes are marked as good; all subsequent imports' nodes are marked as orphans
 * For multi-import scenarios, stores the first import's root node in stash for getFile to find
 * @param {string} teamspace - Teamspace name
 * @param {string} project - Project ID
 * @param {string} container - Container name
 * @param {Array<Function>} imports - Array of import builder functions
 * @param {Object} options - Configuration options
 * @param {boolean} options.incomplete - Whether to mark revision as incomplete
 * @returns {Object} Revision object with all metadata and node tracking for testing
 */
const createRevision = async (
	teamspace,
	project,
	container,
	imports = [],
	{ incomplete = false, void: isVoid = false } = {}) => {
	const revisionEntry = generateRevisionEntry(
		isVoid,
		false,
		modelTypes.CONTAINER,
		new Date(),
		undefined);
	if (incomplete) {
		revisionEntry.incomplete = incomplete;
	}

	await db.createRevision(
		teamspace,
		project,
		container,
		revisionEntry,
		modelTypes.CONTAINER,
	);

	const revisionId = stringToUUID(revisionEntry._id);

	const goodNodeIds = [];
	const orphanNodeIds = [];
	const goodRefNodeNames = [];
	const orphanRefNodeNames = [];

	for (let i = 0; i < imports.length; i++) {
		const importFn = imports[i];
		// eslint-disable-next-line no-await-in-loop
		const result = await importFn(teamspace, project, container, revisionId);

		if (i === 0) {
			// First import: all nodes are good
			// Track the root node for stash file to emulate the final import
			if (result.nodes && result.nodes.length > 0) {
				const fullTreeContent = {
					nodes: {
						shared_id: UUIDToString(result.nodes[0].shared_id),
					},
				};
				// eslint-disable-next-line no-await-in-loop
				await db.addJSONFile(teamspace, container, `${UUIDToString(revisionId)}/fulltree.json`, JSON.stringify(fullTreeContent));
			}
			if (result.nodes) {
				goodNodeIds.push(...getSharedIds(result.nodes));
				// eslint-disable-next-line no-await-in-loop
				goodRefNodeNames.push(...await getRefNodeNames(teamspace, project, container, result.nodes));
			}
			// orphanIds from first import still go to orphans
			if (result.orphanNodes) {
				orphanNodeIds.push(...getSharedIds(result.orphanNodes));
				// eslint-disable-next-line no-await-in-loop
				orphanRefNodeNames.push(...await getRefNodeNames(teamspace, project, container, result.orphanNodes));
			}
		} else {
			// Subsequent imports: all nodes are orphaned
			if (result.nodes) {
				orphanNodeIds.push(...getSharedIds(result.nodes));
				// eslint-disable-next-line no-await-in-loop
				orphanRefNodeNames.push(...await getRefNodeNames(teamspace, project, container, result.nodes));
			}
			if (result.orphanNodes) {
				orphanNodeIds.push(...getSharedIds(result.orphanNodes));
				// eslint-disable-next-line no-await-in-loop
				orphanRefNodeNames.push(...await getRefNodeNames(teamspace, project, container, result.orphanNodes));
			}
		}
	}

	return {
		teamspace,
		project,
		container,
		revisionId,
		goodNodeIds,
		orphanNodeIds,
		goodRefNodeNames,
		orphanRefNodeNames,
	};
};

/**
 * Verifies that a revision was repaired (orphaned nodes removed)
 * @param {Object} revision - Revision object with teamspace, container, revisionId, goodNodeIds, orphanNodeIds
 */
const checkRevisionRepaired = async (revision) => {
	const nodes = await getNodesByQuery(
		revision.teamspace,
		revision.project,
		revision.container,
		{ rev_id: revision.revisionId },
	);

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
	expect(nodes.length).toBe(revision.goodNodeIds.length);

	// Verify ref nodes for orphaned scene nodes are also deleted
	const refNodes = await find(revision.teamspace, `${revision.container}.scene.ref`, {});
	const refNodeNames = refNodes.map((n) => n._id);
	for (const refName of revision.orphanRefNodeNames) {
		expect(refNodeNames).not.toContain(refName);
	}
	// Verify ref nodes for good scene nodes still exist
	for (const refName of revision.goodRefNodeNames) {
		expect(refNodeNames).toContain(refName);
	}
};

/**
 * Verifies that a revision was not modified
 * @param {Object} revision - Revision object with teamspace, container, revisionId, goodNodeIds, orphanNodeIds
 */
const checkRevisionUntouched = async (revision) => {
	const nodes = await getNodesByQuery(
		revision.teamspace,
		revision.project,
		revision.container,
		{ rev_id: revision.revisionId },
	);

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
	expect(nodes.length).toBe(revision.goodNodeIds.length + revision.orphanNodeIds.length);

	// Verify all ref nodes still exist (both good and orphaned)
	const refNodes = await find(revision.teamspace, `${revision.container}.scene.ref`, {});
	const refNodeNames = refNodes.map((n) => n._id);
	for (const refName of revision.goodRefNodeNames) {
		expect(refNodeNames).toContain(refName);
	}
	for (const refName of revision.orphanRefNodeNames) {
		expect(refNodeNames).toContain(refName);
	}
};

/**
 * Sets up test data with multiple containers and scenarios by composing different import states
 * Creates the same scenarios in both teamspaces to test multi-teamspace behavior
 * @returns {Object} Test data object with revision objects
 */
const setupData = async () => {
	const createScenarios = async (teamspace) => {
		// Scenario 1: Clean container (successful import only)
		const cleanRevision = await createRevision(
			teamspace,
			generateUUID(),
			`clean_${generateRandomString()}`,
			[
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),
			],
		);

		// Scenario 2: Corrupted container (successful import + failed import with orphans)
		const corruptedRevision = await createRevision(
			teamspace,
			generateUUID(),
			`corrupted_${generateRandomString()}`,
			[
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),
				(ts, p, c, rev) => addFailedImport(ts, p, c, rev, 5, 5),
			],
		);

		// Scenario 3: Mixed container (2 revisions: one clean, one corrupted)
		const mixedContainer = `mixed_${generateRandomString()}`;
		const mixedProject = generateUUID();
		const mixedCleanRevision = await createRevision(
			teamspace,
			mixedProject,
			mixedContainer,
			[
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),
			],
		);
		const mixedCorruptedRevision = await createRevision(
			teamspace,
			mixedProject,
			mixedContainer,
			[
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),
				(ts, p, c, rev) => addFailedImport(ts, p, c, rev, 3, 3),
			],
		);

		// Scenario 4: Incomplete container (should not be processed)
		const incompleteRevision = await createRevision(
			teamspace,
			generateUUID(),
			`incomplete_${generateRandomString()}`,
			[
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),
				(ts, p, c, rev) => addFailedImport(ts, p, c, rev, 4, 6),
			],
			{ incomplete: true },
		);

		// Scenario 5: Multiple roots container (two successful imports)
		const multiRootRevision = await createRevision(
			teamspace,
			generateUUID(),
			`multiroot_${generateRandomString()}`,
			[
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),
			],
		);

		// Scenario 6: A revision with only failed imports (no root nodes)
		const noRootRevision = await createRevision(
			teamspace,
			generateUUID(),
			`noroot_${generateRandomString()}`,
			[
				(ts, p, c, rev) => addFailedImport(ts, p, c, rev, 0, 10),
			],
		);

		// Scenario 7: A revision with a corrupted fulltree response
		const corruptTreeRevision = await createRevision(
			teamspace,
			generateUUID(),
			`corruptTree_${generateRandomString()}`,
			[
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),

			],
		);
		await db.addJSONFile(
			teamspace,
			corruptTreeRevision.container,
			`${uuidToString(corruptTreeRevision.revisionId)}/fulltree.json`,
			generateRandomString(),
		);

		// Scenario 8: Void revision (marked void but should still be processed)
		const voidRevision = await createRevision(
			teamspace,
			generateUUID(),
			`void_${generateRandomString()}`,
			[
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),
				(ts, p, c, rev) => addFailedImport(ts, p, c, rev, 3, 3),
			],
			{ void: true },
		);

		// Scenario 9: A revision with no project - should be skipped
		const noProjectRevision = await createRevision(
			teamspace,
			generateUUID(),
			`noProject_${generateRandomString()}`,
			[
				(ts, p, c, rev) => addSuccessfulImport(ts, p, c, rev),
				(ts, p, c, rev) => addFailedImport(ts, p, c, rev, 1, 1),
			],
		);

		await Promise.all([
			db.createProject(teamspace, cleanRevision.project, 'Clean Project', [cleanRevision.container]),
			db.createProject(teamspace, corruptedRevision.project, 'Corrupted Project', [corruptedRevision.container]),
			db.createProject(teamspace, mixedCleanRevision.project, 'Mixed Project', [mixedCleanRevision.container]),
			db.createProject(teamspace, incompleteRevision.project, 'Incomplete Project', [incompleteRevision.container]),
			db.createProject(teamspace, multiRootRevision.project, 'MultiRoot Project', [multiRootRevision.container]),
			db.createProject(teamspace, noRootRevision.project, 'NoRoot Project', [noRootRevision.container]),
			db.createProject(teamspace, corruptTreeRevision.project, 'CorruptTree Project', [corruptTreeRevision.container]),
			db.createProject(teamspace, voidRevision.project, 'Void Project', [voidRevision.container]),
		]);

		return {
			cleanRevision,
			corruptedRevision,
			mixedCleanRevision,
			mixedCorruptedRevision,
			incompleteRevision,
			multiRootRevision,
			noRootRevision,
			corruptTreeRevision,
			voidRevision,
			noProjectRevision,
		};
	};

	const teamspace1 = `teamspace_${generateRandomString()}`;
	const teamspace2 = `teamspace_${generateRandomString()}`;

	const [teamspace1Scenarios, teamspace2Scenarios] = await Promise.all([
		createScenarios(teamspace1),
		createScenarios(teamspace2),
	]);

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
			await db.reset();
			data = await setupData();
		});

		test('Should scope to a specific teamspace when one is provided', async () => {
			await RepairFailedImports.run(data.teamspace1.teamspace);
			// Verify all teamspace1 corrupted revisions are repaired
			await checkRevisionRepaired(data.teamspace1.corruptedRevision);
			await checkRevisionRepaired(data.teamspace1.mixedCorruptedRevision);
			await checkRevisionRepaired(data.teamspace1.multiRootRevision);
			await checkRevisionRepaired(data.teamspace1.voidRevision);
			// Verify teamspace1 clean revisions untouched
			await checkRevisionUntouched(data.teamspace1.cleanRevision);
			await checkRevisionUntouched(data.teamspace1.mixedCleanRevision);
			// Verify teamspace2 completely untouched
			await checkRevisionUntouched(data.teamspace2.cleanRevision);
			await checkRevisionUntouched(data.teamspace2.corruptedRevision);
			await checkRevisionUntouched(data.teamspace2.mixedCleanRevision);
			await checkRevisionUntouched(data.teamspace2.mixedCorruptedRevision);
			await checkRevisionUntouched(data.teamspace2.incompleteRevision);
			await checkRevisionUntouched(data.teamspace2.multiRootRevision);
			await checkRevisionUntouched(data.teamspace2.voidRevision);
			// Revisions with irrecoverable issues should be ignored
			await checkRevisionUntouched(data.teamspace1.noRootRevision);
			await checkRevisionUntouched(data.teamspace1.corruptTreeRevision);
			await checkRevisionUntouched(data.teamspace1.incompleteRevision);
			await checkRevisionUntouched(data.teamspace2.noRootRevision);
			await checkRevisionUntouched(data.teamspace2.corruptTreeRevision);
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
			await checkRevisionRepaired(data.teamspace1.voidRevision);
			await checkRevisionRepaired(data.teamspace2.corruptedRevision);
			await checkRevisionRepaired(data.teamspace2.mixedCorruptedRevision);
			await checkRevisionRepaired(data.teamspace2.multiRootRevision);
			await checkRevisionRepaired(data.teamspace2.voidRevision);
			// Verify all clean/unchanged revisions remain untouched in both teamspaces
			await checkRevisionUntouched(data.teamspace1.cleanRevision);
			await checkRevisionUntouched(data.teamspace1.mixedCleanRevision);
			await checkRevisionUntouched(data.teamspace1.incompleteRevision);
			await checkRevisionUntouched(data.teamspace2.cleanRevision);
			await checkRevisionUntouched(data.teamspace2.mixedCleanRevision);
			await checkRevisionUntouched(data.teamspace2.incompleteRevision);
		});

		test('Stream error should skip that collection, leaving it untouched, and fix the others', async () => {
			const streamErrorRevision = data.teamspace1.multiRootRevision;
			const exceptionRevision = data.teamspace2.multiRootRevision;
			const streamErrorCollection = `${streamErrorRevision.container}.stash.json_mpc.ref`;
			const exceptionCollection = `${exceptionRevision.container}.stash.json_mpc.ref`;
			const originalGetFileAsStream = FilesManager.getFileAsStream;
			const getFileAsStreamSpy = jest.spyOn(FilesManager, 'getFileAsStream');

			try {
				getFileAsStreamSpy.mockImplementation((teamspace, collection, filePath) => {
					if (
						teamspace === exceptionRevision.teamspace
						&& collection === exceptionCollection
						&& filePath.endsWith('/fulltree.json')
					) {
						throw new Error('Injected getFileAsStream exception');
					}

					if (
						teamspace === streamErrorRevision.teamspace
						&& collection === streamErrorCollection
						&& filePath.endsWith('/fulltree.json')
					) {
						const readStream = new Readable({
							read() {
								this.push(null);
							},
						});

						// Trigger the stream error path after listeners are attached.
						process.nextTick(() => {
							readStream.emit('error', new Error('Injected stream read error'));
						});

						return { readStream };
					}

					return originalGetFileAsStream.call(FilesManager, teamspace, collection, filePath);
				});

				await RepairFailedImports.run();
			} finally {
				getFileAsStreamSpy.mockRestore();
			}

			// Both targeted collections should be skipped due to injected fulltree read failures.
			await checkRevisionUntouched(data.teamspace1.multiRootRevision);
			await checkRevisionUntouched(data.teamspace2.multiRootRevision);

			// Other reparable revisions should still be repaired.
			await checkRevisionRepaired(data.teamspace1.corruptedRevision);
			await checkRevisionRepaired(data.teamspace1.mixedCorruptedRevision);
			await checkRevisionRepaired(data.teamspace1.voidRevision);
			await checkRevisionRepaired(data.teamspace2.corruptedRevision);
			await checkRevisionRepaired(data.teamspace2.mixedCorruptedRevision);
			await checkRevisionRepaired(data.teamspace2.voidRevision);

			// Non-repairable scenarios should remain untouched.
			await checkRevisionUntouched(data.teamspace1.noRootRevision);
			await checkRevisionUntouched(data.teamspace1.corruptTreeRevision);
			await checkRevisionUntouched(data.teamspace1.incompleteRevision);
			await checkRevisionUntouched(data.teamspace2.noRootRevision);
			await checkRevisionUntouched(data.teamspace2.corruptTreeRevision);
			await checkRevisionUntouched(data.teamspace2.incompleteRevision);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
