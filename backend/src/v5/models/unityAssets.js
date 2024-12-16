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

const FilesManager = require('../services/filesManager');
const db = require('../handler/db');
const { templates } = require('../utils/responseCodes');

const UnityAssets = {};

UnityAssets.getRepoBundle = async (account, model, id) => {
	const bundleFileName = `${id}`;
	const collection = `${model}.stash.repobundles.ref`;
	const result = await FilesManager.getFileAsStream(account, collection, bundleFileName);
	return result;
};

UnityAssets.getUnityBundle = async (account, model, id) => {
	const bundleFileName = `${id}.unity3d`;
	const collection = `${model}.stash.unity3d.ref`;
	const result = await FilesManager.getFileAsStream(account, collection, bundleFileName);
	return result;
};

UnityAssets.getTexture = async (account, model, id) => {
	const collection = `${model}.scene`;

	const node = await db.findOne(account, collection, { _id: id, type: 'texture' }, {
		_id: 1,
		_blobRef: 1,
		extension: 1,
	});

	if (!node) {
		throw (templates.textureNotFound);
	}

	// eslint-disable-next-line no-underscore-dangle
	const { elements, buffer } = node._blobRef;

	// chunkInfo is passed to createReadStream, which expects `start` and `end` properties
	const chunkInfo = {
		start: buffer.start + elements.data.start,
		end: buffer.start + elements.data.start + elements.data.size,
	};

	const response = await FilesManager.getFileAsStream(account, collection, buffer.name, chunkInfo);

	if (node.extension === 'jpg') {
		node.extension = 'jpeg'; // jpg is not a valid mime type, only jpeg, even though the extensions are equivalent
	}

	response.mimeType = `image/${node.extension}`;
	response.size = chunkInfo.end - chunkInfo.start;

	return response;
};

module.exports = UnityAssets;
