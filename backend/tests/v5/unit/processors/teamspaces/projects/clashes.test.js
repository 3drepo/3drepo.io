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

const { times } = require('lodash');
const { src } = require('../../../../helper/path');

jest.mock('fs', () => ({
	...jest.requireActual('fs'),
	createReadStream: jest.fn(),
}));
const fs = require('fs');
const { PassThrough } = require('stream');

const { generateRandomString, determineTestGroup, generateRandomNumber, generateRandomObject, generateUUID } = require('../../../../helper/services');

jest.mock('../../../../../../src/v5/models/clashes.plans');
const ClashPlansModel = require(`${src}/models/clashes.plans`);

jest.mock('../../../../../../src/v5/models/clashes.runs');
const ClashRunsModel = require(`${src}/models/clashes.runs`);

jest.mock('../../../../../../src/v5/models/scenes');
const ScenesModel = require(`${src}/models/scenes`);

jest.mock('../../../../../../src/v5/services/modelProcessing');
const ModelProcessing = require(`${src}/services/modelProcessing`);

jest.mock('../../../../../../src/v5/processors/teamspaces/projects/models/commons/scenes');
const Scenes = require(`${src}/processors/teamspaces/projects/models/commons/scenes`);

jest.mock('../../../../../../src/v5/processors/teamspaces/projects/models/commons/metadata');
const Metadata = require(`${src}/processors/teamspaces/projects/models/commons/metadata`);

jest.mock('../../../../../../src/v5/models/metadata');
const MetadataModel = require(`${src}/models/metadata`);

jest.mock('../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const { SELF_INTERSECTIONS_CHECK_OPTIONS } = require(`${src}/models/clashes.constants`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { CLASH_PLAN_TYPES } = require(`${src}/models/clashes.constants`);

const RUN_HISTORY_COL = 'clashes.runs.history';

const Clashes = require(`${src}/processors/teamspaces/projects/clashes`);

const testCreatePlan = () => {
	describe('Create Plan', () => {
		test('should call createPlan with the teamspace and data provided', async () => {
			const teamspace = generateRandomString();
			const data = generateRandomString();
			ClashPlansModel.createPlan.mockResolvedValueOnce(data);

			await expect(Clashes.createPlan(teamspace, data)).resolves.toEqual(data);

			expect(ClashPlansModel.createPlan).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.createPlan).toHaveBeenCalledWith(teamspace, data);
		});
	});
};

const testUpdatePlan = () => {
	describe('Update Plan', () => {
		test('should call updatePlan with the teamspace and data provided', async () => {
			const teamspace = generateRandomString();
			const planId = generateRandomString();
			const data = generateRandomString();
			const user = generateRandomString();

			await Clashes.updatePlan(teamspace, planId, data, user);

			expect(ClashPlansModel.updatePlan).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.updatePlan).toHaveBeenCalledWith(teamspace, planId, data, user);
		});
	});
};

const testDeletePlan = () => {
	describe('Delete Plan', () => {
		test('should call deletePlan with the teamspace and data provided', async () => {
			const teamspace = generateRandomString();
			const planId = generateRandomString();

			await Clashes.deletePlan(teamspace, planId);

			expect(ClashPlansModel.deletePlan).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.deletePlan).toHaveBeenCalledWith(teamspace, planId);
		});
	});
};

