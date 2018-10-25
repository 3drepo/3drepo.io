/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const Ref = require("./ref");
const C = require("../constants");
const db = require("../db/db");
const ModelSettings = require("./modelSetting");

const UnityAssets = {};

function getSubModelRefs(account, model, currentIds) {
	return ModelSettings.findById({account}, model).then((settings) => {
		if(settings.federate) {
			const filter = {
				type: "ref",
				_id: { $in: currentIds }
			};
			return Ref.find({ account, model }, filter);
		}
		return [];
	});

}

function getAssetListFromRef(ref, username) {
	return middlewares.hasReadAccessToModelHelper(username, ref.owner, ref.project).then((granted) => {
		if(granted) {
			const revId = utils.uuidToString(ref._rid);
			const getRevIdPromise = revId === C.MASTER_BRANCH ?
				History.findLatest({account: ref.owner, model: ref.project}, {_id: 1}) :
				Promise.resolve({_id : ref._rid});

			return getRevIdPromise.then((revInfo) => {
				return getAssetListEntry(ref.owner, ref.project, revInfo._id);
			});
		}
	});
}

function getAssetListEntry(account, model, revId) {
	return db.getCollection(account, model + ".stash.unity3d").then(dbCol => {
		return dbCol.findOne({_id: revId});
	});
}

UnityAssets.getAssetList = function(account, model, branch, rev, username) {
	return History.getHistory({ account, model }, branch, rev).then((history) => {
		return getSubModelRefs(account, model, history.current).then((subModelRefs) => {
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
				return {models: assetLists};
			});

		});

	});
};

module.exports = UnityAssets;
