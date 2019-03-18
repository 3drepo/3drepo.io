/**
 *  Copyright (C) 2019 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.ap
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });
const middlewares = require("../middlewares/middlewares");

const C = require("../constants");
const responseCodes = require("../response_codes.js");
const BCF = require("../models/bcf");
const Issue = require("../models/issue");
const utils = require("../utils");
const multer = require("multer");
const config = require("../config.js");
const ModelSetting = require("../models/modelSetting");

/**
 * @api {get} /:teamspace/:model/issues/:uid.json Find Issue by ID
 * @apiName findIssueById
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {Number} id Issue ID.
 *
 * @apiDescription Find an issue with the requested Issue ID.
 *
 * @apiSuccess {Object} issue The Issue matching the Issue ID
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * {
 *		account: "username"
 *		assigned_roles: []
 *		commentCount: 0
 *		created: 1542723030489
 *		creator_role: "3D Repo"
 *		desc: "(No Description)"
 *		model: "model_ID"
 *		modelCode: ""
 *		name: "Issue one"
 *		norm: []
 *		number: 1
 *		owner: "username"
 *		position: []
 *		priority: "none"
 *		rev_id: "revision_ID"
 *		scale: 1
 *		status: "open"
 *		thumbnail: "USERNAME/MODEL_ID/issues/ISSUE_ID/thumbnail.png"
 *		topic_type: "for_information"
 *		typePrefix: "Architectural"
 *		viewCount: 1
 *		viewpoint: {near: 24.057758331298828, far: 12028.87890625, fov: 1.0471975803375244,…}
 *		__v: 0
 *		_id: "ISSUE_ID"
 * }
 *
 * @apiError ISSUE_NOT_FOUND Issue not found
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {
 *	 "place": "GET /issues/issue_ID.json",
 *	 "status": 500,
 *	 "message": "Issue not found",
 * }
 *
 */
router.get("/issues/:uid.json", middlewares.issue.canView, findIssueById);

/**
 * @api {get} /:teamspace/:model/issues/:uid.json Get Issue Thumbnail
 * @apiName findIssueById
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {Number} id Issue unique ID.
 *
 * @apiDescription Retrieve thumbnail screenshot image for requested issue.
 *
 * @apiSuccess 200 {Object} thumbnail Thumbnail Image
 *
 */
router.get("/issues/:uid/thumbnail.png", middlewares.issue.canView, getThumbnail);

/**
 * @api {get} /:teamspace/:model/issues.json Get all Issues
 * @apiName listIssues
 * @apiGroup Issues
 *
 * @apiDescription List all available issue for current model.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiSuccess (200) {Object} Issue Object.
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * [
 *	{
 *		"_id":"ISSUE_ID",
 *		"creator_role":"Client","scale":1,
 *		"due_date":1543881600000,
 *		"priority":"low",
 *		"desc":"reverse",
 *		"topic_type":"for_information",
 *		"status":"for approval",
 *		"owner":"username",
 *		"created":1546217360002,
 *		"name":"Without reverse",
 *		"number":2,
 *		"rev_id":"REVISION_ID",
 *		"__v":0,
 *		"assigned_roles":["Architect"],
 *		"viewCount":1,
 *		"commentCount":0,
 *		"thumbnail":"nabile/MODEL_ID/issues/ISSUE_ID/thumbnail.png",
 *		"norm":[0,0,0],
 *		"position":[8341.8056640625,1279.962158203125,-3050.34521484375],
 *		"typePrefix":"sample",
 *		"modelCode":"",
 *		"account":"username",
 *		"model":"MODEL_ID",
 *		"viewpoint":
 *			{
 *				"near":54.739341735839844,
 *				"far":27369.669921875,
 *				"fov":1.0471975803375244,
 *				"aspect_ratio":1.451704502105713,
 *				"hideIfc":true,
 *				"guid":"9279d95e-3aee-49c2-ba45-9d2302044597",
 *				"_id":"5c296790e5f57704580ca00a",
 *				"type":"perspective",
 *				"screenshot":"ACCOUNT/MODEL_ID/issues/ISSUE_ID/viewpoints/MODEL_ID/screenshot.png",
 *				"clippingPlanes":[],"right":[0.7270411252975464,1.862645149230957e-8,0.6865938901901245],
 *				"view_dir":[0.6777805089950562,-0.15971262753009796,-0.7177084684371948],
 *				"look_at":[8400.001953125,2339.99951171875,-9599.9990234375],
 *				"position":[-3360.6259765625,5111.28125,2853.4453125],
 *				"up":[0.10965770483016968,0.9871635437011719,-0.11611767113208771],
 *				"screenshotSmall":"nabile/MODEL_ID/issues/ISSUE_ID/viewpoints/MODEL_ID/screenshotSmall.png"
 *			}
 *	}
 * ]
 *
 */