const testCreateRun = () => {
	const teamspace = generateRandomString();
	const project = generateUUID();
	const userId = generateRandomString();
	const runId = generateRandomString();
	const planData = {
		type: CLASH_PLAN_TYPES[0],
		tolerance: generateRandomNumber(),
		selfIntersectionsCheck: false,
		selectionA: { container: generateRandomString(), revision: generateRandomString() },
		selectionB: { container: generateRandomString(),
			revision: generateRandomString(),
			rules: [generateRandomObject()],
		},
	};
	const parentWithManyMeshes = generateRandomString();
	const externalIds = times(10, () => ({ key: generateRandomString(), values: [generateRandomString()] }));

	const metadata = times(10, (i) => ({ _id: generateRandomString(),
		parents: [generateRandomString()],
		externalId: externalIds[i] }));

	const meshDataObj = {
		nonBimMeshes: times(10, (i) => ({
			_id: generateRandomString(),
			name: i % 2 === 0 ? undefined : generateRandomString(),
			parents: [i % 2 === 0 ? parentWithManyMeshes : generateRandomString()],
		})),
		meshes: times(10, (i) => ({
			_id: generateRandomString(),
			parents: metadata[i].parents,
			externalId: externalIds[i],
		})),
		metadata,
		unwantedMetadata: [],
		unwantedMeshes: [],
	};

	Scenes.getExternalIdsFromMetadata.mockImplementation((metadataArr) => metadataArr[0].externalId);

	const checkStreamContent = (stream, expectedContent) => new Promise((resolve, reject) => {
		const chunks = [];
		stream.on('data', (chunk) => chunks.push(chunk));
		stream.on('error', reject);
		stream.on('end', () => {
			try {
				const content = Buffer.concat(chunks).toString();
				expect(content).toEqual(expectedContent);
				resolve();
			} catch (err) {
				reject(err);
			}
		});
	});

	const generateGroupedMeshes = (container, meshes, unwantedMeshes = []) => {
		const result = {};

		for (const mesh of meshes.filter(({ _id }) => !unwantedMeshes.includes(_id))) {
			const parentId = mesh.name ? mesh._id : UUIDToString(mesh.parents[0]);
			const compositePath = `${container}::${mesh.externalId?.key ?? 'internal'}::${mesh.externalId?.values[0] ?? parentId}`;

			if (!result[compositePath]) {
				result[compositePath] = [];
			}
			result[compositePath].push(mesh._id);
		}

		return Object.entries(result).map(([id, meshIds]) => ({ id, meshIds }));
	};

	describe.each([
		['no meshes found in set A', undefined, { ...meshDataObj, nonBimMeshes: [] }],
		['no meshes found in set B', undefined, { ...meshDataObj, meshes: [], metadata: [] }],
		['plan has selfIntersectionsCheck set to selectionA', { ...planData, selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[0] }],
		['plan has selfIntersectionsCheck set to selectionB', { ...planData, selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[1] }],
		['plan has selfIntersectionsCheck set to true', { ...planData, selfIntersectionsCheck: true }],
		['there are unwanted metadata', undefined, { ...meshDataObj, unwantedMetadata: metadata.slice(2), unwantedMeshes: [meshDataObj.meshes[0]._id, meshDataObj.meshes[1]._id] }],
	])('Create Test Run', (desc, plan = planData, meshData = meshDataObj) => {
		test(`should create and queue the run when ${desc}`, async () => {
			ClashRunsModel.createTestRun.mockResolvedValueOnce(runId);

			// mocks for set A (no rules)
			Metadata.getAllMetadata.mockResolvedValueOnce([]);
			ScenesModel.getNodesByQuery.mockResolvedValueOnce(meshData.nonBimMeshes);
			// mocks for set B (rules)
			MetadataModel.getMetadataByRules.mockResolvedValueOnce(
				{ matched: meshData.metadata, unwanted: meshData.unwantedMetadata });
			if (meshData.metadata.length) {
				ScenesModel.getNodesByQuery.mockResolvedValueOnce(meshData.meshes);
			}
			if (meshData.unwantedMeshes.length) {
				Scenes.getMeshesWithParentIds.mockResolvedValueOnce(meshData.unwantedMeshes);
			}

			await Clashes.createRun(teamspace, project, plan, userId);

			expect(ClashRunsModel.createTestRun).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.createTestRun).toHaveBeenCalledWith(teamspace, plan, userId);
			expect(Metadata.getAllMetadata).toHaveBeenCalledTimes(1);
			expect(MetadataModel.getMetadataByRules).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodesByQuery).toHaveBeenCalledTimes(meshData.metadata.length ? 2 : 1);
			expect(Scenes.getMeshesWithParentIds).toHaveBeenCalledTimes(meshData.unwantedMeshes.length ? 1 : 0);

			const stream = ModelProcessing.queueClashRun.mock.calls[0][3];
			expect(ModelProcessing.queueClashRun).toHaveBeenCalledWith(teamspace, project,
				UUIDToString(runId), stream);

			await checkStreamContent(stream, JSON.stringify({
				type: plan.type,
				tolerance: plan.tolerance,
				selfIntersectsA: plan.selfIntersectionsCheck === true
					|| plan.selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[0],
				selfIntersectsB: plan.selfIntersectionsCheck === true
					|| plan.selfIntersectionsCheck === SELF_INTERSECTIONS_CHECK_OPTIONS[1],
				setA: [{
					teamspace,
					container: plan.selectionA.container,
					revision: UUIDToString(plan.selectionA.revision),
					objects: generateGroupedMeshes(planData.selectionA.container, meshData.nonBimMeshes),
				}],
				setB: [{
					teamspace,
					container: plan.selectionB.container,
					revision: UUIDToString(plan.selectionB.revision),
					objects: generateGroupedMeshes(planData.selectionB.container, meshData.meshes,
						meshData.unwantedMeshes),
				}],
			}));
		});
	});
};

