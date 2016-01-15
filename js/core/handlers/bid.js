var express = require('express');
var router = express.Router({mergeParams: true});
var config = require("../config.js");
var _ = require('lodash');
var utils = require('../utils');

var ModelFactory = require('../models/modelFactory');
var ProjectPackage = require('../models/projectPackage');
var resHelper = require('../response_codes');

router.post('/packages', checkPremission, function(req, res, next) {
	'use strict';

	// Instantiate a model
	let account = req.params.account;
	let project = req.params.project;

	let projectPackage = ProjectPackage.createInstance({account, project});

	console.log(req.body)
	//projectPackage.name = 'testname';
	//projectPackage.site = 'sitename';
	projectPackage.budget = '200,000,000';
	projectPackage.completedBy = new Date();

	let place = '/:account/:project/packages POST';

	projectPackage.save().then(projectPackage => {
		resHelper.respond(place, req, res, next, resHelper.OK, projectPackage);

	}).catch(err => {

		console.log(err);
		let errCode = utils.mongoErrorToResCode(err);
		resHelper.respond(place, req, res, next, errCode, err);

	});
	
	

});


function checkPremission(req, res, next){
	next();			
}



module.exports = router;