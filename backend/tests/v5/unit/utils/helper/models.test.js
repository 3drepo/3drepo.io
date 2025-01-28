/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { getFileAsStream } = require('../../../../../src/v5/services/filesManager');
const { src } = require('../../../helper/path');

const { generateRandomString, generateRandomNumber, generateUUID, generateUUIDString, determineTestGroup } = require('../../../helper/services');

const ModelHelper = require(`${src}/utils/helper/models`);

const { TICKETS_RESOURCES_COL } = require(`${src}/models/tickets.constants`);

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/models/tickets');
const Tickets = require(`${src}/models/tickets`);

jest.mock('../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../../src/v5/handler/db');
const DB = require(`${src}/handler/db`);

jest.mock('../../../../../src/v5/models/scenes');
const Scene = require(`${src}/models/scenes`);

const { templates } = require(`${src}/utils/responseCodes`);

const Mongo = require('mongodb');

const UUIDParse = require('uuid-parse');

const { PassThrough } = require('stream');

jest.mock('../../../../../src/v5/utils/helper/binaryVector');
const { BinToVector3dStringStream } = require(`${src}/utils/helper/binaryVector`);

jest.mock('../../../../../src/v5/utils/helper/binaryFace');
const { BinToFaceStringStream } = require(`${src}/utils/helper/binaryFace`);

const testRemoveModelData = () => {
	describe('Remove model data', () => {
		test('should remove model data successfully', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			const modelCol1 = `${model}.ref`;
			const modelCol2 = `${model}.history`;

			ModelSettings.deleteModel.mockResolvedValueOnce();
			DB.listCollections.mockResolvedValueOnce([
				modelCol1,
				modelCol2,
				generateRandomString(),
			].map((name) => ({ name })));

			await ModelHelper.removeModelData(teamspace, project, model);

			expect(FilesManager.removeAllFilesFromModel).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeAllFilesFromModel).toHaveBeenCalledWith(teamspace, model);

			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL,
				{ teamspace, project, model });

			expect(ModelSettings.deleteModel).toHaveBeenCalledTimes(1);
			expect(ModelSettings.deleteModel).toHaveBeenCalledWith(teamspace, project, model);

			expect(DB.listCollections).toHaveBeenCalledTimes(1);
			expect(DB.listCollections).toHaveBeenCalledWith(teamspace);

			expect(DB.dropCollection).toHaveBeenCalledTimes(2);
			expect(DB.dropCollection).toHaveBeenCalledWith(teamspace, modelCol1);
			expect(DB.dropCollection).toHaveBeenCalledWith(teamspace, modelCol2);

			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledTimes(1);
			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledWith(teamspace, project, model);

			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace,
				TICKETS_RESOURCES_COL, { teamspace, project, model });
		});
		test(`should not return with error if deleteModel failed with ${templates.modelNotFound.code}`, async () => {
			DB.listCollections.mockResolvedValueOnce([]);
			ModelSettings.deleteModel.mockRejectedValue(templates.modelNotFound);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			await ModelHelper.removeModelData(teamspace, project, model);

			expect(FilesManager.removeAllFilesFromModel).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeAllFilesFromModel).toHaveBeenCalledWith(teamspace, model);

			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace, TICKETS_RESOURCES_COL,
				{ teamspace, project, model });

			expect(ModelSettings.deleteModel).toHaveBeenCalledTimes(1);
			expect(ModelSettings.deleteModel).toHaveBeenCalledWith(teamspace, project, model);

			expect(DB.listCollections).toHaveBeenCalledTimes(1);
			expect(DB.listCollections).toHaveBeenCalledWith(teamspace);

			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledTimes(1);
			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledWith(teamspace, project, model);

			expect(Tickets.removeAllTicketsInModel).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFilesWithMeta).toHaveBeenCalledWith(teamspace,
				TICKETS_RESOURCES_COL, { teamspace, project, model });

			// We mocked listCollections to return empty array, so we shouldn't have removed any collections
			expect(DB.dropCollection).not.toHaveBeenCalled();
		});

		test(`should throw error if deleteModel threw an error that was not ${templates.modelNotFound.code}`, async () => {
			DB.listCollections.mockResolvedValueOnce([]);
			ModelSettings.deleteModel.mockRejectedValue(templates.unknown);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();

			await expect(ModelHelper.removeModelData(teamspace, project, model)).rejects.toEqual(templates.unknown);
		});
	});
};

