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

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../src/v5/models/clashes.plans');
const ClashPlansModel = require(`${src}/models/clashes.plans`);

jest.mock('../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);

jest.mock('../../../../../../src/v5/models/clashes.runs');
const ClashRunsModel = require(`${src}/models/clashes.runs`);

jest.mock('../../../../../../src/v5/models/scenes');
const ScenesModel = require(`${src}/models/scenes`);

jest.mock('../../../../../../src/v5/models/modelSettings');
const ModelSettingsModel = require(`${src}/models/modelSettings`);

jest.mock('../../../../../../src/v5/services/modelProcessing');
const ModelProcessing = require(`${src}/services/modelProcessing`);

jest.mock('../../../../../../src/v5/processors/teamspaces/projects/models/commons/scenes');
const Scenes = require(`${src}/processors/teamspaces/projects/models/commons/scenes`);

jest.mock('../../../../../../src/v5/models/metadata');
const MetadataModel = require(`${src}/models/metadata`);

jest.mock('../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
jest.mock('../../../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

const MailerConstants = require(`${src}/services/mailer/mailer.constants`);

const {
	CLASH_TYPES,
	RUN_HISTORY_COL,
	SELF_INTERSECTIONS_CHECK_OPTIONS,
	clashObjectIdTypes,
	clashRunStatus,
} = require(`${src}/models/clashes.constants`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

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
		test('should delete the plan and associated run data', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const planId = generateRandomString();
			const runIds = times(3, () => generateUUID());
			ClashRunsModel.deleteRunsByPlan.mockResolvedValueOnce(runIds);

			await Clashes.deletePlan(teamspace, project, planId);

			expect(ClashPlansModel.deletePlan).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.deletePlan).toHaveBeenCalledWith(teamspace, project, planId);
			expect(ClashRunsModel.deleteRunsByPlan).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.deleteRunsByPlan).toHaveBeenCalledWith(teamspace, project, planId);
			expect(FilesManager.removeFiles).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFiles).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, runIds);
		});
	});
};

const testDeleteClashDataInProject = () => {
	describe('Delete clash data in project', () => {
		test('should delete the plans and associated run data', async () => {
			const teamspace = generateRandomString();
			const project = generateUUID();
			const runIds = times(3, () => generateUUID());
			ClashRunsModel.deleteRunsByProject.mockResolvedValueOnce(runIds);

			await Clashes.deleteClashDataInProject(teamspace, project);

			expect(ClashRunsModel.deleteRunsByProject).toHaveBeenCalledTimes(1);
			expect(ClashRunsModel.deleteRunsByProject).toHaveBeenCalledWith(teamspace, project);
			expect(ClashPlansModel.deletePlansByProject).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.deletePlansByProject).toHaveBeenCalledWith(teamspace, project);
			expect(FilesManager.removeFiles).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFiles).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, runIds);
		});
	});
};

