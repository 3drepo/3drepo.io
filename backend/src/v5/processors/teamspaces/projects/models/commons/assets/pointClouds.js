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

const { UUIDToString } = require('../../../../../../utils/helper/uuids');
const { getFileAsStream } = require('../../../../../../services/filesManager');

const PointCloudAssets = {};

const STASH_POINTCLOUD_EXT = '.stash.pointclouds';
const STASH_POINTCLOUD_OCTREE_FILE = 'octree.bin';
const STASH_POINTCLOUD_HIERARCHY_FILE = 'hierarchy.bin';

PointCloudAssets.getPointCloudOctreeData = async (teamspace, container, revision, offset, size) => {
	
    const sectionInfo = {
        start: offset,
        end: offset + size - 1, // - 1 because end is inclusive
    };

    const fileName = `${UUIDToString(revision)}/${STASH_POINTCLOUD_OCTREE_FILE}`;

	return getFileAsStream(teamspace, `${container}${STASH_POINTCLOUD_EXT}`, fileName, sectionInfo);
};

PointCloudAssets.getPointCloudHierarchyData = async (teamspace, container, revision, offset, size) => {
	
	const sectionInfo = {
        start: offset,
        end: offset + size - 1, // - 1 because end is inclusive
    };

    const fileName = `${UUIDToString(revision)}/${STASH_POINTCLOUD_HIERARCHY_FILE}`;

	return getFileAsStream(teamspace, `${container}${STASH_POINTCLOUD_EXT}`, fileName, sectionInfo);
};

module.exports = PointCloudAssets;