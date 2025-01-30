/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const Mongo = require('mongodb');
const UUIDParse = require('uuid-parse');
const { times } = require('lodash');
const { src } = require('../../helper/path');
const { generateRandomString,
	generateRandomObject,
	determineTestGroup,
	generateUUIDString,
	generateUUID,
	generateRandomNumber,
} = require('../../helper/services');

const { UUIDToString } = require('../../../../src/v5/utils/helper/uuids');

const Scenes = require(`${src}/models/scenes`);

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);

jest.mock('../../../../src/v5/models/history');
const History = require(`${src}/models/history`);

jest.mock('../../../../src/v5/utils/permissions/permissions');
const Permissions = require(`${src}/utils/permissions/permissions`);

const testGetNodesBySharedIds = () => {
	describe('Get nodes by shared Ids', () => {
		test('Should return the results from the database query', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const revId = generateRandomString();
			const sharedIds = times(10, () => generateRandomString());
			const projection = generateRandomObject();

			const expectedData = times(10, generateRandomObject);

			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedData);

			await expect(Scenes.getNodesBySharedIds(teamspace, project, model, revId, sharedIds, projection))
				.resolves.toEqual(expectedData);

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, `${model}.scene`, { rev_id: revId, shared_id: { $in: sharedIds } }, projection);
		});
	});
};

const testGetNodeById = () => {
	describe('Get singular node by Id', () => {
		test('Should return the result from the database query', async () => {
			const teamspace = generateRandomString();
			const modelId = generateUUIDString();
			const nodeId = generateUUID();
			const projection = generateRandomObject();

			const expectedData = generateRandomObject();

			db.findOne.mockResolvedValueOnce(expectedData);

			const result = await Scenes.getNodeById(teamspace, modelId, nodeId, projection);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{ _id: nodeId },
				projection,
			);

			expect(result).toEqual(expectedData);
		});

		test('Should use {} as default projection when none is provided to return the result from the database query', async () => {
			const teamspace = generateRandomString();
			const modelId = generateUUIDString();
			const nodeId = generateUUID();

			const expectedData = generateRandomObject();

			db.findOne.mockResolvedValueOnce(expectedData);

			const result = await Scenes.getNodeById(teamspace, modelId, nodeId);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{ _id: nodeId },
				{},
			);

			expect(result).toEqual(expectedData);
		});
	});
};

const testGetNodesByIds = () => {
	describe('Get multiple nodes by Id', () => {
		test('Should return the result from the database query', async () => {
			const teamspace = generateRandomString();
			const projectId = generateUUID();
			const modelId = generateUUIDString();
			const nodeIds = times(10, generateUUID);
			const projection = generateRandomObject();

			const expectedData = times(10, generateRandomObject);

			db.find.mockResolvedValueOnce(expectedData);

			const results = await Scenes.getNodesByIds(teamspace, projectId, modelId, nodeIds, projection);

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{ _id: { $in: nodeIds } },
				projection,
			);

			expect(results).toEqual(expectedData);
		});
	});
};

const stringToUUID = (string) => {
	const bytes = UUIDParse.parse(string);
	// eslint-disable-next-line new-cap
	return Mongo.Binary(new Buffer.from(bytes), 3);
};

