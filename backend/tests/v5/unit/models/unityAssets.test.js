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

const { src } = require('../../helper/path');

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);

jest.mock('../../../../src/v5/models/history');
const History = require(`${src}/models/history`);

jest.mock('../../../../src/v5/models/ref');
const Ref = require(`${src}/models/ref`);

jest.mock('../../../../src/v5/utils/permissions/permissions');
const Permissions = require(`${src}/utils/permissions/permissions`);

jest.mock('../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

// jest.mock('../../../../src/v5/utils/helper/uuids');
// const uuidHelper = require(`${src}/utils/helper/uuids`);

const UnityAssets = require('../../../../src/v5/models/unityAssets');

const ServiceHelper = require('../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);

const testGetAssetList = () => {
	const teamspace = ServiceHelper.generateRandomString();
	const projectId = ServiceHelper.generateUUID();
	const modelId = ServiceHelper.generateUUIDString();
	const revId = ServiceHelper.generateUUID();
	const username = ServiceHelper.generateRandomString();

	const repoBundleCollection = `${modelId}.stash.repobundles`;
	const unityBundleCollection = `${modelId}.stash.unity3d`;

	const masterBytes = UUIDParse.parse('00000000-0000-0000-0000-000000000000');
	// eslint-disable-next-line new-cap
	const masterBranchUUID = Mongo.Binary(new Buffer.from(masterBytes), 3);

	describe('Get list of assets for Container', () => {
		const branch = undefined;

		const mockHistory = {
			_id: revId,
		};

		const mockDBEntry = {
			_id: revId,
		};

		test('should lookup repobundle and return list of assets', async () => {
			History.getHistory.mockResolvedValue(mockHistory);
			db.findOne.mockResolvedValue(mockDBEntry);

			const assets = await UnityAssets.getAssetListForCont(teamspace, modelId, undefined, revId);

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				revId,
			);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				repoBundleCollection,
				{ _id: revId },
			);

			expect(assets.models.length).toEqual(1);
			expect(assets.models[0]._id).toEqual(revId);
		});

		test('should fallback on unity bundles if no repobundles are found and return list of assets', async () => {
			History.getHistory.mockResolvedValue(mockHistory);
			db.findOne.mockResolvedValueOnce(undefined);
			db.findOne.mockResolvedValueOnce(mockDBEntry);

			const assets = await UnityAssets.getAssetListForCont(teamspace, modelId, undefined, revId);

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				revId,
			);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				repoBundleCollection,
				{ _id: revId },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				unityBundleCollection,
				{ _id: revId },
			);

			expect(assets.models.length).toEqual(1);
			expect(assets.models[0]._id).toEqual(revId);
		});

		test('should return an empty list if neither repo or unity bundles are found', async () => {
			History.getHistory.mockResolvedValue(mockHistory);
			db.findOne.mockResolvedValue(undefined);

			const assets = await UnityAssets.getAssetListForCont(teamspace, modelId, undefined, revId);

			expect(History.getHistory).toHaveBeenCalledTimes(1);
			expect(History.getHistory).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				revId,
			);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				repoBundleCollection,
				{ _id: revId },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				unityBundleCollection,
				{ _id: revId },
			);

			expect(assets.models.length).toEqual(0);
		});
	});

	describe('Get list of assets for Federation', () => {
		const branch = undefined;
		const contAId = ServiceHelper.generateUUIDString();
		const contBId = ServiceHelper.generateUUIDString();

		const mockRefNode1 = {
			project: contAId,
			_rid: masterBranchUUID,
			owner: teamspace,
		};
		const mockRefNode2 = {
			project: contBId,
			_rid: masterBranchUUID,
			owner: teamspace,
		};

		const mockHistory = {
			_id: revId,
		};

		const mockDBEntry = {
			_id: revId,
		};

		test('should lookup repobundles and return list of assets', async () => {
			Ref.getRefNodes.mockResolvedValue([mockRefNode1, mockRefNode2]);

			Permissions.hasReadAccessToContainer.mockResolvedValue(true);
			History.findLatest.mockResolvedValue(mockHistory);
			db.findOne.mockResolvedValue(mockDBEntry);

			const assets = await UnityAssets.getAssetListForFed(teamspace, projectId, modelId, branch, username);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				undefined,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contAId,
				username,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contBId,
				username,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				contAId,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				contBId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(2);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contAId}.stash.repobundles`,
				{ _id: revId },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contBId}.stash.repobundles`,
				{ _id: revId },
			);

			expect(assets.models.length).toEqual(2);
			expect(assets.models[0]._id).toEqual(revId);
			expect(assets.models[1]._id).toEqual(revId);
		});

		test('should fallback on unity bundles if no repobundles are found and return list of assets', async () => {
			Ref.getRefNodes.mockResolvedValue([mockRefNode1, mockRefNode2]);

			Permissions.hasReadAccessToContainer.mockResolvedValue(true);
			History.findLatest.mockResolvedValue(mockHistory);

			db.findOne = jest.fn((ts, col) => {
				if (col.includes('repobundles')) {
					return undefined;
				}
				return mockDBEntry;
			});

			const assets = await UnityAssets.getAssetListForFed(teamspace, projectId, modelId, branch, username);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				undefined,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contAId,
				username,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contBId,
				username,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(2);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				contAId,
				{ _id: 1 },
			);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				contBId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(4);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contAId}.stash.repobundles`,
				{ _id: revId },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contAId}.stash.unity3d`,
				{ _id: revId },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contBId}.stash.repobundles`,
				{ _id: revId },
			);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contBId}.stash.unity3d`,
				{ _id: revId },
			);

			expect(assets.models.length).toEqual(2);
			expect(assets.models[0]._id).toEqual(revId);
			expect(assets.models[1]._id).toEqual(revId);
		});

		test('should return an empty list if no ref nodes are found', async () => {
			Ref.getRefNodes.mockResolvedValue([]);

			const assets = await UnityAssets.getAssetListForFed(teamspace, projectId, modelId, branch, username);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				undefined,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(0);

			expect(History.findLatest).toHaveBeenCalledTimes(0);

			expect(db.findOne).toHaveBeenCalledTimes(0);

			expect(assets.models.length).toEqual(0);
		});

		test('should return an empty list if the user has no permissions', async () => {
			Ref.getRefNodes.mockResolvedValue([mockRefNode1, mockRefNode2]);

			Permissions.hasReadAccessToContainer.mockResolvedValue(false);

			const assets = await UnityAssets.getAssetListForFed(teamspace, projectId, modelId, branch, username);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				undefined,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(2);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contAId,
				username,
			);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contBId,
				username,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(0);
			expect(db.findOne).toHaveBeenCalledTimes(0);

			expect(assets.models.length).toEqual(0);
		});

		test('should skip the lookup for the latest revision if one is provided in the refNode', async () => {
			const mockRefNodeRev = {
				project: contAId,
				_rid: revId,
				owner: teamspace,
			};
			Ref.getRefNodes.mockResolvedValue([mockRefNodeRev]);

			Permissions.hasReadAccessToContainer.mockResolvedValue(true);
			db.findOne.mockResolvedValue(mockDBEntry);

			const assets = await UnityAssets.getAssetListForFed(teamspace, projectId, modelId, branch, username);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				undefined,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(1);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contAId,
				username,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(0);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				`${contAId}.stash.repobundles`,
				{ _id: revId },
			);

			expect(assets.models.length).toEqual(1);
			expect(assets.models[0]._id).toEqual(revId);
		});

		test('should return an empty list if the master branch is requested but no latest version found', async () => {
			Ref.getRefNodes.mockResolvedValue([mockRefNode1]);

			Permissions.hasReadAccessToContainer.mockResolvedValue(true);
			History.findLatest.mockResolvedValue(undefined);

			const assets = await UnityAssets.getAssetListForFed(teamspace, projectId, modelId, branch, username);

			expect(Ref.getRefNodes).toHaveBeenCalledTimes(1);
			expect(Ref.getRefNodes).toHaveBeenCalledWith(
				teamspace,
				modelId,
				branch,
				undefined,
			);

			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledTimes(1);
			expect(Permissions.hasReadAccessToContainer).toHaveBeenCalledWith(
				teamspace,
				projectId,
				contAId,
				username,
			);

			expect(History.findLatest).toHaveBeenCalledTimes(1);
			expect(History.findLatest).toHaveBeenCalledWith(
				teamspace,
				contAId,
				{ _id: 1 },
			);

			expect(db.findOne).toHaveBeenCalledTimes(0);

			expect(assets.models.length).toEqual(0);
		});
	});
};

