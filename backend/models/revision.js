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
var C = require('../constants');
var utils = require('../utils');
var stringToUUID = utils.stringToUUID;
//var uuidToString = utils.uuidToString;

var schema = mongoose.Schema({
	_id : Buffer,
	shared_id: Buffer, // means brand id in revision context :(
	type: String,
	api: String,
	author: String,
	rFile: [String],
	current: [Buffer],
	paths: [],
	added: [Buffer],
	deleted: [Buffer],
	modified: [Buffer],
	unmodified: [Buffer],
	timestamp: Number,
	tag: String,
	message: String
});

var latest = {timestamp: -1};

schema.statics.getLatestBySharedId = function(dbColOptions, sharedId){
	'use strict';

	if(sharedId === 'master'){
		sharedId = C.MASTER_UUID;
	} else {
		sharedId = stringToUUID(sharedId);
	}

	return this.findOne(dbColOptions, {shared_id: sharedId}, {}, { 'sort': latest });
};


var Revision = ModelFactory.createClass(
	'Revision', 
	schema, 
	arg => { 
		return `${arg.project}.history`;
	}
);

module.exports = Revision;