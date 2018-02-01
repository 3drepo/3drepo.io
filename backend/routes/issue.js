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
"use strict";

let express = require("express");
let router = express.Router({mergeParams: true});
let middlewares = require("../middlewares/middlewares");

let C = require("../constants");
let responseCodes = require("../response_codes.js");
let Issue = require("../models/issue");
let utils = require("../utils");
let multer = require("multer");
let config = require("../config.js");

let User = require("../models/user");
let ModelHelper = require("../models/helper/model");

let stringToUUID = utils.stringToUUID;

router.get("/issues/:uid.json", middlewares.issue.canView, findIssueById);
router.get("/issues/:uid/thumbnail.png", middlewares.issue.canView, getThumbnail);

router.get("/issues.json", middlewares.issue.canView, listIssues);
router.get("/issues.bcfzip", middlewares.issue.canView, getIssuesBCF);
router.post("/issues.bcfzip", middlewares.issue.canCreate, importBCF);

router.get("/issues/:uid/viewpoints/:vid/screenshot.png", middlewares.issue.canView, getScreenshot);
router.get("/issues/:uid/viewpoints/:vid/screenshotSmall.png", middlewares.issue.canView, getScreenshotSmall);
router.get("/revision/:rid/issues.json", middlewares.issue.canView, listIssues);
router.get("/revision/:rid/issues.bcfzip", middlewares.issue.canView, getIssuesBCF);
router.post("/revision/:rid/issues.bcfzip", middlewares.issue.canCreate, importBCF);

//router.get('/issues/:sid.json', middlewares.issue.canView, listIssuesBySID);
router.get("/issues.html", middlewares.issue.canView, renderIssuesHTML);

router.get("/revision/:rid/issues.html", middlewares.issue.canView, renderIssuesHTML);

router.post("/issues.json", middlewares.connectQueue, middlewares.issue.canCreate, storeIssue);
router.put("/issues/:issueId.json", middlewares.connectQueue, middlewares.issue.canComment, updateIssue);

router.post("/revision/:rid/issues.json", middlewares.connectQueue, middlewares.issue.canCreate, storeIssue);
router.put("/revision/:rid/issues/:issueId.json", middlewares.connectQueue, middlewares.issue.canComment, updateIssue);

