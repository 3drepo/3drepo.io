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
const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const utils = require("../utils");
const C = require("../constants");
const ResponseCodes = require("../response_codes");
const db = require("../handler/db");
const stringToUUID = utils.stringToUUID;
const uuidToString = utils.uuidToString;

const Schema = mongoose.Schema;

const historySchema = Schema({
	_id: Object,
	shared_id: Object,
	paths: [],
	type: String,
	api: Number,
	parents: [],
	name: String,
	tag: String,
	author: String,
	desc: String,
	timestamp: Date,
	incomplete: Number,
	coordOffset: [],
	current: [],
	rFile: [],
	void: Boolean
});

const getColl = async (account, model) =>  await db.getCollection(account, model + ".history");

const find = async (account, model, query, projection = {}) =>  {
	const col = await getColl(account, model);
	return await col.find(query, projection);
};

const findOne = async (account, model, query, projection = {}) =>  {
	const col = await getColl(account, model);
	return await col.findOne(query, projection);
};

historySchema.statics.getHistory = function(dbColOptions, branch, revId, projection) {

	let history;

	if (revId && utils.isUUID(revId)) {
		history = this.findByUID(dbColOptions, revId, projection);
	} else if (revId && !utils.isUUID(revId)) {
		history = this.findByTag(dbColOptions, revId, projection);
	} else if (branch) {
		history = this.findByBranch(dbColOptions, branch, projection);
	}

	return history;
};

historySchema.statics.tagRegExp = /^[a-zA-Z0-9_-]{1,20}$/;
// list revisions by branch
historySchema.statics.listByBranch = function(dbColOptions, branch, projection, showVoid = false) {

	const query = {"incomplete": {"$exists": false}};

	if(!showVoid) {
		query.void = {"$ne" : true};
	}

	if(branch === C.MASTER_BRANCH_NAME) {
		query.shared_id = stringToUUID(C.MASTER_BRANCH);
	} else if(branch) {
		query.shared_id = stringToUUID(branch);
	}

	return History.find(
		dbColOptions,
		query,
		projection,
		{sort: {timestamp: -1}}
	);
};

// get the head of a branch
// FIXME: findByBranch and listByBranch seem to be doing similar things
// FIXME: maybe findByBranch can just take the 1st elem of listByBranch
historySchema.statics.findByBranch = function(dbColOptions, branch, projection, showVoid = false) {

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
	return History.findOne(
		dbColOptions,
		query,
		projection,
		{sort: {timestamp: -1}}
	);
};

historySchema.statics.revisionCount = async function(teamspace, model) {
	const query = {"incomplete": {"$exists": false}, "void": {"$ne": true}};
	return (await find(teamspace, model, query)).count();
};

// get the head of default branch (master)
historySchema.statics.findLatest = function(dbColOptions, projection) {
	return this.findByBranch(dbColOptions, null, projection);
};

historySchema.statics.findByUID = function(dbColOptions, revId, projection) {
	projection = projection || {};
	return History.findOne(dbColOptions, { _id: stringToUUID(revId)}, projection);

};

historySchema.statics.updateRevision = async function(dbColOptions, modelId, data) {
	if(data.hasOwnProperty("void") &&
		Object.prototype.toString.call(data.void) === "[object Boolean]") {
		const rev = await History.findByUID(dbColOptions, modelId);
		if(!rev) {
			return Promise.reject(ResponseCodes.MODEL_HISTORY_NOT_FOUND);
		}

		if(data.void) {
			rev.void = true;
		} else {
			rev.void = undefined;
		}

		return rev.save().then(() => ResponseCodes.OK);

	} else {
		return Promise.reject(ResponseCodes.INVALID_ARGUMENTS);
	}
};

historySchema.statics.findByTag = function(dbColOptions, tag, projection) {
	projection = projection || {};
	return History.findOne(dbColOptions, { tag, incomplete: {"$exists": false }}, projection);
};

historySchema.statics.findByObjectId = async (account, model, id, projection) =>
	await findOne(account, model, { current: stringToUUID(id) }, projection);

// add an item to current
historySchema.methods.addToCurrent = function(id) {
	this.current.push(id);
};

// remove an item from current
historySchema.methods.removeFromCurrent = function(id) {
	this.current.remove(id);
};

historySchema.statics.clean = function(histories) {
	return histories.map(h=> h.clean());
};

historySchema.methods.clean = function() {

	const clean = this.toObject();
	clean._id = uuidToString(clean._id);
	clean.name = clean._id;
	return clean;
};

const History = ModelFactory.createClass(
	"History",
	historySchema,
	arg => {
		return `${arg.model}.history`;
	}
);

module.exports = History;