const testFindStashNodesByType = () => {
	describe('Find stash nodes by type', () => {
		test('Should lookup the rev Id in the history and return the result of the database query.', async () => {
			const teamspace = generateRandomString();
			const modelId = generateUUIDString();
			const revId = generateUUID();
			const branch = undefined;
			const projection = generateRandomObject();
			const regex = new RegExp('testSearchString', 'i');

			const mockHistory = {
				_id: revId,
			};

			const mockStashNodes = times(10, generateRandomObject);
			mockStashNodes.push(null);

			History.getHistory.mockResolvedValue(mockHistory);
			db.find.mockResolvedValueOnce(mockStashNodes);

			const results = await Scenes.findStashNodesByType(teamspace, modelId, branch, revId, 'testType', 'testSearchString', projection);

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				undefined,
				revId,
			);

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.stash.3drepo`,
				{ rev_id: revId, type: 'testType', name: regex },
				projection,
			);

			expect(results).toEqual(mockStashNodes);
		});

		test('If a node has an _id or parents field, they should be converted to strings', async () => {
			const teamspace = generateRandomString();
			const modelId = generateUUIDString();
			const revId = generateUUID();
			const branch = undefined;
			const projection = generateRandomObject();
			const regex = new RegExp('testSearchString', 'i');

			const mockHistory = {
				_id: revId,
			};

			const mockIdStr = generateUUIDString();
			const mockParentStr = generateUUIDString();
			const mockStashNode = {
				_id: UUIDToString(mockIdStr),
				parents: [UUIDToString(mockParentStr)],
			};
			const mockStashNodes = [mockStashNode];

			History.getHistory.mockResolvedValue(mockHistory);
			db.find.mockResolvedValueOnce(mockStashNodes);

			const results = await Scenes.findStashNodesByType(teamspace, modelId, branch, revId, 'testType', 'testSearchString', projection);

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				undefined,
				revId,
			);

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.stash.3drepo`,
				{ rev_id: revId, type: 'testType', name: regex },
				projection,
			);

			expect(results.length).toEqual(1);
			const node = results[0];
			expect(node._id).toEqual(mockIdStr);
			expect(node.parents[0]).toEqual(mockParentStr);
		});
	});
};

const testFindNodesByType = () => {
	describe('Find nodes by type', () => {
		test('Should lookup the rev Id in the history and return the result of the database query.', async () => {
			const teamspace = generateRandomString();
			const modelId = generateUUIDString();
			const revId = generateUUID();
			const branch = undefined;
			const projection = generateRandomObject();
			const regex = new RegExp('testSearchString', 'i');

			const mockHistory = {
				_id: revId,
			};

			const mockNodes = times(10, generateRandomObject);
			mockNodes.push(null);

			History.getHistory.mockResolvedValue(mockHistory);
			db.find.mockResolvedValueOnce(mockNodes);

			const results = await Scenes.findNodesByType(teamspace, modelId, branch, revId, 'testType', 'testSearchString', projection);

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				undefined,
				revId,
			);

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{ rev_id: revId, type: 'testType', name: regex },
				projection,
			);

			expect(results).toEqual(mockNodes);
		});

		test('If a node has an _id or parents field, they should be converted to strings', async () => {
			const teamspace = generateRandomString();
			const modelId = generateUUIDString();
			const revId = generateUUID();
			const branch = undefined;
			const projection = generateRandomObject();
			const regex = new RegExp('testSearchString', 'i');

			const mockHistory = {
				_id: revId,
			};

			const mockIdStr = generateUUIDString();
			const mockParentStr = generateUUIDString();
			const mockNode = {
				_id: UUIDToString(mockIdStr),
				parents: [UUIDToString(mockParentStr)],
			};
			const mockNodes = [mockNode];

			History.getHistory.mockResolvedValue(mockHistory);
			db.find.mockResolvedValueOnce(mockNodes);

			const results = await Scenes.findNodesByType(teamspace, modelId, branch, revId, 'testType', 'testSearchString', projection);

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				undefined,
				revId,
			);

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{ rev_id: revId, type: 'testType', name: regex },
				projection,
			);

			expect(results.length).toEqual(1);
			const node = results[0];
			expect(node._id).toEqual(mockIdStr);
			expect(node.parents[0]).toEqual(mockParentStr);
		});
	});
};