const formatClash = (clash) => ({
	...clash,
	a: { container: clash.a.split('::')[0], idType: clash.a.split('::')[1], id: clash.a.split('::')[2] },
	b: { container: clash.b.split('::')[0], idType: clash.b.split('::')[1], id: clash.b.split('::')[2] },
	index: [clash.a, clash.b].sort().join('-'),
});

const generateClash = () => ({
	a: `${generateRandomString()}::${generateRandomString()}::${generateRandomString()}`,
	b: `${generateRandomString()}::${generateRandomString()}::${generateRandomString()}`,
	...generateRandomObject(),
});

const testCompleteRun = () => {
	describe('Complete Run', () => {
		const fileContent = { clashes: times(10, () => generateClash()) };
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const corId = generateRandomString();
		const resPath = generateRandomString();

		test('should complete run when there are no previous runs', async () => {
			fs.createReadStream.mockImplementationOnce(() => {
				const fakeReadStream = PassThrough();
				fakeReadStream.write(JSON.stringify(fileContent));
				fakeReadStream.end();
				return fakeReadStream;
			});
			ClashRunsModel.getTestRunByQuery.mockRejectedValueOnce(new Error());

			await Clashes.completeRun(teamspace, project, corId, resPath);

			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledWith(teamspace, { _id: corId },
				{ plan: 1, triggeredAt: 1 });
			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();

			const result = { new: fileContent.clashes.map(formatClash), active: [], resolved: [] };
			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, expect.any(String),
				Buffer.from(JSON.stringify(result)));

			expect(ClashRunsModel.completeTestRun).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.completeTestRun).toHaveBeenCalledWith(teamspace, corId,
				FilesManager.storeFile.mock.calls[0][2]);
		});

		test('should categorize clashes and complete run when there are previous runs', async () => {
			const existingClashes = {
				new: times(5, () => generateClash()).map(formatClash),
				active: fileContent.clashes.slice(0, 5).map(formatClash),
				resolved: [],
			};
			const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
			const lastRun = { ...generateRandomObject(), result: generateRandomString() };

			fs.createReadStream.mockImplementationOnce(() => {
				const fakeReadStream = PassThrough();
				fakeReadStream.write(JSON.stringify(fileContent));
				fakeReadStream.end();
				return fakeReadStream;
			});

			FilesManager.getFileAsStream.mockImplementationOnce(() => {
				const fakeReadStream = PassThrough();
				fakeReadStream.write(JSON.stringify(existingClashes));
				fakeReadStream.end();
				return Promise.resolve({ readStream: fakeReadStream });
			});

			ClashRunsModel.getTestRunByQuery.mockResolvedValueOnce(currentRun);
			ClashRunsModel.getTestRunByQuery.mockResolvedValueOnce(lastRun);

			await Clashes.completeRun(teamspace, project, corId, resPath);

			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledTimes(2);
			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledWith(teamspace, { _id: corId },
				{ plan: 1, triggeredAt: 1 });
			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledWith(teamspace, { 'plan._id': currentRun.plan._id, completedAt: { $exists: true } },
				{ result: 1 }, { completedAt: -1 });

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, lastRun.result);

			const result = {
				new: fileContent.clashes.slice(5, 10).map(formatClash),
				active: existingClashes.active,
				resolved: existingClashes.new,
			};

			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, expect.any(String),
				Buffer.from(JSON.stringify(result)));

			expect(ClashRunsModel.completeTestRun).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.completeTestRun).toHaveBeenCalledWith(teamspace, corId,
				FilesManager.storeFile.mock.calls[0][2]);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCreatePlan();
	testUpdatePlan();
	testDeletePlan();
	testCreateRun();
	testCompleteRun();
});
