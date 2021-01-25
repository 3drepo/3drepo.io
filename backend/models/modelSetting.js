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

const MODEL_CODE_REGEX = /^[a-zA-Z0-9]{0,50}$/;

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

function prepareSetting(setting) {
	if (setting) {
		if (!setting.id) {
			setting.id = setting._id;
		}

		if (!setting.status) {
			setting.status = "ok";
		}

		if (!setting.permissions) {
			setting.permissions = [];
		}

		if (!setting.properties) {
			setting.properties = {};
		}

		if (!setting.surveyPoints) {
			setting.surveyPoints = [];
		}

		if (!setting.subModels) {
			setting.subModels = [];
		}
	}

	return setting;
}

schema.set("toObject", { getters: true });

schema.statics.createNewSetting = function(teamspace, modelName, data) {
	const modelNameRegExp = /^[\x00-\x7F]{1,120}$/;
	if(!modelName.match(modelNameRegExp)) {
		return Promise.reject({ resCode: responseCodes.INVALID_MODEL_NAME });
	}

	if(data.code && !MODEL_CODE_REGEX.test(data.code)) {
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
		if (!MODEL_CODE_REGEX.test(data.code)) {
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

const ModelSetting = ModelFactory.createClass(
	"ModelSetting",
	schema,
	() => MODELS_COLL
);

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

ModelSetting.changePermissions = async function(account, model, permissions) {
	const setting = await ModelSetting.findById({account, model}, model);

	if (!setting) {
		throw responseCodes.MODEL_NOT_FOUND;
	}

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

				const perm = setting.permissions.find(_perm => _perm.user === permission.user);

				if(perm) {
					perm.permission = permission.permission;
				}
			}));
		});

		return Promise.all(promises).then(() => {
			setting.permissions = permissions;
			return setting.save();
		});
	});
};

ModelSetting.clean = async function(account, model, dataToClean) {
	const views = new (require("./view"))();
	if (dataToClean.defaultView) {
		try {
			const viewIDStr = utils.uuidToString(dataToClean.defaultView);
			const viewData = await views.findByUID(account, model,
				viewIDStr, {name: 1});
			if (viewData) {
				dataToClean.defaultView = {id: viewIDStr, name: viewData.name};
			}
		} catch (err) {
			// This should technically never happen.
		}
	}

	return dataToClean;
};

ModelSetting.findModelSettingById = async function(account, model, projection) {
	const foundSetting = await db.findOne(account, MODELS_COLL, {_id: model}, projection);

	return prepareSetting(foundSetting);
};

ModelSetting.findModelSettings = async function(account, query, projection) {
	const foundSettings = await db.find(account, MODELS_COLL, query, projection);

	return foundSettings.map(prepareSetting);
};

ModelSetting.findPermissionByUser = async function(account, model, username) {
	const modelSetting = await ModelSetting.findModelSettingById(account, model);
	return modelSetting.permissions.find(perm => perm.user === username);
};

ModelSetting.getHeliSpeed = async function(account, model) {
	const modelSetting = await ModelSetting.findModelSettingById(account, model);
	const speed = modelSetting.heliSpeed ? modelSetting.heliSpeed : 1;

	return {heliSpeed: speed};
};

ModelSetting.getMultipleModelsPermissions = async function(account, models) {
	const modelsList = await ModelSetting.findModelSettings(account, {"_id" : {"$in" : models.split(",")}});

	if (!modelsList.length) {
		throw responseCodes.MODEL_INFO_NOT_FOUND;
	}

	const permissionsList = modelsList.map(({permissions}) => permissions || []);
	const populatedPermissions = await ModelSetting.populateUsersForMultiplePermissions(account, permissionsList);

	return populatedPermissions.map((permissions, index) => {
		const {_id, federate, name, subModels} = modelsList[index];
		return {
			model:_id,
			federate,
			name,
			permissions,
			subModels
		};
	});
};

ModelSetting.getSingleModelPermissions = async function(account, model) {
	const setting = await ModelSetting.findModelSettingById(account, model);

	if (!setting) {
		throw responseCodes.MODEL_INFO_NOT_FOUND;
	}

	return ModelSetting.populateUsers(account, setting.permissions);
};

/**
 * Fills out the models data for the  modelids passed through parameter.
 * @param {Object} teamspaces an object which keys are teamspaces ids and values are an array of modelids
 * @returns {Object} which contains the models data
  */
ModelSetting.getModelsData = function(teamspaces) {
	return Promise.all(
		Object.keys(teamspaces).map((account) => {
			const modelsIds = teamspaces[account];

			return db.find(account, MODELS_COLL, {_id: {$in:modelsIds}}, { name: 1, federate: 1, _id: 1})
				.then((models) => {
					const res = {};
					const indexedModels = models.reduce((ac,c) => {
						const obj = {}; obj[c._id] = c; return Object.assign(ac,obj); // indexing by model._id
					} ,{});
					res[account] = indexedModels;

					return res;
				});
		})
	).then((modelData) => modelData.reduce((ac,cur) => Object.assign(ac, cur),{})); // Turns the array to an object (quick indexing);
};

