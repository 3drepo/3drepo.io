/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { v5Path } = require("../../interop");
const { getModelById: getModelByIdV5 } = require(`${v5Path}/models/modelSettings`);
const responseCodes = require("../response_codes.js");
const _ = require("lodash");
const utils = require("../utils");
const db = require("../handler/db");
const systemLogger = require("../logger.js").systemLogger;
const PermissionTemplates = require("./permissionTemplates");
const { findProjectByModelId } = require(`${v5Path}/models/projectSettings.js`);
const { getArrayDifference } = require(`${v5Path}/utils/helper/arrays.js`);
const { cloneDeep } = require(`${v5Path}/utils/helper/objects.js`);
const { publish } = require(`${v5Path}/services/eventsManager/eventsManager`);
const { events } = require(`${v5Path}/services/eventsManager/eventsManager.constants`);

const MODELS_COLL = "settings";

const MODEL_CODE_REGEX = /^[a-zA-Z0-9]{0,50}$/;

function clean(setting) {
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

		if(setting.defaultLegend) {
			setting.defaultLegend = utils.uuidToString(setting.defaultLegend);
		}
	}

	return setting;
}

const ModelSetting = {};

const publishPermissionUpdates = (teamspace, project, initialPermissions, updatedPermissions, executor) => {
	const map = {};

	updatedPermissions.forEach(({ model, permissions: updPermissions }) => {
		const { permissions: initPermissions } = initialPermissions.find((p) => p.model === model);

		const users = updPermissions.map((p) => p.user);

		users.forEach((user) => {
			const initialValue = initPermissions.find((p) => p.user === user)?.permission ?? null;
			let updatedValue = updPermissions.find((p) => p.user === user)?.permission;

			if(updatedValue === "") {
				updatedValue = null;
			}

			const key = `${initialValue}_${updatedValue}`;
			const existingUpdate = map[key];

			const from = initialValue ? [initialValue] : initialValue;
			const to = updatedValue ? [updatedValue] : updatedValue;

			if (!existingUpdate) {
				map[key] = { users: [user], permissions: [{ model, project, from, to }] };
			} else {
				if (!existingUpdate.users.includes(user)) {
					existingUpdate.users.push(user);
				}
				if (!existingUpdate.permissions.find(u => u.model === model)) {
					existingUpdate.permissions.push({ model, project, from, to });
				}
			}
		});
	});

	Object.values(map).forEach(({ users, permissions }) => {
		publish(events.MODEL_PERMISSIONS_UPDATED, { teamspace, executor, users, permissions});
	});
};

const areBatchPermissionsValid = (batchPermissions) => {
	if(!Array.isArray(batchPermissions) || !batchPermissions.length) {
		return false;
	}

	const referenceUsers = batchPermissions[0].permissions.map(p => p.user);

	for(let i = 1; i < batchPermissions.length; i++) {
		const users = batchPermissions[i].permissions.map(p => p.user);

		if(getArrayDifference(referenceUsers, users).length) {
			return false;
		}
	}

	return true;
};

ModelSetting.batchUpdatePermissions = async function(account, batchPermissions = [], executor) {
	if(!areBatchPermissionsValid(batchPermissions)) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const updatePromises = batchPermissions.map((update) => ModelSetting.updatePermissions(account, update.model, update.permissions));
	const [updateResponses, { _id: projectId }] = await Promise.all([
		Promise.all(updatePromises),
		findProjectByModelId(account, batchPermissions[0].model, { _id: 1 })
	]);

	publishPermissionUpdates(account, projectId, updateResponses.map(r => r.initialPermissions), batchPermissions, executor);

	const okStatus = "ok";
	const badStatusIndex = updateResponses.findIndex((response) => okStatus !== response.status);

	if (-1 === badStatusIndex) {
		return { "status": okStatus };
	} else {
		return updateResponses[badStatusIndex];
	}
};

const checkUserHasPermissionTemplate = (dbUser, permission) => {
	if (permission.permission && !PermissionTemplates.findById(dbUser, permission.permission)) {
		throw responseCodes.PERM_NOT_FOUND;
	}
};

const checkPermissionIsValid = (permission) => {
	if (!utils.isString(permission.user) || !utils.isString(permission.permission)) {
		throw responseCodes.INVALID_ARGUMENTS;
	}
};

ModelSetting.changePermissions = async function(account, model, permissions) {
	const setting = await ModelSetting.findModelSettingById(account, model);

	if (!setting) {
		throw responseCodes.MODEL_NOT_FOUND;
	}

	const { findByUserName, teamspaceMemberCheck } = require("./user");

	if (!Array.isArray(permissions)) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	// get list of valid permission name
	permissions = _.uniq(permissions, "user");
	return findByUserName(account).then(dbUser => {
		const promises = [];

		permissions.forEach(permission => {
			checkPermissionIsValid(permission);
			checkUserHasPermissionTemplate(dbUser, permission);

			promises.push(teamspaceMemberCheck(permission.user, dbUser.user).then(() => {
				const perm = setting.permissions.find(_perm => _perm.user === permission.user);

				if (perm) {
					perm.permission = permission.permission;
				}
			}));
		});

		return Promise.all(promises).then(() => {
			return ModelSetting.updateModelSetting(account, model, { permissions });
		});
	});
};

