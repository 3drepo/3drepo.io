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

const express = require("express");
const router = express.Router({mergeParams: true});
const utils = require("../utils");
const middlewares = require("../middlewares/middlewares");
const ModelSetting = require("../models/modelSetting");
const responseCodes = require("../response_codes");
const C = require("../constants");
const ModelHelpers = require("../models/helper/model");
const History = require("../models/history");
const createAndAssignRole = ModelHelpers.createAndAssignRole;
const User = require("../models/user");

function getDbColOptions(req){
	return {account: req.params.account, model: req.params.model};
}

function convertProjectToParam(req, res, next){
	if(req.body.project){
		req.params.project = req.body.project;
	}
	next();
}

// Get model info
router.get("/:model.json", middlewares.hasReadAccessToModel, getModelSetting);

router.put("/:model/settings", middlewares.hasWriteAccessToModelSettings, updateSettings);

router.post("/model", 
	convertProjectToParam, 
	middlewares.connectQueue,
	middlewares.canCreateModel, 
	createModel
);
router.get("/:model/revision/master/head/meshes.json", middlewares.hasReadAccessToModel, getAllMeshes);
router.get("/:model/revision/:rev/meshes.json", middlewares.hasReadAccessToModel, getAllMeshes);

//Unity information
router.get("/:model/revision/master/head/unityAssets.json", middlewares.hasReadAccessToModel, getUnityAssets);
router.get("/:model/revision/:rev/unityAssets.json", middlewares.hasReadAccessToModel, getUnityAssets);
router.get("/:model/:uid.unity3d", middlewares.hasReadAccessToModel, getUnityBundle);

//update federated model
router.put("/:model", middlewares.connectQueue, middlewares.hasEditAccessToFedModel, updateModel);

//model permission
router.post("/:model/permissions", middlewares.hasEditPermissionsAccessToModel, updatePermissions);

//model permission
router.get("/:model/permissions",  middlewares.hasEditPermissionsAccessToModel, getPermissions);

router.get("/:model/jobs.json", middlewares.hasReadAccessToModel, getJobs);
router.get("/:model/userJobForModel.json", middlewares.hasReadAccessToModel, getUserJobForModel);

//master tree
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

//search master tree
router.get("/:model/revision/master/head/searchtree.json", middlewares.hasReadAccessToModel, searchModelTree);

router.get("/:model/revision/:rev/searchtree.json", middlewares.hasReadAccessToModel, searchModelTree);

router.delete("/:model", middlewares.hasDeleteAccessToModel, deleteModel);

router.post("/:model/upload", middlewares.hasUploadAccessToModel, middlewares.connectQueue, uploadModel);

router.get("/:model/download/latest", middlewares.hasDownloadAccessToModel, downloadLatest);

function updateSettings(req, res, next){
	
	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};

	return ModelSetting.findById(dbCol, req.params.model).then(modelSetting => {

		if(!modelSetting){
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}

		modelSetting.updateProperties(req.body);
		return modelSetting.save();

	}).then(modelSetting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, modelSetting.properties);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}