ModelSetting.isFederation = async function(account, model) {
	const modelSetting = await ModelSetting.findModelSettingById(account, model);

	if (!modelSetting) {
		throw responseCodes.MODEL_NOT_FOUND;
	} else if (!modelSetting.federate) {
		throw responseCodes.MODEL_IS_NOT_A_FED;
	}

	return true;
};

ModelSetting.isSubModel = function(account) {
	return ModelSetting.findModelSettings(account, { federate: true });
};

ModelSetting.populateUsers = async function(account, permissions) {
	const User = require("./user");

	const users = await User.getAllUsersInTeamspace(account);

	users.forEach(user => {
		const permissionFound = permissions && permissions.find(p => p.user ===  user);

		if (!permissionFound) {
			permissions.push({ user });
		}
	});

	return permissions;
};

ModelSetting.populateUsersForMultiplePermissions = function (account, permissionsList) {
	const promises = permissionsList.map((permissions) => {
		return ModelSetting.populateUsers(account, permissions);
	});

	return Promise.all(promises);
};

ModelSetting.setModelStatus = async function(account, model, status) {
	const setting = await ModelSetting.findById({account, model}, model);
	setting.status = status;

	await setting.save();

	return setting;
};

ModelSetting.updateCorId = async function(account, model, correlationId, addTimestamp = false) {
	const setting = await ModelSetting.findById({account, model}, model);
	setting.corID = correlationId;

	if (addTimestamp) {
		// FIXME: This is a temporary workaround, needed because federation
		// doesn't update it's own timestamp (and also not wired into the chat)
		setting.timestamp = new Date();
	}

	await setting.save();

	return correlationId;
};

ModelSetting.updateSubModels = async function(account, model, subModels) {
	const setting = await ModelSetting.findById({account, model}, model);
	setting.subModels = subModels;
	setting.timestamp = new Date();

	await setting.save();

	return setting;
};

ModelSetting.updateHeliSpeed = async function(account, model, newSpeed) {
	const modelSetting = await ModelSetting.findById({account, model}, model);

	if (!modelSetting) {
		throw responseCodes.MODEL_NOT_FOUND;
	}

	if (!Number.isInteger(newSpeed)) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	return ModelSetting.updateProperties(account, model, {heliSpeed: newSpeed});
};

ModelSetting.updateMultiplePermissions = async function(account, modelIds, updatedData) {
	const modelsList = await ModelSetting.find({account}, {"_id" : {"$in" : modelIds}});

	if (!modelsList.length) {
		throw responseCodes.MODEL_INFO_NOT_FOUND;
	}

	const modelsPromises = modelsList.map((model) => {
		const newModelPermissions = updatedData.find((modelPermissions) => modelPermissions.model === model._id);
		return ModelSetting.changePermissions(account, model._id, newModelPermissions.permissions || {});
	});

	const models = await Promise.all(modelsPromises);
	const populatedPermissionsPromises = models.map(({permissions}) => {
		return ModelSetting.populateUsers(account, permissions);
	});
	const populatedPermissions = await Promise.all(populatedPermissionsPromises);

	return populatedPermissions.map((permissions, index) => {
		const {name, federate, _id: model, subModels} =  models[index] || {};
		return {name, federate, model, permissions, subModels};
	});
};

ModelSetting.updatePermissions = async function(account, model, permissions = []) {
	const setting = await ModelSetting.findById({account, model}, model);

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

		const updatedSetting = await ModelSetting.changePermissions(account, model, setting.permissions);

		return { "status": updatedSetting.status };
	} else {
		return Promise.reject(responseCodes.MODEL_NOT_FOUND);
	}
};

ModelSetting.updateProperties = async function (account, model, updateObj) {
	const setting = await ModelSetting.findById({account, model}, model);

	const views = new (require("./view"))();
	const keys = Object.keys(updateObj);
	for(let i = 0; i < keys.length; ++i) {
		const key = keys[i];
		if(!updateObj[key]) {
			if (key === "defaultView") {
				setting[key] = undefined;
			}
			continue;
		}
		switch (key) {
			case "code":
				if (!MODEL_CODE_REGEX.test(updateObj[key])) {
					throw responseCodes.INVALID_MODEL_CODE;
				}
			case "unit":
				if (utils.isString(updateObj[key])) {
					setting.properties[key] = updateObj[key];
				} else {
					throw responseCodes.INVALID_ARGUMENTS;
				}
				break;
			case "defaultView":
				if (utils.isString(updateObj[key]) && utils.isUUID(updateObj[key])) {
					const res = await views.findByUID(account, model, updateObj[key], {_id: 1});
					setting[key] = res._id;
				} else {
					throw responseCodes.INVALID_ARGUMENTS;
				}
				break;
			default:
				setting[key] = updateObj[key];
		}
	}
	await setting.save();
	return ModelSetting.clean(account, model, setting);
};

ModelSetting.updateSettings = async function(account, model, data) {
	const modelSetting = await ModelSetting.findById({account, model}, model);

	if (!modelSetting) {
		throw responseCodes.MODEL_NOT_FOUND;
	}

	return ModelSetting.updateProperties(account, model, data);
};

module.exports = ModelSetting;
