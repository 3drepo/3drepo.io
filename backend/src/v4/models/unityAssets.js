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

"use strict";

const History = require("./history");
const middlewares = require("../middlewares/middlewares");
const utils = require("../utils");
const { getRefNodes } = require("./ref");
const C = require("../constants");
const db = require("../handler/db");
const {v5Path} = require("../../interop");
const responseCodes = require("../response_codes");
const FilesManager = require(`${v5Path}/services/filesManager`);

const UnityAssets = {};

async function getAssetListFromRef(ref, username, legacy) {
	const granted = await middlewares.hasReadAccessToModelHelper(username, ref.owner, ref.project);

	if(granted) {
		const revId = utils.uuidToString(ref._rid);

		const revInfo =  revId === C.MASTER_BRANCH ?
			await History.findLatest(ref.owner, ref.project, {_id: 1}) :
			{_id : ref._rid};

		if (revInfo) {
			return await  getAssetListEntry(ref.owner, ref.project, revInfo._id, legacy);
		}
	}
}

// This method returns RepoBundles, and falls back to AssetBundles if they
// are not available. If the legacy flag is set, the method will only return
// AssetBundles.

async function getAssetListEntry(account, model, revId, legacy) {
	const assets = db.findOne(account, model + ".stash.repobundles", {_id: revId});
	if(assets && !legacy) {
		return Promise.resolve(assets);
	}else {
		return db.findOne(account, model + ".stash.unity3d", {_id: revId});
	}
}

UnityAssets.getAssetList = function(account, model, branch, rev, username, legacy) {
	return History.getHistory(account, model , branch, rev).then((history) => {
		return getRefNodes(account, model, branch, rev).then((subModelRefs) => {
			const fetchPromise = [];
			if(subModelRefs.length) {
				// This is a federation, get asset lists from subModels and merge them
				subModelRefs.forEach((ref) => {
					fetchPromise.push(getAssetListFromRef(ref, username, legacy));
				});
			} else {
				// Not a federation, get it's own assetList.
				fetchPromise.push(getAssetListEntry(account, model, history._id, legacy));
			}

			return Promise.all(fetchPromise).then((assetLists) => {
				return {models: assetLists.filter((list) => list)};
			});

		});
	});
};

UnityAssets.getUnityBundle = function(account, model, id) {
	const bundleFileName = `${id}.unity3d`;
	const collection = `${model}.stash.unity3d.ref`;
	return FilesManager.getFileAsStream(account, collection, bundleFileName);
};

UnityAssets.getRepoBundle = function(account, model, id) {
	const bundleFileName = `${id}`;
	const collection = `${model}.stash.repobundles.ref`;
	return FilesManager.getFileAsStream(account, collection, bundleFileName);
};

UnityAssets.getTexture = async function(account, model, id) {
	const textureFilename = `${id}`;
	const collection = `${model}.scene`;

	const node = await db.findOne(account, collection, { _id: utils.stringToUUID(textureFilename), type: "texture" }, {
		_id: 1,
		_blobRef: 1,
		extension: 1
	});

	if(!node) {
		throw (responseCodes.TEXTURE_NOT_FOUND);
	}

	const {elements, buffer} = node._blobRef;

	// chunkInfo is passed to createReadStream, which expects `start` and `end` properties
	const chunkInfo = {
		start: buffer.start + elements.data.start,
		end: buffer.start + elements.data.start + elements.data.size
	};

	const response = await FilesManager.getFileAsStream(account, collection, buffer.name, chunkInfo);

	if(node.extension === "jpg") {
		node.extension = "jpeg"; // jpg is not a valid mime type, only jpeg, even though the extensions are equivalent
	}

	response.mimeType = `image/${node.extension}`;
	response.size = chunkInfo.end - chunkInfo.start;

	return response;
};

module.exports = UnityAssets;