router.get("/issues.json", middlewares.issue.canView, listIssues);

/**
 * @api {get} /:teamspace/:model/issues.bcfzip Get Issues BCF zip file
 * @apiName getIssuesBCF
 * @apiGroup Issues
 *
 * @apiDescription Get a downloaded zip file of all Issues BCF.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */
router.get("/issues.bcfzip", middlewares.issue.canView, getIssuesBCF);

/**
 * @api {post} /:teamspace/:model/issues.bcfzip Import BCF file
 * @apiName importBCF
 * @apiGroup Issues
 *
 * @apiDescription Upload an Issues BCF file.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */
router.post("/issues.bcfzip", middlewares.issue.canCreate, importBCF);

/**
 * @api {get} /:teamspace/:model/issues.bcfzip Get Issue Screenshot
 * @apiName getScreenshot
 * @apiGroup Issue.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Viewpoint unique ID.
 *
 * @apiDescription Get an issue screenshot from viewpoints using a viewpoint ID and issue ID.
 */
router.get("/issues/:uid/viewpoints/:vid/screenshot.png", middlewares.issue.canView, getScreenshot);

/**
 * @api {get} /:teamspace/:model/issues/:uid/viewpoints/:vid/screenshotSmall.png Get smaller version of Issue screenshot
 * @apiName getScreenshotSmall
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Viewpoint unique ID.
 *
 * @apiSuccess (200) {Object} Issue Screenshot.
 */
router.get("/issues/:uid/viewpoints/:vid/screenshotSmall.png", middlewares.issue.canView, getScreenshotSmall);

/**
 * @api {get} /:teamspace/:model/revision/:rid/issues.json Get all Issues by revision ID
 * @apiName listIssues
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID.
 *
 * @apiDescription Get all issues related to specific revision ID.
 *
 * @apiSuccess (200) {Object} Issues Object
 * @apiSuccessExample {json} Success-Response
 *
 * [
 *	{
 *		"_id":"issue_ID",
 *		"creator_role":"Client",
 *		"scale":1,
 *		"due_date":1547424000000,
 *		"priority":"low",
 *		"desc":"This is a description",
 *		"topic_type":"for_information",
 *		"status":"open","owner":"username",
 *		"created":1546626949432,
 *		"name":"An Issue for API",
 *		"number":3,
 *		"rev_id":"9cf31c6e-37cc-4625-8cee-270cf731059e",
 *		"__v":0,
 *		"assigned_roles":["Architect"],
 *		"viewCount":1,"commentCount":0,
 *		"thumbnail":"ACCOUNT/MODEL_ID/issues/ISSUE_ID/thumbnail.png",
 *		"norm":[],"position":[],
 *		"typePrefix":"sample",
 *		"modelCode":"",
 *		"account":"username",
 *		"model":"MODEL_ID",
 *		"viewpoint":
 *			{
 *				"near":54.739341735839844,
 *				"far":27369.669921875,
 *				"fov":1.0471975803375244,
 *				"aspect_ratio":2.522167444229126,
 *				"hideIfc":true,
 *				"guid":"5afbe23f-8307-42d0-ba77-f031922281ce",
 *				"_id":"5c2fa785b4af3c45f8f83c60",
 *				"type":"perspective",
 *				"screenshot":"username/MODEL_ID/issues/ISSUE_ID/viewpoints/5afbe23f-8307-42d0-ba77-f031922281ce/screenshot.png",
 *				"clippingPlanes":[],"right":[0.7270411252975464,1.862645149230957e-8,0.6865938901901245],
 *					"view_dir":[0.6777805089950562,-0.15971262753009796,-0.7177084684371948],
 *					"look_at":[8400.001953125,2339.99951171875,-9599.9990234375],
 *					"position":[-3360.6259765625,5111.28125,2853.4453125],
 *					"up":[0.10965770483016968,0.9871635437011719,-0.11611767113208771],
 *					"screenshotSmall"username/MODEL_ID/issues/ISSUE_ID/viewpoints/5afbe23f-8307-42d0-ba77-f031922281ce/screenshot.png"}
 *	}
 * ]
 */
