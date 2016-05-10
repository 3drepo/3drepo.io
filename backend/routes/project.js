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
// var config = require("../config.js");
// var _ = require('lodash');
var utils = require('../utils');
var middlewares = require('./middlewares');
var ProjectSetting = require('../models/projectSetting');
var responseCodes = require('../response_codes');
var C               = require("../constants");
var Role = require('../models/role');
var User = require('../models/user');

var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};

//Every API list below has to log in to access
router.use(middlewares.loggedIn);

// bid4free exclusive api get project info
router.get('/:project/info.json', hasReadProjectInfoAccess, B4F_getProjectSetting);
//  bid4free exclusive api update project info
router.post('/:project/info.json', middlewares.isMainContractor, B4F_updateProjectSetting);

// Get projection info
router.get('/:project.json', middlewares.hasReadAccessToProject, getProjectSetting);

router.put('/:project/settings/map-tile', middlewares.hasWriteAccessToProject, updateMapTileSettings);

router.post('/:project', middlewares.canCreateProject, createProject);

function updateMapTileSettings(req, res, next){
	'use strict';


	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};

	return ProjectSetting.findById(dbCol, req.params.project).then(projectSetting => {
		return projectSetting.updateMapTileCoors(req.body);
	}).then(projectSetting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, projectSetting);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}


function _getProject(req){
	'use strict';

	return ProjectSetting.findById(getDbColOptions(req), req.params.project).then(setting => {
		if(!setting){
			return Promise.reject({ resCode: responseCodes.PROJECT_INFO_NOT_FOUND});
		} else {
			return Promise.resolve(setting);
		}
	});
}

function B4F_getProjectSetting(req, res, next){
	'use strict';

	let place = '/:account/:project/info.json GET';
	_getProject(req).then(setting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, setting.info);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function B4F_updateProjectSetting(req, res, next){
	'use strict';

	let place = '/:account/:project/info.json POST';

	ProjectSetting.findById(getDbColOptions(req), req.params.project).then(setting => {

		if(!setting){
			setting = ProjectSetting.createInstance(getDbColOptions(req));
			setting._id = req.params.project;
		}
		return Promise.resolve(setting);

	}).then(setting => {

		let whitelist = [
			'name',
			'site',
			'code',
			'client',
			'budget',
			'completedBy',
			'contact'
		];

		setting.info = setting.info || {};
		setting.info = utils.writeCleanedBodyToModel(whitelist, req.body, setting.info);
		return setting.save();

	}).then(setting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, setting.info);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function hasReadProjectInfoAccess(req, res, next){

	middlewares.checkRole([/*C.REPO_ROLE_SUBCONTRACTOR, */C.REPO_ROLE_MAINCONTRACTOR], req).then((/*roles*/) => {
		// if role is maincontractor then no more check is needed
		return Promise.resolve();
	}).catch(() => {
		return middlewares.isSubContractorInvitedHelper(req);
	}).then(() => {
		next();
	}).catch(resCode => {
		responseCodes.respond("Middleware: check has read access", req, res, next, resCode, null, req.params);
	});
}

function getProjectSetting(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	_getProject(req).then(setting => {

		let whitelist = ['owner', 'desc', 'type', 'permissions', 'properties'];
		let resObj = {};
		
		whitelist.forEach(key => {
			resObj[key] = setting[key];
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, resObj);
		
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function createProject(req, res, next){
	'use strict';
	
	let responsePlace = utils.APIInfo(req);
	let project = req.params.project;
	let account = req.params.account;
	var roleId = `${account}.${project}`;


	Role.findByRoleID(roleId).then(role =>{
		
		if(role){
			return Promise.resolve();
		} else {
			return Role.createRole(account, project);
		}

	}).then(() => {

		return User.grantRoleToUser(account, account, project);

	}).then(() => {

		let setting = ProjectSetting.createInstance(getDbColOptions(req));
		
		setting._id = req.params.project;
		setting.owner = account;
		setting.desc = req.body.desc;
		setting.type = req.body.type;
		
		return setting.save();

	}).then(() => {
		responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, { account, project });
	}).catch( err => {
		responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

// function uploadProject(req, res, next){


// }

module.exports = router;
