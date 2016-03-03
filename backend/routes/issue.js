var express = require('express');
var router = express.Router({mergeParams: true});
var middlewares = require('./middlewares');
var dbInterface = require("../db_interface.js");

router.get('/issue/:uid.json', middlewares.hasReadAccessToProject, function(req, res, next) {
	
	var params = req.params;
	var place = '/issue/:uid.json GET';

	dbInterface(req[C.REQ_REPO].logger).getIssue(params.account, params.project, params.uid, false, function(err, issueList) {
		if(err.value){
			responseCodes.respond(place, req, res, next, err);
		} else {
			responseCodes.respond(place, req, res, next, responseCodes.OK, issueList);
		}
	});
});

router.get('/issues.json', middlewares.hasReadAccessToProject, function(req, res, next) {

	var params = req.params;
	var place = '/issues.json GET';

	dbInterface(req[C.REQ_REPO].logger).getIssues(params.account, params.project, "master", null, true, function(err, issueList) {
		if(err.value) {
			responseCodes.respond(place, req, res, next, err);
		} else {
			responseCodes.respond(place, req, res, next, responseCodes.OK, issueList);
		}
	});
});


router.get('/issues/:sid.json', middlewares.hasReadAccessToProject, function(req, res, next) {

	var params = req.params;
	var place = '/issues/:sid.json GET';

	dbInterface(req[C.REQ_REPO].logger).getObjectIssues(params.account, params.project, params.sid, params.number, false, function(err, issueList) {
		if(err.value) {
			responseCodes.respond(place, req, res, next, err);
		} else {
			responseCodes.respond(place, req, res, next, responseCodes.OK, issueList);
		}
	});
});


module.exports = router;