const testCreateRun = () => {
	const teamspace = generateRandomString();
	const project = generateUUID();
	const userId = generateRandomString();
	const runId = generateRandomString();
	const planData = {
		type: CLASH_TYPES.HARD,
		tolerance: generateRandomNumber(),
		selfIntersectionsCheck: false,
		selectionA: [{ container: generateRandomString(), revision: generateUUID() }],
		selectionB: [{ container: generateRandomString(),
			revision: generateUUID(),
			rules: [generateRandomObject()],
		}],
	};
	const parentWithManyMeshes = generateRandomString();
	const externalIds = times(10, () => ({ key: generateRandomString(), values: [generateRandomString()] }));
	const mockBoundingBox = { min: [1, 2, 3], max: [4, 5, 6] };
	const mockBoundingBoxStr = JSON.stringify(mockBoundingBox);
	const generateIndex = (container, idType, id, bbox) => [container, idType, id, bbox].join('::');

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
			parents: metadata[i].parents,
			externalId: externalIds[i],
		})),
		metadata,
		unwantedMetadata: [],
		unwantedMeshes: [],
	};

	Scenes.getExternalIdsFromMetadata.mockImplementation((metadataArr) => metadataArr[0].metadata);
	Scenes.getMeshNodeBounds.mockResolvedValue(mockBoundingBox);

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
			selectionA: [{ container: generateRandomString(), revision: generateUUID() }],
			selectionB: [{ container: generateRandomString(), revision: generateUUID() }],
		};

		ClashRunsModel.createClashRun.mockResolvedValueOnce(runId);
		ScenesModel.getNodesByQuery.mockResolvedValueOnce(meshes);
		ScenesModel.getNodesByQuery.mockResolvedValueOnce([]);
		MetadataModel.getMetadataByQuery.mockImplementation((ts, container) => Promise.resolve(
			container === plan.selectionA[0].container ? metadataNodes : []));

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
			const compositePath = generateIndex(container, idType, mesh.externalId?.values[0] ?? parentId,
				mockBoundingBoxStr);

			if (!result[compositePath]) {
				result[compositePath] = [];
			}
			result[compositePath].push(mesh._id);
		}

		return Object.entries(result).map(([id, meshIds]) => ({
			id,
			meshIds,
		}));
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
					teamspace, project, plan.selectionB[0].container,
					plan.selectionB[0].revision, plan.selectionB[0].rules, { parents: 1 },
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
						container: plan.selectionA[0].container,
						revision: UUIDToString(plan.selectionA[0].revision),
						objects: generateGroupedMeshes(plan.selectionA[0].container, meshData.nonBimMeshes),
					}],
					setB: [{
						teamspace,
						container: plan.selectionB[0].container,
						revision: UUIDToString(plan.selectionB[0].revision),
						objects: generateGroupedMeshes(plan.selectionB[0].container, meshData.meshes,
							meshData.unwantedMeshes),
					}],
				}));
			});

			test('should merge multiple selections for the same container into one config entry', async () => {
				const container = generateRandomString();
				const revision = generateUUID();
				const sharedParent = generateRandomString();
				const otherParent = generateRandomString();
				const meshA = makeMesh({ _id: generateRandomString(), parent: sharedParent });
				const duplicateMeshA = makeMesh({ _id: meshA._id, parent: sharedParent });
				const meshB = makeMesh({ _id: generateRandomString(), parent: sharedParent });
				const meshC = makeMesh({ _id: generateRandomString(), parent: otherParent });
				const plan = {
					...planData,
					selectionA: [
						{ container, revision },
						{ container, revision },
					],
					selectionB: [{ container: generateRandomString(), revision: generateUUID() }],
				};

				ClashRunsModel.createClashRun.mockResolvedValueOnce(runId);
				ScenesModel.getNodesByQuery.mockResolvedValueOnce([meshA]);
				ScenesModel.getNodesByQuery.mockResolvedValueOnce([duplicateMeshA, meshB, meshC]);
				ScenesModel.getNodesByQuery.mockResolvedValueOnce([]);
				MetadataModel.getMetadataByQuery.mockResolvedValue([]);

				await Clashes.createRun(teamspace, project, plan, userId);

				const stream = ModelProcessing.queueClashRun.mock.calls[0][3];
				const content = JSON.parse(await getStreamContent(stream));

				expect(content.setA).toEqual([{
					teamspace,
					container,
					revision: UUIDToString(revision),
					objects: [
						{
							id: generateIndex(container, clashObjectIdTypes.INTERNAL, sharedParent,
								mockBoundingBoxStr),
							meshIds: [meshA._id, meshB._id],
						},
						{
							id: generateIndex(container, clashObjectIdTypes.INTERNAL, otherParent,
								mockBoundingBoxStr),
							meshIds: [meshC._id],
						},
					],
				}]);
				expect(content.setB).toHaveLength(1);
				expect(MetadataModel.getMetadataByQuery).toHaveBeenCalledTimes(2);
			});

			test('should create separate config entries for selections from different containers', async () => {
				const containerA = generateRandomString();
				const containerB = generateRandomString();
				const revisionA = generateUUID();
				const revisionB = generateUUID();
				const parentA = generateRandomString();
				const parentB = generateRandomString();
				const meshA = makeMesh({ _id: generateRandomString(), parent: parentA });
				const meshB = makeMesh({ _id: generateRandomString(), parent: parentB });
				const plan = {
					...planData,
					selectionA: [
						{ container: containerA, revision: revisionA },
						{ container: containerB, revision: revisionB },
					],
					selectionB: [{ container: generateRandomString(), revision: generateUUID() }],
				};

				ClashRunsModel.createClashRun.mockResolvedValueOnce(runId);
				ScenesModel.getNodesByQuery.mockResolvedValueOnce([meshA]);
				ScenesModel.getNodesByQuery.mockResolvedValueOnce([meshB]);
				ScenesModel.getNodesByQuery.mockResolvedValueOnce([]);
				MetadataModel.getMetadataByQuery.mockResolvedValueOnce([]);
				MetadataModel.getMetadataByQuery.mockResolvedValueOnce([]);
				MetadataModel.getMetadataByQuery.mockResolvedValueOnce([]);

				await Clashes.createRun(teamspace, project, plan, userId);

				const stream = ModelProcessing.queueClashRun.mock.calls[0][3];
				const content = JSON.parse(await getStreamContent(stream));

				expect(content.setA).toEqual([
					{
						teamspace,
						container: containerA,
						revision: UUIDToString(revisionA),
						objects: [{
							id: generateIndex(containerA, clashObjectIdTypes.INTERNAL, parentA,
								mockBoundingBoxStr),
							meshIds: [meshA._id],
						}],
					},
					{
						teamspace,
						container: containerB,
						revision: UUIDToString(revisionB),
						objects: [{
							id: generateIndex(containerB, clashObjectIdTypes.INTERNAL, parentB,
								mockBoundingBoxStr),
							meshIds: [meshB._id],
						}],
					},
				]);
			});

			test('should use parent IDs as internal composite IDs for nameless meshes', async () => {
				const parent = generateRandomString();
				const mesh = makeMesh({ _id: generateRandomString(), parent });

				const { content, plan } = await createClashRunWithObjects([mesh]);

				expect(content.setA[0].objects).toEqual([{
					id: generateIndex(plan.selectionA[0].container, clashObjectIdTypes.INTERNAL, parent,
						mockBoundingBoxStr),
					meshIds: [mesh._id],
				}]);
			});

			test('should use shared IDs as internal composite IDs for named meshes', async () => {
				const sharedId = generateRandomString();
				const mesh = makeMesh({ _id: generateRandomString(), sharedId, name: generateRandomString() });

				const { content, plan } = await createClashRunWithObjects([mesh]);

				expect(content.setA[0].objects).toEqual([{
					id: generateIndex(plan.selectionA[0].container, clashObjectIdTypes.INTERNAL, sharedId,
						mockBoundingBoxStr),
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
						id: generateIndex(plan.selectionA[0].container, clashObjectIdTypes.INTERNAL, parent,
							mockBoundingBoxStr),
						meshIds: [namelessMesh._id],
					},
					{
						id: generateIndex(plan.selectionA[0].container, clashObjectIdTypes.INTERNAL, sharedId,
							mockBoundingBoxStr),
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
					id: generateIndex(plan.selectionA[0].container, clashObjectIdTypes.INTERNAL, parent,
						mockBoundingBoxStr),
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
					teamspace, plan.selectionA[0].container,
					{ rev_id: plan.selectionA[0].revision, parents: { $in: [parent] } },
					{ metadata: 1, parents: 1 });
				expect(content.setA[0].objects).toEqual([{
					id: generateIndex(plan.selectionA[0].container, externalId.key, externalId.values[0],
						mockBoundingBoxStr),
					meshIds: [mesh._id],
				}]);
			});

			test('should fall back to internal IDs when metadata has no external IDs', async () => {
				const parent = generateRandomString();
				const mesh = makeMesh({ _id: generateRandomString(), parent });

				const { content, plan } = await createClashRunWithObjects([mesh], [makeMetadata(parent)]);

				expect(content.setA[0].objects).toEqual([{
					id: generateIndex(plan.selectionA[0].container, clashObjectIdTypes.INTERNAL, parent,
						mockBoundingBoxStr),
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
						id: generateIndex(plan.selectionA[0].container, externalId.key, externalId.values[0],
							mockBoundingBoxStr),
						meshIds: [meshes[0]._id],
					},
					{
						id: generateIndex(plan.selectionA[0].container, clashObjectIdTypes.INTERNAL,
							parentWithoutExternalId, mockBoundingBoxStr),
						meshIds: [meshes[1]._id],
					},
				]);
			});
		});
	});
};

