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
var ProjectSetting = require('../models/projectSetting');
var responseCodes = require('../response_codes');
var C = require("../constants");
var ProjectHelpers = require('../models/helper/project');
var History = require('../models/history');
var createAndAssignRole = ProjectHelpers.createAndAssignRole;
var User = require('../models/user');

var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};


// Get project info
router.get('/:project.json', middlewares.hasReadAccessToModel, getProjectSetting);

router.put('/:project/settings', middlewares.hasWriteAccessToModelSettings, updateSettings);

router.post('/:project', middlewares.connectQueue, middlewares.checkPermissions([C.PERM_CREATE_MODEL]), createProject);

//update federated project
router.put('/:project', middlewares.connectQueue, middlewares.hasEditAccessToFedModel, updateProject);

//model permission
router.post('/:project/permissions', middlewares.checkPermissions([C.PERM_MANAGE_MODEL_PERMISSION]), updatePermissions);

//model permission
router.get('/:project/permissions',  middlewares.checkPermissions([C.PERM_MANAGE_MODEL_PERMISSION]), getPermissions);

//get project roles
router.get('/:project/roles.json', middlewares.hasReadAccessToModel, getRolesForProject);

//user roles for this project
router.get('/:project/:username/userRolesForProject.json', middlewares.hasReadAccessToModel, getUserRolesForProject);

router.get('/:project/jobs.json', middlewares.hasReadAccessToModel, getJobs);
router.get('/:project/userJobForProject.json', middlewares.hasReadAccessToModel, getUserJobForProject);

//master tree
router.get('/:project/revision/master/head/fulltree.json', middlewares.hasReadAccessToModel, getProjectTree);

router.get('/:project/revision/master/head/modelProperties.json', middlewares.hasReadAccessToModel, getModelProperties);

router.get('/:project/revision/:rev/fulltree.json', middlewares.hasReadAccessToModel, getProjectTree);

router.get('/:project/revision/:rev/modelProperties.json', middlewares.hasReadAccessToModel, getModelProperties);

//search master tree
router.get('/:project/revision/master/head/searchtree.json', middlewares.hasReadAccessToModel, searchProjectTree);

router.get('/:project/revision/:rev/searchtree.json', middlewares.hasReadAccessToModel, searchProjectTree);

router.delete('/:project', middlewares.hasDeleteAccessToModel, deleteProject);

router.post('/:project/upload', middlewares.hasUploadAccessToModel, middlewares.connectQueue, uploadProject);

//to-be-delete
router.get('/:project/collaborators', middlewares.isAccountAdmin, listCollaborators);
router.post('/:project/collaborators', middlewares.isAccountAdmin, middlewares.hasCollaboratorQuota, addCollaborator);
router.delete('/:project/collaborators', middlewares.isAccountAdmin, removeCollaborator);

router.get('/:project/download/latest', middlewares.hasDownloadAccessToModel, downloadLatest);

function updateSettings(req, res, next){
	'use strict';


	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};

	return ProjectSetting.findById(dbCol, req.params.project).then(projectSetting => {

		if(!projectSetting){
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		}

		projectSetting.updateProperties(req.body);
		return projectSetting.save();

	}).then(projectSetting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, projectSetting);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}


function _getProject(req){
	'use strict';

	let setting;
	return ProjectSetting.findById(getDbColOptions(req), req.params.project).then(_setting => {

		if(!_setting){
			return Promise.reject({ resCode: responseCodes.PROJECT_INFO_NOT_FOUND});
		} else {

			setting = _setting;
			setting = setting.toObject();
			//compute permissions by user role

			return ProjectHelpers.getProjectPermission(
				req.session.user.username,
				_setting, 
				req.params.account
			).then(permissions => {

				setting.permissions = permissions;
				return ProjectHelpers.listSubProjects(req.params.account, req.params.project, C.MASTER_BRANCH_NAME);

			}).then(subProjects => {
				//console.log('subProjects', subProjects)
				setting.subProjects = subProjects;
				return setting;
			});
		}
	});
}


function getProjectSetting(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	_getProject(req).then(setting => {

		//setting = setting.toObject();
		
		let whitelist = ['owner', 'desc', 'type', 'permissions', 'properties', 'status', 'errorReason', 'federate', 'subProjects'];
		let resObj = {};

		whitelist.forEach(key => {
			resObj[key] = setting[key];
		});

		resObj.headRevisions = {};
		let proj  = {_id : 1, tag: 1, timestamp: 1, desc: 1, author: 1};
	       	let sort  = {sort: {branch: -1, timestamp: -1}};
		let account = req.params.account;
		let project = req.params.project;

		// Calculate revision heads
		History.find({account, project}, {}, proj, sort).then(histories => {
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



function createProject(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	let project = req.params.project;
	let account = req.params.account;
	let username = req.session.user.username;

	let federate;
	if(req.body.subProjects){
		federate = true;
	}

	let data = {
		desc: req.body.desc, 
		type: req.body.type, 
		unit: req.body.unit, 
		subProjects: req.body.subProjects, 
		federate: federate,
		code: req.body.code,
		topicTypes: req.body.topicTypes,
		projectGroup: req.body.projectGroup
	};

	data.sessionId = req.headers[C.HEADER_SOCKET_ID];

	createAndAssignRole(project, account, username, data).then(data => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, data.project);
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateProject(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	let project = req.params.project;
	let account = req.params.account;

	let promise = Promise.resolve();

	if(req.body.subProjects && req.body.subProjects.length > 0){

		promise = ProjectSetting.findById({account}, project).then(setting => {

			if(!setting) {
				return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
			} else if (!setting.federate){
				return Promise.reject(responseCodes.PROJECT_IS_NOT_A_FED);
			} else {
				return ProjectHelpers.createFederatedProject(account, project, req.body.subProjects);
			}
		});

	}

	promise.then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, project });
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteProject(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	let project = req.params.project;
	let account = req.params.account;

	//delete
	ProjectHelpers.removeProject(account, project).then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, project });
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || err, err.resCode ? {} : err);
	});
}