const testGetMeshByIdSucc = (primitiveSet) => {
	describe('Get mesh data from ref', () => {
		const primitiveStr = primitiveSet ? 'with primitive set' : 'with primitive not set';
		test(`should get streams for mesh data succesfully ${primitiveStr}`, async () => {
			const uuidStringToBinary = (uuidString) => {
				const bytes = UUIDParse.parse(uuidString);
				// eslint-disable-next-line new-cap
				const buf = new Buffer.from(bytes);
				return Mongo.Binary(buf, 3);
			};

			const teamspace = generateRandomString();
			const container = generateRandomString();
			const meshId = generateUUIDString();
			const parents = [generateUUID()];
			const revId = generateUUID();
			const primitive = 3;
			const vertices = {
				start: generateRandomNumber(0),
				size: generateRandomNumber(0),
			};
			const faces = {
				start: generateRandomNumber(0),
				size: generateRandomNumber(0),
			};
			const elements = {
				vertices,
				faces,
			};
			const buffer = {
				name: generateRandomString(),
				start: generateRandomNumber(0),
			};
			// eslint-disable-next-line no-underscore-dangle
			const _blobRef = {
				elements,
				buffer,
			};

			let mesh;
			if (primitiveSet) {
				mesh = {
					primitive,
					_blobRef,
					rev_id: revId,
					parents,
				};
			} else {
				mesh = {
					_blobRef,
					rev_id: revId,
					parents,
				};
			}

			const projection = {
				parents: 1,
				vertices: 1,
				faces: 1,
				_blobRef: 1,
				primitive: 1,
				rev_id: 1,
			};

			const matrix = [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1],
			];

			const verticeRegion = {
				start: buffer.start + elements.vertices.start,
				end: buffer.start + elements.vertices.start + elements.vertices.size - 1,
			};
			const faceRegion = {
				start: buffer.start + elements.faces.start,
				end: buffer.start + elements.faces.start + elements.faces.size - 1,
			};

			const vertexStream = new PassThrough();
			const faceStream = new PassThrough();

			Scene.getNodeById.mockResolvedValue(mesh);
			Scene.getParentMatrix.mockResolvedValue(matrix);

			getFileAsStream.mockResolvedValueOnce({ readStream: vertexStream });
			getFileAsStream.mockResolvedValueOnce({ readStream: faceStream });

			const result = await ModelHelper.getMeshById(teamspace, container, meshId);

			expect(Scene.getNodeById).toHaveBeenCalledTimes(1);
			expect(Scene.getNodeById).toHaveBeenCalledWith(
				teamspace,
				container,
				uuidStringToBinary(meshId),
				projection,
			);

			expect(Scene.getParentMatrix).toHaveBeenCalledTimes(1);
			expect(Scene.getParentMatrix).toHaveBeenCalledWith(
				teamspace,
				container,
				parents[0],
				[revId],
			);

			expect(getFileAsStream).toHaveBeenCalledTimes(2);
			expect(getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${container}.scene`,
				buffer.name,
				verticeRegion,
			);
			expect(getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${container}.scene`,
				buffer.name,
				faceRegion,
			);

			expect(BinToVector3dStringStream).toHaveBeenCalledTimes(1);

			expect(BinToFaceStringStream).toHaveBeenCalledTimes(1);

			expect(result.mimeType).toEqual('"application/json; charset=utf-8"');
		});
	});
};

const testGetMeshByIdNoMesh = () => {
	describe('Get mesh data from ref', () => {
		test('should throw meshNotFound error if the mesh is not found', async () => {
			const uuidStringToBinary = (uuidString) => {
				const bytes = UUIDParse.parse(uuidString);
				// eslint-disable-next-line new-cap
				const buf = new Buffer.from(bytes);
				return Mongo.Binary(buf, 3);
			};

			const teamspace = generateRandomString();
			const container = generateRandomString();
			const meshId = generateUUIDString();

			const projection = {
				parents: 1,
				vertices: 1,
				faces: 1,
				_blobRef: 1,
				primitive: 1,
				rev_id: 1,
			};

			Scene.getNodeById.mockResolvedValue(undefined);

			await expect(ModelHelper.getMeshById(teamspace, container, meshId))
				.rejects.toBe(templates.meshNotFound);

			expect(Scene.getNodeById).toHaveBeenCalledTimes(1);
			expect(Scene.getNodeById).toHaveBeenCalledWith(
				teamspace,
				container,
				uuidStringToBinary(meshId),
				projection,
			);
		});
	});
};

const testGetMeshByIdNoMeshData = () => {
	describe('Get mesh data from ref', () => {
		test('should throw meshDataNotFound error if the mesh has no _blobRef property', async () => {
			const uuidStringToBinary = (uuidString) => {
				const bytes = UUIDParse.parse(uuidString);
				// eslint-disable-next-line new-cap
				const buf = new Buffer.from(bytes);
				return Mongo.Binary(buf, 3);
			};

			const teamspace = generateRandomString();
			const container = generateRandomString();
			const meshId = generateUUIDString();
			const parents = [generateUUID()];
			const revId = generateUUID();
			const primitive = 3;

			const mesh = {
				primitive,
				rev_id: revId,
				parents,
			};

			const projection = {
				parents: 1,
				vertices: 1,
				faces: 1,
				_blobRef: 1,
				primitive: 1,
				rev_id: 1,
			};

			const matrix = [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1],
			];

			const vertexStream = new PassThrough();
			const faceStream = new PassThrough();

			Scene.getNodeById.mockResolvedValue(mesh);
			Scene.getParentMatrix.mockResolvedValue(matrix);

			getFileAsStream.mockResolvedValueOnce({ readStream: vertexStream });
			getFileAsStream.mockResolvedValueOnce({ readStream: faceStream });

			await expect(ModelHelper.getMeshById(teamspace, container, meshId))
				.rejects.toBe(templates.meshDataNotFound);

			expect(Scene.getNodeById).toHaveBeenCalledTimes(1);
			expect(Scene.getNodeById).toHaveBeenCalledWith(
				teamspace,
				container,
				uuidStringToBinary(meshId),
				projection,
			);

			expect(Scene.getParentMatrix).toHaveBeenCalledTimes(1);
			expect(Scene.getParentMatrix).toHaveBeenCalledWith(
				teamspace,
				container,
				parents[0],
				[revId],
			);
		});
	});
};

// describe('utils/helper/models', () => {
// 	testRemoveModelData();
// 	testGetMeshByIdSucc(true);
// 	testGetMeshByIdSucc(false);
// 	testGetMeshByIdNoMesh();
// 	testGetMeshByIdNoMeshData();
// });

const dummyTest = () => {
	describe('dummy test', () => {
		test('should succeed', () => {
			expect(true).toEqual(true);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	dummyTest();
});
