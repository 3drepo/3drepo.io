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
var utils = require('../utils');
var uuid = require('node-uuid');

var Schema = mongoose.Schema;

var groupSchema = Schema({
	// no extra attributes
	_id: Object,
	parents: [],
	hidden: {type: Boolean, default: false},
	color: [Number]
});



groupSchema.statics.findByUID = function(dbCol, uid){
	'use strict';
	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) });
};

groupSchema.statics.listGroups = function(dbCol){
	'use strict';

	return this.find(dbCol, {});
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
	group.updateAttrs(data);
	
	return group;
};

groupSchema.methods.clean = function(){
	'use strict';

	let cleaned = this.toObject();
	cleaned._id = uuidToString(cleaned._id);
	cleaned.parents.forEach((parent, i) => {
		cleaned.parents[i] = uuidToString(parent);
	});

	return cleaned;

};

var Group = ModelFactory.createClass(
	'Group', 
	groupSchema, 
	arg => { 
		return `${arg.project}.groups`;
	}
);


module.exports = Group;
