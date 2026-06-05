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

const { determineTestGroup } = require('../../../../helper/utils');
const { times } = require('lodash');
const { src } = require('../../../../helper/path');

jest.mock('fs', () => ({
	...jest.requireActual('fs'),
	createReadStream: jest.fn(),
}));
const fs = require('fs');
const { PassThrough } = require('stream');

const { generateRandomString, generateRandomNumber, generateRandomObject, generateUUID } = require('../../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);

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

jest.mock('../../../../../../src/v5/models/metadata');
const MetadataModel = require(`${src}/models/metadata`);

jest.mock('../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

const MailerConstants = require(`${src}/services/mailer/mailer.constants`);

const { SELF_INTERSECTIONS_CHECK_OPTIONS } = require(`${src}/models/clashes.constants`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { CLASH_PLAN_TYPES } = require(`${src}/models/clashes.constants`);
const { CLASH_RUN_STATUS } = require(`${src}/models/clashes.constants`);

const RUN_HISTORY_COL = 'clashes.runs.history';

const Clashes = require(`${src}/processors/teamspaces/projects/clashes`);

const testCreatePlan = () => {
	describe('Create Plan', () => {
		test('should call createPlan with the teamspace and data provided', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const data = generateRandomString();
			const user = generateRandomString();
			ClashPlansModel.createPlan.mockResolvedValueOnce(data);

			await expect(Clashes.createPlan(teamspace, project, data, user)).resolves.toEqual(data);

			expect(ClashPlansModel.createPlan).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.createPlan).toHaveBeenCalledWith(teamspace, project, data, user);
		});
	});
};

const testUpdatePlan = () => {
	describe('Update Plan', () => {
		test('should call updatePlan with the teamspace and data provided', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const planId = generateRandomString();
			const data = generateRandomString();
			const user = generateRandomString();

			await Clashes.updatePlan(teamspace, project, planId, data, user);

			expect(ClashPlansModel.updatePlan).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.updatePlan).toHaveBeenCalledWith(teamspace, project, planId, data, user);
		});
	});
};

const testDeletePlan = () => {
	describe('Delete Plan', () => {
		test('should call deletePlan with the teamspace and data provided', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const planId = generateRandomString();

			await Clashes.deletePlan(teamspace, project, planId);

			expect(ClashPlansModel.deletePlan).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.deletePlan).toHaveBeenCalledWith(teamspace, project, planId);
		});
	});
};

const testGetAllPlans = () => {
	describe('Get All Plans', () => {
		test('should call getAllPlans with the teamspace and project provided and return plans unchanged', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const plans = times(3, () => ({
				_id: generateUUID(),
				name: generateRandomString(),
				type: CLASH_PLAN_TYPES[0],
			}));
			ClashPlansModel.getAllPlans.mockResolvedValueOnce(plans);

			await expect(Clashes.getAllPlans(teamspace, project)).resolves.toEqual(plans);

			expect(ClashPlansModel.getAllPlans).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getAllPlans).toHaveBeenCalledWith(teamspace, project);
		});

		test('should return an empty plans array when no plans are found', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			ClashPlansModel.getAllPlans.mockResolvedValueOnce([]);

			await expect(Clashes.getAllPlans(teamspace, project)).resolves.toEqual([]);

			expect(ClashPlansModel.getAllPlans).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getAllPlans).toHaveBeenCalledWith(teamspace, project);
		});

		test('should reject when getAllPlans fails', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const error = new Error(generateRandomString());
			ClashPlansModel.getAllPlans.mockRejectedValueOnce(error);

			await expect(Clashes.getAllPlans(teamspace, project)).rejects.toEqual(error);

			expect(ClashPlansModel.getAllPlans).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getAllPlans).toHaveBeenCalledWith(teamspace, project);
		});
	});
};

const testGetPlanById = () => {
	describe('Get Plan By ID', () => {
		const teamspace = generateRandomString();
		const project = generateUUID();
		const planId = generateUUID();

		test('should call getPlanById with the teamspace, project and plan ID provided and return plan unchanged', async () => {
			const plan = {
				_id: generateUUID(),
				name: generateRandomString(),
				tickets: {
					template: generateUUID(),
					federation: generateUUID(),
					...generateRandomObject(),
				},
				...generateRandomObject(),
			};
			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);

			await expect(Clashes.getPlanById(teamspace, project, planId)).resolves.toEqual(plan);

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(teamspace, project, planId);
		});

		test('should return plan unchanged when plan has no tickets', async () => {
			const plan = {
				_id: generateUUID(),
				name: generateRandomString(),
			};
			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);

			await expect(Clashes.getPlanById(teamspace, project, planId)).resolves.toEqual(plan);

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(teamspace, project, planId);
		});

		test('should reject when getPlanById fails', async () => {
			const error = new Error(generateRandomString());
			ClashPlansModel.getPlanById.mockRejectedValueOnce(error);

			await expect(Clashes.getPlanById(teamspace, project, planId)).rejects.toEqual(error);

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(teamspace, project, planId);
		});
	});
};

