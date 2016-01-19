var express = require('express');
var router = express.Router({mergeParams: true});
var config = require("../config.js");
var _ = require('lodash');
var utils = require('../utils');

var ProjectPackage = require('../models/projectPackage');
var resHelper = require('../response_codes');

var dbInterface     = require("../db_interface.js");
var C               = require("../constants");

var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
}

//Every API list below has to log in to access
router.use(utils.loggedIn);

// Create a package
router.post('/packages.json', isMainContractor, createPackage);
// Get a package by name
router.get('/packages/:name.json', hasAccess, findPackage);


function createPackage(req, res, next) {
	'use strict';
	
	let place = '/:account/:project/packages.json POST';

	// Instantiate a model
	let projectPackage = ProjectPackage.createInstance(getDbColOptions(req));

	let whitelist = ['name', 'site', 'budget', 'completedBy'];

	projectPackage = utils.writeCleanedBodyToModel(whitelist, req.body, projectPackage);

	projectPackage.save().then(projectPackage => {
		resHelper.respond(place, req, res, next, resHelper.OK, projectPackage);

	}).catch(err => {
		let errCode = utils.mongoErrorToResCode(err);
		resHelper.respond(place, req, res, next, errCode, err);

	});

}

function findPackage(req, res, next){
	'use strict';

	let place = '/:account/:project/package/:name.json GET';

	ProjectPackage.findByName(getDbColOptions(req), req.params.name).then(projectPackage => {
		if(projectPackage){
			resHelper.respond(place, req, res, next, resHelper.OK, projectPackage);
		} else {
			resHelper.respond(place, req, res, next, resHelper.PACKAGE_NOT_FOUND);
		}
	}).catch(err => {
		let errCode = utils.mongoErrorToResCode(err);
		resHelper.respond(place, req, res, next, errCode, err);

	});
	
}

function hasAccess(req, res, next){
	next()
	//checkRole([C.REPO_ROLE_SUBCONTRACTOR, C.REPO_ROLE_MAINCONTRACTOR], req, res, next);
}

function isMainContractor(req, res, next){
	next()
	//checkRole([C.REPO_ROLE_MAINCONTRACTOR], req, res, next);
}

function checkRole(acceptedRoles, req, res, next){
	'use strict';

	var dbInterface = require("../db_interface.js");

	var dbCol = getDbColOptions(req);

	dbInterface(req[C.REQ_REPO].logger).getUserRoles(req.session[C.REPO_SESSION_USER].username, dbCol.account, function(err, roles){
		
		console.log('roles', roles);
		
		roles = _.filter(roles, item => {
			return acceptedRoles.indexOf(item.role) !== -1;
		});

		if(roles.length > 0){
			next();
		} else {
			resHelper.respond("Check package API Read access", req, res, next, resHelper.AUTH_ERROR, null, req.params);
		}

	});
	// dbInterface(req[C.REQ_REPO].logger).getRolesByProject(dbCol.account,  dbCol.project, C.REPO_ANY, function(err, roles){

	// 	roles = _.filter(roles, item => {
	// 		return acceptedRoles.indexOf(item.role) !== -1;
	// 	});

	// 	if(roles.length > 0){
	// 		next();
	// 	} else {
	// 		resHelper.respond("Check package API Read access", req, res, next, resHelper.AUTH_ERROR, null, req.params);
	// 	}

	// });
}

module.exports = router;