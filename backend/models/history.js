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


const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const utils = require("../utils");
const C = require("../constants");

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
	current: []
});

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
historySchema.statics.listByBranch = function(dbColOptions, branch, projection){
	
	const query = {"incomplete": {"$exists": false}};

	if(branch === C.MASTER_BRANCH_NAME){
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
historySchema.statics.findByBranch = function(dbColOptions, branch, projection){
	
	const query = { "incomplete": {"$exists": false}};

	projection = projection || {};

	if(!branch || branch === C.MASTER_BRANCH_NAME){
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

//get the head of default branch (master)
historySchema.statics.findLatest = function(dbColOptions, projection){
	return this.findByBranch(dbColOptions, null, projection);
};

historySchema.statics.findByUID = function(dbColOptions, revId, projection){

	projection = projection || {};
	return History.findOne(dbColOptions, { _id: stringToUUID(revId)}, projection);

};

historySchema.statics.findByTag = function(dbColOptions, tag, projection){

	projection = projection || {};
	return History.findOne(dbColOptions, { tag }, projection);

};

// add an item to current
historySchema.methods.addToCurrent = function(id) {
	this.current.push(id);
};

// remove an item from current
historySchema.methods.removeFromCurrent = function(id) {
	this.current.remove(id);
};

historySchema.statics.clean = function(histories){
	"use strict";

	const cleaned = [];

	histories.forEach(history => {
		cleaned.push(history.clean());
	});

	return cleaned;
};

historySchema.methods.clean = function(){
	"use strict";

	const clean = this.toObject();
	clean._id = uuidToString(clean._id);
	clean.name = clean._id;
	return clean;
};

var History = ModelFactory.createClass(
	"History", 
	historySchema, 
	arg => { 
		return `${arg.model}.history`;
	}
);

module.exports = History;
