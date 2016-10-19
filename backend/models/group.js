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
var _ = require('lodash');
var Schema = mongoose.Schema;
var Mesh = require('./mesh');
var responseCodes = require('../response_codes.js');

var groupSchema = Schema({
	// no extra attributes
	_id: Object,
	parents: [],
	issue_id: Object,
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

	let parents = [];

	data.parents.forEach(obj =>{
		parents.push(obj.id);
	});

	if(!parents){
		return Promise.resolve();
	}

	let currentParents = [];

	this.parents.forEach(obj => {
		currentParents.push(utils.uuidToString(obj.id));
	});


	let newParents = _.difference(parents, currentParents);

	let addPromises = [];


	newParents.forEach(id => {

		let obj = data.parents.find(obj => obj.id === id);
		addPromises.push(
			Mesh.addGroup(
				obj.account,
				obj.project,
				id,
				utils.uuidToString(this._id)
			)
		);
	});

	return Promise.all(addPromises).then(() =>{

		let removeParents = _.difference(currentParents, parents);
		let removePromises = [];

		removeParents.forEach(id => {

			let obj = this.parents.find(obj => utils.uuidToString(obj.id) === id);

			removePromises.push(
				Mesh.removeGroup(
					obj.account,
					obj.project,
					id,
					utils.uuidToString(this._id)
				)
			);
		});

		return Promise.all(removePromises);

	}).then(() => {

		data.parents.forEach(obj => {
			obj.id = stringToUUID(obj.id);
		});

		this.name = data.name || this.name;
		this.parents = data.parents || this.parents;
		this.color = data.color || this.color;

		this.markModified('parents');
		return this.save();

	});







};

groupSchema.statics.createGroup = function(dbCol, data){
	'use strict';

	let group = this.model('Group').createInstance({
		account: dbCol.account, 
		project: dbCol.project
	});


	group._id = stringToUUID(uuid.v1());
	return group.updateAttrs(data);
	
};

groupSchema.methods.clean = function(){
	'use strict';

	let cleaned = this.toObject();
	cleaned._id = uuidToString(cleaned._id);
	cleaned.issue_id = cleaned.issue_id && uuidToString(cleaned.issue_id);
	console.log(cleaned.parents);
	cleaned.parents.forEach(parent => {
		parent.id = uuidToString(parent.id);
	});

	return cleaned;

};


groupSchema.statics.deleteGroup = function(dbCol, id){
	'use strict';

	return Group.findOneAndRemove(dbCol, { _id : stringToUUID(id)}).then(group => {

		if(!group){
			return Promise.reject(responseCodes.GROUP_NOT_FOUND);
		}

		let removePromises = [];

		group.parents.forEach(obj => removePromises.push(
			Mesh.removeGroup(
				obj.account,
				obj.project,
				utils.uuidToString(obj.id),
				id
			)
		));

		return Promise.all(removePromises);

	});
};

var Group = ModelFactory.createClass(
	'Group', 
	groupSchema, 
	arg => { 
		return `${arg.project}.groups`;
	}
);


module.exports = Group;
