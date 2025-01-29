/**
 *  Copyright (C) 2024 3D Repo Ltd
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
const Stream = require('stream');
const util = require('util');

const { src } = require('../../helper/path');

const JSONAssets = require(`${src}/models/jsonAssets`);

const ServiceHelper = require('../../helper/services');

jest.mock('../../../../src/v5/models/history');
const History = require(`${src}/models/history`);

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);

jest.mock('../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../src/v5/models/ref');
const Ref = require(`${src}/models/ref`);

jest.mock('../../../../src/v5/utils/permissions/permissions');
const Permissions = require(`${src}/utils/permissions/permissions`);

const stringToUUID = (string) => {
	const bytes = UUIDParse.parse(string);
	// eslint-disable-next-line new-cap
	return Mongo.Binary(new Buffer.from(bytes), 3);
};

const pipelineAsync = util.promisify(Stream.pipeline);

const generateMockJSONFileName = () => ServiceHelper.generateUUIDString();

const generateMockJSONFileNames = (count) => {
	const mockJsonFileNames = [];
	for (let i = 0; i < count; i++) {
		mockJsonFileNames.push(generateMockJSONFileName());
	}
	return mockJsonFileNames;
};

const generateMockFile = () => {
	const mockFileContentObj = { data: ServiceHelper.generateRandomString() };
	const mockFileStream = Stream.PassThrough();

	const mockFileContent = JSON.stringify(mockFileContentObj);
	const mockFileContentPart1 = mockFileContent.slice(0, 10);
	const mockFileContentPart2 = mockFileContent.slice(10);

	mockFileStream.write(mockFileContentPart1);
	mockFileStream.write(mockFileContentPart2);
	mockFileStream.end();

	return { mockFileContentObj, mockFileStream };
};

const generateMockFiles = (count) => {
	const mockFileContents = [];
	const mockFileStreams = [];

	for (let i = 0; i < count; i++) {
		const { mockFileContentObj, mockFileStream } = generateMockFile();
		mockFileContents.push(mockFileContentObj);
		mockFileStreams.push(mockFileStream);
	}

	return { mockFileContents, mockFileStreams };
};

const testGetAllSuperMeshMappingForContainer = () => {
	describe('Get all supermesh mappings for a container', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const contId = ServiceHelper.generateUUIDString();
		const branch = 'master';
		const revIdStr = ServiceHelper.generateUUIDString();
		const revId = stringToUUID(revIdStr);

		const mockHistory = {
			_id: revId,
		};

		test('should get all supermesh mapping for the container from the cached file if it exists', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const mockAsset = {
				jsonFiles: undefined,
			};
			db.findOne.mockResolvedValueOnce(mockAsset);

			const mockFileRef = {
				size: Math.round(ServiceHelper.generateRandomNumber(0)),
			};
			FilesManager.fileExists.mockResolvedValue(mockFileRef);

			const { mockFileContentObj, mockFileStream } = generateMockFile();
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForContainer(teamspace, contId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(1);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			const result = JSON.parse(resultStr);
			expect(result).toEqual(mockFileContentObj);
		});

		test('should fall back on unity assets if repo assets don\'t exist', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const mockAsset = {
				jsonFiles: undefined,
			};
			db.findOne.mockResolvedValueOnce(undefined);
			db.findOne.mockResolvedValueOnce(mockAsset);

			const mockFileRef = {
				size: Math.round(ServiceHelper.generateRandomNumber(0)),
			};
			FilesManager.fileExists.mockResolvedValue(mockFileRef);

			const { mockFileContentObj, mockFileStream } = generateMockFile();
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForContainer(teamspace, contId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.unity3d`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(1);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			const result = JSON.parse(resultStr);
			expect(result).toEqual(mockFileContentObj);
		});

		test('should return an empty string if neither unity nore repo assets exist', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);
			db.findOne.mockResolvedValue(undefined);

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForContainer(teamspace, contId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.unity3d`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(resultStr).toEqual('');
		});

		test('should get all supermesh mapping for the container from the json files if a cached file does not exists', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const noFiles = 101;

			const mockJsonFileNames = generateMockJSONFileNames(noFiles);
			const mockAsset = {
				jsonFiles: mockJsonFileNames,
			};
			db.findOne.mockResolvedValueOnce(mockAsset);

			FilesManager.fileExists.mockResolvedValue(false);

			const { mockFileContents, mockFileStreams } = generateMockFiles(noFiles);
			for (let i = 0; i < noFiles; i++) {
				FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStreams[i] });
			}

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForContainer(teamspace, contId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(1);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(noFiles);
			for (let i = 0; i < noFiles; i++) {
				expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
					teamspace,
					`${contId}.stash.json_mpc.ref`,
					`${mockJsonFileNames[i]}`,
				);
			}

			expect(FilesManager.storeFileStream).toHaveBeenCalledTimes(1);

			const expResult = {
				model: contId,
				supermeshes: [],
			};
			for (let i = 0; i < noFiles; i++) {
				expResult.supermeshes.push({
					id: mockJsonFileNames[i],
					data: mockFileContents[i],
				});
			}

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should delete the old cache file if its size is 0', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const mockAsset = {
				jsonFiles: [],
			};
			db.findOne.mockResolvedValueOnce(mockAsset);

			const mockFileRef = {
				size: 0,
			};
			FilesManager.fileExists.mockResolvedValue(mockFileRef);

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForContainer(teamspace, contId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(1);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.removeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFile).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			const expResult = {
				model: contId,
				supermeshes: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should emit "error" if an error is thrown in getSuperMeshMappingForModels', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			db.findOne.mockImplementation(() => {
				throw new Error('mockError');
			});

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForContainer(teamspace, contId, branch, revId);

			const targetStream = Stream.PassThrough();

			let errorCaught = false;
			let error;
			try {
				await pipelineAsync(mappingStream.readStream, targetStream);
			} catch (err) {
				error = err;
				errorCaught = true;
			}

			expect(errorCaught).toBeTruthy();
			expect(error.message).toEqual('mockError');

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
		});

		test('should emit error if the JSON File stream for the cache file throws an error', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const mockJsonFileName = generateMockJSONFileName();
			const mockAsset = {
				jsonFiles: [mockJsonFileName],
			};
			db.findOne.mockResolvedValueOnce(mockAsset);

			const mockFileRef = {
				size: Math.round(ServiceHelper.generateRandomNumber(0)),
			};
			FilesManager.fileExists.mockResolvedValue(mockFileRef);

			const mockFileStream = {
				on: jest.fn().mockImplementation((event, handler) => {
					if (event === 'error') {
						handler(new Error('mockError'));
					}
				}),
			};
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForContainer(teamspace, contId, branch, revId);

			const targetStream = Stream.PassThrough();

			let errorCaught = false;
			let error;

			try {
				await pipelineAsync(mappingStream.readStream, targetStream);
			} catch (err) {
				error = err;
				errorCaught = true;
			}

			expect(errorCaught).toBeTruthy();
			expect(error.message).toEqual('mockError');

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(1);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);
		});

		test('should emit error if a JSON File stream for the generation of the mappings throws an error', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const mockJsonFileName = generateMockJSONFileName();
			const mockAsset = {
				jsonFiles: [mockJsonFileName],
			};
			db.findOne.mockResolvedValueOnce(mockAsset);

			FilesManager.fileExists.mockResolvedValue(false);

			const mockFileStream = {
				on: jest.fn().mockImplementation((event, handler) => {
					if (event === 'error') {
						handler(new Error('mockError'));
					}
				}),
			};
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForContainer(teamspace, contId, branch, revId);

			const targetStream = Stream.PassThrough();

			let errorCaught = false;
			let error;

			try {
				await pipelineAsync(mappingStream.readStream, targetStream);
			} catch (err) {
				error = err;
				errorCaught = true;
			}

			expect(errorCaught).toBeTruthy();
			expect(error.message).toEqual('mockError');

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(1);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${mockJsonFileName}`,
			);
		});

		test('should ignore broken streams when generating super mesh mappings', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const mockJsonFileName = generateMockJSONFileName();
			const mockAsset = {
				jsonFiles: [mockJsonFileName],
			};
			db.findOne.mockResolvedValueOnce(mockAsset);

			FilesManager.fileExists.mockResolvedValue(false);

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: undefined });

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForContainer(teamspace, contId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(1);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${mockJsonFileName}`,
			);

			const expResult = {
				model: contId,
				supermeshes: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});
	});
};

const testGetAllSuperMeshMappingForFederation = () => {
	describe('Get all supermesh mappings for a federation', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const branch = 'master';
		const fedId = ServiceHelper.generateUUIDString();
		const revIdStr = ServiceHelper.generateUUIDString();
		const revId = stringToUUID(revIdStr);

		const cont1Id = ServiceHelper.generateUUIDString();
		const cont2Id = ServiceHelper.generateUUIDString();

		const mockRefNodes = [
			{
				owner: teamspace,
				project: cont1Id,
			},
			{
				owner: teamspace,
				project: cont2Id,
			},
		];

		const mockHistory = {
			_id: revId,
		};

		test('should get all supermesh mapping all containers of the federation from the cached file if it exists', async () => {
			Ref.getRefNodes.mockResolvedValue(mockRefNodes);
			History.findLatest.mockResolvedValue(mockHistory);

			const mockAsset = {
				jsonFiles: undefined,
			};
			db.findOne.mockResolvedValue(mockAsset);

			const mockFileRef = {
				size: Math.round(ServiceHelper.generateRandomNumber(0)),
			};
			FilesManager.fileExists.mockResolvedValue(mockFileRef);

			const cacheMockFiles = generateMockFiles(2);
			const mockCacheFileContents = cacheMockFiles.mockFileContents;
			const mockCacheFileStreams = cacheMockFiles.mockFileStreams;
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockCacheFileStreams[0] });
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockCacheFileStreams[1] });

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForFederation(teamspace, fedId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(2);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(2);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			const expResult = {
				submodels: [],
			};
			for (let i = 0; i < mockCacheFileContents.length; i++) {
				expResult.submodels.push(mockCacheFileContents[i]);
			}

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should fall back on unity assets if repo assets don\'t exist', async () => {
			Ref.getRefNodes.mockResolvedValue(mockRefNodes);
			History.findLatest.mockResolvedValue(mockHistory);

			const mockAsset = {
				jsonFiles: undefined,
			};
			db.findOne.mockImplementation((ts, col) => {
				if (col.includes('repobundles')) {
					return undefined;
				}
				return mockAsset;
			});

			const mockFileRef = {
				size: Math.round(ServiceHelper.generateRandomNumber(0)),
			};
			FilesManager.fileExists.mockResolvedValue(mockFileRef);

			const cacheMockFiles = generateMockFiles(2);
			const mockCacheFileContents = cacheMockFiles.mockFileContents;
			const mockCacheFileStreams = cacheMockFiles.mockFileStreams;
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockCacheFileStreams[0] });
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockCacheFileStreams[1] });

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForFederation(teamspace, fedId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(4);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.unity3d`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.unity3d`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(2);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(2);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			const expResult = {
				submodels: [],
			};
			for (let i = 0; i < mockCacheFileContents.length; i++) {
				expResult.submodels.push(mockCacheFileContents[i]);
			}

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should ignore submodels without unity and repo assets', async () => {
			Ref.getRefNodes.mockResolvedValue(mockRefNodes);
			History.findLatest.mockResolvedValue(mockHistory);

			db.findOne.mockResolvedValue(undefined);

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForFederation(teamspace, fedId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(4);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.unity3d`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.unity3d`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			const expResult = {
				submodels: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should get all supermesh mappings for federation\'s containers from the json files if cached files do not exist', async () => {
			Ref.getRefNodes.mockResolvedValue(mockRefNodes);
			History.findLatest.mockResolvedValue(mockHistory);

			const noFiles = 101;

			const cont1MockJsonFileNames = generateMockJSONFileNames(noFiles);
			const cont1MockAsset = {
				jsonFiles: cont1MockJsonFileNames,
			};
			db.findOne.mockResolvedValueOnce(cont1MockAsset);

			const cont2MockJsonFileNames = generateMockJSONFileNames(noFiles);
			const cont2MockAsset = {
				jsonFiles: cont2MockJsonFileNames,
			};
			db.findOne.mockResolvedValueOnce(cont2MockAsset);

			FilesManager.fileExists.mockResolvedValue(false);

			const cont1MockFiles = generateMockFiles(noFiles);
			for (let i = 0; i < noFiles; i++) {
				FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: cont1MockFiles.mockFileStreams[i] });
			}

			const cont2MockFiles = generateMockFiles(noFiles);
			for (let i = 0; i < noFiles; i++) {
				FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: cont2MockFiles.mockFileStreams[i] });
			}

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForFederation(teamspace, fedId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(2);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(noFiles * 2);
			for (let i = 0; i < noFiles; i++) {
				expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
					teamspace,
					`${cont1Id}.stash.json_mpc.ref`,
					`${cont1MockJsonFileNames[i]}`,
				);
			}
			for (let i = 0; i < noFiles; i++) {
				expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
					teamspace,
					`${cont2Id}.stash.json_mpc.ref`,
					`${cont2MockJsonFileNames[i]}`,
				);
			}

			expect(FilesManager.storeFileStream).toHaveBeenCalledTimes(2);

			const subModelResult1 = {
				model: cont1Id,
				supermeshes: [],
			};
			for (let i = 0; i < noFiles; i++) {
				subModelResult1.supermeshes.push({
					id: cont1MockJsonFileNames[i],
					data: cont1MockFiles.mockFileContents[i],
				});
			}

			const subModelResult2 = {
				model: cont2Id,
				supermeshes: [],
			};
			for (let i = 0; i < noFiles; i++) {
				subModelResult2.supermeshes.push({
					id: cont2MockJsonFileNames[i],
					data: cont2MockFiles.mockFileContents[i],
				});
			}
			const expResult = {
				submodels: [
					subModelResult1,
					subModelResult2,
				],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should delete the old cache file if its size is 0', async () => {
			Ref.getRefNodes.mockResolvedValue(mockRefNodes);
			History.findLatest.mockResolvedValue(mockHistory);

			const mockAsset = {
				jsonFiles: [],
			};
			db.findOne.mockResolvedValue(mockAsset);

			const mockFileRef = {
				size: 0,
			};
			FilesManager.fileExists.mockResolvedValue(mockFileRef);

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForFederation(teamspace, fedId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(2);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.removeFile).toHaveBeenCalledTimes(2);
			expect(FilesManager.removeFile).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);
			expect(FilesManager.removeFile).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			const subModelResult1 = {
				model: cont1Id,
				supermeshes: [],
			};
			const subModelResult2 = {
				model: cont2Id,
				supermeshes: [],
			};
			const expResult = {
				submodels: [
					subModelResult1,
					subModelResult2,
				],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should emit "error" if an error is thrown in getSuperMeshMappingForModels', async () => {
			Ref.getRefNodes.mockResolvedValue(mockRefNodes);
			History.findLatest.mockResolvedValue(mockHistory);

			db.findOne.mockImplementation(() => {
				throw new Error('mockError');
			});

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForFederation(teamspace, fedId, branch, revId);

			const targetStream = Stream.PassThrough();

			let errorCaught = false;
			let error;
			try {
				await pipelineAsync(mappingStream.readStream, targetStream);
			} catch (err) {
				error = err;
				errorCaught = true;
			}

			expect(errorCaught).toBeTruthy();
			expect(error.message).toEqual('mockError');

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
		});

		test('should return a stream with an empty submodel array if History finds no latest revNode', async () => {
			Ref.getRefNodes.mockResolvedValue(mockRefNodes);
			History.findLatest.mockResolvedValue(undefined);

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForFederation(teamspace, fedId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			const expResult = {
				submodels: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should emit error if a JSON File stream for the cache files throws an error', async () => {
			Ref.getRefNodes.mockResolvedValue(mockRefNodes);
			History.findLatest.mockResolvedValue(mockHistory);

			const mockAsset = {
				jsonFiles: undefined,
			};
			db.findOne.mockResolvedValue(mockAsset);

			const mockFileRef = {
				size: Math.round(ServiceHelper.generateRandomNumber(0)),
			};
			FilesManager.fileExists.mockResolvedValue(mockFileRef);

			const mockFileStream = {
				on: jest.fn().mockImplementation((event, handler) => {
					if (event === 'error') {
						handler(new Error('mockError'));
					}
				}),
			};
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForFederation(teamspace, fedId, branch, revId);

			const targetStream = Stream.PassThrough();

			let errorCaught = false;
			let error;

			try {
				await pipelineAsync(mappingStream.readStream, targetStream);
			} catch (err) {
				error = err;
				errorCaught = true;
			}

			expect(errorCaught).toBeTruthy();
			expect(error.message).toEqual('mockError');

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(1);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);
		});

		test('should emit error if a JSON File stream for the generation of one of the mappings throws an error', async () => {
			Ref.getRefNodes.mockResolvedValue(mockRefNodes);
			History.findLatest.mockResolvedValue(mockHistory);

			const mockJsonFileNames = [generateMockJSONFileName()];

			const mockAsset = {
				jsonFiles: mockJsonFileNames,
			};
			db.findOne.mockResolvedValueOnce(mockAsset);

			FilesManager.fileExists.mockResolvedValue(false);

			const mockFileStream = {
				on: jest.fn().mockImplementation((event, handler) => {
					if (event === 'error') {
						handler(new Error('mockError'));
					}
				}),
			};
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForFederation(teamspace, fedId, branch, revId);

			const targetStream = Stream.PassThrough();

			let errorCaught = false;
			let error;

			try {
				await pipelineAsync(mappingStream.readStream, targetStream);
			} catch (err) {
				error = err;
				errorCaught = true;
			}

			expect(errorCaught).toBeTruthy();
			expect(error.message).toEqual('mockError');

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(1);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${mockJsonFileNames[0]}`,
			);
		});

		test('should ignore broken streams when generating super mesh mappings', async () => {
			Ref.getRefNodes.mockResolvedValue(mockRefNodes);
			History.findLatest.mockResolvedValue(mockHistory);

			const mockJsonFileName = generateMockJSONFileName();

			const mockAsset = {
				jsonFiles: [mockJsonFileName],
			};
			db.findOne.mockResolvedValue(mockAsset);

			FilesManager.fileExists.mockResolvedValue(false);

			FilesManager.getFileAsStream.mockResolvedValue({ readStream: undefined });

			const mappingStream = await JSONAssets.getAllSuperMeshMappingForFederation(teamspace, fedId, branch, revId);

			let resultStr = '';
			for await (const chunk of mappingStream.readStream) {
				resultStr += chunk;
			}

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.repobundles`,
				{ _id: revId },
				{ jsonFiles: 1 },
			);

			expect(FilesManager.fileExists).toHaveBeenCalledTimes(2);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);
			expect(FilesManager.fileExists).toHaveBeenCalledWith(
				teamspace,
				`${cont2Id}.stash.json_mpc.ref`,
				`${revIdStr}/supermeshes.json`,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(2);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${mockJsonFileName}`,
			);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${mockJsonFileName}`,
			);

			const subModelResult1 = {
				model: cont1Id,
				supermeshes: [],
			};
			const subModelResult2 = {
				model: cont2Id,
				supermeshes: [],
			};
			const expResult = {
				submodels: [
					subModelResult1,
					subModelResult2,
				],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});
	});
};

const testGetBundleMappings = () => {
	describe('Get the mapping for a bunle', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const contId = ServiceHelper.generateUUIDString();
		const bundleId = ServiceHelper.generateUUIDString();

		const mockFile = {
			readStream: ServiceHelper.generateRandomString(),
		};

		const fileExp = {
			readStream: mockFile.readStream,
			mimeType: 'application/json',
		};

		test('should assemble the file name, retrieve the stream, and return it', async () => {
			FilesManager.getFileAsStream.mockResolvedValueOnce(mockFile);

			const file = await JSONAssets.getBundleMappings(teamspace, contId, bundleId);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${bundleId}.json.mpc`,
			);

			expect(file).toEqual(fileExp);
		});
	});
};

const testGetModelPropertiesForContainer = () => {
	describe('Get model properties for Container from JSON Files', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const projectId = ServiceHelper.generateUUID();
		const branch = 'master';
		const contId = ServiceHelper.generateUUIDString();
		const revIdStr = ServiceHelper.generateUUIDString();
		const revId = stringToUUID(revIdStr);
		const username = ServiceHelper.generateRandomString();

		const mockHistory = {
			_id: revId,
		};

		test('should return stream with model properties of Container', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const { mockFileContentObj, mockFileStream } = generateMockFile();

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			const modelPropStream = await JSONAssets.getModelProperties(
				teamspace,
				projectId,
				contId,
				branch,
				revId,
				username,
				false,
			);

			let resultStr = '';
			for await (const chunk of modelPropStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);

			const expResult = {
				properties: mockFileContentObj,
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should return stream with default values if the tree file can\'t be found', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			FilesManager.getFileAsStream.mockImplementation(() => {
				throw new Error('mockError)');
			});

			const modelPropStream = await JSONAssets.getModelProperties(
				teamspace,
				projectId,
				contId,
				branch,
				revId,
				username,
				false,
			);

			let resultStr = '';
			for await (const chunk of modelPropStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);

			const expResult = {
				hiddenNodes: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should return stream with just the prefix if the stream for the treefile is undefined', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: undefined });

			const modelPropStream = await JSONAssets.getModelProperties(
				teamspace,
				projectId,
				contId,
				branch,
				revId,
				username,
				false,
			);

			let resultStr = '';
			for await (const chunk of modelPropStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				contId,
				branch,
				revId,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${contId}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);

			const expResult = {
				hiddenNodes: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});
	});
};

const testGetModelPropertiesForFederation = () => {
	describe('Get model properties for Federation from JSON Files', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const projectId = ServiceHelper.generateUUID();
		const branch = 'master';
		const fedId = ServiceHelper.generateUUIDString();
		const revIdStr = ServiceHelper.generateUUIDString();
		const revId = stringToUUID(revIdStr);
		const masterRevId = stringToUUID('00000000-0000-0000-0000-000000000000');
		const username = ServiceHelper.generateRandomString();

		const cont1Id = ServiceHelper.generateUUIDString();
		const cont2Id = ServiceHelper.generateUUIDString();

		const mockHistory = {
			_id: revId,
		};

		const mockRefNode1 = {
			owner: teamspace,
			project: cont1Id,
			_rid: revId,
		};
		const mockRefNode2 = {
			owner: teamspace,
			project: cont2Id,
			_rid: masterRevId,
		};
		const mockRefNodes = [mockRefNode1, mockRefNode2];

		test('should return stream with model properties of Federation', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const { mockFileContents, mockFileStreams } = generateMockFiles(3);

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStreams[0] });

			Ref.getRefNodes.mockResolvedValueOnce(mockRefNodes);

			Permissions.hasReadAccessToContainer.mockResolvedValue(true);

			History.findLatest.mockResolvedValueOnce(mockHistory);

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStreams[1] });
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStreams[2] });

			const modelPropStream = await JSONAssets.getModelProperties(
				teamspace,
				projectId,
				fedId,
				branch,
				revId,
				username,
				true,
			);

			let resultStr = '';
			for await (const chunk of modelPropStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(3);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${fedId}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont1Id,
				username,
				true,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont2Id,
				username,
				true,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(1);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			const expResult = {
				properties: mockFileContents[0],
				subModels: [
					{
						account: teamspace,
						model: cont1Id,
						...mockFileContents[1],
					},
					{
						account: teamspace,
						model: cont2Id,
						...mockFileContents[2],
					},
				],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should return stream with default values if the tree file can\'t be found', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			FilesManager.getFileAsStream.mockImplementation(() => {
				throw new Error('mockError)');
			});

			const modelPropStream = await JSONAssets.getModelProperties(
				teamspace,
				projectId,
				fedId,
				branch,
				revId,
				username,
				true,
			);

			let resultStr = '';
			for await (const chunk of modelPropStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${fedId}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);

			const expResult = {
				hiddenNodes: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should return stream with default values and model properties of submodels if the treefile is invalid', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const { mockFileContents, mockFileStreams } = generateMockFiles(2);

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: undefined });

			Ref.getRefNodes.mockResolvedValueOnce(mockRefNodes);

			Permissions.hasReadAccessToContainer.mockResolvedValue(true);

			History.findLatest.mockResolvedValueOnce(mockHistory);

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStreams[0] });
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStreams[1] });

			const modelPropStream = await JSONAssets.getModelProperties(
				teamspace,
				projectId,
				fedId,
				branch,
				revId,
				username,
				true,
			);

			let resultStr = '';
			for await (const chunk of modelPropStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(3);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${fedId}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont1Id,
				username,
				true,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont2Id,
				username,
				true,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(1);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			const expResult = {
				hiddenNodes: [],
				subModels: [
					{
						account: teamspace,
						model: cont1Id,
						...mockFileContents[0],
					},
					{
						account: teamspace,
						model: cont2Id,
						...mockFileContents[1],
					},
				],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should ignore failures from submodel fetches and still return stream with properties that could be fetched', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const { mockFileContentObj, mockFileStream } = generateMockFile();

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			Ref.getRefNodes.mockResolvedValueOnce(mockRefNodes);

			Permissions.hasReadAccessToContainer.mockImplementation(() => { throw new Error('mockError'); });

			const modelPropStream = await JSONAssets.getModelProperties(
				teamspace,
				projectId,
				fedId,
				branch,
				revId,
				username,
				true,
			);

			let resultStr = '';
			for await (const chunk of modelPropStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${fedId}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont1Id,
				username,
				true,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont2Id,
				username,
				true,
			);

			const expResult = {
				properties: mockFileContentObj,
				subModels: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should ignore submodels without read permission and still return stream with properties that could be fetched', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const { mockFileContentObj, mockFileStream } = generateMockFile();

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			Ref.getRefNodes.mockResolvedValueOnce(mockRefNodes);

			Permissions.hasReadAccessToContainer.mockResolvedValue(false);

			const modelPropStream = await JSONAssets.getModelProperties(
				teamspace,
				projectId,
				fedId,
				branch,
				revId,
				username,
				true,
			);

			let resultStr = '';
			for await (const chunk of modelPropStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${fedId}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont1Id,
				username,
				true,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont2Id,
				username,
				true,
			);

			const expResult = {
				properties: mockFileContentObj,
				subModels: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should ignore broken streams from submodels and still return stream with properties that could be fetched', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const { mockFileContentObj, mockFileStream } = generateMockFile();

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			Ref.getRefNodes.mockResolvedValueOnce(mockRefNodes);

			Permissions.hasReadAccessToContainer.mockResolvedValue(true);

			History.findLatest.mockResolvedValueOnce(mockHistory);

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: undefined });
			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: undefined });

			const modelPropStream = await JSONAssets.getModelProperties(
				teamspace,
				projectId,
				fedId,
				branch,
				revId,
				username,
				true,
			);

			let resultStr = '';
			for await (const chunk of modelPropStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(3);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${fedId}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${cont1Id}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont1Id,
				username,
				true,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont2Id,
				username,
				true,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(1);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont2Id,
				{ _id: 1 },
			);

			const expResult = {
				properties: mockFileContentObj,
				subModels: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});

		test('should ignore submodels with master rev id where no latest revision can be found', async () => {
			History.getHistory.mockResolvedValueOnce(mockHistory);

			const { mockFileContentObj, mockFileStream } = generateMockFile();

			FilesManager.getFileAsStream.mockResolvedValueOnce({ readStream: mockFileStream });

			const masterRefNode = {
				owner: teamspace,
				project: cont1Id,
				_rid: masterRevId,
			};

			Ref.getRefNodes.mockResolvedValueOnce([masterRefNode]);

			Permissions.hasReadAccessToContainer.mockResolvedValue(true);

			History.findLatest.mockResolvedValueOnce(undefined);

			const modelPropStream = await JSONAssets.getModelProperties(
				teamspace,
				projectId,
				fedId,
				branch,
				revId,
				username,
				true,
			);

			let resultStr = '';
			for await (const chunk of modelPropStream.readStream) {
				resultStr += chunk;
			}

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				`${fedId}.stash.json_mpc.ref`,
				`${revIdStr}/modelProperties.json`,
			);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				fedId,
				branch,
				revId,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(1);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				cont1Id,
				username,
				true,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(1);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				cont1Id,
				{ _id: 1 },
			);

			const expResult = {
				properties: mockFileContentObj,
				subModels: [],
			};

			const result = JSON.parse(resultStr);
			expect(result).toEqual(expResult);
		});
	});
};

describe('models/jsonAssets', () => {
	testGetAllSuperMeshMappingForContainer();
	testGetAllSuperMeshMappingForFederation();
	testGetBundleMappings();
	testGetModelPropertiesForContainer();
	testGetModelPropertiesForFederation();
});
