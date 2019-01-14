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
const _ = require("lodash");
const express = require("express");
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");

const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Issue = require("../models/issue");
const utils = require("../utils");
const multer = require("multer");
const config = require("../config.js");
const moment = require("moment");
const User = require("../models/user");
const Job = require("../models/job");
const ModelHelper = require("../models/helper/model");
const ModelSetting = require("../models/modelSetting");

const stringToUUID = utils.stringToUUID;

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

// router.get('/issues/:sid.json', middlewares.issue.canView, listIssuesBySID);
router.get("/issues.html", middlewares.issue.canView, renderIssuesHTML);

router.get("/revision/:rid/issues.html", middlewares.issue.canView, renderIssuesHTML);

router.post("/issues.json", middlewares.connectQueue, middlewares.issue.canCreate, storeIssue, middlewares.notification.onUpdateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);
router.put("/issues/:issueId.json", middlewares.connectQueue, middlewares.issue.canComment, updateIssue, middlewares.notification.onUpdateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

router.post("/revision/:rid/issues.json", middlewares.connectQueue, middlewares.issue.canCreate, storeIssue, responseCodes.onSuccessfulOperation);
router.put("/revision/:rid/issues/:issueId.json", middlewares.connectQueue, middlewares.issue.canComment, updateIssue, middlewares.notification.onUpdateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

function storeIssue(req, res, next) {
	const data = req.body;
	data.owner = req.session.user.username;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];
	data.revId = req.params.rid;

	Issue.createIssue({account: req.params.account, model: req.params.model}, data).then(issue => {
		req.dataModel =  issue;
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function updateIssue(req, res, next) {
	const data = req.body;
	data.owner = req.session.user.username;
	data.requester = req.session.user.username;
	data.revId = req.params.rid;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];

	const dbCol = {account: req.params.account, model: req.params.model};
	const issueId = req.params.issueId;
	let action;

	Issue.findById(dbCol, utils.stringToUUID(issueId)).then(issue => {
		if(!issue) {
			return Promise.reject({ resCode: responseCodes.ISSUE_NOT_FOUND });
		}

		req.oldDataModel = _.cloneDeep(issue.toObject());

		if (data.hasOwnProperty("comment") && data.edit) {
			action = issue.updateComment(data.commentIndex, data);

		} else if(data.sealed) {
			action = issue.updateComment(data.commentIndex, data);

		} else if(data.commentIndex >= 0 && data.delete) {
			action = issue.removeComment(data.commentIndex, data);

		} else if (data.hasOwnProperty("comment")) {
			action = issue.updateComment(null, data);

		} else if (data.hasOwnProperty("closed") && data.closed) {
			action = Promise.reject("This action is deprecated, use PUT issues/id.json {\"status\": \"closed\"}");

		} else if (data.hasOwnProperty("closed") && !data.closed) {
			action = Promise.reject("This action is deprecated, use PUT issues/id.json {\"status\": \"closed\"}");

		} else {

			action = User.findByUserName(req.params.account).then(dbUser => {

				return Job.findByUser(dbUser.user, req.session.user.username).then(_job => {
					const job = _job ?  _job._id : null;
					const accountPerm = dbUser.customData.permissions.findByUser(req.session.user.username);
					const userIsAdmin = ModelHelper.isUserAdmin(
						req.params.account,
						req.params.model,
						req.session.user.username
					);

					return userIsAdmin.then(projAdmin => {

						const tsAdmin = accountPerm && accountPerm.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
						const isAdmin = projAdmin || tsAdmin;
						const hasOwnerJob = issue.creator_role === job && issue.creator_role && job;
						const hasAssignedJob = job === issue.assigned_roles[0];

						return issue.updateAttrs(data, isAdmin, hasOwnerJob, hasAssignedJob);

					}).catch(err =>{
						if(err) {
							return Promise.reject(err);
						} else{
							return Promise.reject(responseCodes.ISSUE_UPDATE_FAILED);
						}
					});

				});

			});
		}

		return action;

	}).then(actionResult => {
		req.dataModel =  actionResult;
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function listIssues(req, res, next) {

	// let params = req.params;
	const place = utils.APIInfo(req);
	const dbCol =  {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};
	const projection = {
		extras: 0,
		"comments": 0,
		"viewpoints.extras": 0,
		"viewpoints.scribble": 0,
		"viewpoints.screenshot.content": 0,
		"viewpoints.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	let findIssue;
	if(req.query.shared_id) {
		findIssue = Issue.findBySharedId(dbCol, req.query.shared_id, req.query.number);
	} else if (req.params.rid) {
		findIssue = Issue.findIssuesByModelName(dbCol, req.session.user.username, null, req.params.rid, projection);
	} else {
		findIssue = Issue.findIssuesByModelName(dbCol, req.session.user.username, "master", null, projection, null, null, req.query.sortBy);
	}

	findIssue.then(issues => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issues);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function getIssuesBCF(req, res, next) {
	const place = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;
	const dbCol =  {account: account, model: model};

	let ids;
	if (req.query.ids) {
		ids = req.query.ids.split(",");
	}

	let getBCFZipRS;

	if (req.params.rid) {
		getBCFZipRS = Issue.getBCFZipReadStream(account, model, req.session.user.username, null, req.params.rid, ids);
	} else {
		getBCFZipRS = Issue.getBCFZipReadStream(account, model, req.session.user.username, "master", null, ids);
	}

	getBCFZipRS.then(zipRS => {

		const timestamp = (new Date()).toLocaleString();

		ModelSetting.findById(dbCol, dbCol.model).then((settings) => {
			const filenamePrefix = (settings.name + "_" + timestamp + "_").replace(/\W+/g, "_");

			const headers = {
				"Content-Disposition": "attachment;filename=" + filenamePrefix + "issues.bcf",
				"Content-Type": "application/zip"
			};

			res.writeHead(200, headers);
			zipRS.pipe(res);
		});

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function findIssueById(req, res, next) {

	const params = req.params;
	const place = utils.APIInfo(req);
	const dbCol =  {account: req.params.account, model: req.params.model};

	Issue.findByUID(dbCol, params.uid).then(issue => {

		Issue.update(dbCol, { _id: stringToUUID(params.uid) }, { $inc: { viewCount: "1" }}).exec();
		responseCodes.respond(place, req, res, next, responseCodes.OK, issue);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

/**
 * 
 * @param {Date} dateToFormat 
 * @param {string} formatToUse
 * 
 * Format date by providing a date object 
 * and required string format. 
 */

function formatDate(dateToFormat, formatToUse) {
	return moment(dateToFormat).format(formatToUse);
}

function renderIssuesHTML(req, res, next) {

	const place = utils.APIInfo(req);
	const dbCol =  {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};
	let findIssue;
	const noClean = false;

	/**
	* Create dynamic Print report values to use in template.
	**/
	const reportValues = {};
	const reportDate = formatDate(new Date(), "Do MMMM YYYY");
	const currentUser = req.session.user.username;
	reportValues.reportDate = reportDate;
	reportValues.currentUser = currentUser;

	const modelName = ModelSetting.findById({ account: req.params.account, model: req.params.model }, req.params.model)
		.then(setting => {
			 reportValues.modelName = setting.name;
			 Promise.resolve();
		});

	const username = User.findByUserName(req.session.user.username)
		.then(username => {
			reportValues.fullName = username.customData.firstName + " " + username.customData.lastName;
			reportValues.userCompany = username.customData.billing.billingInfo.company;
			Promise.resolve();
		});

	const finaliseValues = Promise.all([modelName, username]);

	const projection = {
		extras: 0,
		"viewpoints.extras": 0,
		"viewpoints.scribble": 0,
		"viewpoints.screenshot.content": 0,
		"viewpoints.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	let ids;
	if(req.query.ids) {
		ids = req.query.ids.split(",");
	}

	if (req.params.rid) {
		findIssue = Issue.findIssuesByModelName(dbCol, req.session.user.username, null, req.params.rid, projection, noClean, ids);
	} else {
		findIssue = Issue.findIssuesByModelName(dbCol, req.session.user.username, "master", null, projection, noClean, ids);
	}

	findIssue.then(issues => {
		// Split issues by type
		const splitIssues   = {open : [], closed: []};

		for (let i = 0; i < issues.length; i++) {
			
			if (issues[i].hasOwnProperty("comments")) {
				for (let j = 0; j < issues[i].comments.length; j++) {
					issues[i].comments[j].created = formatDate(issues[i].comments[j].created, "hh:mm, Do MMM YYYY");
					if (issues[i].comments[j].action !== undefined && issues[i].comments[j].action.property === "due_date") {
						issues[i].comments[j].action.to = formatDate(parseInt(issues[i].comments[j].action.to), "hh:mm, Do MMM YYYY");
						issues[i].comments[j].action.from = formatDate(parseInt(issues[i].comments[j].action.from), "hh:mm, Do MMM YYYY");
					}	
				}
			}

			const issueDueDate = formatDate(issues[i].due_date, "hh:mm, Do MMM YYYY");
			const issueDate = formatDate(issues[i].created, "hh:mm, Do MMM YYYY");
			const currentRevision = issues[i].rev_id;

			reportValues.issueDate = issueDate;
			reportValues.issueDueDate = issueDueDate;
			reportValues.currentRevision = currentRevision;

			if(issues[i].closed || issues[i].status === "closed") {
				issues[i].created = new Date(issues[i].created).toString();
				splitIssues.closed.push(issues[i]);
			} else {
				issues[i].created = new Date(issues[i].created).toString();
				splitIssues.open.push(issues[i]);
			}
		}

		finaliseValues.then(()=> {
			res.render("issues.pug", {
				issues: splitIssues,
				reportValues: reportValues,
				url: function (path) {
					return config.apiAlgorithm.apiUrl(C.GET_API, path);
				}
			});
		}).catch((err) => {
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function importBCF(req, res, next) {

	const place = utils.APIInfo(req);

	// check space
	function fileFilter(fileReq, file, cb) {

		const acceptedFormat = [
			"bcf", "bcfzip", "zip"
		];

		let format = file.originalname.split(".");
		format = format.length <= 1 ? "" : format.splice(-1)[0];

		const size = parseInt(fileReq.headers["content-length"]);

		if(acceptedFormat.indexOf(format.toLowerCase()) === -1) {
			return cb({resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
		}

		if(size > config.uploadSizeLimit) {
			return cb({ resCode: responseCodes.SIZE_LIMIT });
		}

		cb(null, true);
	}

	if(!config.bcf_dir) {
		return responseCodes.respond(place, req, res, next, { message: "config.bcf_dir is not defined"});
	}

	const upload = multer({
		dest: config.bcf_dir,
		fileFilter: fileFilter
	});

	upload.single("file")(req, res, function (err) {
		if (err) {
			return responseCodes.respond(place, req, res, next, err.resCode ? err.resCode : err , err.resCode ?  err.resCode : err);

		} else if(!req.file.size) {
			return responseCodes.respond(place, req, res, next, responseCodes.FILE_FORMAT_NOT_SUPPORTED, responseCodes.FILE_FORMAT_NOT_SUPPORTED);
		} else {

			Issue.importBCF({socketId: req.headers[C.HEADER_SOCKET_ID], user: req.session.user.username}, req.params.account, req.params.model, req.params.rid, req.file.path).then(() => {
				responseCodes.respond(place, req, res, next, responseCodes.OK, {"status": "ok"});
			}).catch(error => {
				responseCodes.respond(place, req, res, next, error, error);
			});
		}
	});
}

function getScreenshot(req, res, next) {

	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Issue.getScreenshot(dbCol, req.params.uid, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

function getScreenshotSmall(req, res, next) {

	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Issue.getSmallScreenshot(dbCol, req.params.uid, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

function getThumbnail(req, res, next) {

	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Issue.getThumbnail(dbCol, req.params.uid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

module.exports = router;