ModelSetting.prepareDefaultView = async function(account, model, dataToClean) {
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

ModelSetting.createNewSetting = async function(teamspace, modelName, data) {
	const modelNameRegExp = /^[\x00-\x7F]{1,120}$/;

	if (!modelName.match(modelNameRegExp)) {
		throw responseCodes.INVALID_MODEL_NAME;
	}

	if (data.code && !MODEL_CODE_REGEX.test(data.code)) {
		throw responseCodes.INVALID_MODEL_CODE;
	}

	if (!data.unit) {
		throw responseCodes.MODEL_NO_UNIT;
	}

	const modelID = utils.generateUUID({string: true});

	const setting = {
		_id: modelID,
		name: modelName,
		desc: data.desc,
		type: data.type,
		account: teamspace
	};

	if (data.defaultView) {
		if (utils.isUUID(data.defaultView)) {
			setting.defaultView = data.defaultView;
		} else {
			throw responseCodes.INVALID_ARGUMENTS;
		}
	}

	if (data.defaultLegend) {
		if (utils.isUUID(data.defaultLegend)) {
			setting.defaultLegend = utils.stringToUUID(data.defaultLegend);
		} else {
			throw responseCodes.INVALID_ARGUMENTS;
		}
	}

	if (data.subModels) {
		setting.federate = true;
	}

	if (data.surveyPoints) {
		setting.surveyPoints = data.surveyPoints;
	}

	if (data.angleFromNorth) {
		setting.angleFromNorth = data.angleFromNorth;
	}

	if (data.elevation) {
		setting.elevation = data.elevation;
	}

	if (data.code) {
		if (!MODEL_CODE_REGEX.test(data.code)) {
			throw responseCodes.INVALID_MODEL_CODE;
		}
		setting.properties = { code: data.code };
	}

	if (utils.isString(data.unit)) {
		if (!setting.properties) {
			setting.properties = {};
		}

		setting.properties.unit = data.unit;
	} else {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	await db.insertOne(teamspace, MODELS_COLL, setting);

	return setting;
};

ModelSetting.deleteModelSetting = function(account, model) {
	return db.deleteOne(account, MODELS_COLL, { _id: model });
};

ModelSetting.findModelSettingById = async function(account, model, projection, toClean = true) {
	const foundSetting = await getModelByIdV5(account, model, projection);

	return toClean ? clean(foundSetting) : foundSetting;
};

ModelSetting.findModelSettings = async function(account, query, projection) {
	const foundSettings = await db.find(account, MODELS_COLL, query, projection);

	return foundSettings.map(clean);
};

ModelSetting.findPermissionByUser = async function(account, model, username) {
	const modelSetting = await ModelSetting.findModelSettingById(account, model, {permissions: 1});
	return modelSetting.permissions.find(perm => perm.user === username);
};

ModelSetting.getHeliSpeed = async function(account, model) {
	const modelSetting = await ModelSetting.findModelSettingById(account, model, {heliSpeed: 1});

	return {heliSpeed: modelSetting.heliSpeed || 1};
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

ModelSetting.isModelNameExists = async function(account, models, modelName) {
	const count = await db.count(account, MODELS_COLL, {name: modelName, _id: {"$in": models}});

	return count > 0;
};

ModelSetting.populateUsers = async function(account, permissions) {
	const { getAllUsersInTeamspace } = require("./user");

	const users = await getAllUsersInTeamspace(account);

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

ModelSetting.setModelImportFail = async function(account, model, errorReason) {
	// mark model failed
	const data = {
		status: "failed",
		errorReason
	};

	return ModelSetting.updateModelSetting(account, model, data);
};

ModelSetting.setModelImportSuccess = async function(account, model, isToy) {
	const data = {
		corID: undefined,
		errorReason: undefined
	};

	if (isToy) {
		data.timestamp = new Date();
	}

	return ModelSetting.updateModelSetting(account, model, data);
};

ModelSetting.setModelStatus = async function(account, model, status) {
	return ModelSetting.updateModelSetting(account, model, { status });
};

/**
 * Create correlation ID, store it in model setting, and return it
 * @param {account} account - User account
 * @param {model} model - Model
 * @param {addTimestamp} - add a timestamp to the model settings while you're at it
 */
ModelSetting.createCorrelationId = async function(account, model, addTimestamp = false) {
	const correlationId = utils.generateUUID({string: true});
	return ModelSetting.setCorrelationId(account, model, correlationId, addTimestamp);
};

ModelSetting.setCorrelationId = async function(account, model, correlationId, addTimestamp = false) {
	const data = { corID: correlationId };

	if (addTimestamp) {
		// FIXME: This is a temporary workaround, needed because federation
		// doesn't update it's own timestamp (and also not wired into the chat)
		data.timestamp = new Date();
	}

	const setting = await ModelSetting.updateModelSetting(account, model, data);
	systemLogger.logInfo(`Correlation ID ${setting.corID} set`);

	return correlationId;
};

ModelSetting.updateHeliSpeed = async function(account, model, newSpeed) {
	if (!Number.isInteger(newSpeed)) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	return ModelSetting.updateModelSetting(account, model, {heliSpeed: newSpeed});
};

ModelSetting.updatePermissions = async function(account, model, permissions = [], executor) {
	const { findByUserName, teamspaceMemberCheck } = require("./user");

	if (!Array.isArray(permissions)) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const setting = await ModelSetting.findModelSettingById(account, model);
	const initialPermissions = { model, permissions: cloneDeep(setting.permissions) };

	if (!setting) {
		throw responseCodes.MODEL_NOT_FOUND;
	}

	permissions = _.uniq(permissions, "user");
	const dbUser = await findByUserName(account);

	const promises = permissions.map(async (permission) => {
		checkPermissionIsValid(permission);
		checkUserHasPermissionTemplate(dbUser, permission);

		await teamspaceMemberCheck(permission.user, dbUser.user);
		const index = setting.permissions.findIndex(x => x.user === permission.user);
		if (index !== -1) {
			if (permission.permission) {
				setting.permissions[index].permission = permission.permission;
			} else {
				setting.permissions.splice(index, 1);
			}
		} else if (permission.permission) {
			setting.permissions.push(permission);
		}
	});

	await Promise.all(promises);
	await db.updateOne(account, MODELS_COLL, { _id: model }, { $set: { permissions: setting.permissions } });

	const updatedPermissions = { model, permissions: setting.permissions };

	if(executor) {
		const { _id: projectId } = await findProjectByModelId(account, model, { _id: 1 });
		publishPermissionUpdates(account, projectId, [initialPermissions], [updatedPermissions], executor);
	}

	return { status: setting.status, initialPermissions, updatedPermissions};
};

ModelSetting.getDefaultLegendId = async (account, model) => {
	const setting = await ModelSetting.findModelSettingById(account, model, {defaultLegend : 1}, false);
	return setting ? setting.defaultLegend : undefined;
};

ModelSetting.updateModelSetting = async function (account, model, updateObj) {
	const setting = await ModelSetting.findModelSettingById(account, model);

	if (!setting) {
		throw responseCodes.MODEL_NOT_FOUND;
	}

	const views = new (require("./view"))();
	const keys = Object.keys(updateObj);
	const toUpdate = {};
	const toUnset = {};

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];

		if (updateObj[key]) {
			switch (key) {
				case "code":
					if (!MODEL_CODE_REGEX.test(updateObj[key])) {
						throw responseCodes.INVALID_MODEL_CODE;
					}
				case "unit":
					if (utils.isString(updateObj[key])) {
						if (!toUpdate.properties) {
							toUpdate.properties = {};
						}
						toUpdate.properties[key] = updateObj[key];
						setting.properties[key] = updateObj[key];
					} else {
						throw responseCodes.INVALID_ARGUMENTS;
					}
					break;
				case "defaultView":
					if (utils.isString(updateObj[key]) && utils.isUUID(updateObj[key])) {
						const res = await views.findByUID(account, model, updateObj[key], {_id: 1});
						toUpdate[key] = res._id;
						setting[key] = res._id;
					} else {
						throw responseCodes.INVALID_ARGUMENTS;
					}
					break;
				case "defaultLegend":
					if (utils.isString(updateObj[key]) && utils.isUUID(updateObj[key])) {
						const legendId = utils.stringToUUID(updateObj[key]);
						toUpdate[key] = legendId;
						setting[key] = legendId;
					} else {
						throw responseCodes.INVALID_ARGUMENTS;
					}
					break;
				default:
					toUpdate[key] = updateObj[key];
					setting[key] = updateObj[key];
			}
		} else {
			if (["defaultView", "corID", "errorReason"].includes(key)) {
				toUnset[key] = 1;
				setting[key] = undefined;
			}
		}
	}

	const updateBson = {};

	if (Object.keys(toUpdate).length > 0) {
		updateBson.$set = toUpdate;
	}

	if (Object.keys(toUnset).length > 0) {
		updateBson.$unset = toUnset;
	}

	if (Object.keys(updateBson).length > 0) {
		await db.updateOne(account, MODELS_COLL, {_id: model}, updateBson);
	}

	return ModelSetting.prepareDefaultView(account, model, setting);
};

ModelSetting.removePermissionsFromModels = async (account, models, userToRemove) => {
	await Promise.all(models.map((model)=> {
		ModelSetting.updatePermissions(account, model, [{ user: userToRemove, permission: ""}]);
	}));
};

module.exports = ModelSetting;
