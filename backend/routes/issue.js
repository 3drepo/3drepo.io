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
var multer = require("multer");
var config = require("../config.js");

var User = require('../models/user');

var stringToUUID = utils.stringToUUID;

router.get('/issues/:uid.json', middlewares.hasReadAccessToIssue, findIssueById);
router.get('/issues/:uid/thumbnail.png', middlewares.hasReadAccessToIssue, getThumbnail);

router.get('/issues.json', middlewares.hasReadAccessToIssue, listIssues);
router.get('/issues.bcfzip', middlewares.hasReadAccessToIssue, getIssuesBCF);
router.post('/issues.bcfzip', middlewares.hasWriteAccessToIssue, importBCF);

router.get('/issues/:uid/viewpoints/:vid/screenshot.png', middlewares.hasReadAccessToIssue, getScreenshot);
router.get('/issues/:uid/viewpoints/:vid/screenshotSmall.png', middlewares.hasReadAccessToIssue, getScreenshotSmall);
router.get('/revision/:rid/issues.json', middlewares.hasReadAccessToIssue, listIssues);
router.get('/revision/:rid/issues.bcfzip', middlewares.hasReadAccessToIssue, getIssuesBCF);
router.post('/revision/:rid/issues.bcfzip', middlewares.hasWriteAccessToIssue, importBCF);

//router.get('/issues/:sid.json', middlewares.hasReadAccessToIssue, listIssuesBySID);
router.get("/issues.html", middlewares.hasReadAccessToIssue, renderIssuesHTML);

router.get("/revision/:rid/issues.html", middlewares.hasReadAccessToIssue, renderIssuesHTML);

router.post('/issues.json', middlewares.connectQueue, middlewares.hasWriteAccessToIssue, storeIssue);
router.put('/issues/:issueId.json', middlewares.connectQueue, middlewares.hasCommentAccessToIssue, updateIssue);

router.post('/revision/:rid/issues.json', middlewares.connectQueue, middlewares.hasWriteAccessToIssue, storeIssue);
router.put('/revision/:rid/issues/:issueId.json', middlewares.connectQueue, middlewares.hasCommentAccessToIssue, updateIssue);