const testGetRunsByPlanId = () => {
	describe('Get Runs By Plan ID', () => {
		const teamspace = generateRandomString();
		const planId = generateUUID();

		test('should call getRunsByPlanId and return runs unchanged', async () => {
			const completedRun = {
				_id: generateUUID(),
				status: CLASH_RUN_STATUS.COMPLETED,
				triggeredAt: new Date(),
				triggeredBy: generateRandomString(),
				completedAt: new Date(),
				result: { stats: generateRandomObject(), details: generateRandomObject() },
			};
			const failedRun = {
				_id: generateUUID(),
				status: CLASH_RUN_STATUS.FAILED,
				triggeredAt: new Date(),
				triggeredBy: generateRandomString(),
				errorCode: generateRandomString(),
				message: generateRandomString(),
				result: generateRandomObject(),
			};
			const queuedRun = {
				_id: generateUUID(),
				status: CLASH_RUN_STATUS.QUEUED,
				triggeredAt: new Date(),
				triggeredBy: generateRandomString(),
				completedAt: new Date(),
				result: generateRandomObject(),
				errorCode: generateRandomString(),
				message: generateRandomString(),
			};
			const runs = [completedRun, failedRun, queuedRun];
			ClashRunsModel.getRunsByPlanId.mockResolvedValueOnce(runs);

			await expect(Clashes.getRunsByPlanId(teamspace, planId)).resolves.toEqual({ runs });

			expect(ClashRunsModel.getRunsByPlanId).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.getRunsByPlanId).toHaveBeenCalledWith(teamspace, planId);
		});

		test('should return an empty runs array when no runs are found', async () => {
			ClashRunsModel.getRunsByPlanId.mockResolvedValueOnce([]);

			await expect(Clashes.getRunsByPlanId(teamspace, planId)).resolves.toEqual({ runs: [] });

			expect(ClashRunsModel.getRunsByPlanId).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.getRunsByPlanId).toHaveBeenCalledWith(teamspace, planId);
		});

		test('should reject when getRunsByPlanId fails', async () => {
			const error = new Error(generateRandomString());
			ClashRunsModel.getRunsByPlanId.mockRejectedValueOnce(error);

			await expect(Clashes.getRunsByPlanId(teamspace, planId)).rejects.toEqual(error);

			expect(ClashRunsModel.getRunsByPlanId).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.getRunsByPlanId).toHaveBeenCalledWith(teamspace, planId);
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
		metadata: externalIds[i] }));

	const meshDataObj = {
		nonBimMeshes: times(10, (i) => ({
			_id: generateRandomString(),
			shared_id: generateRandomString(),
			name: i % 2 === 0 ? undefined : generateRandomString(),
			parents: [i % 2 === 0 ? parentWithManyMeshes : generateRandomString()],
		})),
		meshes: times(10, (i) => ({
			_id: generateRandomString(),
			shared_id: generateRandomString(),
			parents: metadata[i].parents,
			externalId: externalIds[i],
		})),
		metadata,
		unwantedMetadata: [],
		unwantedMeshes: [],
	};

	Scenes.getExternalIdsFromMetadata.mockImplementation((metadataArr) => metadataArr[0]);

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
			const parentId = mesh.name ? mesh.shared_id : UUIDToString(mesh.parents[0]);
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
		['plan has additional properties', { ...planData, ...generateRandomObject() }],
		['there are unwanted metadata', undefined, { ...meshDataObj, unwantedMetadata: metadata.slice(2), unwantedMeshes: [meshDataObj.meshes[0]._id, meshDataObj.meshes[1]._id] }],
	])('Create Test Run', (desc, plan = planData, meshData = meshDataObj) => {
		test(`should create and queue the run when ${desc}`, async () => {
			ClashRunsModel.createTestRun.mockResolvedValueOnce(runId);

			// mocks for set A (no rules)
			MetadataModel.getMetadataByQuery.mockResolvedValueOnce([]);
			ScenesModel.getNodesByQuery.mockResolvedValueOnce(meshData.nonBimMeshes);
			// mocks for set B (rules)
			MetadataModel.getMetadataByQuery.mockResolvedValueOnce(meshData.metadata);
			MetadataModel.getMetadataByRules.mockResolvedValueOnce(
				{ matched: meshData.metadata, unwanted: meshData.unwantedMetadata });
			if (meshData.metadata.length) {
				Scenes.getMeshesWithParentIds.mockResolvedValueOnce(meshData.meshes);
			}
			if (meshData.unwantedMeshes.length) {
				Scenes.getMeshesWithParentIds.mockResolvedValueOnce(meshData.unwantedMeshes);
			}

			await Clashes.createRun(teamspace, project, plan, userId);

			expect(ClashRunsModel.createTestRun).toHaveBeenCalledTimes(1);
			const expectedPlanData = {
				_id: plan._id,
				type: plan.type,
				tolerance: plan.tolerance,
				selfIntersectionsCheck: plan.selfIntersectionsCheck,
				selectionA: plan.selectionA,
				selectionB: plan.selectionB,
			};
			expect(ClashRunsModel.createTestRun).toHaveBeenCalledWith(teamspace, expectedPlanData, userId);

			expect(ScenesModel.getNodesByQuery).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodesByQuery).toHaveBeenCalledWith(teamspace, project, plan.selectionA.container,
				{ type: 'mesh', rev_id: plan.selectionA.revision }, { _id: 1, parents: 1, name: 1 });
			expect(MetadataModel.getMetadataByRules).toHaveBeenCalledTimes(1);
			expect(MetadataModel.getMetadataByRules).toHaveBeenCalledWith(teamspace, project, plan.selectionB.container,
				plan.selectionB.revision, plan.selectionB.rules, { parents: 1 });

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

const testProcessClashResults = () => {
	describe('Process Clash Results', () => {
		const fileContent = { clashes: times(10, () => generateClash()) };
		const teamspace = generateRandomString();
		const corId = generateRandomString();
		const resPath = generateRandomString();

		test('should process clash results when there are no previous runs', async () => {
			fs.createReadStream.mockImplementationOnce(() => {
				const fakeReadStream = PassThrough();
				fakeReadStream.write(JSON.stringify(fileContent));
				fakeReadStream.end();
				return fakeReadStream;
			});

			const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
			ClashRunsModel.getTestRunByQuery.mockResolvedValueOnce(currentRun);
			ClashRunsModel.getTestRunByQuery.mockRejectedValueOnce(templates.clashRunNotFound);

			await Clashes.processClashResults(teamspace, corId, resPath);

			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledTimes(2);
			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledWith(teamspace, { _id: corId }, { 'plan._id': 1, triggeredAt: 1 });
			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledWith(teamspace,
				{ 'plan._id': currentRun.plan._id, completedAt: { $exists: true } },
				{ result: 1 }, { completedAt: -1 });

			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();

			const result = { new: fileContent.clashes.map(formatClash), active: [], resolved: [] };
			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, expect.any(String),
				Buffer.from(JSON.stringify(result)));

			expect(ClashRunsModel.completeTestRun).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.completeTestRun).toHaveBeenCalledWith(teamspace, corId,
				FilesManager.storeFile.mock.calls[0][2]);
		});

		test('should mark run as failed and send an email if it fails to fetch last results', async () => {
			const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
			ClashRunsModel.getTestRunByQuery.mockResolvedValueOnce(currentRun);
			ClashRunsModel.getTestRunByQuery.mockRejectedValueOnce(templates.unknown);

			await Clashes.processClashResults(teamspace, corId, resPath);

			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledTimes(2);
			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledWith(teamspace, { _id: corId }, { 'plan._id': 1, triggeredAt: 1 });
			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledWith(teamspace,
				{ 'plan._id': currentRun.plan._id, completedAt: { $exists: true } },
				{ result: 1 }, { completedAt: -1 });

			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();

			expect(FilesManager.storeFile).not.toHaveBeenCalled();
			const errorMessage = 'Error retrieving clashes from last run';
			expect(ClashRunsModel.setTestRunToFailed).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.setTestRunToFailed).toHaveBeenCalledWith(teamspace, corId, errorMessage);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(MailerConstants.templates.CLASH_ERROR.name,
				{ errorMessage, teamspace, planId: currentRun.plan._id, runId: corId });
		});

		test('should categorize clashes and process clash results when there are previous runs', async () => {
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

			await Clashes.processClashResults(teamspace, corId, resPath);

			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledTimes(2);
			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledWith(teamspace, { _id: corId }, { 'plan._id': 1, triggeredAt: 1 });
			expect(ClashRunsModel.getTestRunByQuery).toHaveBeenCalledWith(teamspace,
				{ 'plan._id': currentRun.plan._id, completedAt: { $exists: true } },
				{ result: 1 }, { completedAt: -1 });

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, lastRun.result);

			const result = {
				new: fileContent.clashes.slice(5, 10).map(formatClash),
				active: existingClashes.active,
				resolved: existingClashes.new.map((c) => c.index),
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
	testGetAllPlans();
	testGetPlanById();
	testGetRunsByPlanId();
	testCreateRun();
	testProcessClashResults();
});
