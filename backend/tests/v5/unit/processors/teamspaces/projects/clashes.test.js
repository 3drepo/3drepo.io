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

const {
	CLASH_PLAN_TYPES,
	SELF_INTERSECTIONS_CHECK_OPTIONS,
	clashObjectIdTypes,
	clashRunStatus,
} = require(`${src}/models/clashes.constants`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

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
				status: clashRunStatus.COMPLETED,
				triggeredAt: new Date(),
				triggeredBy: generateRandomString(),
				completedAt: new Date(),
				result: { stats: generateRandomObject(), details: generateRandomObject() },
			};
			const failedRun = {
				_id: generateUUID(),
				status: clashRunStatus.FAILED,
				triggeredAt: new Date(),
				triggeredBy: generateRandomString(),
				errorCode: generateRandomString(),
				message: generateRandomString(),
				result: generateRandomObject(),
			};
			const queuedRun = {
				_id: generateUUID(),
				status: clashRunStatus.QUEUED,
				triggeredAt: new Date(),
				triggeredBy: generateRandomString(),
				completedAt: new Date(),
				result: generateRandomObject(),
				errorCode: generateRandomString(),
				message: generateRandomString(),
			};
			const runs = [completedRun, failedRun, queuedRun];
			ClashRunsModel.getRunsByPlanId.mockResolvedValueOnce(runs);

			await expect(Clashes.getRunsByPlanId(teamspace, planId)).resolves.toEqual(runs);

			expect(ClashRunsModel.getRunsByPlanId).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.getRunsByPlanId).toHaveBeenCalledWith(teamspace, planId);
		});

		test('should return an empty runs array when no runs are found', async () => {
			ClashRunsModel.getRunsByPlanId.mockResolvedValueOnce([]);

			await expect(Clashes.getRunsByPlanId(teamspace, planId)).resolves.toEqual([]);

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
		selectionB: {
			container: generateRandomString(),
			revision: generateRandomString(),
			rules: [generateRandomObject()],
		},
	};
	const parentWithManyMeshes = generateRandomString();
	const externalIds = times(10, () => ({ key: generateRandomString(), values: [generateRandomString()] }));

	const metadata = times(10, (i) => ({
		_id: generateRandomString(),
		parents: [generateRandomString()],
		metadata: externalIds[i],
	}));

	const meshDataObj = {
		nonBimMeshes: times(10, (i) => ({
			_id: generateRandomString(),
			shared_id: generateRandomString(),
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

	Scenes.getExternalIdsFromMetadata.mockImplementation((metadataArr) => metadataArr[0].metadata);

	const getStreamContent = (stream) => new Promise((resolve, reject) => {
		const chunks = [];
		stream.on('data', (chunk) => chunks.push(chunk));
		stream.on('error', reject);
		stream.on('end', () => {
			try {
				const buffers = chunks.map((chunk) => (Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
				resolve(Buffer.concat(buffers).toString());
			} catch (err) {
				reject(err);
			}
		});
	});

	const checkStreamContent = async (stream, expectedContent) => {
		const content = await getStreamContent(stream);
		expect(content).toEqual(expectedContent);
	};

	const createClashRunWithObjects = async (meshes, metadataNodes = []) => {
		const plan = {
			...planData,
			selectionA: { container: generateRandomString(), revision: generateRandomString() },
			selectionB: { container: generateRandomString(), revision: generateRandomString() },
		};

		ClashRunsModel.createClashRun.mockResolvedValueOnce(runId);
		ScenesModel.getNodesByQuery.mockResolvedValueOnce(meshes);
		ScenesModel.getNodesByQuery.mockResolvedValueOnce([]);
		MetadataModel.getMetadataByQuery.mockResolvedValueOnce(metadataNodes);
		MetadataModel.getMetadataByQuery.mockResolvedValueOnce([]);

		await Clashes.createRun(teamspace, project, plan, userId);

		const stream = ModelProcessing.queueClashRun.mock.calls[0][3];
		const content = JSON.parse(await getStreamContent(stream));
		return { content, plan };
	};

	const makeMesh = ({ _id = generateRandomString(), parent = generateRandomString(),
		sharedId = generateRandomString(), name } = {}) => ({
		_id,
		parents: [parent],
		shared_id: sharedId,
		...(name ? { name } : {}),
	});

	const makeMetadata = (parent, externalId) => ({
		parents: [parent],
		metadata: externalId,
	});

	const generateGroupedMeshes = (container, meshes, unwantedMeshes = []) => {
		const result = {};

		for (const mesh of meshes.filter(({ _id }) => !unwantedMeshes.includes(_id))) {
			const parentId = mesh.name ? mesh.shared_id : UUIDToString(mesh.parents[0]);
			const idType = mesh.externalId?.key ?? clashObjectIdTypes.INTERNAL;
			const compositePath = `${container}::${idType}::${mesh.externalId?.values[0] ?? parentId}`;

			if (!result[compositePath]) {
				result[compositePath] = [];
			}
			result[compositePath].push(mesh._id);
		}

		return Object.entries(result).map(([id, meshIds]) => ({ id, meshIds }));
	};

	describe('Create Clash Run', () => {
		describe('General tests', () => {
			test.each([
				['no meshes found in set A', undefined, { ...meshDataObj, nonBimMeshes: [] }],
				['no meshes found in set B', undefined, { ...meshDataObj, meshes: [], metadata: [] }],
				['plan has selfIntersectionsCheck set to selectionA', { ...planData, selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[0] }],
				['plan has selfIntersectionsCheck set to selectionB', { ...planData, selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[1] }],
				['plan has selfIntersectionsCheck set to true', { ...planData, selfIntersectionsCheck: true }],
				['there are unwanted metadata', undefined, { ...meshDataObj, unwantedMetadata: metadata.slice(2), unwantedMeshes: meshDataObj.meshes.slice(2) }],
			])('should create and queue the run when %s', async (desc, plan = planData, meshData = meshDataObj) => {
				ClashRunsModel.createClashRun.mockResolvedValueOnce(runId);

				// mocks for set A (no rules)
				MetadataModel.getMetadataByQuery.mockResolvedValueOnce([]);
				ScenesModel.getNodesByQuery.mockResolvedValueOnce(meshData.nonBimMeshes);
				// mocks for set B (rules)
				MetadataModel.getMetadataByRules.mockResolvedValueOnce(
					{ matched: meshData.metadata, unwanted: meshData.unwantedMetadata });
				MetadataModel.getMetadataByQuery.mockResolvedValueOnce(meshData.metadata);
				if (meshData.metadata.length) {
					Scenes.getMeshesWithParentIds.mockResolvedValueOnce(meshData.meshes.map((m) => m._id));
				}
				if (meshData.unwantedMeshes.length) {
					Scenes.getMeshesWithParentIds.mockResolvedValueOnce(meshData.unwantedMeshes.map((m) => m._id));
				}
				ScenesModel.getNodesByQuery.mockResolvedValueOnce(meshData.meshes);

				await Clashes.createRun(teamspace, project, plan, userId);

				expect(ClashRunsModel.createClashRun).toHaveBeenCalledTimes(1);
				expect(ClashRunsModel.createClashRun).toHaveBeenCalledWith(teamspace, project, plan, userId);
				expect(ScenesModel.getNodesByQuery).toHaveBeenCalledTimes(2);
				expect(MetadataModel.getMetadataByRules).toHaveBeenCalledTimes(1);
				expect(MetadataModel.getMetadataByRules).toHaveBeenCalledWith(
					teamspace, project, plan.selectionB.container,
					plan.selectionB.revision, plan.selectionB.rules, { parents: 1 },
				);

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

			test('should use parent IDs as internal composite IDs for nameless meshes', async () => {
				const parent = generateRandomString();
				const mesh = makeMesh({ _id: generateRandomString(), parent });

				const { content, plan } = await createClashRunWithObjects([mesh]);

				expect(content.setA[0].objects).toEqual([{
					id: `${plan.selectionA.container}::${clashObjectIdTypes.INTERNAL}::${parent}`,
					meshIds: [mesh._id],
				}]);
			});

			test('should use shared IDs as internal composite IDs for named meshes', async () => {
				const sharedId = generateRandomString();
				const mesh = makeMesh({ _id: generateRandomString(), sharedId, name: generateRandomString() });

				const { content, plan } = await createClashRunWithObjects([mesh]);

				expect(content.setA[0].objects).toEqual([{
					id: `${plan.selectionA.container}::${clashObjectIdTypes.INTERNAL}::${sharedId}`,
					meshIds: [mesh._id],
				}]);
			});

			test('should support a combination of named and nameless meshes', async () => {
				const parent = generateRandomString();
				const sharedId = generateRandomString();
				const namelessMesh = makeMesh({ _id: generateRandomString(), parent });
				const namedMesh = makeMesh({
					_id: generateRandomString(), sharedId, name: generateRandomString(),
				});

				const { content, plan } = await createClashRunWithObjects([namelessMesh, namedMesh]);

				expect(content.setA[0].objects).toEqual([
					{
						id: `${plan.selectionA.container}::${clashObjectIdTypes.INTERNAL}::${parent}`,
						meshIds: [namelessMesh._id],
					},
					{
						id: `${plan.selectionA.container}::${clashObjectIdTypes.INTERNAL}::${sharedId}`,
						meshIds: [namedMesh._id],
					},
				]);
			});

			test('should group nameless meshes that belong to the same parent', async () => {
				const parent = generateRandomString();
				const meshes = [
					makeMesh({ _id: generateRandomString(), parent }),
					makeMesh({ _id: generateRandomString(), parent }),
				];

				const { content, plan } = await createClashRunWithObjects(meshes);

				expect(content.setA[0].objects).toEqual([{
					id: `${plan.selectionA.container}::${clashObjectIdTypes.INTERNAL}::${parent}`,
					meshIds: meshes.map(({ _id }) => _id),
				}]);
			});
		});

		describe('External ID tests', () => {
			test('should use external IDs when they are found', async () => {
				const parent = generateRandomString();
				const mesh = makeMesh({ _id: generateRandomString(), parent });
				const externalId = { key: clashObjectIdTypes.IFC, values: [generateRandomString()] };

				const { content, plan } = await createClashRunWithObjects([mesh], [makeMetadata(parent, externalId)]);

				expect(MetadataModel.getMetadataByQuery).toHaveBeenNthCalledWith(1,
					teamspace, plan.selectionA.container,
					{ rev_id: plan.selectionA.revision, parents: { $in: [parent] } },
					{ metadata: 1, parents: 1 });
				expect(content.setA[0].objects).toEqual([{
					id: `${plan.selectionA.container}::${externalId.key}::${externalId.values[0]}`,
					meshIds: [mesh._id],
				}]);
			});

			test('should fall back to internal IDs when metadata has no external IDs', async () => {
				const parent = generateRandomString();
				const mesh = makeMesh({ _id: generateRandomString(), parent });

				const { content, plan } = await createClashRunWithObjects([mesh], [makeMetadata(parent)]);

				expect(content.setA[0].objects).toEqual([{
					id: `${plan.selectionA.container}::${clashObjectIdTypes.INTERNAL}::${parent}`,
					meshIds: [mesh._id],
				}]);
			});

			test('should use external IDs only where found and internal IDs for the rest', async () => {
				const parentWithExternalId = generateRandomString();
				const parentWithoutExternalId = generateRandomString();
				const meshes = [
					makeMesh({ _id: generateRandomString(), parent: parentWithExternalId }),
					makeMesh({ _id: generateRandomString(), parent: parentWithoutExternalId }),
				];
				const externalId = { key: clashObjectIdTypes.REVIT, values: [generateRandomString()] };

				const { content, plan } = await createClashRunWithObjects(
					meshes,
					[makeMetadata(parentWithExternalId, externalId)],
				);

				expect(content.setA[0].objects).toEqual([
					{
						id: `${plan.selectionA.container}::${externalId.key}::${externalId.values[0]}`,
						meshIds: [meshes[0]._id],
					},
					{
						id: `${plan.selectionA.container}::${clashObjectIdTypes.INTERNAL}::${parentWithoutExternalId}`,
						meshIds: [meshes[1]._id],
					},
				]);
			});
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

const createResultsReadStream = (content) => {
	const fakeReadStream = PassThrough();
	fakeReadStream.write(JSON.stringify(content));
	fakeReadStream.end();
	return fakeReadStream;
};

const createRawResultsReadStream = (content) => {
	const fakeReadStream = PassThrough();
	fakeReadStream.write(content);
	fakeReadStream.end();
	return fakeReadStream;
};

const testProcessClashResults = () => {
	describe('Process Clash Results', () => {
		const fileContent = { clashes: times(10, () => generateClash()) };
		const teamspace = generateRandomString();
		const project = generateUUID();
		const corId = generateRandomString();
		const resPath = generateRandomString();

		test('should process clash results when there are no previous runs', async () => {
			fs.createReadStream.mockImplementationOnce(() => createResultsReadStream(fileContent));

			const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
			ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(currentRun);
			ClashRunsModel.getClashRunByQuery.mockRejectedValueOnce(templates.clashRunNotFound);

			await Clashes.processClashResults(teamspace, project, corId, resPath);

			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(2);
			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledWith(teamspace, project,
				{ _id: corId }, { 'plan._id': 1, triggeredAt: 1 });
			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledWith(teamspace, project,
				{ 'plan._id': currentRun.plan._id, status: clashRunStatus.COMPLETED },
				{ _id: 1 }, { updatedAt: -1 });

			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();
			expect(fs.createReadStream).toHaveBeenCalledTimes(1);

			const result = { new: fileContent.clashes.map(formatClash), active: [], resolved: [] };
			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, corId,
				Buffer.from(JSON.stringify(result)));

			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledWith(teamspace, project, corId,
				clashRunStatus.COMPLETED,
				{ stats: { new: 10, active: 0, resolved: 0 } });
		});

		test('should mark run as failed if the results file contains errors', async () => {
			const fileContentWithErrors = {
				clashes: times(3, () => generateClash()),
				errors: [
					{ type: 'MeshBoundsException' },
					{ type: 'TransformBoundsException' },
					{ type: 'TransformBoundsException' },
				],
			};
			fs.createReadStream.mockImplementationOnce(() => createResultsReadStream(fileContentWithErrors));

			const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
			ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(currentRun);

			await expect(Clashes.processClashResults(teamspace, project, corId, resPath))
				.resolves.toBeUndefined();

			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).not.toHaveBeenCalled();

			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledWith(teamspace, project, corId,
				clashRunStatus.FAILED,
				{ error: { reason: 'The following errors were found: 1 MeshBoundsException, 2 TransformBoundsException' } });
		});

		test('should ignore clashes after an error is found in the results file', async () => {
			const fileContentWithErrors = {
				errors: [{ type: 'MeshBoundsException' }],
				clashes: times(3, () => generateClash()),
			};
			fs.createReadStream.mockImplementationOnce(() => createResultsReadStream(fileContentWithErrors));

			const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
			ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(currentRun);

			await expect(Clashes.processClashResults(teamspace, project, corId, resPath))
				.resolves.toBeUndefined();

			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).not.toHaveBeenCalled();

			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledWith(teamspace, project, corId,
				clashRunStatus.FAILED,
				{ error: { reason: 'The following errors were found: 1 MeshBoundsException' } });
		});

		test('should mark run as failed if the results file cannot be read', async () => {
			const readError = new Error(generateRandomString());
			fs.createReadStream.mockImplementationOnce(() => {
				const fakeReadStream = PassThrough();
				setImmediate(() => fakeReadStream.emit('error', readError));
				return fakeReadStream;
			});

			const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
			ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(currentRun);

			await expect(Clashes.processClashResults(teamspace, project, corId, resPath))
				.rejects.toEqual(readError);

			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).not.toHaveBeenCalled();

			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledWith(teamspace, project, corId,
				clashRunStatus.FAILED, { error: { reason: `Could not read results file: ${readError.message}` } });
		});

		test('should mark run as failed if the results file cannot be parsed', async () => {
			fs.createReadStream.mockImplementationOnce(() => createRawResultsReadStream('{'));

			const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
			ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(currentRun);

			await expect(Clashes.processClashResults(teamspace, project, corId, resPath))
				.rejects.toThrow();

			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).not.toHaveBeenCalled();

			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledWith(teamspace, project, corId,
				clashRunStatus.FAILED,
				{ error: { reason: expect.stringContaining('Could not read results file:') } });
		});

		test('should mark run as failed and send an email if it fails to fetch last results', async () => {
			fs.createReadStream.mockImplementationOnce(() => createResultsReadStream(fileContent));

			const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
			ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(currentRun);
			ClashRunsModel.getClashRunByQuery.mockRejectedValueOnce(templates.unknown);

			await expect(Clashes.processClashResults(teamspace, project, corId, resPath))
				.rejects.toEqual(templates.unknown);

			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(2);
			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledWith(teamspace, project,
				{ _id: corId }, { 'plan._id': 1, triggeredAt: 1 });
			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledWith(teamspace, project,
				{ 'plan._id': currentRun.plan._id, status: clashRunStatus.COMPLETED },
				{ _id: 1 }, { updatedAt: -1 });

			expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();

			expect(FilesManager.storeFile).not.toHaveBeenCalled();
			const errorMessage = `Error retrieving clashes from last run: ${templates.unknown.message}`;
			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledWith(teamspace, project, corId,
				clashRunStatus.FAILED, { error: { reason: errorMessage } });
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(MailerConstants.templates.CLASH_ERROR.name,
				{
					errorMessage: templates.unknown.message,
					teamspace,
					project: UUIDToString(project),
					planId: currentRun.plan._id,
					runId: corId,
				});
		});

		test('should categorize clashes and process clash results when there are previous runs', async () => {
			const existingClashes = {
				new: times(5, () => generateClash()).map(formatClash),
				active: fileContent.clashes.slice(0, 5).map(formatClash),
				resolved: times(2, () => generateClash()).map(formatClash),
			};
			const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
			const lastRun = { ...generateRandomObject(), _id: generateRandomString() };

			fs.createReadStream.mockImplementationOnce(() => createResultsReadStream(fileContent));

			FilesManager.getFileAsStream.mockImplementationOnce(() => {
				const fakeReadStream = PassThrough();
				fakeReadStream.write(JSON.stringify(existingClashes));
				fakeReadStream.end();
				return Promise.resolve({ readStream: fakeReadStream });
			});

			ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(currentRun);
			ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(lastRun);

			await Clashes.processClashResults(teamspace, project, corId, resPath);

			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(2);
			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledWith(teamspace, project,
				{ _id: corId }, { 'plan._id': 1, triggeredAt: 1 });
			expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledWith(teamspace, project,
				{ 'plan._id': currentRun.plan._id, status: clashRunStatus.COMPLETED },
				{ _id: 1 }, { updatedAt: -1 });

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, lastRun._id);
			expect(fs.createReadStream).toHaveBeenCalledTimes(1);

			const result = {
				new: fileContent.clashes.slice(5, 10).map(formatClash),
				active: existingClashes.active,
				resolved: existingClashes.new,
			};

			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, corId,
				Buffer.from(JSON.stringify(result)));

			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledWith(teamspace, project, corId,
				clashRunStatus.COMPLETED,
				{ stats: { new: 5, active: 5, resolved: 5 } });
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