const combineBBoxes = (bboxA, bboxB) => ({
	min: bboxA.min.map((value, i) => Math.min(value, bboxB.min[i])),
	max: bboxA.max.map((value, i) => Math.max(value, bboxB.max[i])),
});

const formatClash = (clash) => {
	const formatClashObject = (objectId) => {
		const [container, idType, id, bboxJSON] = objectId.split('::');
		return {
			bbox: JSON.parse(bboxJSON),
			index: [container, idType, id].join('::'),
			object: { container, idType, id },
		};
	};
	const objectA = formatClashObject(clash.a);
	const objectB = formatClashObject(clash.b);

	return {
		...clash,
		a: objectA.object,
		b: objectB.object,
		index: [objectA.index, objectB.index].sort().join('-'),
		bbox: combineBBoxes(objectA.bbox, objectB.bbox),
	};
};

const generateObjectId = () => {
	const objectId = `${generateRandomString()}::${generateRandomString()}::${generateRandomString()}`;
	const bbox = { min: [0, 0, 0], max: [1, 1, 1] };
	return `${objectId}::${JSON.stringify(bbox)}`;
};

const generateClash = () => ({
	a: generateObjectId(),
	b: generateObjectId(),
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

		describe('General', () => {
			test('should process clash results when there are no previous runs', async () => {
				fs.createReadStream.mockImplementationOnce(() => createResultsReadStream(fileContent));

				const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
				ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(currentRun);
				ClashRunsModel.getClashRunByQuery.mockRejectedValueOnce(templates.clashRunNotFound);

				await Clashes.processClashResults(teamspace, project, corId, resPath);

				expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(2);
				expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledWith(teamspace, project,
					{ _id: corId }, { plan: 1, triggeredAt: 1 });
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

				expect(EventsManager.publish).toHaveBeenCalledTimes(1);
				expect(EventsManager.publish).toHaveBeenCalledWith(events.CLASH_RUN_PROCESSED, {
					teamspace,
					project,
					runId: corId,
					plan: currentRun.plan,
					results: result,
				});
			});

			test('should categorize clashes and process clash results when there are previous runs', async () => {
				const [clashWithNewBbox, ...otherClashes] = fileContent.clashes;
				const clashWithOldBbox = {
					...clashWithNewBbox,
					a: clashWithNewBbox.a.replace(/\{.*\}$/, JSON.stringify({ min: [4, 4, 4], max: [5, 5, 5] })),
					b: clashWithNewBbox.b.replace(/\{.*\}$/, JSON.stringify({ min: [6, 6, 6], max: [7, 7, 7] })),
				};
				const existingClashes = {
					new: times(5, () => generateClash()).map(formatClash),
					active: [formatClash(clashWithOldBbox), ...otherClashes.slice(0, 4).map(formatClash)],
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
					{ _id: corId }, { plan: 1, triggeredAt: 1 });
				expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledWith(teamspace, project,
					{ 'plan._id': currentRun.plan._id, status: clashRunStatus.COMPLETED },
					{ _id: 1 }, { updatedAt: -1 });

				expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
				expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, lastRun._id);
				expect(fs.createReadStream).toHaveBeenCalledTimes(1);

				const result = {
					new: fileContent.clashes.slice(5, 10).map(formatClash),
					active: fileContent.clashes.slice(0, 5).map(formatClash),
					resolved: existingClashes.new,
				};

				expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
				expect(FilesManager.storeFile).toHaveBeenCalledWith(teamspace, RUN_HISTORY_COL, corId,
					Buffer.from(JSON.stringify(result)));

				expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledTimes(1);
				expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledWith(teamspace, project, corId,
					clashRunStatus.COMPLETED,
					{ stats: { new: 5, active: 5, resolved: 5 } });

				expect(EventsManager.publish).toHaveBeenCalledTimes(1);
				expect(EventsManager.publish).toHaveBeenCalledWith(events.CLASH_RUN_PROCESSED, {
					teamspace,
					project,
					runId: corId,
					plan: currentRun.plan,
					results: result,
				});
			});
		});

		describe('Error handling', () => {
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
				ClashRunsModel.getClashRunByQuery.mockRejectedValueOnce(templates.clashRunNotFound);

				await expect(Clashes.processClashResults(teamspace, project, corId, resPath))
					.resolves.toBeUndefined();

				expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(2);
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
				ClashRunsModel.getClashRunByQuery.mockRejectedValueOnce(templates.clashRunNotFound);

				await expect(Clashes.processClashResults(teamspace, project, corId, resPath))
					.resolves.toBeUndefined();

				expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(2);
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
				ClashRunsModel.getClashRunByQuery.mockRejectedValueOnce(templates.clashRunNotFound);

				await expect(Clashes.processClashResults(teamspace, project, corId, resPath))
					.rejects.toEqual(readError);

				expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(2);
				expect(FilesManager.storeFile).not.toHaveBeenCalled();

				expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledTimes(1);
				expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledWith(teamspace, project, corId,
					clashRunStatus.FAILED, { error: { reason: `Could not read results file: ${readError.message}` } });
			});

			test('should mark run as failed if the results file cannot be parsed', async () => {
				fs.createReadStream.mockImplementationOnce(() => createRawResultsReadStream('{'));

				const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
				ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(currentRun);
				ClashRunsModel.getClashRunByQuery.mockRejectedValueOnce(templates.clashRunNotFound);

				await expect(Clashes.processClashResults(teamspace, project, corId, resPath))
					.rejects.toThrow();

				expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(2);
				expect(FilesManager.storeFile).not.toHaveBeenCalled();

				expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledTimes(1);
				expect(ClashRunsModel.updateRunStatus).toHaveBeenCalledWith(teamspace, project, corId,
					clashRunStatus.FAILED,
					{ error: { reason: expect.stringContaining('Could not read results file:') } });
			});

			test('should mark run as failed and send an email if it fails to fetch last results', async () => {
				const currentRun = { ...generateRandomObject(), plan: { _id: generateRandomString() } };
				ClashRunsModel.getClashRunByQuery.mockResolvedValueOnce(currentRun);
				ClashRunsModel.getClashRunByQuery.mockRejectedValueOnce(templates.unknown);

				await expect(Clashes.processClashResults(teamspace, project, corId, resPath))
					.rejects.toEqual(templates.unknown);

				expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledTimes(2);
				expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledWith(teamspace, project,
					{ _id: corId }, { plan: 1, triggeredAt: 1 });
				expect(ClashRunsModel.getClashRunByQuery).toHaveBeenCalledWith(teamspace, project,
					{ 'plan._id': currentRun.plan._id, status: clashRunStatus.COMPLETED },
					{ _id: 1 }, { updatedAt: -1 });

				expect(FilesManager.getFileAsStream).not.toHaveBeenCalled();
				expect(fs.createReadStream).not.toHaveBeenCalled();

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
		});
	});
};

