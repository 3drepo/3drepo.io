var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var C = require('../constants');
var utils = require('../utils');
var stringToUUID = utils.stringToUUID;
//var uuidToString = utils.uuidToString;

var schema = mongoose.Schema({
	_id : Buffer,
	shared_id: Buffer,
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

schema.statics.getLatestByRevId = function(dbColOptions, revId){
	'use strict';

	revId = stringToUUID(revId);
	return this.findOne(dbColOptions, {_id: revId}, {}, { 'sort': latest});
};

schema.statics.getLatestBySharedId = function(dbColOptions, sharedId){
	'use strict';

	if(sharedId === 'master'){
		sharedId = C.MASTER_UUID;
	} else {
		sharedId = stringToUUID(sharedId);
	}

	return this.findOne(dbColOptions, {shared_id: sharedId}, {}, { 'sort': latest});
};


var History = ModelFactory.createClass(
	'History', 
	schema, 
	arg => { 
		return `${arg.project}.history`;
	}
);



module.exports = History;