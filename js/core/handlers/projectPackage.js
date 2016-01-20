var express = require('express');
var router = express.Router({mergeParams: true});
var config = require("../config.js");
var _ = require('lodash');
var utils = require('../utils');
var middlewares = require('./middlewares');

var ProjectPackage = require('../models/projectPackage');
var resHelper = require('../response_codes');
var Bid = require('../models/bid');

var dbInterface     = require("../db_interface.js");
var C               = require("../constants");

var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
}

//Every API list below has to log in to access
router.use(middlewares.loggedIn);

// Create a package
router.post('/packages.json', middlewares.isMainContractor, createPackage);
// Get all packages
router.get('/packages.json', middlewares.isMainContractor, listPackages);
// Get a package by name
router.get('/packages/:packageName.json', hasReadPackageAccess, findPackage);



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

	let place = '/:account/:project/packages/:packageName.json GET';

	ProjectPackage.findByName(getDbColOptions(req), req.params.packageName).then(projectPackage => {
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

function listPackages(req, res, next){
	'use strict';

	let place = '/:account/:project/packages.json GET';

	ProjectPackage.find(getDbColOptions(req)).then(projectPackages => {
		resHelper.respond(place, req, res, next, resHelper.OK, projectPackages);
	}).catch(err => {
		let errCode = utils.mongoErrorToResCode(err);
		resHelper.respond(place, req, res, next, errCode, err);

	});
	
}

// packages/* specific middlewares
function hasReadPackageAccess(req, res, next){
	middlewares.checkRole([C.REPO_ROLE_SUBCONTRACTOR, C.REPO_ROLE_MAINCONTRACTOR], req).then((roles) => {
		// if role is maincontractor then no more check is needed

		if(roles.indexOf(C.REPO_ROLE_MAINCONTRACTOR) !== -1){
			return Promise.resolve();
		} else {
			return middlewares.isSubContractorInvitedHelper(req);
		}

	}).then(() => {
		next();
	}).catch(resCode => {
		resHelper.respond("Middleware: check has read access", req, res, next, resCode, null, req.params);
	});
}


module.exports = router;