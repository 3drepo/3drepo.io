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

var Schema = mongoose.Schema;

var historySchema = Schema({
		_id: Object,
		shared_id: Object,
		paths: [],
		type: String,
		api: Number,
		parents: [],
		name: String,
		author: String,
		timestamp: Date,
		current: []
});


// get the head of a branch
historySchema.statics.findByBranch = function(dbColOptions, branch){
	
	var query = {};
	if(branch === C.MASTER_BRANCH_NAME){
		query.shared_id = stringToUUID(C.MASTER_BRANCH);
	} else {
		query.shared_id = stringToUUID(branch);
	}

	return History.findOne(
		dbColOptions, 
		query, 
		{}, 
		{sort: {timestamp: -1}}
	);
};

historySchema.statics.findByUID = function(dbColOptions, revId){

	return History.findOne(dbColOptions, { _id: stringToUUID(revId)});
	
};

// add an item to current
historySchema.methods.addToCurrent = function(id) {
	this.current.push(id);
};

// remove an item from current
historySchema.methods.removeFromCurrent = function(id) {
	this.current.remove(id);
};

//

var History = ModelFactory.createClass(
	'History', 
	historySchema, 
	arg => { 
		return `${arg.project}.history`;
	}
);

module.exports = History;