function storeIssue(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	//let data = JSON.parse(req.body.data);
	let data = req.body;
	data.owner = req.session.user.username;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];
	
	data.revId = req.params.rid;

	Issue.createIssue({account: req.params.account, project: req.params.project}, data).then(issue => {

		// let resData = {
		// 	_id: issue._id,
		// 	account: req.params.account, 
		// 	project: req.params.project, 
		// 	issue_id : issue._id, 
		// 	number : issue.number, 
		// 	created : issue.created, 
		// 	scribble: data.scribble,
		// 	issue: issue
		// };

		responseCodes.respond(place, req, res, next, responseCodes.OK, issue);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateIssue(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	//let data = JSON.parse(req.body.data);
	let data = req.body;
	data.owner = req.session.user.username;
	data.requester = req.session.user.username;
	data.revId = req.params.rid;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];

	let dbCol = {account: req.params.account, project: req.params.project};
	let issueId = req.params.issueId;
	let action;

	Issue.findById(dbCol, utils.stringToUUID(issueId), { 'viewpoints.screenshot': 0, 'thumbnail.content': 0 }).then(issue => {

		if(!issue){
			return Promise.reject({ resCode: responseCodes.ISSUE_NOT_FOUND });
		}

		if(data.hasOwnProperty('comment') && data.edit){
			action = issue.updateComment(data.commentIndex, data);

		} else if(data.sealed) {
			action = issue.updateComment(data.commentIndex, data);

		} else if(data.commentIndex >= 0 && data.delete) {
			action = issue.removeComment(data.commentIndex, data);

		} else if (data.hasOwnProperty('comment')){
			action = issue.updateComment(null, data);
		
		} else if (data.hasOwnProperty('closed') && data.closed){
			action = Promise.reject('This action is deprecated, use PUT issues/id.json {"status": "closed"}');

		} else if (data.hasOwnProperty('closed') && !data.closed){
			action = Promise.reject('This action is deprecated, use PUT issues/id.json {"status": "closed"}');

		} else {
			
			action = User.findByUserName(req.params.account).then(dbUser => {

				const job = dbUser.customData.billing.subscriptions.findByAssignedUser(req.session.user.username).job;
				const accountPerm = dbUser.customData.permissions.findByUser(req.session.user.username);
				const isAdmin = accountPerm && accountPerm.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
				
				const canCloseIssue = (issue.creator_role === job && issue.creator_role && job) || 
					req.session.user.username === issue.owner ||
					isAdmin;

				if(data.status === C.ISSUE_STATUS_CLOSED && !canCloseIssue){
					return Promise.reject(responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED);
				} else {
					return issue.updateAttrs(data);
				}

			});
		}

		return action;

	}).then(issue => {

		let resData = {
			_id: issueId,
			account: req.params.account,
			project: req.params.project,
			issue: issue,
			issue_id : issueId,
			number: issue.number,
			owner: data.hasOwnProperty('comment') ?  data.owner : issue.owner,
			created: issue.created
		};

		responseCodes.respond(place, req, res, next, responseCodes.OK, resData);

	}).catch(err => {

		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function listIssues(req, res, next) {
	'use strict';

	//let params = req.params;
	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};
	let projection = {
		extras: 0,
		'comments': 0,
		'viewpoints.extras': 0,
		'viewpoints.scribble': 0,
		'viewpoints.screenshot.content': 0,
		'viewpoints.screenshot.resizedContent': 0,
		'thumbnail.content': 0
	};

	var findIssue;
	if(req.query.shared_id){
		findIssue = Issue.findBySharedId(dbCol, req.query.shared_id, req.query.number);
	} else if (req.params.rid) {
		findIssue = Issue.findByProjectName(dbCol, req.session.user.username, null, req.params.rid, projection);
	} else {
		findIssue = Issue.findByProjectName(dbCol, req.session.user.username, "master", null, projection, null, null, req.query.sortBy);
	}

	findIssue.then(issues => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function getIssuesBCF(req, res, next) {
	'use strict';
	
	let place = utils.APIInfo(req);
	let account = req.params.account;
	let project = req.params.project;
	
	let getBCFZipRS;

	if (req.params.rid) {
		getBCFZipRS = Issue.getBCFZipReadStream(account, project, req.session.user.username, null, req.params.rid);
	} else {
		getBCFZipRS = Issue.getBCFZipReadStream(account, project, req.session.user.username, "master", null);
	}

	getBCFZipRS.then(zipRS => {

		let headers = {
			'Content-Disposition': 'attachment;filename=issues.bcfzip',
			'Content-Type': 'application/zip'
		};

		res.writeHead(200, headers);
		zipRS.pipe(res);

	}).catch(err => {
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

		Issue.update(dbCol, { _id: stringToUUID(params.uid) }, { $inc: { viewCount: '1' }}).exec();
		responseCodes.respond(place, req, res, next, responseCodes.OK, issue);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function renderIssuesHTML(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, project: req.params.project, logger: req[C.REQ_REPO].logger};
	let findIssue;
	let noClean = false;

	let projection = {
		extras: 0,
		'viewpoints.extras': 0,
		'viewpoints.scribble': 0,
		'viewpoints.screenshot.content': 0,
		'viewpoints.screenshot.resizedContent': 0,
		'thumbnail.content': 0
	};

	let ids;
	if(req.query.ids){
		ids = req.query.ids.split(',');
	}

	if (req.params.rid) {
		findIssue = Issue.findByProjectName(dbCol, req.session.user.username, null, req.params.rid, projection, noClean, ids);
	} else {
		findIssue = Issue.findByProjectName(dbCol, req.session.user.username, "master", null, projection, noClean, ids);
	}

	findIssue.then(issues => {
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

			if(issues[i].closed || issues[i].status === 'closed')
			{
				issues[i].created = new Date(issues[i].created).toString();
				splitIssues.closed.push(issues[i]);
			} else {
				issues[i].created = new Date(issues[i].created).toString();
				splitIssues.open.push(issues[i]);
			}
		}

		res.render("issues.jade", {
			issues : splitIssues, 
			url: function (path){
				return config.apiAlgorithm.apiUrl(C.GET_API, path);
			}
		});

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function importBCF(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);

	//check space
	function fileFilter(req, file, cb){

		let acceptedFormat = [
			'bcfzip', 'zip'
		];

		let format = file.originalname.split('.');
		format = format.length <= 1 ? '' : format.splice(-1)[0];

		let size = parseInt(req.headers['content-length']);

		if(acceptedFormat.indexOf(format.toLowerCase()) === -1){
			return cb({resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
		}

		if(size > config.uploadSizeLimit){
			return cb({ resCode: responseCodes.SIZE_LIMIT });
		}

		cb(null, true);
	}

	if(!config.bcf_dir){
		return responseCodes.respond(place, req, res, next, { message: 'config.bcf_dir is not defined'});
	}

	var upload = multer({ 
		dest: config.bcf_dir,
		fileFilter: fileFilter,
	});

	upload.single("file")(req, res, function (err) {
		if (err) {
			return responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode : err , err.resCode ?  err.resCode : err);
		
		} else if(!req.file.size){
			return responseCodes.respond(responsePlace, req, res, next, responseCodes.FILE_FORMAT_NOT_SUPPORTED, responseCodes.FILE_FORMAT_NOT_SUPPORTED);
		} else {


			Issue.importBCF(req.headers[C.HEADER_SOCKET_ID], req.params.account, req.params.project, req.params.rid, req.file.path).then(() => {
				responseCodes.respond(place, req, res, next, responseCodes.OK, {'status': 'ok'});
			}).catch(err => {
				responseCodes.respond(place, req, res, next, err, err);
			});
		}
	});
}

function getScreenshot(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let dbCol = {account: req.params.account, project: req.params.project};

	Issue.getScreenshot(dbCol, req.params.uid, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, 'png');
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

function getScreenshotSmall(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let dbCol = {account: req.params.account, project: req.params.project};

	Issue.getSmallScreenshot(dbCol, req.params.uid, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, 'png');
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

function getThumbnail(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let dbCol = {account: req.params.account, project: req.params.project};

	Issue.getThumbnail(dbCol, req.params.uid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, 'png');
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

module.exports = router;
