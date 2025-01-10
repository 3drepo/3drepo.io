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

const DbConstants = require('../handler/db.constants');
const FilesManager = require('../services/filesManager');
const History = require('./history');
const Permissions = require('../utils/permissions/permissions');
const Ref = require('./ref');
const db = require('../handler/db');
const { templates } = require('../utils/responseCodes');
const uuidHelper = require('../utils/helper/uuids');

const UnityAssets = {};

const getAssetListEntry = async (teamspace, modelId, revId) => {
	const collection = `${modelId}.stash.repobundles`;
	let assets = await db.findOne(teamspace, collection, { _id: revId });

	// falls back on Unity bundles if RepoBundles are not available.
	if (!assets) {
		const legacyCollection = `${modelId}.stash.unity3d`;
		assets = await db.findOne(teamspace, legacyCollection, { _id: revId });
	}

	return assets;
};

const getAssetListFromRef = async (teamspace, project, ref, username) => {
	const modelId = ref.project;
	const granted = await Permissions.hasReadAccessToContainer(teamspace, project, modelId, username);

	if (granted) {
		// eslint-disable-next-line no-underscore-dangle
		let revId = ref._rid;
		const revIdStr = uuidHelper.UUIDToString(revId);
		if (revIdStr === DbConstants.MASTER_BRANCH) {
			const history = await History.findLatest(ref.owner, modelId, { _id: 1 });
			revId = history ? history._id : undefined;
		}

		if (revId) {
			const listEntry = await getAssetListEntry(ref.owner, modelId, revId);
			return listEntry;
		}
	}
	return undefined;
};

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

UnityAssets.getAssetListForCont = async (teamspace, model, branch, rev) => {
	const history = await History.getHistory(teamspace, model, branch, rev);

	const assetEntry = await getAssetListEntry(teamspace, model, history._id);
	const models = [];
	if (assetEntry) {
		models.push(assetEntry);
	}
	return { models };
};

UnityAssets.getAssetListForFed = async (teamspace, project, model, branch, rev, username) => {
	const subModelRefs = await Ref.getRefNodes(teamspace, model, branch, rev);

	const fetchPromise = [];
	subModelRefs.forEach((ref) => {
		fetchPromise.push(getAssetListFromRef(teamspace, project, ref, username));
	});

	const assetLists = await Promise.all(fetchPromise);
	return { models: assetLists.filter((list) => list) };
};

module.exports = UnityAssets;
