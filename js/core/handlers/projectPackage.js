var express = require('express');
var router = express.Router({mergeParams: true});
var config = require("../config.js");
var _ = require('lodash');
var utils = require('../utils');

var ProjectPackage = require('../models/projectPackage');
var resHelper = require('../response_codes');
var Bid = require('../models/bid');

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
router.get('/packages/:name.json', hasReadPackageAccess, findPackage);


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

// Permission checking middleware for /packages/*
function hasReadPackageAccess(req, res, next){
	checkRole([C.REPO_ROLE_SUBCONTRACTOR, C.REPO_ROLE_MAINCONTRACTOR], req).then((roles) => {
		// if role is maincontractor then no more check is needed
		
		if(roles.indexOf(C.REPO_ROLE_MAINCONTRACTOR) !== -1){
			return Promise.resolve();
		} else {
			return isSubContractorInvited(req);
		}

	}).then(() => {
		next();
	}).catch(resCode => {
		resHelper.respond("Package middleware: check has read access", req, res, next, resCode, null, req.params);
	});
}

function isMainContractor(req, res, next){
	checkRole([C.REPO_ROLE_MAINCONTRACTOR], req).then(() => {
		next();
	}).catch(resCode => {
		resHelper.respond("Package middleware: check is maincontractor", req, res, next, resCode, null, req.params);
	});
}

function isSubContractorInvited(req){

	return Bid.count(getDbColOptions(req), { 
		packageName: req.params.name,
		user: req.session[C.REPO_SESSION_USER].username
	}).then(count => {
		if (count > 0) {
			console.log('resolved')
			return Promise.resolve();
		} else {
			return Promise.reject(resHelper.AUTH_ERROR);
		}
	});
}

function checkRole(acceptedRoles, req){
	'use strict';

	var dbInterface = require("../db_interface.js");

	var dbCol = getDbColOptions(req);

	return new Promise((resolve, reject) => {
		dbInterface(req[C.REQ_REPO].logger).getUserRoles(req.session[C.REPO_SESSION_USER].username, dbCol.account, function(err, roles){
			
			roles = _.filter(roles, item => {
				return acceptedRoles.indexOf(item.role) !== -1;
			});

			if(roles.length > 0){
				resolve(_.map(roles, 'role'));
			} else {
				reject(resHelper.AUTH_ERROR);
			}

		});
	});

}

module.exports = router;