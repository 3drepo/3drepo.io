var _ = require('lodash');
var repoBase = require('./base/repo');
var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var utils = require('../utils');
var uuid = require('node-uuid');

var Schema = mongoose.Schema;

var groupSchema = Schema(
	_.extend({}, repoBase.attrs, {
		// no extra attributes
		type: { type: String, default: 'group'}
	})
);


groupSchema.statics = {};

groupSchema.statics.listGroups = function(dbCol){
	'use strict';

	//TO-DO : get head history-> current, and do type: group, _id: {$in: current}

	return this.find(dbCol, { type : 'group'});
}

groupSchema.statics.createGroup = function(dbCol, data){
	'use strict';

	let group = this.model('Group').createInstance({
		account: dbCol.account, 
		project: dbCol.project
	});

	let parents = data.parents;

	parents.forEach((p, index) => {
		parents[index] = stringToUUID(p);
	});

	group._id = utils.uuidToMongoBuf3(uuid.v4());
	group.shared_id = utils.uuidToMongoBuf3(uuid.v4());
	group.api = 1;

	group.name = data.name
	group.parents = parents;
	
	return group;
};

// extend statics method
_.extend(groupSchema.statics, repoBase.statics);
// extend instance method
_.extend(groupSchema.methods, repoBase.methods);

var Group = ModelFactory.createClass(
	'Group', 
	groupSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);


module.exports = Group;
