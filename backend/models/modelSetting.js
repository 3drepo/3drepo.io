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
const utils = require("../utils");
const db = require("../handler/db");

const MODELS_COLL = "settings";

const schema = mongoose.Schema({
	_id : String,
	name: String, // model name
	desc: String,
	type: String,
	corID: String,
	status: {type: String, default: "ok"},
	errorReason: Object,
	federate: Boolean,
	defaultView: Object,
	permissions: [{
		_id: false,
		user: String,
		permission: String
	}],
	properties: {
		unit: String, // cm, m, ft, mm
		code: String
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
	}],
	heliSpeed: Number
});

schema.set("toObject", { getters: true });

schema.statics.modelCodeRegExp = /^[a-zA-Z0-9]{0,50}$/;

schema.methods.clean = async function() {
	const views = new (require("./view"))();
	const cleanedData = this.toObject();
	if (this.defaultView) {
		delete cleanedData.defaultView;
		try {
			const viewIDStr = utils.uuidToString(this.defaultView);
			const viewData = await views.findByUID(this._dbcolOptions.account, this._id,
				viewIDStr, {name: 1});
			if (viewData) {
				cleanedData.defaultView = {id: viewIDStr, name: viewData.name};
			}
		} catch (err) {
			// This should technically never happen.
		}
	}

	return cleanedData;
};

schema.methods.updateProperties = async function (updateObj) {
	const views = new (require("./view"))();
	const keys = Object.keys(updateObj);
	for(let i = 0; i < keys.length; ++i) {
		const key = keys[i];
		if(!updateObj[key]) {
			if (key === "defaultView") {
				this[key] = undefined;
			}
			continue;
		}
		switch (key) {
			case "code":
				if (!schema.statics.modelCodeRegExp.test(updateObj[key])) {
					throw responseCodes.INVALID_MODEL_CODE;
				}
			case "unit":
				if (utils.isString(updateObj[key])) {
					this.properties[key] = updateObj[key];
				} else {
					throw responseCodes.INVALID_ARGUMENTS;
				}
				break;
			case "defaultView":
				if (utils.isString(updateObj[key]) && utils.isUUID(updateObj[key])) {
					const res = await views.findByUID(this._dbcolOptions.account, this._dbcolOptions.model, updateObj[key], {_id: 1});
					this[key] = res._id;
				} else {
					throw responseCodes.INVALID_ARGUMENTS;
				}
				break;
			default:
				this[key] = updateObj[key];
		}
	}
	await this.save();
	return this.clean();
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

schema.statics.createNewSetting = function(teamspace, modelName, data) {
	const modelNameRegExp = /^[\x00-\x7F]{1,120}$/;
	if(!modelName.match(modelNameRegExp)) {
		return Promise.reject({ resCode: responseCodes.INVALID_MODEL_NAME });
	}

	if(data.code && !ModelSetting.modelCodeRegExp.test(data.code)) {
		return Promise.reject({ resCode: responseCodes.INVALID_MODEL_CODE });
	}

	if(!data.unit) {
		return Promise.reject({ resCode: responseCodes.MODEL_NO_UNIT });
	}

	const modelID = utils.generateUUID({string: true});

	const setting = ModelSetting.createInstance({
		account: teamspace
	});

	setting._id = modelID;
	setting.name = modelName;
	setting.desc = data.desc;
	setting.type = data.type;

	if(data.defaultView) {
		if (utils.isUUID(data.defaultView)) {
			setting.defaultView = data.defaultView;
		} else {
			return Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}
	}

	if(data.subModels) {
		setting.federate = true;
		setting.subModels = data.subModels;
	}

	if(data.surveyPoints) {
		setting.surveyPoints = data.surveyPoints;
	}

	if(data.angleFromNorth) {
		setting.angleFromNorth = data.angleFromNorth;
	}

	if(data.elevation) {
		setting.elevation = data.elevation;
	}

	if(data.code) {
		if (!schema.statics.modelCodeRegExp.test(data.code)) {
			return Promise.reject(responseCodes.INVALID_MODEL_CODE);
		}
		setting.properties.code = data.code;
	}

	if (Object.prototype.toString.call(data.unit) === "[object String]") {
		setting.properties.unit = data.unit;
	} else {
		return Promise.reject(responseCodes.INVALID_ARGUMENTS);
	}

	return setting.save();
};

schema.statics.populateUsersForMultiplePermissions = function (account, permissionsList) {
	const promises = permissionsList.map((permissions) => {
		return schema.statics.populateUsers(account, permissions);
	});

	return Promise.all(promises);
};

/**
 * Fills out the models data for the  modelids passed through parameter.
 * @param {Object} teamSpaces an object which keys are teamspaces ids and values are an array of modelids
 * @returns {Object} which contains the models data
  */
schema.statics.getModelsData = function(teamSpaces) {
	return Promise.all(
		Object.keys(teamSpaces).map(accountDB => {
			const modelsIds = teamSpaces[accountDB];

			return db.getCollection(accountDB, MODELS_COLL)
				.then(collection => collection.find({_id: {$in:modelsIds}},{ name: 1, federate: 1, _id: 1}).toArray())
				.then(models => {
					const res = {};
					const indexedModels = models.reduce((ac,c) => {
						const obj = {}; obj[c._id] = c; return Object.assign(ac,obj); // indexing by model._id
					} ,{});
					res[accountDB] = indexedModels;
					return res;
				});
		})
	).then((modelData)=> modelData.reduce((ac,cur) => Object.assign(ac, cur),{})); // Turns the array to an object (quick indexing);
};

const ModelSetting = ModelFactory.createClass(
	"ModelSetting",
	schema,
	() => MODELS_COLL
);

ModelSetting.updatePermissions = async function(account, model, permissions = []) {
	const setting = await this.findById({account, model}, model);

	if (setting) {
		permissions.forEach((permissionUpdate) => {
			if (!setting.permissions) {
				setting.permissions = [];
			}

			const userIndex = setting.permissions.findIndex(x => x.user === permissionUpdate.user);

			if (-1 !== userIndex) {
				if ("" !== permissionUpdate.permission) {
					setting.permissions[userIndex].permission = permissionUpdate.permission;
				} else {
					setting.permissions.splice(userIndex, 1);
				}
			} else if ("" !== permissionUpdate.permission) {
				setting.permissions.push(permissionUpdate);
			}
		});

		const updatedSetting = await setting.changePermissions(setting.permissions, account);

		return { "status": updatedSetting.status };
	} else {
		return Promise.reject(responseCodes.MODEL_NOT_FOUND);
	}
};

ModelSetting.batchUpdatePermissions = async function(account, batchPermissions = []) {
	const updatePromises = batchPermissions.map((update) => this.updatePermissions(account, update.model, update.permissions));
	const updateResponses = await Promise.all(updatePromises);
	const okStatus = "ok";
	const badStatusIndex = updateResponses.findIndex((response) => okStatus !== response.status);

	if (-1 === badStatusIndex) {
		return { "status": okStatus };
	} else {
		return updateResponses[badStatusIndex];
	}
};

module.exports = ModelSetting;