router.get("/revision/:rid/issues.json", middlewares.issue.canView, listIssues);

/**
 * @api {get} /:teamspace/:model/revision/:rid/issues.bcfzip Get Issues BCF zip file by revision ID
 * @apiName getIssuesBCF
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID.
 *
 * @apiDescription Get Issues BCF export based on revision ID.
 *
 */
router.get("/revision/:rid/issues.bcfzip", middlewares.issue.canView, getIssuesBCF);

/**
 * @api {post} /:teamspace/:model/revision/:rid/issues.bcfzip Post Issues BCF zip file by revision ID
 * @apiName getIssuesBCF
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID.
 *
 * @apiDescription Upload Issues BCF file using current revision ID.
 *
 * @apiSuccess (200) {Object} Status
 * @apiSuccessExample {json} Success-Response.
 * HTTP
 * {
 *	"status":"ok"
 * }
 *
 */
router.post("/revision/:rid/issues.bcfzip", middlewares.issue.canCreate, importBCF);

/**
 * @api {get} /:teamspace/:model/issues.html Issues response into as HTML
 * @apiName renderIssuesHTML
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiDescription Render all Issues into a HTML webpage, response is rendered HTML.
 */
router.get("/issues.html", middlewares.issue.canView, renderIssuesHTML);

/**
 * @api {get} /:teamspace/:model/revision/:rid/issues.html Issues response into as HTML by revision ID
 * @apiName  renderIssuesHTML
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID.
 *
 * @apiDescription Render all Issues into a HTML webpage based on current revision ID.
 */
router.get("/revision/:rid/issues.html", middlewares.issue.canView, renderIssuesHTML);

/**
 * @api {post} /:teamspace/:model/issues.json Create a new issue.
 * @apiName  storeIssue
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiDescription Create a new issue. This is the same endpoint as listIssues, but a post request is required.
 */
