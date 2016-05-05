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
		color: [Number]
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
	this.color = data.color || this.color;

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
groupSchema.statics = _.extend({}, repoBase.statics, groupSchema.statics);

// extend instance method
groupSchema.methods = _.extend({}, repoBase.methods, groupSchema.methods);

var Group = ModelFactory.createClass(
	'Group', 
	groupSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);


module.exports = Group;
