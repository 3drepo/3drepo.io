/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.ap
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

var C = require("../constants");
var responseCodes = require('../response_codes.js');
var Issue = require('../models/issue');
var utils = require('../utils');
var uuidToString = utils.uuidToString;



router.get('/issues/:uid.json', middlewares.hasReadAccessToProject, findIssueById);
router.get('/issues.json', middlewares.hasReadAccessToProject, listIssues);
//router.get('/issues/:sid.json', middlewares.hasReadAccessToProject, listIssuesBySID);
router.get("/issues.html", middlewares.hasReadAccessToProject, renderIssuesHTML);
router.post('/issues.json', middlewares.hasWriteAccessToProject, storeIssue);
router.put('/issues/:issueId.json', middlewares.hasWriteAccessToProject, updateIssue);


function storeIssue(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let data = JSON.parse(req.body.data);
	data.owner = req.session.user.username;

	Issue.createIssue({account: req.params.account, project: req.params.project}, data).then(issue => {

		issue = issue.toObject();
		issue.scribble = data.scribble;

		let resData = {
			_id: uuidToString(issue._id),
			account: req.params.account, 
			project: req.params.project, 
			issue_id : uuidToString(issue._id), 
			number : issue.number, 
			created : issue.created, 
			scribble: data.scribble,
			issue: issue
		};

		responseCodes.respond(place, req, res, next, responseCodes.OK, resData);

	}).catch(err => {
		console.log(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateIssue(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let data = JSON.parse(req.body.data);
	data.owner = req.session.user.username;
	let dbCol = {account: req.params.account, project: req.params.project};
	let issueId = req.params.issueId;
	let action;


	Issue.findByUID(dbCol, issueId, false, true).then(issue => {

		console.log(issue.updateComment);

		if(data.hasOwnProperty('comment') && data.edit){
			action = issue.updateComment(data.commentIndex, data);

		} else if(data.hasOwnProperty('comment') && data.sealed) {
			action = issue.updateComment(data.commentIndex, data);

		} else if(data.hasOwnProperty('comment') && data.delete) {
			action = issue.removeComment(data.commentIndex, data);

		} else if (data.hasOwnProperty('comment')){
			action = issue.updateComment(null, data);
		
		} else if (data.hasOwnProperty('closed') && data.closed){
			action = issue.closeIssue();

		} else if (data.hasOwnProperty('closed') && !data.closed){
			action = issue.reopenIssue();

		} else if (data.hasOwnProperty("assigned_roles")){
			issue.assigned_roles = data.assigned_roles;
			action = issue.save();

		} else {
			return Promise.reject({ 'message': 'unknown action'});
		}

		return action;

	}).then(issue => {

		issue = issue.toObject();
		let resData = {
			_id: uuidToString(issue._id),
			account: req.params.account,
			project: req.params.project,
			issue: data,
			issue_id : uuidToString(issue._id),
			number: issue.number,
			owner: issue.owner,
			created: issue.created
		};

		responseCodes.respond(place, req, res, next, responseCodes.OK, resData);

	}).catch(err => {
		console.log(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function listIssues(req, res, next) {
	'use strict';

	//let params = req.params;
	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};

	var findIssue;
	if(req.query.shared_id){
		findIssue = Issue.findBySharedId(dbCol, req.query.shared_id, req.query.number);
	} else {
		findIssue = Issue.findByProjectName(dbCol, "master", null);
	}

	findIssue.then(issues => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
	}).catch(err => {
		console.log(err);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

// function listIssuesBySID(req, res, next) {
// 	'use strict';

// 	let params = req.params;
// 	let place = utils.APIInfo(req);
// 	let dbCol =  {account: req.params.account, project: req.params.project};

// 	Issue.findBySharedId(dbCol, params.sid, req.query.number).then(issues => {
// 		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
// 	}).catch(err => {
// 		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
// 	});

// }

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