const testGetTexture = () => {
	describe('Get Texture', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const modelId = ServiceHelper.generateUUIDString();
		const texId = ServiceHelper.generateUUID();
		const texCollection = `${modelId}.scene`;

		const getRandomPosInt = () => Math.round(ServiceHelper.generateRandomNumber(0));

		test('should retrieve the texture with the given ID', async () => {
			const mockElements = {
				data: {
					start: getRandomPosInt(),
					size: getRandomPosInt(),
				},
			};
			const mockBuffer = {
				start: getRandomPosInt(),
				name: ServiceHelper.generateRandomString(),
			};
			const mockNode = {
				_blobRef: {
					elements: mockElements,
					buffer: mockBuffer,
				},
				extension: 'jpeg',
			};
			db.findOne.mockResolvedValue(mockNode);

			FilesManager.getFileAsStream.mockResolvedValue({});

			const texResponse = await UnityAssets.getTexture(teamspace, modelId, texId);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				texCollection,
				{ _id: texId, type: 'texture' },
				{ _id: 1, _blobRef: 1, extension: 1 },
			);

			const expectedChunkStart = mockBuffer.start + mockElements.data.start;
			const expectedChunkSize = expectedChunkStart + mockElements.data.size;
			const expectedChunkInfo = {
				start: expectedChunkStart,
				end: expectedChunkSize,
			};

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				texCollection,
				mockBuffer.name,
				expectedChunkInfo,
			);

			expect(texResponse.mimeType).toEqual('image/jpeg');
			expect(texResponse.size).toEqual(expectedChunkInfo.end - expectedChunkInfo.start);
		});

		// Throw error if texture not found
		test('should throw error if texture cannot be found', async () => {
			db.findOne.mockResolvedValue(undefined);

			await expect(UnityAssets.getTexture(teamspace, modelId, texId))
				.rejects.toBe(templates.textureNotFound);
		});

		// If it is a jpg, change extension
		test('when retrieving the texture with a jpg extension, it should be corrected to jpeg', async () => {
			const mockElements = {
				data: {
					start: getRandomPosInt(),
					size: getRandomPosInt(),
				},
			};
			const mockBuffer = {
				start: getRandomPosInt(),
				name: ServiceHelper.generateRandomString(),
			};
			const mockNode = {
				_blobRef: {
					elements: mockElements,
					buffer: mockBuffer,
				},
				extension: 'jpg',
			};
			db.findOne.mockResolvedValue(mockNode);

			FilesManager.getFileAsStream.mockResolvedValue({});

			const texResponse = await UnityAssets.getTexture(teamspace, modelId, texId);

			expect(db.findOne).toHaveBeenCalledTimes(1);
			expect(db.findOne).toHaveBeenCalledWith(
				teamspace,
				texCollection,
				{ _id: texId, type: 'texture' },
				{ _id: 1, _blobRef: 1, extension: 1 },
			);

			const expectedChunkStart = mockBuffer.start + mockElements.data.start;
			const expectedChunkSize = expectedChunkStart + mockElements.data.size;
			const expectedChunkInfo = {
				start: expectedChunkStart,
				end: expectedChunkSize,
			};

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				texCollection,
				mockBuffer.name,
				expectedChunkInfo,
			);

			expect(texResponse.mimeType).toEqual('image/jpeg');
			expect(texResponse.size).toEqual(expectedChunkInfo.end - expectedChunkInfo.start);
		});
	});
};

