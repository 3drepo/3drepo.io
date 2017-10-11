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


var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var utils = require("../utils");
var C = require("../constants");

var stringToUUID = utils.stringToUUID;
var uuidToString = utils.uuidToString;

var Schema = mongoose.Schema;

var historySchema = Schema({
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

historySchema.statics.tagRegExp = /^[a-zA-Z0-9_-]{1,20}$/;
// list revisions by branch
historySchema.statics.listByBranch = function(dbColOptions, branch, projection){
	
	var query = {'incomplete': {'$exists': false}};

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
	
	var query = { 'incomplete': {'$exists': false}};

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
	'use strict';

	let cleaned = [];

	histories.forEach(history => {
		cleaned.push(history.clean());
	});

	return cleaned;
};

historySchema.methods.clean = function(){
	'use strict';

	let clean = this.toObject();
	clean._id = uuidToString(clean._id);
	clean.name = clean._id;
	return clean;
};

historySchema.statics.getHeadRevisions = function(dbColOptions){
	'use strict';

	let proj  = {_id : 1, tag: 1, timestamp: 1, desc: 1, author: 1};
	let sort  = {sort: {branch: -1, timestamp: -1}};

	return History.find(dbColOptions, {'incomplete': {'$exists': false}}, proj, sort).then(histories => {

		histories = History.clean(histories);
		let headRevisions = {};

		histories.forEach(history => {

			var branch = history.branch || C.MASTER_BRANCH_NAME;

			if (!headRevisions[branch])
			{
				headRevisions[branch] = history._id;
			}
		});

		return headRevisions;
	});

};


var History = ModelFactory.createClass(
	'History', 
	historySchema, 
	arg => { 
		return `${arg.model}.history`;
	}
);

module.exports = History;
