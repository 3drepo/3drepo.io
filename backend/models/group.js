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
		_id: Object,
		type: { type: String, default: 'group'},
		parents: [],
	})
);


groupSchema.statics = {};
groupSchema.methods = {};


groupSchema.statics.findByUID = function(dbCol, uid){
	'use strict';
	return this.findOne(dbCol, { _id: utils.stringToUUID(uid), type: 'group' });
};

groupSchema.statics.listGroups = function(dbCol){
	'use strict';

	//TO-DO : get head history-> current, and do type: group, _id: {$in: current}

	return this.find(dbCol, { type : 'group'});
};

groupSchema.methods.updateAttrs = function(data){
	'use strict';

	let parents = data.parents;

	if(parents){
		parents.forEach((p, index) => {
			parents[index] = stringToUUID(p);
		});
	}


	this.name = data.name || this.name;
	this.parents = parents || this.parents;

	this.markModified('parents');

};

groupSchema.statics.createGroup = function(dbCol, data){
	'use strict';

	let group = this.model('Group').createInstance({
		account: dbCol.account, 
		project: dbCol.project
	});


	group._id = stringToUUID(uuid.v1());
	group.shared_id = stringToUUID(uuid.v1());
	group.api = 1;

	group.updateAttrs(data);
	
	return group;
};

// extend statics method
groupSchema.statics = _.extend(repoBase.statics, groupSchema.statics);

// extend instance method
groupSchema.methods = _.extend(repoBase.methods, groupSchema.methods);

var Group = ModelFactory.createClass(
	'Group', 
	groupSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);


module.exports = Group;
