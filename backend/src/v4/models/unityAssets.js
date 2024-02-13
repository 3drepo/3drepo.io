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
const FilesManager = require(`${v5Path}/services/filesManager`);

const UnityAssets = {};

async function getAssetListFromRef(ref, username) {
	const granted = await middlewares.hasReadAccessToModelHelper(username, ref.owner, ref.project);

	if(granted) {
		const revId = utils.uuidToString(ref._rid);

		const revInfo =  revId === C.MASTER_BRANCH ?
			await History.findLatest(ref.owner, ref.project, {_id: 1}) :
			{_id : ref._rid};

		if (revInfo) {
			return await  getAssetListEntry(ref.owner, ref.project, revInfo._id);
		}
	}
}

function getAssetListEntry(account, model, revId) {
	return db.findOne(account, model + ".stash.unity3d", {_id: revId});
}

UnityAssets.getAssetList = function(account, model, branch, rev, username) {
	return History.getHistory(account, model , branch, rev).then((history) => {
		return getRefNodes(account, model, branch, rev).then((subModelRefs) => {
			const fetchPromise = [];
			if(subModelRefs.length) {
				// This is a federation, get asset lists from subModels and merge them
				subModelRefs.forEach((ref) => {
					fetchPromise.push(getAssetListFromRef(ref, username));
				});
			} else {
				// Not a federation, get it's own assetList.
				fetchPromise.push(getAssetListEntry(account, model, history._id));
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
	const bundleFileName = `${id}.repobundle`;
	const collection = `${model}.stash.repobundles.ref`;
	return FilesManager.getFileAsStream(account, collection, bundleFileName);
};

UnityAssets.getTexture = async function(account, model, id) {
	const textureFilename = `${id}`;
	const collection = `${model}.scene`;

	const node = await db.findOne(account, collection, { _id: utils.stringToUUID(textureFilename) }, {
		_id: 1,
		_blobRef: 1
	});

	const {data, buffer} = node._blobRef;

	const response = await FilesManager.getFileAsStream(account, collection, buffer.name, data);
	response.mimeType = "image/png";

	return response;
};

module.exports = UnityAssets;