router.post("/issues.json", middlewares.issue.canCreate, storeIssue, middlewares.notification.onUpdateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

/**
 * @api {put} /:teamspace/:model/issues.json/issueId.json Update an Issue.
 * @apiName  updateIssue
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Issue unique ID.
 *
 * @apiDescription Update an issue with an existing Issue ID
 *
 * @apiSuccess (200) {Object} Updated Issue Object.
 *
 */
router.put("/issues/:issueId.json", middlewares.issue.canComment, updateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/issuesId.json Store issue based on revision
 * @apiName storeIssue
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Unique Revision ID to store.
 */
router.post("/revision/:rid/issues.json", middlewares.issue.canCreate, storeIssue, responseCodes.onSuccessfulOperation);

/**
 * @api {put} /:teamspace/:model/revision/"rid/issues/:issueId.json Update issue based on revision
 * @apiName updateIssue
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Unique Revision ID to update to.
 * @apiParam {String} issueId Unique Issue ID to update.
 */
router.put("/revision/:rid/issues/:issueId.json", middlewares.issue.canComment, updateIssue, middlewares.chat.onNotification, responseCodes.onSuccessfulOperation);

function storeIssue(req, res, next) {
	const data = req.body;
	data.owner = req.session.user.username;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];
	data.revId = req.params.rid;

	Issue.createIssue({ account: req.params.account, model: req.params.model }, data).then(issue => {
		req.dataModel = issue;
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function updateIssue(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = { account: req.params.account, model: req.params.model };
	const data = req.body;

	data.owner = req.session.user.username;
	data.requester = req.session.user.username;
	data.revId = req.params.rid;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];

	const issueId = req.params.issueId;

	return Issue.updateAttrs(dbCol, issueId, data).then((issue) => {
		req.dataModel = issue;
		req.userNotifications = issue.userNotifications;
		next();
	}).catch((err) => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function listIssues(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = { account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger };

	const branch = req.params.rid ? null : "master";
	const rid = req.params.rid ? req.params.rid : null;
	const ids = req.query.ids ? req.query.ids.split(",") : null;
	const convertCoords = !!req.query.convertCoords;

	Issue.getIssuesList(dbCol, req.session.user.username, branch, rid, ids, req.query.sortBy, convertCoords).then(issues => {
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
		getBCFZipRS = BCF.getBCFZipReadStream(account, model, req.session.user.username, null, req.params.rid, ids);
	} else {
		getBCFZipRS = BCF.getBCFZipReadStream(account, model, req.session.user.username, "master", null, ids);
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
	const dbCol = { account: req.params.account, model: req.params.model };

	Issue.findByUID(dbCol, params.uid).then(issue => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, issue);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function renderIssuesHTML(req, res, next) {
	const place = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;
	const rid = req.params.rid;
	const ids = req.query.ids ? req.query.ids.split(",") : undefined;

	Issue.getIssuesReport(account, model, req.session.user.username, rid, ids, res).catch(err => {
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

		if (acceptedFormat.indexOf(format.toLowerCase()) === -1) {
			return cb({ resCode: responseCodes.FILE_FORMAT_NOT_SUPPORTED });
		}

		if (size > config.uploadSizeLimit) {
			return cb({ resCode: responseCodes.SIZE_LIMIT });
		}

		cb(null, true);
	}

	if (!config.bcf_dir) {
		return responseCodes.respond(place, req, res, next, { message: "config.bcf_dir is not defined" });
	}

	const upload = multer({
		dest: config.bcf_dir,
		fileFilter: fileFilter
	});

	upload.single("file")(req, res, function (err) {
		if (err) {
			return responseCodes.respond(place, req, res, next, err.resCode ? err.resCode : err, err.resCode ? err.resCode : err);

		} else if (!req.file.size) {
			return responseCodes.respond(place, req, res, next, responseCodes.FILE_FORMAT_NOT_SUPPORTED, responseCodes.FILE_FORMAT_NOT_SUPPORTED);
		} else {
			BCF.importBCF({ socketId: req.headers[C.HEADER_SOCKET_ID], user: req.session.user.username }, req.params.account, req.params.model, req.params.rid, req.file.path).then(() => {
				responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "ok" });
			}).catch(error => {
				responseCodes.respond(place, req, res, next, error, error);
			});
		}
	});
}

function getScreenshot(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = { account: req.params.account, model: req.params.model };

	Issue.getScreenshot(dbCol, req.params.uid, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getScreenshotSmall(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = { account: req.params.account, model: req.params.model };

	Issue.getSmallScreenshot(dbCol, req.params.uid, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getThumbnail(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = { account: req.params.account, model: req.params.model };

	Issue.getThumbnail(dbCol, req.params.uid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

module.exports = router;
