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

"use strict";

const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const responseCodes = require("../response_codes.js");
const _ = require("lodash");

const schema = mongoose.Schema({
	_id : String,
	name: String, // model name
	owner: String,
	users: [String],
	desc: String,
	type: String,
	status: {type: String, default: "ok"},
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

	timestamp: Date,
	subModels: [{
		_id: false,
		database: String,
		model: String
	}]
});


schema.statics.defaultTopicTypes = [
	{value: "for_information", label: "For information"},
	{value: "vr", label: "VR"}
];

schema.path("properties.topicTypes").get(function(v) {
	// TODO: Why would this be undefined?
	if (!v) {
		v = [];
	}
	return v.length === 0 ? schema.statics.defaultTopicTypes : v;
});

schema.set("toObject", { getters: true });

schema.statics.modelCodeRegExp = /^[a-zA-Z0-9]{0,5}$/;


schema.methods.updateProperties = function(updateObj){

	Object.keys(updateObj).forEach(key => {

		if (key === "name") {
			this.name = updateObj[key];
		}

		if(key === "code" && updateObj[key] && !schema.statics.modelCodeRegExp.test(updateObj[key])){
			throw responseCodes.INVALID_MODEL_CODE;
		}

		if(key === "topicTypes"){
			
			let topicTypes = {};
			updateObj[key].forEach(type => {

				if(!type || !type.trim()){
					return;
				}
				
				//generate value from label
				let value = type.trim().toLowerCase().replace(/ /g, "_");
				
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

	const User = require("./user");
	const account = this._dbcolOptions.account;

	//get list of valid permission name
	permissions = _.uniq(permissions, "user");
	
	return User.findByUserName(account).then(dbUser => {

		let promises = [];

		permissions.forEach(permission => {

			if (!dbUser.customData.permissionTemplates.findById(permission.permission)){
				return promises.push(Promise.reject(responseCodes.PERM_NOT_FOUND));
			}

			if(!dbUser.customData.billing.subscriptions.findByAssignedUser(permission.user)){
				return promises.push(Promise.reject(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE));
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
							return;
						}
					})
				);
			}

		});

		return Promise.all(promises);

	}).then(() => {
		
		this.permissions = permissions;

		return this.save();		
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

schema.statics.populateUsers = function(account, permissions){

	const User = require("./user");

	return User.findByUserName(account).then(user => {

		const subscriptions = user.customData.billing.subscriptions.getActiveSubscriptions({ skipBasic: true});

		subscriptions.forEach(sub => {
			const permissionFound = permissions && permissions.find(p => p.user === sub.assignedUser);

			if(!permissionFound && sub.assignedUser){
				permissions.push({ user: sub.assignedUser });
			}
		});

		return permissions;

	});

};

const ModelSetting = ModelFactory.createClass(
	"ModelSetting",
	schema,
	() => {
		return "settings";
	}
);

module.exports = ModelSetting;