const testSetLastRevForSelections = () => {
	describe('Set Selection Last Revisions', () => {
		test('should set the last revisions for the selection', async () => {
			const teamspace = generateRandomString();
			const selectionA = [{ container: generateRandomString() }];
			const selectionB = [{ container: generateRandomString() }];
			const lastRevisionA = generateUUID();
			const lastRevisionB = generateUUID();

			ModelSettingsModel.getContainerById.mockResolvedValueOnce({ });
			ModelSettingsModel.getContainerById.mockResolvedValueOnce({ });
			RevisionsModel.getLatestRevision.mockResolvedValueOnce({ _id: lastRevisionA });
			RevisionsModel.getLatestRevision.mockResolvedValueOnce({ _id: lastRevisionB });

			await Clashes.setLastRevForSelections(teamspace, selectionA, selectionB);

			expect(ModelSettingsModel.getContainerById).toHaveBeenCalledTimes(2);
			expect(ModelSettingsModel.getContainerById)
				.toHaveBeenCalledWith(teamspace, selectionA[0].container, { _id: 1 });
			expect(ModelSettingsModel.getContainerById)
				.toHaveBeenCalledWith(teamspace, selectionB[0].container, { _id: 1 });

			expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(2);
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, selectionA[0].container, modelTypes.CONTAINER, { _id: 1 });
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, selectionB[0].container, modelTypes.CONTAINER, { _id: 1 });

			expect(selectionA[0].revision).toEqual(lastRevisionA);
			expect(selectionB[0].revision).toEqual(lastRevisionB);
		});

		test('should set the last revisions for all selections in both sets', async () => {
			const teamspace = generateRandomString();
			const selectionA = [{ container: generateRandomString() }, { container: generateRandomString() }];
			const selectionB = [{ container: generateRandomString() }];
			const revisions = times(3, () => generateUUID());

			ModelSettingsModel.getContainerById.mockResolvedValueOnce({ });
			ModelSettingsModel.getContainerById.mockResolvedValueOnce({ });
			ModelSettingsModel.getContainerById.mockResolvedValueOnce({ });
			revisions.forEach((revision) => RevisionsModel.getLatestRevision.mockResolvedValueOnce({ _id: revision }));

			await Clashes.setLastRevForSelections(teamspace, selectionA, selectionB);

			expect(ModelSettingsModel.getContainerById).toHaveBeenCalledTimes(3);
			expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(3);
			[...selectionA, ...selectionB].forEach((selection, index) => {
				expect(ModelSettingsModel.getContainerById)
					.toHaveBeenCalledWith(teamspace, selection.container, { _id: 1 });
				expect(RevisionsModel.getLatestRevision)
					.toHaveBeenCalledWith(teamspace, selection.container, modelTypes.CONTAINER, { _id: 1 });
				expect(selection.revision).toEqual(revisions[index]);
			});
		});

		test('should throw error if one container doesnt exist', async () => {
			const teamspace = generateRandomString();
			const selectionA = [{ container: generateRandomString() }];
			const selectionB = [{ container: generateRandomString() }];

			ModelSettingsModel.getContainerById.mockRejectedValueOnce(templates.containerNotFound);

			await expect(Clashes.setLastRevForSelections(teamspace, selectionA, selectionB))
				.rejects.toEqual(templates.containerNotFound);

			expect(ModelSettingsModel.getContainerById).toHaveBeenCalledTimes(2);
			expect(ModelSettingsModel.getContainerById)
				.toHaveBeenCalledWith(teamspace, selectionA[0].container, { _id: 1 });
			expect(ModelSettingsModel.getContainerById)
				.toHaveBeenCalledWith(teamspace, selectionB[0].container, { _id: 1 });

			expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(1);
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, selectionB[0].container, modelTypes.CONTAINER, { _id: 1 });
		});

		test('should throw error if one container doesnt have a revision', async () => {
			const teamspace = generateRandomString();
			const selectionA = [{ container: generateRandomString() }];
			const selectionB = [{ container: generateRandomString() }];

			ModelSettingsModel.getContainerById.mockResolvedValueOnce({ });
			ModelSettingsModel.getContainerById.mockResolvedValueOnce({ });
			RevisionsModel.getLatestRevision.mockRejectedValueOnce(templates.revisionNotFound);

			await expect(Clashes.setLastRevForSelections(teamspace, selectionA, selectionB))
				.rejects.toEqual(templates.revisionNotFound);

			expect(ModelSettingsModel.getContainerById).toHaveBeenCalledTimes(2);
			expect(ModelSettingsModel.getContainerById)
				.toHaveBeenCalledWith(teamspace, selectionA[0].container, { _id: 1 });
			expect(ModelSettingsModel.getContainerById)
				.toHaveBeenCalledWith(teamspace, selectionB[0].container, { _id: 1 });

			expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(2);
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, selectionA[0].container, modelTypes.CONTAINER, { _id: 1 });
			expect(RevisionsModel.getLatestRevision)
				.toHaveBeenCalledWith(teamspace, selectionB[0].container, modelTypes.CONTAINER, { _id: 1 });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCreatePlan();
	testUpdatePlan();
	testDeletePlan();
	testDeleteClashDataInProject();
	testCreateRun();
	testProcessClashResults();
	testSetLastRevForSelections();
});