const testGetParentMatrix = () => {
	describe('Get parent matrix', () => {
		const matchMatricesHelper = (matA, matB) => {
			expect(matA.length).toEqual(matB.length);

			for (let i = 0; i < matA.length; i++) {
				for (let e = 0; e < matA.length; e++) {
					expect(matA[i][e]).toBeCloseTo(matB[i][e]);
				}
			}
		};

		const teamspace = generateRandomString();
		const modelId = generateUUIDString();
		const childId = generateUUIDString();
		const parentId = generateUUID();
		const revisionIds = [generateUUID()];

		const identityMatrix = [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1],
		];

		const mockChildMatrix = [
			[1, 0, 0, 0],
			[0, 2, 0, 0],
			[0, 0, 3, 0],
			[0, 0, 0, 1],
		];

		const mockParentMatrix = [
			[3, 0, 0, 0],
			[0, 2, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1],
		];

		const expResultMatrixProduct = [
			[3, 0, 0, 0],
			[0, 4, 0, 0],
			[0, 0, 3, 0],
			[0, 0, 0, 1],
		];

		const mockChildMesh = {
			parents: [parentId],
			matrix: mockChildMatrix,
		};

		const mockParentMesh = {
			parents: [],
			matrix: mockParentMatrix,
		};

		const mockMeshNoParents = {
			matrix: mockParentMatrix,
		};

		const mockMeshNoMatrix = {
			parents: [parentId],
		};

		test('should return product of the matrix of the current parent and its parent', async () => {
			db.findOne.mockResolvedValueOnce(mockChildMesh);
			db.findOne.mockResolvedValueOnce(mockParentMesh);

			const resultMatrix = await Scenes.getParentMatrix(teamspace, modelId, childId, revisionIds);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{
					shared_id: stringToUUID(childId),
					rev_id: { $in: revisionIds },
				},
				{},
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{
					shared_id: parentId,
					rev_id: { $in: revisionIds },
				},
				{},
			);

			matchMatricesHelper(resultMatrix, expResultMatrixProduct);
		});

		test('should return just the parent\'s matrix if it has no parent itself', async () => {
			db.findOne.mockResolvedValueOnce(mockMeshNoParents);

			const resultMatrix = await Scenes.getParentMatrix(teamspace, modelId, parentId, revisionIds);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{
					shared_id: parentId,
					rev_id: { $in: revisionIds },
				},
				{},
			);

			matchMatricesHelper(resultMatrix, mockParentMatrix);
		});

		test('should return an identity matrix if the parent has no matrix', async () => {
			db.findOne.mockResolvedValueOnce(mockMeshNoMatrix);
			db.findOne.mockResolvedValueOnce(mockMeshNoParents);

			const resultMatrix = await Scenes.getParentMatrix(teamspace, modelId, parentId, revisionIds);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{
					shared_id: parentId,
					rev_id: { $in: revisionIds },
				},
				{},
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{
					shared_id: parentId,
					rev_id: { $in: revisionIds },
				},
				{},
			);

			matchMatricesHelper(resultMatrix, identityMatrix);
		});
	});
};

const superMeshCheckHelper = (superMesh, stashNode) => {
	expect(superMesh.max).toEqual(stashNode.bounding_box[1]);
	expect(superMesh.min).toEqual(stashNode.bounding_box[0]);
	expect(superMesh.nFaces).toEqual(stashNode.faces_count);
	expect(superMesh.nUVChannels).toEqual(stashNode.uv_channels_count);
	expect(superMesh.nVertices).toEqual(stashNode.vertices_count);
	expect(superMesh.primitive).toEqual(stashNode.primitive);
};

const subModelCheckHelper = (subModel, teamspace, cont, stashNode) => {
	expect(subModel.teamspace).toEqual(teamspace);
	expect(subModel.model).toEqual(cont);
	expect(subModel.superMeshes.superMeshes.length).toEqual(1);
	const superMeshResult = subModel.superMeshes.superMeshes[0];
	superMeshCheckHelper(superMeshResult, stashNode);
};

