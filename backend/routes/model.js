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

var express = require('express');
var router = express.Router({mergeParams: true});
// var _ = require('lodash');
var utils = require('../utils');
var middlewares = require('./middlewares');
var ModelSetting = require('../models/modelSetting');
var responseCodes = require('../response_codes');
var C = require("../constants");
var ModelHelpers = require('../models/helper/model');
var History = require('../models/history');
var createAndAssignRole = ModelHelpers.createAndAssignRole;
var User = require('../models/user');

var getDbColOptions = function(req){
	return {account: req.params.account, model: req.params.model};
};

function convertProjectToParam(req, res, next){
	if(req.body.project){
		req.params.project = req.body.project;
	}
	next();
}

// Get model info
router.get('/:model.json', middlewares.hasReadAccessToModel, getModelSetting);

router.put('/:model/settings', middlewares.hasWriteAccessToModelSettings, updateSettings);

router.post('/:modelName', 
	convertProjectToParam, 
	middlewares.connectQueue,
	middlewares.canCreateModel, 
	createModel
);

//Unity information
router.get('/:model/revision/master/head/unityAssets.json', middlewares.hasReadAccessToModel, getUnityAssets);
router.get('/:model/revision/:rev/unityAssets.json', middlewares.hasReadAccessToModel, getUnityAssets);
router.get('/:model/:uid.unity3d', middlewares.hasReadAccessToModel, getUnityBundle);

//update federated model
router.put('/:model', middlewares.connectQueue, middlewares.hasEditAccessToFedModel, updateModel);

//model permission
router.post('/:model/permissions', middlewares.hasEditPermissionsAccessToModel, updatePermissions);

//model permission
router.get('/:model/permissions',  middlewares.hasEditPermissionsAccessToModel, getPermissions);

router.get('/:model/jobs.json', middlewares.hasReadAccessToModel, getJobs);
router.get('/:model/userJobForModel.json', middlewares.hasReadAccessToModel, getUserJobForModel);

//master tree
router.get('/:model/revision/master/head/fulltree.json', middlewares.hasReadAccessToModel, getModelTree);

router.get('/:model/revision/master/head/modelProperties.json', middlewares.hasReadAccessToModel, getModelProperties);

router.get('/:model/revision/:rev/fulltree.json', middlewares.hasReadAccessToModel, getModelTree);

router.get('/:model/revision/:rev/modelProperties.json', middlewares.hasReadAccessToModel, getModelProperties);

//search master tree
router.get('/:model/revision/master/head/searchtree.json', middlewares.hasReadAccessToModel, searchModelTree);

router.get('/:model/revision/:rev/searchtree.json', middlewares.hasReadAccessToModel, searchModelTree);

router.delete('/:model', middlewares.hasDeleteAccessToModel, deleteModel);

router.post('/:model/upload', middlewares.hasUploadAccessToModel, middlewares.connectQueue, uploadModel);

router.get('/:model/download/latest', middlewares.hasDownloadAccessToModel, downloadLatest);

function updateSettings(req, res, next){
	'use strict';


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
	'use strict';

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
				//console.log('subModels', subModels)
				setting.subModels = subModels;
				return setting;
			});
		}
	});
}


function getModelSetting(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	_getModel(req).then(setting => {

		//setting = setting.toObject();
		
		let whitelist = ['name', 'owner', 'desc', 'type', 'permissions', 'properties', 'status', 'errorReason', 'federate', 'subModels'];
		let resObj = {};

		whitelist.forEach(key => {
			resObj[key] = setting[key];
		});

		resObj.headRevisions = {};
		let proj  = {_id : 1, tag: 1, timestamp: 1, desc: 1, author: 1};
	       	let sort  = {sort: {branch: -1, timestamp: -1}};
		let account = req.params.account;
		let model = req.params.model;

		// Calculate revision heads
		History.find({account, model}, {}, proj, sort).then(histories => {
			histories = History.clean(histories);

			histories.forEach(history => {
				var branch = history.branch || C.MASTER_BRANCH_NAME;
				if (!resObj.headRevisions[branch])
				{
					resObj.headRevisions[branch] = history._id;
				}
			});

			responseCodes.respond(place, req, res, next, responseCodes.OK, resObj);
		});

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}



function createModel(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	let modelName = req.params.modelName;
	let account = req.params.account;
	let username = req.session.user.username;

	let federate;
	if(req.body.subModels){
		federate = true;
	}

	let data = {
		desc: req.body.desc, 
		type: req.body.type, 
		unit: req.body.unit, 
		subModels: req.body.subModels, 
		federate: federate,
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
	'use strict';

	let responsePlace = utils.APIInfo(req);
	let model = req.params.model;
	let account = req.params.account;

	let promise = Promise.resolve();

	if(req.body.subModels && req.body.subModels.length > 0){

		promise = ModelSetting.findById({account}, model).then(setting => {

			if(!setting) {
				return Promise.reject(responseCodes.MODEL_NOT_FOUND);
			} else if (!setting.federate){
				return Promise.reject(responseCodes.MODEL_IS_NOT_A_FED);
			} else {
				return ModelHelpers.createFederatedModel(account, model, req.body.subModels);
			}
		});

	}

	promise.then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, model });
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteModel(req, res, next){
	'use strict';

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

function getModelTree(req, res, next){
	'use strict';

	let model = req.params.model;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ModelHelpers.getFullTree(account, model, branch, req.params.rev, username).then(obj => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getModelProperties(req, res, next) {
	'use strict';

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



function searchModelTree(req, res, next){
	'use strict';

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
	'use strict';
	ModelHelpers.downloadLatest(req.params.account, req.params.model).then(file => {

		let headers = {
			'Content-Length': file.meta.length,
			'Content-Disposition': 'attachment;filename=' + file.meta.filename,
		};

		if(file.meta.contentType){
			headers['Content-Type'] = file.meta.contentType;
		}

		res.writeHead(200, headers);
		file.readStream.pipe(res);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function uploadModel(req, res, next){
	'use strict';

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
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { status: 'uploaded'});

		let data = {
			tag: req.body.tag,
			desc: req.body.desc
		};

		let source = {
			type: 'upload',
			file: file
		};
		//do not return this promise!, error will be logged in importModel function
		//returning this promise may cause sending double http headers
		ModelHelpers.importModel(account, model, username, modelSetting, source, data);

	}).catch(err => {
		err = err.resCode ? err.resCode : err;
		responseCodes.respond(responsePlace, req, res, next, err, err);
	});
}

function updatePermissions(req, res, next){
	'use strict';

	let account = req.params.account;
	let model = req.params.model;

	return ModelSetting.findById({account, model}, model).then(modelSetting => {

		return modelSetting.changePermissions(req.body);

	}).then(permission => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
	}).catch(err => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getPermissions(req, res, next){
	'use strict';

	let account = req.params.account;
	let model = req.params.model;

	return ModelSetting.findById({account, model}, model).then(setting => {

		if(!setting){
			return Promise.reject({ resCode: responseCodes.MODEL_INFO_NOT_FOUND});
		} else {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, setting.permissions);
		}
	}).catch(err => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getJobs(req, res, next){
	'use strict';

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
	'use strict';

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
	'use strict';

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
	'use strict';

	let model = req.params.model;
	let account = req.params.account;
	let id = req.params.uid;


	ModelHelpers.getUnityBundle(account, model, id).then(obj => {
		req.params.format= 'unity3d';
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode? {} : err);
	});
}



module.exports = router;


