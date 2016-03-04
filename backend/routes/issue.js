var express = require('express');
var router = express.Router({mergeParams: true});
var middlewares = require('./middlewares');
var dbInterface = require("../db/db_interface.js");
var C = require("../constants");
var responseCodes = require('../response_codes.js');
var Issue = require('../models/issue');
var utils = require('../utils');

router.get('/issue/:uid.json', middlewares.hasReadAccessToProject, findIssueById);
router.get('/issues.json', middlewares.hasReadAccessToProject, listIssues);
router.get('/issues/:sid.json', middlewares.hasReadAccessToProject, listIssuesBySID);
router.post('/issues/:id', middlewares.hasReadAccessToProject, storeIssue);

function listIssues(req, res, next) {
	'use strict';

	//let params = req.params;
	let place = '/issues.json GET';
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};

	Issue.findByProjectName(dbCol, "master", null).then(issues => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
	
	// old handler
	// dbInterface(req[C.REQ_REPO].logger).getIssues(params.account, params.project, "master", null, true, function(err, issueList) {
	// 	if(err.value) {
	// 		responseCodes.respond(place, req, res, next, err);
	// 	} else {
	// 		responseCodes.respond(place, req, res, next, responseCodes.OK, issueList);
	// 	}
	// });
}

function listIssuesBySID(req, res, next) {
	'use strict';

	let params = req.params;
	let place = '/issues/:sid.json GET';
	let dbCol =  {account: req.params.account, project: req.params.project};

	Issue.findBySharedId(dbCol, params.sid, req.query.number).then(issues => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
	
	//old handlers
	// dbInterface(req[C.REQ_REPO].logger).getObjectIssues(params.account, params.project, params.sid, params.number, false, function(err, issueList) {
	// 	if(err.value) {
	// 		responseCodes.respond(place, req, res, next, err);
	// 	} else {
	// 		responseCodes.respond(place, req, res, next, responseCodes.OK, issueList);
	// 	}
	// });
}

function findIssueById(req, res, next) {
	'use strict';

	let params = req.params;
	let place = '/issue/:uid.json GET';
	let dbCol =  {account: req.params.account, project: req.params.project};

	Issue.findByUID(dbCol, params.uid).then(issue => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, [issue]);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
	// old handlers
	// dbInterface(req[C.REQ_REPO].logger).getIssue(params.account, params.project, params.uid, false, function(err, issueList) {
	// 	if(err.value){
	// 		responseCodes.respond(place, req, res, next, err);
	// 	} else {
	// 		responseCodes.respond(place, req, res, next, responseCodes.OK, issueList);
	// 	}
	// });
}

function storeIssue(req, res, next){

	var responsePlace = "Adding or updating an issue";
	var data = JSON.parse(req.body.data);

	// TO-DO: use mongoose to save/update
	req[C.REQ_REPO].logger.logDebug("Upserting an issues for object " + req.params[C.REPO_REST_API_SID] + " in " + req.params[C.REPO_REST_API_ACCOUNT] + "/" + req.params[C.REPO_REST_API_PROJECT], req);

	dbInterface(req[C.REQ_REPO].logger).storeIssue(req.params[C.REPO_REST_API_ACCOUNT], req.params[C.REPO_REST_API_PROJECT], req.params[C.REPO_REST_API_ID], req.session.user.username, data, function(err, result) {
		responseCodes.onError(responsePlace, req, res, next, err, result);
	});

}

module.exports = router;