const testGetContainerMeshInfo = () => {
	describe('Get mesh info for a container', () => {
		const teamspace = generateRandomString();
		const modelId = generateUUIDString();
		const revId = generateUUID();
		const branch = undefined;

		const mockHistory = {
			_id: revId,
		};

		const parentId = generateUUID();
		const mockStashNode = {
			_id: generateUUID(),
			vertices_count: generateRandomNumber(),
			faces_count: generateRandomNumber(),
			uv_channels_count: generateRandomNumber(),
			bounding_box: [
				generateRandomNumber(),
				generateRandomNumber(),
			],
			primitive: generateRandomNumber(),
			parents: [parentId],
		};

		const stashProjection = {
			_id: 1,
			vertices_count: 1,
			faces_count: 1,
			uv_channels_count: 1,
			bounding_box: 1,
			primitive: 1,
		};

		test('should return mesh info for the container', async () => {
			History.getHistory.mockResolvedValue(mockHistory);
			db.find.mockResolvedValueOnce([mockStashNode]);

			const meshInfo = await Scenes.getContainerMeshInfo(teamspace, modelId, branch, revId);

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				undefined,
				revId,
			);

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.stash.3drepo`,
				{ rev_id: revId, type: 'mesh' },
				stashProjection,
			);

			expect(meshInfo.superMeshes.length).toEqual(1);
			const superMesh = meshInfo.superMeshes[0];
			superMeshCheckHelper(superMesh, mockStashNode);
		});

		test('should return mesh info for the container with some fields set to default values when not provided by the node', async () => {
			const reducedStashNode = mockStashNode;
			delete reducedStashNode.faces_count;
			delete reducedStashNode.uv_channels_count;
			delete reducedStashNode.vertices_count;
			delete reducedStashNode.primitive;

			History.getHistory.mockResolvedValue(mockHistory);
			db.find.mockResolvedValueOnce([reducedStashNode]);

			const meshInfo = await Scenes.getContainerMeshInfo(teamspace, modelId, branch, revId);

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				undefined,
				revId,
			);

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.stash.3drepo`,
				{ rev_id: revId, type: 'mesh' },
				stashProjection,
			);

			expect(meshInfo.superMeshes.length).toEqual(1);

			const expStashNode = reducedStashNode;
			expStashNode.faces_count = 0;
			expStashNode.uv_channels_count = 0;
			expStashNode.vertices_count = 0;
			expStashNode.primitive = 3;

			const superMesh = meshInfo.superMeshes[0];
			superMeshCheckHelper(superMesh, expStashNode);
		});
	});
};