function _getModel(req){
	

	let setting;
	return ModelSetting.findById(getDbColOptions(req), req.params.model).then(_setting => {

		if(!_setting){
			return Promise.reject({ resCode: responseCodes.MODEL_INFO_NOT_FOUND});
		} else {

			setting = _setting;
			setting = setting.toObject();
			//compute permissions by user role

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


function getModelSetting(req, res, next){
	

	let place = utils.APIInfo(req);
	let resObj = {};

	_getModel(req).then(setting => {

		resObj = setting;
		resObj.model = setting._id;
		resObj.account = req.params.account;

		resObj.headRevisions = {};

		let account = req.params.account;
		let model = req.params.model;

		// Calculate revision heads
		return History.getHeadRevisions({account, model});

	}).then(headRevisions => {
		
		resObj.headRevisions = headRevisions;
		responseCodes.respond(place, req, res, next, responseCodes.OK, resObj);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}



function createModel(req, res, next){
	

	let responsePlace = utils.APIInfo(req);
	let modelName = req.body.modelName;
	let account = req.params.account;
	let username = req.session.user.username;

	let data = {
		desc: req.body.desc, 
		type: req.body.type, 
		unit: req.body.unit, 
		subModels: req.body.subModels, 
		code: req.body.code,
		project: req.body.project
	};


	data.sessionId = req.headers[C.HEADER_SOCKET_ID];
	data.userPermissions = req.session.user.permissions;

	createAndAssignRole(modelName, account, username, data).then(data => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, data.model);
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateModel(req, res, next){
	

	let responsePlace = utils.APIInfo(req);
	let model = req.params.model;
	let account = req.params.account;

	let promise = Promise.reject(responseCodes.SUBMODEL_IS_MISSING);
	let setting;

	if(req.body.subModels && req.body.subModels.length > 0){

		promise = ModelSetting.findById({account}, model).then(_setting => {

			setting = _setting;

			if(!setting) {
				return Promise.reject(responseCodes.MODEL_NOT_FOUND);
			} else if (!setting.federate){
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

	promise.then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, model });
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteModel(req, res, next){
	

	let responsePlace = utils.APIInfo(req);
	let model = req.params.model;
	let account = req.params.account;

	//delete
	ModelHelpers.removeModel(account, model).then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, model });
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || err, err.resCode ? {} : err);
	});
}

function getAllMeshes(req, res,next){
	let model = req.params.model;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.getAllMeshes(account, model, branch, req.params.rev, username).then(meshes => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, meshes.results);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getIdMap(req, res, next){
	

	let model = req.params.model;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.getIdMap(account, model, branch, req.params.rev, username).then(idMap => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, idMap.idMaps);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getIdToMeshes(req, res, next){
	

	let model = req.params.model;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.getIdToMeshes(account, model, branch, req.params.rev, username).then(idToMeshes => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, idToMeshes);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}


function getModelTree(req, res, next){
	

	let model = req.params.model;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	const data = ModelHelpers.getFullTree_noSubTree(account, model, branch, req.params.rev, username);

	data.readStreamPromise.then(readStream => {
		let headers = {
			"Content-Type" : "application/json"
		};
		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, readStream, headers);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || err, err.resCode ? {} : err);
	});

	// There may be some errors generated during the streaming process but it is to late and unable to return to client anymore
	data.outputingPromise.catch(err => {
		// log error
		req[C.REQ_REPO].logger.logError(JSON.stringify(err));
		req[C.REQ_REPO].logger.logError(err.stack);
	});
}

function getModelProperties(req, res, next) {
	

	let model = req.params.model;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.getModelProperties(account, model, branch, req.params.rev, username).then(properties => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, properties);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getTreePath(req, res, next){
	

	let model = req.params.model;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.getTreePath(account, model, branch, req.params.rev, username).then(treePath => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, treePath);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}



function searchModelTree(req, res, next){
	

	let model = req.params.model;
	let account = req.params.account;
	let username = req.session.user.username;
	let searchString = req.query.searchString;

	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.searchTree(account, model, branch, req.params.rev, searchString, username).then(items => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, items);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}


function downloadLatest(req, res, next){
	
	ModelHelpers.downloadLatest(req.params.account, req.params.model).then(file => {

		let headers = {
			"Content-Length": file.meta.length,
			"Content-Disposition": "attachment;filename=" + file.meta.filename,
		};

		if(file.meta.contentType){
			headers["Content-Type"] = "application/json";
		}

		responseCodes.writeStreamRespond(utils.APIInfo(req), req, res, next, file.readStream, headers);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function uploadModel(req, res, next){
	

	let responsePlace = utils.APIInfo(req);
	let modelSetting;
	let account = req.params.account;
	let username = req.session.user.username;
	let model = req.params.model;

	//check model exists before upload
	return ModelSetting.findById({account, model}, model).then(_modelSetting => {
		
		modelSetting = _modelSetting;

		if(!modelSetting){
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		} else {
			return ModelHelpers.uploadFile(req);
		}

	}).then(file => {
		// api respond ok once the file is uploaded
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { status: "uploaded"});

		let data = {
			tag: req.body.tag,
			desc: req.body.desc
		};

		let source = {
			type: "upload",
			file: file
		};
		//FIXME: importModel should no longer return a promise. this should be a function call that expects no return!
		ModelHelpers.importModel(account, model, username, modelSetting, source, data).then(() => {
			}).catch(() => {

			});

	}).catch(err => {
		err = err.resCode ? err.resCode : err;
		responseCodes.respond(responsePlace, req, res, next, err, err);
	});
}

function updatePermissions(req, res, next){
	

	let account = req.params.account;
	let model = req.params.model;

	return ModelSetting.findById({account, model}, model).then(modelSetting => {

		if(!modelSetting){
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}

		return modelSetting.changePermissions(req.body);

	}).then(permission => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
	}).catch(err => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getPermissions(req, res, next){
	

	let account = req.params.account;
	let model = req.params.model;

	return ModelSetting.findById({account, model}, model).then(setting => {

		if(!setting){
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

function getJobs(req, res, next){
	

	const account = req.params.account;

	User.findByUserName(account).then(dbUser => {
		if(!dbUser){
			return Promise.reject(responseCodes.USER_NOT_FOUND);
		}

		return dbUser.customData.jobs.get();

	}).then(jobs => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, jobs);
	}).catch(err => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});

}

function getUserJobForModel(req, res, next){
	

	const account = req.params.account;
	const username = req.session.user.username;

	User.findByUserName(account).then(dbUser => {
		if(!dbUser){
			return Promise.reject(responseCodes.USER_NOT_FOUND);
		}

		const job = dbUser.customData.billing.subscriptions.findByAssignedUser(username);
		
		if(job){
			return dbUser.customData.jobs.findById(job.job);
		}

	}).then(job => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, job || {});
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getUnityAssets(req, res, next){
	

	let model = req.params.model;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.getUnityAssets(account, model, branch, req.params.rev, username).then(obj => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getUnityBundle(req, res, next){
	

	let model = req.params.model;
	let account = req.params.account;
	let id = req.params.uid;


	ModelHelpers.getUnityBundle(account, model, id).then(obj => {
		req.params.format= "unity3d";
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode? {} : err);
	});
}



module.exports = router;


