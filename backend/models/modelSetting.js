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
var responseCodes = require('../response_codes.js');
var _ = require('lodash');

var schema = mongoose.Schema({
	_id : String,
	name: String, // model name
	owner: String,
	users: [String],
	desc: String,
	type: String,
	status: {type: String, default: 'ok'},
	errorReason: Object,
	federate: Boolean,
	permissions: [{
		_id: false,
		user: String,
		permission: String
	}],
	properties: {
		"pinSize" : Number,
		"avatarHeight" : Number,
		"visibilityLimit" : Number,
		"speed" : Number,
		"zNear" : Number,
		"zFar" : Number,
		"unit": String, //cm, m, ft, mm
		"mapTile": {
			lat: Number,
			lon: Number,
			y: Number
		},
		code: String,
		topicTypes: [{
			_id: false,
			value: String,
			label: String
		}]

	},
	//redundant field to speed up listing collaborators
	collaborators: [{
		user: String,
		role: {type: String}
	}],

});


schema.statics.defaultTopicTypes = [
	{value: "for_information", label: "For information"},
	{value: "vr", label: "VR"}
];

schema.path('properties.topicTypes').get(function(v) {
	return v.length === 0 ? schema.statics.defaultTopicTypes : v;
});

schema.set('toObject', { getters: true });

schema.statics.modelCodeRegExp = /^[a-zA-Z0-9]{0,5}$/;


schema.methods.updateProperties = function(updateObj){
	'use strict';

	Object.keys(updateObj).forEach(key => {

		if(key === 'code' && updateObj[key] && !schema.statics.modelCodeRegExp.test(updateObj[key])){
			throw responseCodes.INVALID_MODEL_CODE;
		}

		if(key === 'topicTypes'){
			
			let topicTypes = {};
			updateObj[key].forEach(type => {

				if(!type || !type.trim()){
					return;
				}
				
				//generate value from label
				let value = type.trim().toLowerCase().replace(/ /g, '_');
				
				if(topicTypes[value]){
					throw responseCodes.ISSUE_DUPLICATE_TOPIC_TYPE;
				} else {
					topicTypes[value] = {
						value,
						label: type.trim()
					};
				}
			});

			this.properties[key] = _.values(topicTypes);
		} else {
			this.properties[key] = updateObj[key];
		}
		
	});

};

schema.methods.changePermissions = function(permissions){
	'use strict';

	const User = require('./user');
	const account = this._dbcolOptions.account;

	//get list of valid permission name
	permissions = _.uniq(permissions, 'user');
	
	return User.findByUserName(account).then(dbUser => {

		let promises = [];

		permissions.forEach(permission => {

			if (!dbUser.customData.permissionTemplates.findById(permission.permission)){
				return promises.push(Promise.reject(responseCodes.PERM_NOT_FOUND));
			}


			let perm = this.permissions.find(perm => perm.user === permission.user);

			if(perm) {

				perm.permission = permission.permission;

			} else {

				promises.push(
					User.findByUserName(permission.user).then(user => {
						if(!user){
							return Promise.reject(responseCodes.USER_NOT_FOUND);
						} else {

							user.customData.models.push({
								account, 
								model: this._id
							});

							return user.save();
						}
					})
				);
			}

		});

		return Promise.all(promises);

	}).then(() => {
		
		//delete user.customData.models first
		const usersToRemove = _.difference(this.permissions.map(p => p.user), permissions.map(p => p.user));

		this.permissions = permissions;

		return this.save().then(() => usersToRemove);
		
	}).then(usersToRemove => {
		
		let removeUserPromises = [];

		usersToRemove.forEach(user => {
			removeUserPromises.push(User.removeModel(user, account, this._id));
		});

		return Promise.all(removeUserPromises);
		
	}).then(
		() => this.permissions
	);

};

schema.methods.isPermissionAssigned = function(permission){
	return this.permissions.find(perm => perm.permission === permission) ?  true : false;
};

schema.methods.findPermissionByUser = function(username){
	return this.permissions.find(perm => perm.user === username);
};

var ModelSetting = ModelFactory.createClass(
	'ModelSetting',
	schema,
	() => {
		return 'settings';
	}
);

module.exports = ModelSetting;