const testGetFederationMeshInfo = () => {
	describe('Get mesh info for a federation', () => {
		const teamspace = generateRandomString();
		const projectId = generateUUID();
		const modelId = generateUUIDString();
		const revId = generateUUID();
		const username = generateRandomString();
		const user = { username };

		const contA = generateUUID();
		const contB = generateUUID();

		const branch = undefined;

		const mockHistory = {
			_id: revId,
		};

		const mockRefNode1 = {
			project: contA,
		};
		const mockRefNode2 = {
			project: contB,
		};
		const mockRefNodes = [mockRefNode1, mockRefNode2];

		const parentId = generateUUID();
		const mockStashNode1 = {
			_id: generateUUID(),
			vertices_count: generateRandomNumber(),
			faces_count: generateRandomNumber(),
			uv_channels_count: generateRandomNumber(),
			bounding_box: [
				generateRandomNumber(),
				generateRandomNumber(),
			],
			primitive: generateRandomNumber(),
			parents: [parentId],
		};
		const mockStashNode2 = {
			_id: generateUUID(),
			vertices_count: generateRandomNumber(),
			faces_count: generateRandomNumber(),
			uv_channels_count: generateRandomNumber(),
			bounding_box: [
				generateRandomNumber(),
				generateRandomNumber(),
			],
			primitive: generateRandomNumber(),
			parents: [parentId],
		};

		const stashProjection = {
			_id: 1,
			vertices_count: 1,
			faces_count: 1,
			uv_channels_count: 1,
			bounding_box: 1,
			primitive: 1,
		};

		test('should return mesh info for the federation', async () => {
			History.getHistory.mockResolvedValue(mockHistory);
			db.find.mockResolvedValueOnce(mockRefNodes);
			Permissions.hasReadAccessToContainer.mockResolvedValue(true);
			db.find.mockResolvedValueOnce([mockStashNode1]);
			db.find.mockResolvedValueOnce([mockStashNode2]);

			const meshInfo = await Scenes.getFederationMeshInfo(teamspace, projectId, modelId, branch, user);

			expect(History.getHistory).toHaveBeenCalledTimes(3);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				undefined,
			);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contA,
				'master',
				undefined,
			);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contB,
				'master',
				undefined,
			);

			expect(db.find).toHaveBeenCalledTimes(3);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{ rev_id: revId, type: 'ref' },
				{ project: 1 },
			);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${contA}.stash.3drepo`,
				{ rev_id: revId, type: 'mesh' },
				stashProjection,
			);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${contB}.stash.3drepo`,
				{ rev_id: revId, type: 'mesh' },
				stashProjection,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contA,
				username,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contB,
				username,
			);

			expect(meshInfo.subModels.length).toEqual(2);

			const subModelResult1 = meshInfo.subModels[0];
			const subModelResult2 = meshInfo.subModels[1];
			subModelCheckHelper(subModelResult1, teamspace, contA, mockStashNode1);
			subModelCheckHelper(subModelResult2, teamspace, contB, mockStashNode2);
		});

		test('should return empty list for the federation if the user does not have read permission on the containers', async () => {
			History.getHistory.mockResolvedValue(mockHistory);
			db.find.mockResolvedValueOnce(mockRefNodes);
			Permissions.hasReadAccessToContainer.mockResolvedValue(false);

			// Actual call
			const meshInfo = await Scenes.getFederationMeshInfo(teamspace, projectId, modelId, branch, user);

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				undefined,
			);

			expect(db.find).toHaveBeenCalledTimes(1);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{ rev_id: revId, type: 'ref' },
				{ project: 1 },
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contA,
				username,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contB,
				username,
			);

			expect(meshInfo.subModels.length).toEqual(0);
		});

		test('should return empty list for the federation if an error is thrown while trying to get the container mesh info', async () => {
			History.getHistory.mockResolvedValue(mockHistory);
			db.find.mockResolvedValueOnce(mockRefNodes);
			Permissions.hasReadAccessToContainer.mockResolvedValue(true);

			db.find.mockImplementation(() => {
				throw new Error();
			});

			// Actual call
			const meshInfo = await Scenes.getFederationMeshInfo(teamspace, projectId, modelId, branch, user);

			expect(History.getHistory).toHaveBeenCalledTimes(3);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				undefined,
			);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contA,
				'master',
				undefined,
			);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contB,
				'master',
				undefined,
			);

			expect(db.find).toHaveBeenCalledTimes(3);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${modelId}.scene`,
				{ rev_id: revId, type: 'ref' },
				{ project: 1 },
			);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${contA}.stash.3drepo`,
				{ rev_id: revId, type: 'mesh' },
				stashProjection,
			);
			expect(db.find).toHaveBeenCalledWith(
				teamspace,
				`${contB}.stash.3drepo`,
				{ rev_id: revId, type: 'mesh' },
				stashProjection,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contA,
				username,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contB,
				username,
			);

			expect(meshInfo.subModels.length).toEqual(0);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetNodesBySharedIds();
	testGetNodeById();
	testGetNodesByIds();
	testFindNodesByType();
	testFindStashNodesByType();
	testGetParentMatrix();
	testGetContainerMeshInfo();
	testGetFederationMeshInfo();
});
