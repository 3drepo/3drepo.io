/**
 *  Copyright (C) 2018 3D Repo Ltd
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

const express = require("express");
const router = express.Router({mergeParams: true});
const utils = require("../utils");
const middlewares = require("../middlewares/middlewares");
const ModelSetting = require("../models/modelSetting");
const responseCodes = require("../response_codes");
const C = require("../constants");
const ModelHelpers = require("../models/helper/model");
const UnityAssets = require("../models/unityAssets");
const JSONAssets = require("../models/jsonAssets");

function getDbColOptions(req) {
	return {account: req.params.account, model: req.params.model};
}

function convertProjectToParam(req, res, next) {
	if (req.body.project) {
		req.params.project = req.body.project;
	}
	next();
}

// Get model info
router.get("/:model.json", middlewares.hasReadAccessToModel, getModelSetting);
router.get("/:model/settings/heliSpeed", middlewares.hasReadAccessToModel, getHeliSpeed);
router.put("/:model/settings/heliSpeed", middlewares.hasReadAccessToModel, updateHeliSpeed);
router.put("/:model/settings", middlewares.hasWriteAccessToModelSettings, updateSettings);
router.post("/model",
	convertProjectToParam,
	middlewares.connectQueue,
	middlewares.canCreateModel,
	createModel
);

// Unity information
router.get("/:model/revision/master/head/unityAssets.json", middlewares.hasReadAccessToModel, getUnityAssets);
router.get("/:model/revision/:rev/unityAssets.json", middlewares.hasReadAccessToModel, getUnityAssets);
router.get("/:model/:uid.json.mpc",  middlewares.hasReadAccessToModel, getJsonMpc);
router.get("/:model/:uid.unity3d", middlewares.hasReadAccessToModel, getUnityBundle);

// update federated model
router.put("/:model", middlewares.connectQueue, middlewares.hasEditAccessToFedModel, updateModel);

// model permission
router.post("/models/permissions", middlewares.hasEditPermissionsAccessToMulitpleModels, updateMultiplePermissions);
router.post("/:model/permissions", middlewares.hasEditPermissionsAccessToModel, updatePermissions);

// model permission
router.get("/models/permissions", middlewares.hasEditPermissionsAccessToMulitpleModels, getMultipleModelsPermissions);
router.get("/:model/permissions", middlewares.hasEditPermissionsAccessToModel, getSingleModelPermissions);

// master tree
router.get("/:model/revision/master/head/fulltree.json", middlewares.hasReadAccessToModel, getModelTree);
router.get("/:model/revision/master/head/tree_path.json", middlewares.hasReadAccessToModel, getTreePath);
router.get("/:model/revision/master/head/idMap.json", middlewares.hasReadAccessToModel, getIdMap);
router.get("/:model/revision/master/head/idToMeshes.json", middlewares.hasReadAccessToModel, getIdToMeshes);

router.get("/:model/revision/master/head/modelProperties.json", middlewares.hasReadAccessToModel, getModelProperties);

router.get("/:model/revision/:rev/fulltree.json", middlewares.hasReadAccessToModel, getModelTree);
router.get("/:model/revision/:rev/tree_path.json", middlewares.hasReadAccessToModel, getTreePath);
router.get("/:model/revision/:rev/idMap.json", middlewares.hasReadAccessToModel, getIdMap);
router.get("/:model/revision/:rev/idToMeshes.json", middlewares.hasReadAccessToModel, getIdToMeshes);

router.get("/:model/revision/:rev/modelProperties.json", middlewares.hasReadAccessToModel, getModelProperties);

// search master tree
router.get("/:model/revision/master/head/searchtree.json", middlewares.hasReadAccessToModel, searchModelTree);
router.get("/:model/revision/:rev/searchtree.json", middlewares.hasReadAccessToModel, searchModelTree);
router.delete("/:model", middlewares.hasDeleteAccessToModel, deleteModel);
router.post("/:model/upload", middlewares.hasUploadAccessToModel, middlewares.connectQueue, uploadModel);
router.get("/:model/download/latest", middlewares.hasDownloadAccessToModel, downloadLatest);

function updateSettings(req, res, next) {

	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};

	return ModelSetting.findById(dbCol, req.params.model).then(modelSetting => {

		if (!modelSetting) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}

		return modelSetting.updateProperties(req.body);

	}).then(modelSetting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, modelSetting.properties);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getHeliSpeed(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};

	return ModelSetting.findById(dbCol, req.params.model).then(modelSetting => {
		const speed = modelSetting.heliSpeed ? modelSetting.heliSpeed : 1;
		responseCodes.respond(place, req, res, next, responseCodes.OK, {heliSpeed: speed});
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateHeliSpeed(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};

	return ModelSetting.findById(dbCol, req.params.model).then(modelSetting => {
		if (!modelSetting) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}
		if (!Number.isInteger(req.body.heliSpeed)) {
			return Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}

		return modelSetting.updateProperties({heliSpeed: req.body.heliSpeed});
	}).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, {});
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function _getModel(req) {

	let setting;
	return ModelSetting.findById(getDbColOptions(req), req.params.model).then(_setting => {

		if (!_setting) {
			return Promise.reject({ resCode: responseCodes.MODEL_INFO_NOT_FOUND});
		} else {

			setting = _setting;
			setting = setting.toObject();
			// compute permissions by user role

			return ModelHelpers.getModelPermission(
				req.session.user.username,
				_setting,
				req.params.account
			).then(permissions => {

				setting.permissions = permissions;
				return ModelHelpers.listSubModels(req.params.account, req.params.model, C.MASTER_BRANCH_NAME);

			}).then(subModels => {

				setting.subModels = subModels;
				return setting;
			});
		}
	});
}

function getModelSetting(req, res, next) {

	const place = utils.APIInfo(req);

	_getModel(req).then(setting => {

		setting.model = setting._id;
		setting.account = req.params.account;

		setting.headRevisions = {};

		responseCodes.respond(place, req, res, next, responseCodes.OK, setting);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function createModel(req, res, next) {

	const responsePlace = utils.APIInfo(req);

	if (Object.keys(req.body).length >= 1 &&
			Object.prototype.toString.call(req.body.modelName) === "[object String]" &&
			(!req.body.desc || Object.prototype.toString.call(req.body.desc) === "[object String]") &&
			(!req.body.type || Object.prototype.toString.call(req.body.type) === "[object String]") &&
			(!req.body.unit || Object.prototype.toString.call(req.body.unit) === "[object String]") &&
			(!req.body.subModels || Object.prototype.toString.call(req.body.subModels) === "[object Array]") &&
			(!req.body.code || Object.prototype.toString.call(req.body.code) === "[object String]") &&
			(!req.body.project || Object.prototype.toString.call(req.body.project) === "[object String]")) {
		const modelName = req.body.modelName;
		const account = req.params.account;

		const data = {
			desc: req.body.desc,
			type: req.body.type,
			unit: req.body.unit,
			subModels: req.body.subModels,
			code: req.body.code,
			project: req.body.project
		};

		data.sessionId = req.headers[C.HEADER_SOCKET_ID];
		data.userPermissions = req.session.user.permissions;

		let createModelPromise;
		if (req.body.subModels) {
			createModelPromise = ModelHelpers.createNewFederation(account, modelName, data);
		} else {
			createModelPromise = ModelHelpers.createNewModel(account, modelName, data);
		}

		createModelPromise.then(result => {
			const modelData = result.modelData;
			modelData.setting = result.settings;

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, modelData);
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	} else {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

function updateModel(req, res, next) {

	const responsePlace = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;

	let promise = Promise.reject(responseCodes.SUBMODEL_IS_MISSING);
	let setting;

	if (Object.keys(req.body).length >= 1 && req.body.subModels) {
		if (Object.prototype.toString.call(req.body.subModels) === "[object Array]") {
			if (req.body.subModels.length > 0) {

				promise = ModelSetting.findById({account}, model).then(_setting => {

					setting = _setting;

					if (!setting) {
						return Promise.reject(responseCodes.MODEL_NOT_FOUND);
					} else if (!setting.federate) {
						return Promise.reject(responseCodes.MODEL_IS_NOT_A_FED);
					} else {
						return ModelHelpers.createFederatedModel(account, model, req.body.subModels);
					}

				}).then(() => {
					setting.subModels = req.body.subModels;
					setting.timestamp = new Date();
					return setting.save();
				});

			}
		} else {
			promise = Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}
	}

	promise.then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, model, setting });
	}).catch(err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteModel(req, res, next) {

	const responsePlace = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;

	// delete
	ModelHelpers.removeModel(account, model).then((removedModel) => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, model, federate: removedModel.federate });
	}).catch(err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || err, err.resCode ? {} : err);
	});
}

function getIdMap(req, res, next) {
	const revId = req.params.rev;
	JSONAssets.getIdMap(
		req.params.account,
		req.params.model,
		revId ? undefined : C.MASTER_BRANCH_NAME,
		revId,
		req.session.user.username
	).then(file => {

		const headers = {
			"Content-Type" : "application/json"
		};
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getIdToMeshes(req, res, next) {
	const revId = req.params.rev;
	JSONAssets.getIdToMeshes(
		req.params.account,
		req.params.model,
		revId ? undefined : C.MASTER_BRANCH_NAME,
		revId,
		req.session.user.username
	).then(file => {

		const headers = {
			"Content-Type" : "application/json"
		};
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getModelTree(req, res, next) {
	const revId = req.params.rev;
	JSONAssets.getTree(
		req.params.account,
		req.params.model,
		revId ? undefined : C.MASTER_BRANCH_NAME,
		revId
	).then(file => {

		const headers = {
			"Content-Type" : "application/json"
		};
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getModelProperties(req, res, next) {
	const revId = req.params.rev;
	JSONAssets.getModelProperties(
		req.params.account,
		req.params.model,
		revId ? undefined : C.MASTER_BRANCH_NAME,
		revId,
		req.session.user.username
	).then(file => {

		const headers = {
			"Content-Type" : "application/json"
		};
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getTreePath(req, res, next) {
	const revId = req.params.rev;
	JSONAssets.getTreePath(
		req.params.account,
		req.params.model,
		revId ? undefined : C.MASTER_BRANCH_NAME,
		revId,
		req.session.user.username
	).then(file => {

		const headers = {
			"Content-Type" : "application/json"
		};
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function searchModelTree(req, res, next) {

	const model = req.params.model;
	const account = req.params.account;
	const username = req.session.user.username;
	const searchString = req.query.searchString;

	let branch;

	if (!req.params.rev) {
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.searchTree(account, model, branch, req.params.rev, searchString, username).then(items => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, items);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function downloadLatest(req, res, next) {

	ModelHelpers.downloadLatest(req.params.account, req.params.model).then(file => {

		const headers = {
			"Content-Length": file.size,
			"Content-Disposition": "attachment;filename=" + file.fileName
		};

		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function uploadModel(req, res, next) {

	const responsePlace = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;
	const username = req.session.user.username;
	let modelSetting;

	// check model exists before upload
	return ModelSetting.findById({account, model}, model).then(_modelSetting => {

		modelSetting = _modelSetting;

		if (!modelSetting) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		} else {
			return ModelHelpers.uploadFile(req);
		}

	}).then(file => {
		// api respond ok once the file is uploaded
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { status: "uploaded"});

		const data = {
			tag: req.body.tag,
			desc: req.body.desc
		};

		const source = {
			type: "upload",
			file: file
		};
		// FIXME: importModel should no longer return a promise. this should be a function call that expects no return!
		ModelHelpers.importModel(account, model, username, modelSetting, source, data).then(() => {
		}).catch(() => {

		});

	}).catch(err => {
		err = err.resCode ? err.resCode : err;
		responseCodes.respond(responsePlace, req, res, next, err, err);
	});
}

function updatePermissions(req, res, next) {

	const account = req.params.account;
	const model = req.params.model;

	return ModelSetting.findById({account, model}, model).then(modelSetting => {

		if (!modelSetting) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}

		return modelSetting.changePermissions(req.body);

	}).then(permission => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function updateMultiplePermissions(req, res, next) {

	const account = req.params.account;
	const modelsIds = req.body.map(({model}) => model);

	return ModelSetting.find({account}, {"_id" : {"$in" : modelsIds}}).then((modelsList) => {
		if (!modelsList.length) {
			return Promise.reject({resCode: responseCodes.MODEL_INFO_NOT_FOUND});
		} else {
			const modelsPromises = modelsList.map((model) => {
				const newModelPermissions = req.body.find((modelPermissions) => modelPermissions.model === model._id);
				return model.changePermissions(newModelPermissions.permissions || {}, account);
			});

			return Promise.all(modelsPromises).then((models) => {
				const populatedPermissionsPromises = models.map(({permissions}) => {
					return ModelSetting.populateUsers(account, permissions);
				});

				return Promise.all(populatedPermissionsPromises).then((populatedPermissions) => {
					return populatedPermissions.map((permissions, index) => {
						const {name, federate, _id: model, subModels} =  models[index] || {};
						return {name, federate, model, permissions, subModels};
					});
				});
			});
		}
	}).then(permissions => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permissions);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getSingleModelPermissions(req, res, next) {

	const account = req.params.account;
	const model = req.params.model;

	return ModelSetting.findById({account, model}, model).then(setting => {
		if (!setting) {
			return Promise.reject({ resCode: responseCodes.MODEL_INFO_NOT_FOUND});
		} else {
			return ModelSetting.populateUsers(account, setting.permissions);
		}

	}).then(permissions => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permissions);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getMultipleModelsPermissions(req, res, next) {

	const account = req.params.account;
	const models = req.query.models.split(",");

	return ModelSetting.find({account}, {"_id" : {"$in" : models}}).then((modelsList) => {
		if (!modelsList.length) {
			return Promise.reject({ resCode: responseCodes.MODEL_INFO_NOT_FOUND });
		} else {
			const permissionsList = modelsList.map(({permissions}) => permissions || []);
			return ModelSetting.populateUsersForMultiplePermissions(account, permissionsList)
				.then((populatedPermissions) => {
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
				});
		}
	}).then(permissions => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permissions);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getUnityAssets(req, res, next) {

	const model = req.params.model;
	const account = req.params.account;
	const username = req.session.user.username;
	let branch;

	if (!req.params.rev) {
		branch = C.MASTER_BRANCH_NAME;
	}

	UnityAssets.getAssetList(account, model, branch, req.params.rev, username).then(obj => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getJsonMpc(req, res, next) {
	const model = req.params.model;
	const account = req.params.account;
	const id = req.params.uid;

	JSONAssets.getSuperMeshMapping(account, model, id).then(file => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, file);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getUnityBundle(req, res, next) {

	const model = req.params.model;
	const account = req.params.account;
	const id = req.params.uid;

	UnityAssets.getUnityBundle(account, model, id).then(file => {
		req.params.format = "unity3d";
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, file);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