function listCollaborators(req, res ,next){
	'use strict';

	let project = req.params.project;
	let account = req.params.account;

	ProjectSetting.findById({account, project}, project).then(setting => {

		if(!setting){
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		}

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, setting.collaborators);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function addCollaborator(req, res ,next){
	'use strict';

	let username = req.body.user;
	let project = req.params.project;
	let account = req.params.account;
	let role = req.body.role;
	let email = req.body.email;

	ProjectHelpers.addCollaborator(username, email, account, project, role).then(resRole => {
		return responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, resRole);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function removeCollaborator(req, res ,next){
	'use strict';

	let project = req.params.project;
	let account = req.params.account;
	let username = req.body.user;
	let role = req.body.role;
	let email = req.body.email;

	ProjectHelpers.removeCollaborator(username, email, account, project, role).then(resRole => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, resRole);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getProjectTree(req, res, next){
	'use strict';

	let project = req.params.project;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ProjectHelpers.getFullTree(account, project, branch, req.params.rev, username).then(obj => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getModelProperties(req, res, next) {
	'use strict';

	let project = req.params.project;
	let account = req.params.account;
	let username = req.session.user.username;
	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ProjectHelpers.getModelProperties(account, project, branch, req.params.rev, username).then(properties => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, properties);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}



function searchProjectTree(req, res, next){
	'use strict';

	let project = req.params.project;
	let account = req.params.account;
	let username = req.session.user.username;
	let searchString = req.query.searchString;

	let branch;

	if(!req.params.rev){
		branch = C.MASTER_BRANCH_NAME;
	}

	ProjectHelpers.searchTree(account, project, branch, req.params.rev, searchString, username).then(items => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, items);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}


function downloadLatest(req, res, next){
	'use strict';
	ProjectHelpers.downloadLatest(req.params.account, req.params.project).then(file => {

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

function getUserRolesForProject(req, res, next){
	'use strict';
	ProjectHelpers.getUserRolesForProject(req.params.account, req.params.project, req.params.username).then(role => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, role);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getRolesForProject(req, res, next){
	'use strict';
	let removeViewer = true;

	ProjectHelpers.getRolesForProject(req.params.account, req.params.project, removeViewer).then(role => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, role);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function uploadProject(req, res, next){
	'use strict';

	let responsePlace = utils.APIInfo(req);
	let projectSetting;
	let account = req.params.account;
	let username = req.session.user.username;
	let project = req.params.project;

	//check project exists before upload
	return ProjectSetting.findById({account, project}, project).then(_projectSetting => {
		
		projectSetting = _projectSetting;

		if(!projectSetting){
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		} else {
			return ProjectHelpers.uploadFile(req);
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
		//do not return this promise!, error will be logged in importProject function
		//returning this promise may cause sending double http headers
		ProjectHelpers.importProject(account, project, username, projectSetting, source, data);

	}).catch(err => {
		err = err.resCode ? err.resCode : err;
		responseCodes.respond(responsePlace, req, res, next, err, err);
	});
}

function updatePermissions(req, res, next){
	'use strict';

	let account = req.params.account;
	let project = req.params.project;

	return ProjectSetting.findById({account, project}, project).then(projectSetting => {

		return projectSetting.changePermissions(req.body);

	}).then(permission => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, permission);
	}).catch(err => {

		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function getPermissions(req, res, next){
	'use strict';

	let account = req.params.account;
	let project = req.params.project;

	return ProjectSetting.findById({account, project}, project).then(setting => {

		if(!setting){
			return Promise.reject({ resCode: responseCodes.PROJECT_INFO_NOT_FOUND});
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
	const project = req.params.project;

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

function getUserJobForProject(req, res, next){
	'use strict';

	const account = req.params.account;
	const project = req.params.project;
	const username = req.session.user.username;

	User.findByUserName(account).then(dbUser => {
		if(!dbUser){
			return Promise.reject(responseCodes.USER_NOT_FOUND);
		}

		const job = dbUser.customData.billing.subscriptions.findByAssignedUser(username).job;
		return dbUser.customData.jobs.findById(job);

	}).then(job => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, job);
	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

module.exports = router;