const testGetRepoBundle = () => {
	describe('Get Repo Bundle', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const modelId = ServiceHelper.generateUUIDString();
		const bundleId = ServiceHelper.generateUUIDString();

		const expFileName = `${bundleId}`;
		const expCollection = `${modelId}.stash.repobundles.ref`;

		test('should construct file and collection name, call getFileAsStream with it, and directly return result', async () => {
			FilesManager.getFileAsStream.mockResolvedValue('mockResult');

			const result = await UnityAssets.getRepoBundle(teamspace, modelId, bundleId);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				expCollection,
				expFileName,
			);

			expect(result).toBe('mockResult');
		});
	});
};

const testGetUnityBundle = () => {
	describe('Get Unity Bundle', () => {
		const teamspace = ServiceHelper.generateRandomString();
		const modelId = ServiceHelper.generateUUIDString();
		const bundleId = ServiceHelper.generateUUIDString();

		const expFileName = `${bundleId}.unity3d`;
		const expCollection = `${modelId}.stash.unity3d.ref`;

		test('should construct file and collection name, call getFileAsStream with it, and directly return result', async () => {
			FilesManager.getFileAsStream.mockResolvedValue('mockResult');

			const result = await UnityAssets.getUnityBundle(teamspace, modelId, bundleId);

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				expCollection,
				expFileName,
			);

			expect(result).toBe('mockResult');
		});
	});
};

describe('models/unityAssets', () => {
	testGetAssetList();
	testGetTexture();
	testGetRepoBundle();
	testGetUnityBundle();
});
