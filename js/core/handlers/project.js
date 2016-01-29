var express = require('express');
var router = express.Router({mergeParams: true});
// var config = require("../config.js");
// var _ = require('lodash');
var utils = require('../utils');
var middlewares = require('./middlewares');
var ProjectSetting = require('../models/projectSetting');
var responseCodes = require('../response_codes');
var C               = require("../constants");

var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};

//Every API list below has to log in to access
router.use(middlewares.loggedIn);

router.get('/info.json', hasReadProjectInfoAccess, getProjectSetting);

// Update project info
router.post('/info.json', middlewares.isMainContractor, updateProjectSetting);

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

function getProjectSetting(req, res, next){
	'use strict';

	let place = '/:account/:project/info.json GET';

	_getProject(req).then(setting => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, setting.info);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateProjectSetting(req, res, next){
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
	middlewares.checkRole([/*C.REPO_ROLE_SUBCONTRACTOR, */C.REPO_ROLE_MAINCONTRACTOR], req).then((roles) => {
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

module.exports = router;