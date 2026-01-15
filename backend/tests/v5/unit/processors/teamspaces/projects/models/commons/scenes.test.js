/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { src } = require('../../../../../../helper/path');
const {
	determineTestGroup,
	generateRandomString,
	generateUUID,
	generateUUIDString,
	generateRandomIfcGuid,
	generateRandomRvtId,
	sleepMS,
	generateRandomObject,
} = require('../../../../../../helper/services');

const { UUIDToString, stringToUUID } = require(`${src}/utils/helper/uuids`);
const { idTypesToKeys, idTypes, metaKeyToIdType } = require(`${src}/models/metadata.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const { nodeTypes } = require(`${src}/models/scenes.constants`);
const GeoMaths = require(`${src}/utils/helper/geoMaths`);

const Scenes = require(`${src}/processors/teamspaces/projects/models/commons/scenes`);

jest.mock('../../../../../../../../src/v5/models/scenes.stash');
const SceneStashModel = require(`${src}/models/scenes.stash`);

jest.mock('../../../../../../../../src/v5/models/metadata');
const MetaModel = require(`${src}/models/metadata`);

jest.mock('../../../../../../../../src/v5/models/scenes');
const ScenesModel = require(`${src}/models/scenes`);

jest.mock('../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const { Readable } = require('stream');

const testGetMeshesWithParentIds = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const container = generateRandomString();
	const revision = generateUUID();
	const parentIds = times(10, generateUUID);

	const nodesMocked = [];
	const meshesToReturn = [];

	const meshMap = {};
	const dupMeshMap = {};

	const dupValues = times(10, generateUUIDString);

	for (let i = 1; i <= 10; ++i) {
		const id = generateUUIDString();
		nodesMocked.push({ _id: stringToUUID(id) });
		const results = times(i, generateUUIDString);
		meshMap[id] = results;
		dupMeshMap[id] = dupValues;
		meshesToReturn.push(...results.map(stringToUUID));
	}

	const defaultParams = {
		nodes: nodesMocked,
		meshMapFile: JSON.stringify(meshMap),
		expectedResults: meshesToReturn,
	};

	describe.each([
		['empty array if no corresponding nodes are found', { ...defaultParams, nodes: [], expectedResults: [] }],
		['empty array if no corresponding mesh mapping is found', { ...defaultParams, nodes: times(10, () => ({ _id: generateUUID() })), expectedResults: [] }],
		['expected mesh ids', defaultParams],
		['expected mesh ids in string form if returnString is set to true', { ...defaultParams, returnString: true, expectedResults: defaultParams.expectedResults.map(UUIDToString) }],
		['expected mesh ids without duplicates', { ...defaultParams, meshMapFile: JSON.stringify(dupMeshMap), expectedResults: dupValues.map(stringToUUID) }],
	])('Get meshes with parent Ids', (desc, { nodes, meshMapFile, expectedResults, returnString }) => {
		test(`Should return ${desc}`, async () => {
			Scenes.setCacheExpiration(1);
			Scenes.clearCache();
			ScenesModel.getNodesBySharedIds.mockResolvedValueOnce(nodes);
			FilesManager.getFile.mockResolvedValueOnce(meshMapFile);

			const res = await Scenes.getMeshesWithParentIds(teamspace, project, container, revision,
				parentIds, returnString);
			expect(res).toEqual(expectedResults);

			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodesBySharedIds).toHaveBeenCalledWith(teamspace,
				project, container, revision, parentIds, { _id: 1 });

			expect(FilesManager.getFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFile).toHaveBeenCalledWith(teamspace, `${container}.stash.json_mpc`, `${UUIDToString(revision)}/idToMeshes.json`);
		});
	});
};

const testGetExternalIdsFromMetadata = () => {
	const generateMeta = (ifc, revit) => {
		const metadata = [{ key: generateRandomString(), value: generateRandomString() }];

		if (revit) {
			metadata.push(...Object.values(idTypesToKeys[idTypes.REVIT]).map((key) => ({
				key, value: revit,
			})));
		}

		if (ifc) {
			metadata.push(...Object.values(idTypesToKeys[idTypes.IFC]).map((key) => ({
				key, value: ifc,
			})));
		}

		return { metadata };
	};

	const ifcOnlyMeta = times(4, () => generateMeta(generateRandomIfcGuid()));
	const rvtOnlyMeta = times(4, () => generateMeta(undefined, generateRandomRvtId()));
	const bothMeta = times(4, () => generateMeta(generateRandomIfcGuid(), generateRandomRvtId()));

	const getIDsFromMeta = (meta, targetType) => meta.flatMap(({ metadata }) => {
		for (const { key, value } of metadata) {
			if (metaKeyToIdType[key] === targetType) return value;
		}
		return [];
	});

	describe.each([
		['undefined if metadata is empty', []],
		['undefined if the metadata entry has no metadata', [{}]],
		['ifc guids if matched', ifcOnlyMeta, undefined, { key: idTypes.IFC, values: getIDsFromMeta(ifcOnlyMeta, idTypes.IFC) }],
		['rvt ids if matched', rvtOnlyMeta, undefined, { key: idTypes.REVIT, values: getIDsFromMeta(rvtOnlyMeta, idTypes.REVIT) }],
		['ifc guids if both rvt and ifc matched', bothMeta, undefined, { key: idTypes.IFC, values: getIDsFromMeta(bothMeta, idTypes.IFC) }],
		['revit ids if requested', bothMeta, idTypes.REVIT, { key: idTypes.REVIT, values: getIDsFromMeta(bothMeta, idTypes.REVIT) }],
		['partial match of a specific id if requested', [...ifcOnlyMeta, ...rvtOnlyMeta], idTypes.REVIT, { key: idTypes.REVIT, values: getIDsFromMeta(rvtOnlyMeta, idTypes.REVIT) }],
		['undefined if partial match and no specific type is requested', [...ifcOnlyMeta, ...rvtOnlyMeta]],
		['all unique values', [...ifcOnlyMeta, ...ifcOnlyMeta], undefined, { key: idTypes.IFC, values: getIDsFromMeta(ifcOnlyMeta, idTypes.IFC) }],

	])('Get external ids from metadata', (desc, metadata, wantedType, expectedResults) => {
		test(`Should return ${desc}`, () => {
			expect(Scenes.getExternalIdsFromMetadata(metadata, wantedType)).toEqual(expectedResults);
		});
	});
};

const testSharedIdsToExternalIds = () => {
	describe('Get shared ids from external ids', () => {
		test('should fetch the metadata query and call getExternalIdsFromMetadata', async () => {
			const teamspace = generateRandomString();
			const container = generateRandomString();
			const revId = generateUUID();
			const sharedIds = times(10, generateUUID);

			const metaRes = generateRandomString();
			const finalRes = generateRandomString();

			MetaModel.getMetadataByQuery.mockResolvedValueOnce(metaRes);

			const fn = jest.spyOn(Scenes, 'getExternalIdsFromMetadata');
			fn.mockReturnValueOnce(finalRes);

			const res = await Scenes.sharedIdsToExternalIds(teamspace, container, revId, sharedIds);

			expect(res).toEqual(finalRes);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(metaRes);

			const externalIdKeys = Object.values(idTypesToKeys).flat();
			const query = { parents: { $in: sharedIds }, 'metadata.key': { $in: externalIdKeys }, rev_id: revId };
			const projection = { metadata: 1 };

			expect(MetaModel.getMetadataByQuery).toHaveBeenCalledTimes(1);
			expect(MetaModel.getMetadataByQuery).toHaveBeenCalledWith(
				teamspace, container, query, projection);
		});
	});
};

const testPrepareCache = () => {
	describe('Prepare cache', () => {
		const teamspace = generateRandomString();
		const model = generateRandomString();
		const revId = generateUUID();
		test('should prepare the cache file when called', async () => {
			FilesManager.getFile.mockResolvedValue(JSON.stringify({}));
			await expect(Scenes.prepareCache(teamspace, model, revId, 50)).resolves.toBeUndefined();

			await sleepMS(10);

			await expect(Scenes.prepareCache(teamspace, model, revId)).resolves.toBeUndefined();

			await sleepMS(100);

			await expect(Scenes.prepareCache(teamspace, model, revId, 1)).resolves.toBeUndefined();

			expect(FilesManager.getFile).toHaveBeenCalledTimes(2);
			expect(FilesManager.getFile).toHaveBeenCalledWith(teamspace, `${model}.stash.json_mpc`, `${UUIDToString(revId)}/idToMeshes.json`);
		});
	});
};

const testGetMeshData = () => {
	describe('Get mesh data', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const container = generateRandomString();
		const meshId = generateUUID();
		test('Should throw an error if mesh node is not found', async () => {
			ScenesModel.getNodeByQuery.mockResolvedValueOnce(null);

			await expect(Scenes.getMeshData(teamspace, project, container, meshId))
				.rejects.toEqual(templates.meshNotFound);

			expect(ScenesModel.getNodeByQuery).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodeByQuery).toHaveBeenCalledWith(teamspace, project, container,
				{ _id: meshId, type: nodeTypes.MESH }, {
					parents: 1,
					_blobRef: 1,
					primitive: 1,
				});
		});
		test('Should throw an error if mesh node has no _blobRef', async () => {
			ScenesModel.getNodeByQuery.mockResolvedValueOnce({});

			await expect(Scenes.getMeshData(teamspace, project, container, meshId))
				.rejects.toEqual(templates.meshNotFound);

			expect(ScenesModel.getNodeByQuery).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodeByQuery).toHaveBeenCalledWith(teamspace, project, container,
				{ _id: meshId, type: nodeTypes.MESH }, {
					parents: 1,
					_blobRef: 1,
					primitive: 1,
				});
		});

		const matrix1 = times(4, () => times(4, () => Math.random()));
		const matrix2 = times(4, () => times(4, () => Math.random()));
		const resultMatrix = GeoMaths.matrices.multiply(matrix2, matrix1);

		[
			['Should return identity matrix if parent node has no matrix', [{}], GeoMaths.matrices.identity()],
			['Should return parent\'s matrix if parent node exists', [{ matrix: matrix1 }], matrix1],
			['Should return multipled matrix if more than one ancestor exist', [{ matrix: matrix1, parents: [generateUUIDString()] }, { matrix: matrix2, parents: [generateUUIDString()] }, { }], resultMatrix],
			['Should return multipled matrix if more than one ancestor exist (one with no matrix)', [{ matrix: matrix1, parents: [generateUUIDString()] }, { parents: [generateUUIDString()] }, { matrix: matrix2, parents: [generateUUIDString()] }, { }], resultMatrix],
		]
			.forEach(([desc, parentMocks, expectedMatrix]) => {
				test(desc, async () => {
					const parentId = generateUUIDString();
					const fileName = generateRandomString();

					// Mesh node
					ScenesModel.getNodeByQuery.mockResolvedValueOnce({
						// eslint-disable-next-line no-underscore-dangle
						_blobRef: {
							elements: {
								vertices: { start: 0, size: 12 },
								faces: { start: 12, size: 12 },
							},
							buffer: {
								start: 0,
								name: fileName,
							},
						},
						parents: [parentId],
					});

					// Parent node mocks
					parentMocks.forEach((mock) => {
						ScenesModel.getNodeByQuery.mockResolvedValueOnce(mock);
					});

					const verticesReadStream = generateRandomString();
					const facesReadStream = generateRandomString();

					FilesManager.getFileAsStream.mockResolvedValueOnce({
						readStream: verticesReadStream,
					});
					FilesManager.getFileAsStream.mockResolvedValueOnce({
						readStream: facesReadStream,
					});

					const vectorData = generateRandomObject();
					const faceData = generateRandomObject();
					// spy on geomaths vectors and faces toJSONStream
					const vectorSpy = jest.spyOn(GeoMaths.vectors, 'toJSONStream').mockReturnValueOnce(Readable.from([JSON.stringify(vectorData)]));
					const facesSpy = jest.spyOn(GeoMaths.faces, 'toJSONStream').mockReturnValueOnce(Readable.from([JSON.stringify(faceData)]));

					const resStream = await Scenes.getMeshData(teamspace, project, container, meshId);

					const chunks = [];
					for await (const chunk of resStream) {
						chunks.push(chunk);
					}
					const resString = chunks.join('');
					const expectedString = `{"matrix":${JSON.stringify(expectedMatrix)},"primitive": 3,"vertices":[${JSON.stringify(vectorData)}],"faces":[${JSON.stringify(faceData)}]}`;
					expect(resString).toEqual(expectedString);

					expect(ScenesModel.getNodeByQuery).toHaveBeenCalledTimes(1 + parentMocks.length);
					expect(ScenesModel.getNodeByQuery).toHaveBeenNthCalledWith(1, teamspace, project, container,
						{ _id: meshId, type: nodeTypes.MESH }, {
							parents: 1,
							_blobRef: 1,
							primitive: 1,
						});
					parentMocks.forEach((_, index) => {
						const sharedId = index === 0 ? parentId : parentMocks[index - 1].parents[0];
						expect(ScenesModel.getNodeByQuery).toHaveBeenNthCalledWith(
							2 + index, teamspace, project, container,
							{ shared_id: sharedId, type: nodeTypes.TRANSFORMATION }, {
								parents: 1,
								matrix: 1,
							});
					});

					expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(2);
					expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, `${container}.scene`,
						fileName, { start: 0, end: 11 });
					expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, `${container}.scene`,
						fileName, { start: 12, end: 23 });

					expect(vectorSpy).toHaveBeenCalledTimes(1);
					expect(vectorSpy).toHaveBeenCalledWith(verticesReadStream);

					expect(facesSpy).toHaveBeenCalledTimes(1);
					expect(facesSpy).toHaveBeenCalledWith(facesReadStream);
				});
			});
	});
};

const testGetTexture = () => {
	describe('Get texture', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const container = generateRandomString();
		const textureId = generateUUID();
		test('Should throw an error if texture node is not found', async () => {
			ScenesModel.getNodeByQuery.mockResolvedValueOnce(null);

			await expect(Scenes.getTexture(teamspace, project, container, textureId))
				.rejects.toEqual(templates.textureNotFound);

			expect(ScenesModel.getNodeByQuery).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodeByQuery).toHaveBeenCalledWith(teamspace, project, container,
				{ _id: textureId, type: nodeTypes.TEXTURE }, {
					_id: 1,
					_blobRef: 1,
					extension: 1,
				});
		});
		test('Should throw an error if texture node has no _blobRef', async () => {
			ScenesModel.getNodeByQuery.mockResolvedValueOnce({});

			await expect(Scenes.getTexture(teamspace, project, container, textureId))
				.rejects.toEqual(templates.textureNotFound);

			expect(ScenesModel.getNodeByQuery).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodeByQuery).toHaveBeenCalledWith(teamspace, project, container,
				{ _id: textureId, type: nodeTypes.TEXTURE }, {
					_id: 1,
					_blobRef: 1,
					extension: 1,
				});
		});

		test('Should return texture stream and mime type if texture node is found', async () => {
			const fileName = generateRandomString();
			const extension = 'png';

			// Texture node
			ScenesModel.getNodeByQuery.mockResolvedValueOnce({
				// eslint-disable-next-line no-underscore-dangle
				_blobRef: {
					elements: {
						data: { start: 0, size: 100 },
					},
					buffer: {
						start: 0,
						name: fileName,
					},
				},
				extension,
			});

			const readStream = generateRandomString();

			FilesManager.getFileAsStream.mockResolvedValueOnce({
				readStream,
			});

			const res = await Scenes.getTexture(teamspace, project, container, textureId);

			expect(res).toEqual({
				readStream,
				mimeType: `image/${extension}`,
				size: 100,
			});

			expect(ScenesModel.getNodeByQuery).toHaveBeenCalledTimes(1);
			expect(ScenesModel.getNodeByQuery).toHaveBeenCalledWith(teamspace, project, container,
				{ _id: textureId, type: nodeTypes.TEXTURE }, {
					_id: 1,
					_blobRef: 1,
					extension: 1,
				});

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(teamspace, `${container}.scene`,
				fileName, { start: 0, end: 100 });
		});

		test('Should return texture stream and mime type as jpeg if texture node extension is jpg', async () => {
			const fileName = generateRandomString();
			const extension = 'jpg';

			// Texture node
			ScenesModel.getNodeByQuery.mockResolvedValueOnce({
				// eslint-disable-next-line no-underscore-dangle
				_blobRef: {
					elements: {
						data: { start: 0, size: 100 },
					},
					buffer: {
						start: 0,
						name: fileName,
					},
				},
				extension,
			});

			const readStream = generateRandomString();

			FilesManager.getFileAsStream.mockResolvedValueOnce({
				readStream,
			});

			const res = await Scenes.getTexture(teamspace, project, container, textureId);

			expect(res).toEqual({
				readStream,
				mimeType: 'image/jpeg',
				size: 100,
			});
		});
	});
};

const testGetSuperMeshesInfo = () => {
	describe('Get supermeshes info in revision', () => {
		const teamspace = generateRandomString();
		const model = generateRandomString();
		const revision = generateUUID();

		test('Should return supermeshes info in revision', async () => {
			const data = generateRandomObject();
			SceneStashModel.getSuperMeshesInRevision.mockResolvedValueOnce(data);

			expect(await Scenes.getSuperMeshesInfo(teamspace, model, revision)).toEqual({ superMeshes: data });

			expect(SceneStashModel.getSuperMeshesInRevision).toHaveBeenCalledTimes(1);
			expect(SceneStashModel.getSuperMeshesInRevision).toHaveBeenCalledWith(
				teamspace, model, revision,
				{
					_id: 1,
					vertices_count: 1,
					faces_count: 1,
					uv_channels_count: 1,
					bounding_box: 1,
					primitive: 1,
				},
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetMeshesWithParentIds();
	testGetExternalIdsFromMetadata();
	testSharedIdsToExternalIds();
	testPrepareCache();
	testGetTexture();
	testGetMeshData();
	testGetSuperMeshesInfo();
});
