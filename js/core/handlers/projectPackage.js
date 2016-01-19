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

// Create a package
router.post('/packages.json', checkPremission, createPackage);
// Get a package by name
router.get('/packages/:name.json', checkPremission, findPackage);


function createPackage(req, res, next) {
	'use strict';
	
	let place = '/:account/:project/packages.json POST';

	let whitelist = ['name', 'site', 'budget', 'completedBy'];

	// Instantiate a model
	let projectPackage = ProjectPackage.createInstance(getDbColOptions(req));

	let cleanedReq = _.pick(req.body, whitelist);

	_.forEach(cleanedReq, (value, key) => {
		projectPackage[key] = value;
	});

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

function checkPremission(req, res, next){
	var username = null;

	// logged in?
	// package -> account == login.username OR
	// you are invited.
}


module.exports = router;