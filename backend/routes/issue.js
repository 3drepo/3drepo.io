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
var middlewares = require('./middlewares');
var dbInterface = require("../db/db_interface.js");

var C = require("../constants");
var responseCodes = require('../response_codes.js');
var Issue = require('../models/issue');
var utils = require('../utils');

router.get('/issue/:uid.json', middlewares.hasReadAccessToProject, findIssueById);
router.get('/issues.json', middlewares.hasReadAccessToProject, listIssues);
router.get('/issues/:sid.json', middlewares.hasReadAccessToProject, listIssuesBySID);
router.get("/issues.html", middlewares.hasReadAccessToProject, renderIssuesHTML);
router.post('/issues/:id', middlewares.hasWriteAccessToProject, storeIssue);


function listIssues(req, res, next) {
	'use strict';

	//let params = req.params;
	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};

	Issue.findByProjectName(dbCol, "master", null).then(issues => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
	}).catch(err => {
		console.log(err);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function listIssuesBySID(req, res, next) {
	'use strict';

	let params = req.params;
	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project};

	Issue.findBySharedId(dbCol, params.sid, req.query.number).then(issues => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function findIssueById(req, res, next) {
	'use strict';

	let params = req.params;
	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project};

	Issue.findByUID(dbCol, params.uid).then(issue => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, [issue]);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function storeIssue(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let data = JSON.parse(req.body.data);

	req[C.REQ_REPO].logger.logDebug("Upserting an issues for object " + req.params[C.REPO_REST_API_SID] + " in " + req.params[C.REPO_REST_API_ACCOUNT] + "/" + req.params[C.REPO_REST_API_PROJECT], req);

	console.log(data);

	// since there is a incompatible attribute in issue model ('set' in comments) with mongoose, need to fall back native mongo api call.
	dbInterface(req[C.REQ_REPO].logger).storeIssue(
		req.params[C.REPO_REST_API_ACCOUNT],
		req.params[C.REPO_REST_API_PROJECT],
		req.params[C.REPO_REST_API_ID],
		req.session.user.username,
		data,
		function(err, result) {
			responseCodes.onError(place, req, res, next, err, result);
		}
	);
}

function renderIssuesHTML(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};

	Issue.findByProjectName(dbCol, "master", null).then(issues => {
		// Split issues by type
		let splitIssues   = {open : [], closed: []};

		for (var i = 0; i < issues.length; i++)
		{
			if (issues[i].hasOwnProperty("comments"))
			{
				for (var j = 0; j < issues[i].comments.length; j++)
				{
					issues[i].comments[j].created = new Date(issues[i].comments[j].created).toString();
				}
			}

			if(issues[i].closed)
			{
				issues[i].created = new Date(issues[i].created).toString();
				splitIssues.closed.push(issues[i]);
			} else {
				issues[i].created = new Date(issues[i].created).toString();
				splitIssues.open.push(issues[i]);
			}
		}

		res.render("issues.jade", {issues : splitIssues});

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
