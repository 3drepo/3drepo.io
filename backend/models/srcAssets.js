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
const db = require("../handler/db");
const responseCodes = require("../response_codes");
const FileRef = require("./fileRef");

const SrcAssets = {};

function getAssetListFromRef(ref, username) {
	return middlewares.hasReadAccessToModelHelper(username, ref.owner, ref.project).then((granted) => {
		if(granted) {
			const revId = utils.uuidToString(ref._rid);
			const getRevIdPromise = revId === C.MASTER_BRANCH ?
				History.findLatest({account: ref.owner, model: ref.project}, {_id: 1}) :
				Promise.resolve({_id : ref._rid});

			return getRevIdPromise.then((revInfo) => {
				if (revInfo) {
					return getAssetListEntry(ref.owner, ref.project, revInfo._id);
				}
			});
		}
	});
}

function getAssetListEntry(account, model, revId) {
	return db.getCollection(account, model + ".stash.3drepo").then(dbCol => {
		return dbCol.find({rev_id: revId, type: "mesh"}, { _id: 1, rev_id: 1}).toArray().then((list) => {
			return list.map(item => {
				item._id = utils.uuidToString(item._id);
				item.rev_id = utils.uuidToString(item.rev_id);
				item.asset = account + "/" + model + "/" + utils.uuidToString(item._id);
				return item;
			});
		});
	});
}

function getAssetRevisionsFromRef(ref, username) {
	return middlewares.hasReadAccessToModelHelper(username, ref.owner, ref.project).then((granted) => {
		if(granted) {
			const revId = utils.uuidToString(ref._rid);
			const getRevIdPromise = revId === C.MASTER_BRANCH ?
				History.findLatest({account: ref.owner, model: ref.project}, {_id: 1, coordOffset: 1}) :
				Promise.resolve({_id : ref._rid, coordOffset: ref.coordOffset});

			return getRevIdPromise.then((revInfo) => {
				if (revInfo) {
					return getAssetRevision(revInfo);
				}
			});
		}
	});
}

function getAssetRevision(revInfo) {
	return {rev_id: utils.uuidToString(revInfo._id), coordOffset: revInfo.coordOffset, type: "revision"};
}

SrcAssets.getAssetList = function(account, model, branch, rev, username) {
	return History.getHistory({ account, model }, branch, rev).then((history) => {
		if(history) {
			return Ref.getRefNodes(account, model, history.current).then((subModelRefs) => {
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

				const revisionsPromise = [];
				if(subModelRefs.length) {
					subModelRefs.forEach((ref) => {
						revisionsPromise.push(getAssetRevisionsFromRef(ref, username));
					});
				} else {
					revisionsPromise.push(getAssetRevision(history));
				}

				const modelsPromises = Promise.all(fetchPromise).then((assetLists) => {
					const flattened = [].concat.apply([], assetLists);
					return flattened;
				});

				const revisionsPromises = Promise.all(revisionsPromise).then((revisions) => {
					return revisions.reduce((result, filter) => {
						result[filter.rev_id] = filter.coordOffset; // for now all we are interested in is the world offsets
						return result;
					},
					{});
				});

				return Promise.all([modelsPromises, revisionsPromises]).then(([models, revisions]) => {
					return {
						models: models,
						offsets: revisions
					};
				});

			});
		} else {
			return Promise.reject(responseCodes.INVALID_TAG_NAME);
		}

	});
};

SrcAssets.getSRC = (account, model, id) => {
	return FileRef.getSRCFile(account, model, `${id}.src.mpc`);
};

module.exports = SrcAssets;
