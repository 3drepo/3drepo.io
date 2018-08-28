/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const responseCodes = require("../response_codes.js");
const _ = require("lodash");

const schema = mongoose.Schema({
	_id : String,
	name: String, // model name
	desc: String,
	type: String,
	corID: String,
	status: {type: String, default: "ok"},
	errorReason: Object,
	federate: Boolean,
	permissions: [{
		_id: false,
		user: String,
		permission: String
	}],
	properties: {
		unit: String, // cm, m, ft, mm
		code: String,
		topicTypes: [{
			_id: false,
			value: String,
			label: String
		}]
	},
	surveyPoints: [
		{
			_id: false,
			latLong: [Number],
			position: [Number]
		}
	],
	angleFromNorth : Number,
	elevation: Number,
	fourDSequenceTag: String,
	timestamp: Date,
	subModels: [{
		_id: false,
		database: String,
		model: String
	}]
});

schema.statics.defaultTopicTypes = [
	{value: "clash", label: "Clash"},
	{value: "diff", label: "Diff"},
	{value: "rfi", label: "RFI"},
	{value: "risk", label: "Risk"},
	{value: "hs", label: "H&S"},
	{value: "design", label: "Design"},
	{value: "constructibility", label: "Constructibility"},
	{value: "gis", label: "GIS"},
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

schema.methods.updateProperties = function(updateObj) {
	Object.keys(updateObj).forEach(key => {
		if(!updateObj[key]) {
			return;
		}
		switch (key) {
		case "topicTypes":
			if (Object.prototype.toString.call(updateObj[key]) === "[object Array]") {
				const topicTypes = {};
				updateObj[key].forEach(type => {

					if (type &&
							Object.prototype.toString.call(type) === "[object String]" &&
							type.trim()) {
						// generate value from label
						const value = type.trim().toLowerCase().replace(/ /g, "_").replace(/&/g, "");

						if(topicTypes[value]) {
							throw responseCodes.ISSUE_DUPLICATE_TOPIC_TYPE;
						} else {
							topicTypes[value] = {
								value,
								label: type.trim()
							};
						}
					} else {
						throw responseCodes.INVALID_ARGUMENTS;
					}

				});

				this.properties[key] = _.values(topicTypes);
			} else {
				throw responseCodes.INVALID_ARGUMENTS;
			}
			break;
		case "code":
			if (!schema.statics.modelCodeRegExp.test(updateObj[key])) {
				throw responseCodes.INVALID_MODEL_CODE;
			}
		case "unit":
			if (Object.prototype.toString.call(updateObj[key]) === "[object String]") {
				this.properties[key] = updateObj[key];
			} else {
				throw responseCodes.INVALID_ARGUMENTS;
			}
			break;
		default:
			this[key] = updateObj[key];
		}
	});
};

schema.methods.changePermissions = function(permissions, account = this._dbcolOptions.account) {

	const User = require("./user");

	if (Object.prototype.toString.call(permissions) !== "[object Array]") {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	// get list of valid permission name
	permissions = _.uniq(permissions, "user");
	return User.findByUserName(account).then(dbUser => {

		const promises = [];

		permissions.forEach(permission => {
			if (Object.prototype.toString.call(permission.user) !== "[object String]" ||
					Object.prototype.toString.call(permission.permission) !== "[object String]") {
				throw responseCodes.INVALID_ARGUMENTS;
			}

			if (!dbUser.customData.permissionTemplates.findById(permission.permission)) {
				return promises.push(Promise.reject(responseCodes.PERM_NOT_FOUND));
			}

			promises.push(User.findByUserName(permission.user).then(assignedUser => {
				if (!assignedUser) {
					return Promise.reject(responseCodes.USER_NOT_FOUND);
				}

				const isMember = assignedUser.isMemberOfTeamspace(dbUser.user);
				if (!isMember) {
					return Promise.reject(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE);
				}

				const perm = this.permissions.find(_perm => _perm.user === permission.user);

				if(perm) {
					perm.permission = permission.permission;
				}
			}));
		});

		return Promise.all(promises).then(() => {
			this.permissions = permissions;
			return this.save();
		});
	});
};

schema.methods.isPermissionAssigned = function(permission) {
	return this.permissions.find(perm => perm.permission === permission);
};

schema.methods.findPermissionByUser = function(username) {
	return this.permissions.find(perm => perm.user === username);
};

schema.statics.populateUsers = function(account, permissions) {

	const User = require("./user");

	return User.getAllUsersInTeamspace(account).then(users => {

		users.forEach(user => {
			const permissionFound = permissions && permissions.find(p => p.user ===  user);

			if (!permissionFound) {
				permissions.push({ user });
			}
		});

		return permissions;
	});
};

schema.statics.populateUsersForMultiplePermissions = function (account, permissionsList) {
	const promises = permissionsList.map((permissions) => {
		return schema.statics.populateUsers(account, permissions);
	});

	return Promise.all(promises);
};

const ModelSetting = ModelFactory.createClass(
	"ModelSetting",
	schema,
	() => {
		return "settings";
	}
);

module.exports = ModelSetting;