function storeIssue(req, res, next){
	

	let place = utils.APIInfo(req);
	//let data = JSON.parse(req.body.data);
	let data = req.body;
	data.owner = req.session.user.username;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];
	
	data.revId = req.params.rid;

	Issue.createIssue({account: req.params.account, model: req.params.model}, data).then(issue => {

		// let resData = {
		// 	_id: issue._id,
		// 	account: req.params.account, 
		// 	model: req.params.model, 
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
	
	let place = utils.APIInfo(req);
	//let data = JSON.parse(req.body.data);
	let data = req.body;
	data.owner = req.session.user.username;
	data.requester = req.session.user.username;
	data.revId = req.params.rid;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];

	let dbCol = {account: req.params.account, model: req.params.model};
	let issueId = req.params.issueId;
	let action;

	Issue.findById(dbCol, utils.stringToUUID(issueId)).then(issue => {

		if(!issue){
			return Promise.reject({ resCode: responseCodes.ISSUE_NOT_FOUND });
		}

		if (data.hasOwnProperty("comment") && data.edit){
			action = issue.updateComment(data.commentIndex, data);

		} else if(data.sealed) {
			action = issue.updateComment(data.commentIndex, data);

		} else if(data.commentIndex >= 0 && data.delete) {
			action = issue.removeComment(data.commentIndex, data);

		} else if (data.hasOwnProperty("comment")){
			action = issue.updateComment(null, data);
		
		} else if (data.hasOwnProperty("closed") && data.closed){
			action = Promise.reject("This action is deprecated, use PUT issues/id.json {\"status\": \"closed\"}");

		} else if (data.hasOwnProperty("closed") && !data.closed){
			action = Promise.reject("This action is deprecated, use PUT issues/id.json {\"status\": \"closed\"}");

		} else {
			
			action = User.findByUserName(req.params.account).then(dbUser => {

				const sub = dbUser.customData.billing.subscriptions.findByAssignedUser(req.session.user.username);
				const job = sub && sub.job;
				const accountPerm = dbUser.customData.permissions.findByUser(req.session.user.username);
				const userIsAdmin = ModelHelper.isUserAdmin(
					req.params.account, 
					req.params.model, 
					req.session.user.username
				);
				
				return userIsAdmin.then( projAdmin => {

					const tsAdmin = accountPerm && accountPerm.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
					const isAdmin = projAdmin || tsAdmin;
					const hasOwnerJob = issue.creator_role === job && issue.creator_role && job; 
					const hasAssignedJob = job === issue.assigned_roles[0];

					return issue.updateAttrs(data, isAdmin, hasOwnerJob, hasAssignedJob);
					

				}).catch(err =>{
						if(err){
							return Promise.reject(err);
						}
						else{
							return Promise.reject(responseCodes.ISSUE_UPDATE_FAILED);					
						}
				});


			});
		}

		return action;

	}).then(issue => {
		let resData = {
			_id: issueId,
			account: req.params.account,
			model: req.params.model,
			issue: issue,
			issue_id : issueId,
			number: issue.number,
			owner: data.hasOwnProperty("comment") ?  data.owner : issue.owner,
			created: issue.created
		};

		responseCodes.respond(place, req, res, next, responseCodes.OK, resData);

	}).catch(err => {

		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function listIssues(req, res, next) {
	
	//let params = req.params;
	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};
	let projection = {
		extras: 0,
		"comments": 0,
		"viewpoints.extras": 0,
		"viewpoints.scribble": 0,
		"viewpoints.screenshot.content": 0,
		"viewpoints.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	let findIssue;
	if(req.query.shared_id){
		findIssue = Issue.findBySharedId(dbCol, req.query.shared_id, req.query.number);
	} else if (req.params.rid) {
		findIssue = Issue.findByModelName(dbCol, req.session.user.username, null, req.params.rid, projection);
	} else {
		findIssue = Issue.findByModelName(dbCol, req.session.user.username, "master", null, projection, null, null, req.query.sortBy);
	}

	findIssue.then(issues => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function getIssuesBCF(req, res, next) {
	
	
	let place = utils.APIInfo(req);
	let account = req.params.account;
	let model = req.params.model;
	
	let getBCFZipRS;

	if (req.params.rid) {
		getBCFZipRS = Issue.getBCFZipReadStream(account, model, req.session.user.username, null, req.params.rid);
	} else {
		getBCFZipRS = Issue.getBCFZipReadStream(account, model, req.session.user.username, "master", null);
	}

	getBCFZipRS.then(zipRS => {

		let headers = {
			"Content-Disposition": "attachment;filename=issues.bcfzip",
			"Content-Type": "application/zip"
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
// 	let dbCol =  {account: req.params.account, model: req.params.model};

// 	Issue.findBySharedId(dbCol, params.sid, req.query.number).then(issues => {
// 		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
// 	}).catch(err => {
// 		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
// 	});

// }

function findIssueById(req, res, next) {
	
	let params = req.params;
	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, model: req.params.model};

	Issue.findByUID(dbCol, params.uid).then(issue => {

		Issue.update(dbCol, { _id: stringToUUID(params.uid) }, { $inc: { viewCount: "1" }}).exec();
		responseCodes.respond(place, req, res, next, responseCodes.OK, issue);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function renderIssuesHTML(req, res, next){
	

	let place = utils.APIInfo(req);
	let dbCol =  {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};
	let findIssue;
	let noClean = false;

	let projection = {
		extras: 0,
		"viewpoints.extras": 0,
		"viewpoints.scribble": 0,
		"viewpoints.screenshot.content": 0,
		"viewpoints.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	let ids;
	if(req.query.ids){
		ids = req.query.ids.split(",");
	}

	if (req.params.rid) {
		findIssue = Issue.findByModelName(dbCol, req.session.user.username, null, req.params.rid, projection, noClean, ids);
	} else {
		findIssue = Issue.findByModelName(dbCol, req.session.user.username, "master", null, projection, noClean, ids);
	}

	findIssue.then(issues => {
		// Split issues by type
		let splitIssues   = {open : [], closed: []};

		for (let i = 0; i < issues.length; i++)
		{
			if (issues[i].hasOwnProperty("comments"))
			{
				for (let j = 0; j < issues[i].comments.length; j++)
				{
					issues[i].comments[j].created = new Date(issues[i].comments[j].created).toString();
				}
			}

			if(issues[i].closed || issues[i].status === "closed")
			{
				issues[i].created = new Date(issues[i].created).toString();
				splitIssues.closed.push(issues[i]);
			} else {
				issues[i].created = new Date(issues[i].created).toString();
				splitIssues.open.push(issues[i]);
			}
		}

		res.render("issues.pug", {
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
	

	let place = utils.APIInfo(req);

	//check space
	function fileFilter(req, file, cb){

		let acceptedFormat = [
			"bcfzip", "zip"
		];

		let format = file.originalname.split(".");
		format = format.length <= 1 ? "" : format.splice(-1)[0];

		let size = parseInt(req.headers["content-length"]);

		if(acceptedFormat.indexOf(format.toLowerCase()) === -1){
			return cb({resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
		}

		if(size > config.uploadSizeLimit){
			return cb({ resCode: responseCodes.SIZE_LIMIT });
		}

		cb(null, true);
	}

	if(!config.bcf_dir){
		return responseCodes.respond(place, req, res, next, { message: "config.bcf_dir is not defined"});
	}

	let upload = multer({ 
		dest: config.bcf_dir,
		fileFilter: fileFilter,
	});

	upload.single("file")(req, res, function (err) {
		if (err) {
			return responseCodes.respond(responsePlace, req, res, next, err.resCode ? err.resCode : err , err.resCode ?  err.resCode : err);
		
		} else if(!req.file.size){
			return responseCodes.respond(responsePlace, req, res, next, responseCodes.FILE_FORMAT_NOT_SUPPORTED, responseCodes.FILE_FORMAT_NOT_SUPPORTED);
		} else {


			Issue.importBCF(req.headers[C.HEADER_SOCKET_ID], req.params.account, req.params.model, req.params.rid, req.file.path).then(() => {
				responseCodes.respond(place, req, res, next, responseCodes.OK, {"status": "ok"});
			}).catch(err => {
				responseCodes.respond(place, req, res, next, err, err);
			});
		}
	});
}

function getScreenshot(req, res, next){
	

	let place = utils.APIInfo(req);
	let dbCol = {account: req.params.account, model: req.params.model};

	Issue.getScreenshot(dbCol, req.params.uid, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

function getScreenshotSmall(req, res, next){
	

	let place = utils.APIInfo(req);
	let dbCol = {account: req.params.account, model: req.params.model};

	Issue.getSmallScreenshot(dbCol, req.params.uid, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

function getThumbnail(req, res, next){
	

	let place = utils.APIInfo(req);
	let dbCol = {account: req.params.account, model: req.params.model};

	Issue.getThumbnail(dbCol, req.params.uid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

module.exports = router;
