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

const { determineTestGroup } = require('../../../../../../../helper/utils');
const { src } = require('../../../../../../../helper/path');
const {
	generateRandomString,
	generateUUID,
	generateRandomObject,
} = require('../../../../../../../helper/dataGen');
const { UUIDToString } = require('../../../../../../../../../src/v5/utils/helper/uuids');

jest.mock('../../../../../../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

const pointCloudAssets = require(`${src}/processors/teamspaces/projects/models/commons/assets/pointClouds`);

const STASH_POINTCLOUD_EXT = '.stash.pointclouds';
const STASH_POINTCLOUD_OCTREE_FILE = 'octree.bin';
const STASH_POINTCLOUD_HIERARCHY_FILE = 'hierarchy.bin';

const testGetPointCloudOctreeData = () => {
	describe('getPointCloudOctreeData', () => {
		const teamspace = generateRandomString();
		const container = generateRandomString();
		const revision = generateUUID();
		const offset = 123;
		const size = 456;

		test('should return what getFileAsStream returns', async () => {
			const mockResult = generateRandomObject();
			FilesManager.getFileAsStream.mockResolvedValueOnce(mockResult);

			await expect(pointCloudAssets.getPointCloudOctreeData(teamspace, container, revision, offset, size))
				.resolves.toEqual(mockResult);

			const expectedSectionInfo = {
				start: 123,
				end: 578,
			};

			const expectedCollection = `${container}${STASH_POINTCLOUD_EXT}`;
			const expectedFileName = `${UUIDToString(revision)}/${STASH_POINTCLOUD_OCTREE_FILE}`;

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				expectedCollection,
				expectedFileName,
				expectedSectionInfo,
			);
		});
	});
};

const testGetPointCloudHierarchyData = () => {
	describe('getPointCloudHierarchyData', () => {
		const teamspace = generateRandomString();
		const container = generateRandomString();
		const revision = generateUUID();
		const offset = 123;
		const size = 456;

		test('should return what getFileAsStream returns', async () => {
			const mockResult = generateRandomObject();
			FilesManager.getFileAsStream.mockResolvedValueOnce(mockResult);

			await expect(pointCloudAssets.getPointCloudHierarchyData(teamspace, container, revision, offset, size))
				.resolves.toEqual(mockResult);

			const expectedSectionInfo = {
				start: 123,
				end: 578,
			};

			const expectedCollection = `${container}${STASH_POINTCLOUD_EXT}`;
			const expectedFileName = `${UUIDToString(revision)}/${STASH_POINTCLOUD_HIERARCHY_FILE}`;

			expect(FilesManager.getFileAsStream).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFileAsStream).toHaveBeenCalledWith(
				teamspace,
				expectedCollection,
				expectedFileName,
				expectedSectionInfo,
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetPointCloudOctreeData();
	testGetPointCloudHierarchyData();
});
