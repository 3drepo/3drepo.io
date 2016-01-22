var express = require('express');
var router = express.Router({mergeParams: true});
// var config = require("../config.js");
// var _ = require('lodash');
var utils = require('../utils');
var middlewares = require('./middlewares');

var ProjectPackage = require('../models/projectPackage');
var responseCodes = require('../response_codes');
// var Bid = require('../models/bid');

// var dbInterface     = require("../db_interface.js");
var C               = require("../constants");

var getDbColOptions = function(req){
	return {account: req.params.account, project: req.params.project};
};

//Every API list below has to log in to access
router.use(middlewares.loggedIn);

// Create a package
router.post('/packages.json', /*middlewares.isMainContractor, */ createPackage);
// Get all packages
router.get('/packages.json', /*middlewares.isMainContractor, */ listPackages);
// Get a package by name
router.get('/packages/:packageName.json', /*hasReadPackageAccess, */ findPackage);



function createPackage(req, res, next) {
	'use strict';
	
	let place = '/:account/:project/packages.json POST';

	// Instantiate a model
	let projectPackage = ProjectPackage.createInstance(getDbColOptions(req));

	let whitelist = ['name', 'site', 'budget', 'completedBy'];

	projectPackage = utils.writeCleanedBodyToModel(whitelist, req.body, projectPackage);

	//creator is main contractor
	projectPackage.user = req.session[C.REPO_SESSION_USER].username;

	projectPackage.save().then(projectPackage => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, projectPackage);

	}).catch(err => {
		let errCode = utils.mongoErrorToResCode(err);
		responseCodes.respond(place, req, res, next, errCode, err);

	});

}

function findPackage(req, res, next){
	'use strict';

	let place = '/:account/:project/packages/:packageName.json GET';

	ProjectPackage.findByName(getDbColOptions(req), req.params.packageName).then(projectPackage => {
		if(projectPackage){
			responseCodes.respond(place, req, res, next, responseCodes.OK, projectPackage);
		} else {
			responseCodes.respond(place, req, res, next, responseCodes.PACKAGE_NOT_FOUND);
		}
	}).catch(err => {
		let errCode = utils.mongoErrorToResCode(err);
		responseCodes.respond(place, req, res, next, errCode, err);

	});
	
}

function listPackages(req, res, next){
	'use strict';

	let place = '/:account/:project/packages.json GET';

	ProjectPackage.find(getDbColOptions(req),{}, ProjectPackage.defaultProjection).then(projectPackages => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, projectPackages);
	}).catch(err => {
		let errCode = utils.mongoErrorToResCode(err);
		responseCodes.respond(place, req, res, next, errCode, err);

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
		responseCodes.respond("Middleware: check has read access", req, res, next, resCode, null, req.params);
	});
}


module.exports = router;