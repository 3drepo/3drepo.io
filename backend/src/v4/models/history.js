/**
 *  Copyright (C) 2014 3D Repo Ltd
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
const utils = require("../utils");
const C = require("../constants");
const responseCodes = require("../response_codes");
const db = require("../handler/db");
const stringToUUID = utils.stringToUUID;
const uuidToString = utils.uuidToString;

const getCollName = (model) => model + ".history";

const findOne = async (account, model, query, projection, sort) =>
	await db.findOne(account, getCollName(model), query, projection, sort);

const History = {};

History.getHistory = async function(account, model, branch, revId, projection) {
	let history;

	if (revId) {
		if(utils.isUUIDObject(revId) || utils.isUUID(revId)) {
			history = await History.findByUID(account, model, utils.stringToUUID(revId), projection);
		} else {
			history = await History.findByTag(account, model, revId, projection);
		}
	} else if (branch) {
		history = await History.findByBranch(account, model, branch, projection);
	}

	if (!history) {
		throw responseCodes.INVALID_TAG_NAME;
	}

	return history;
};

History.find = async function(account, model, query, projection, sort) {
	return await db.find(account, getCollName(model), query, projection, sort);
};

History.tagRegExp = /^[a-zA-Z0-9_-]{1,50}$/;
// list revisions by branch
History.listByBranch = async function(account, model, branch, projection, showVoid = false) {

	const query = {"incomplete": {"$exists": false}};

	if(!showVoid) {
		query.void = {"$ne" : true};
	}

	if(branch === C.MASTER_BRANCH_NAME) {
		query.shared_id = stringToUUID(C.MASTER_BRANCH);
	} else if(branch) {
		query.shared_id = stringToUUID(branch);
	}

	return await History.find(
		account, model,
		query,
		projection,
		{timestamp: -1}
	);
};

// get the head of a branch
// FIXME: findByBranch and listByBranch seem to be doing similar things
// FIXME: maybe findByBranch can just take the 1st elem of listByBranch
History.findByBranch = async function(account, model, branch, projection, showVoid = false) {
	const query = { "incomplete": {"$exists": false}};

	if(!showVoid) {
		query.void = {"$ne" : true};
	}

	projection = projection || {};

	if(!branch || branch === C.MASTER_BRANCH_NAME) {
		query.shared_id = stringToUUID(C.MASTER_BRANCH);
	} else {
		query.shared_id = stringToUUID(branch);
	}

	const sort = {timestamp: -1};

	const res = await findOne(
		account,
		model,
		query,
		projection,
		sort
	);

	return res;
};

History.revisionCount = async function(teamspace, model) {
	const query = {"incomplete": {"$exists": false}, "void": {"$ne": true}};
	return await db.count(teamspace, getCollName(model), query);
};

// get the head of default branch (master)
History.findLatest = async function(account, model, projection) {
	return await History.findByBranch(account, model, null, projection);
};

History.findByUID = async function(account, model, revId, projection) {
	projection = projection || {};
	return await findOne(account, model, { _id: stringToUUID(revId)}, projection);
};

History.updateRevision = async function(account, model, revId, voidValue) {
	if(utils.isBoolean(voidValue)) {
		voidValue = voidValue ? true : undefined;

		const {result} = await db.updateMany(account, getCollName(model), {_id: utils.stringToUUID(revId)} , { $set:  {void: voidValue}});

		if(!result.n) {
			throw responseCodes.INVALID_TAG_NAME;
		}

		return responseCodes.OK;

	} else {
		throw responseCodes.INVALID_ARGUMENTS;
	}
};

History.createRevision = async function(teamspace, project, container, revision) {
	revision.type = C.REPO_NODE_TYPE_REVISION;
	revision.shared_id  = revision.shared_id ? revision.shared_id : C.MASTER_UUID;
	return db.insertOne(teamspace, getCollName(container), revision);
}

History.findByTag = async function(account, model, tag, projection = {}) {
	return await findOne(account, model, { tag, incomplete: {"$exists": false }}, projection);
};

const clean = function(history, branch) {
	history._id = uuidToString(history._id);
	history.name = history._id;
	history.branch = history.branch || branch || C.MASTER_BRANCH_NAME;

	if(history.rFile && history.rFile.length > 0) {
		const orgFileArr = history.rFile[0].split("_");
		history.fileType = orgFileArr[orgFileArr.length - 1].toUpperCase();
	}
	delete history.rFile;

	return history;
};

History.clean = function(histories, branch) { // or history
	return Array.isArray(histories) ?
		histories.map((history) => clean(history, branch)) :
		clean(histories, branch);
};

History.isValidTag = async function(account, model, tag) {
	if (!tag) {
		throw responseCodes.INVALID_TAG_NAME;
	} else {
		if (!tag.match(History.tagRegExp)) {
			throw responseCodes.INVALID_TAG_NAME;
		}

		const _tag = await History.findByTag(account, model, tag, {_id: 1});

		if (_tag) {
			throw responseCodes.DUPLICATE_TAG;
		}
	}
};

module.exports = History;

