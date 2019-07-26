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
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");

const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Risk = require("../models/risk");
const utils = require("../utils");
const Comment = require("../models/comment");

/**
 * @api {get} /:teamspace/:model/risks/:riskId Find Risk by ID
 * @apiName findRiskById
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Risk ID.
 */
router.get("/risks/:riskId", middlewares.issue.canView, findRiskById);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/thumbnail.png Get Risks Thumbnail
 * @apiName getThumbnail
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Risk ID.
 */
router.get("/risks/:riskId/thumbnail.png", middlewares.issue.canView, getThumbnail);

/**
 * @api {get} /:teamspace/:model/risks List All Risks
 * @apiName listRisks
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */
router.get("/risks", middlewares.issue.canView, listRisks);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/screenshot.png	Get Risks Screenshot
 * @apiName getScreenshot
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */
router.get("/risks/:riskId/viewpoints/:vid/screenshot.png", middlewares.issue.canView, getScreenshot);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/screenshotSmall.png  Get Small Risks Screenshot
 * @apiName getScreenshotSmall
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Risk ID.
 */
router.get("/risks/:riskId/viewpoints/:vid/screenshotSmall.png", middlewares.issue.canView, getScreenshotSmall);

/**
 * @api {get} /:teamspace/:model/revision/:rid/risks	List all Risks by revision ID
 * @apiName listRisks
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision ID.
 */
router.get("/revision/:rid/risks", middlewares.issue.canView, listRisks);

/**
 * @api {get} /:teamspace/:model/risks.html  Render all Risks as HTML
 * @apiName renderRisksHTML
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */
router.get("/risks.html", middlewares.issue.canView, renderRisksHTML);

/**
 * @api {get} /:teamspace/:model/revision/:rid/risks.html  Render all Risks as HTML by revision ID
 * @apiName renderRisksHTML
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID.
 */
router.get("/revision/:rid/risks.html", middlewares.issue.canView, renderRisksHTML);

/**
 * @api {post} /:teamspace/:model/risks  Store Risks
 * @apiName storeRisk
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision ID.
 */
router.post("/risks", middlewares.issue.canCreate, storeRisk);

/**
 * @api {patch} /:teamspace/:model/risks/:riskId	Update risks based on revision
 * @apiName updateRisk
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} riskId Risk ID.
 */
router.patch("/risks/:riskId", middlewares.issue.canComment, updateRisk,  middlewares.chat.onUpdateRisk,responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/revision/:rid/risks	Store risks based on Revision ID
 * @apiName storeRisk
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID.
 */
router.post("/revision/:rid/risks", middlewares.issue.canCreate, storeRisk);

/**
 * @api {patch} /:teamspace/:model/revision/:rid/risks/:riskId  Update Risk based on revision ID
 * @apiName  updateRisk
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID.
 * @apiParam {String} riskId Risk ID.
 */
router.patch("/revision/:rid/risks/:riskId", middlewares.issue.canComment, updateRisk, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/risks/:rid/comments Add an comment for an issue
 * @apiName commentIssue
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Unique Issue ID to update.
 * @apiParam {Json} PAYLOAD The data with the comment to be added.
 * @apiParamExample {json} PAYLOAD
 *    {
 *      "comment": "This is a commment",
 *      "viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *   {
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
 *       comment: "This is a commment",
 *       created: 1558534690327,
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
 *       owner: "username",
 *       viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
 *   }
 *
 * @apiError 404 Issue not found
 * @apiError 400 Comment with no text
 * */
router.post("/risks/:rid/comments", middlewares.issue.canComment, addComment, middlewares.chat.onCommentCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/risks/:rid/comments Deletes an comment from an issue
 * @apiName commentIssue
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid	 Unique Issue ID to update.
 * @apiParam {Json} PAYLOAD The data with the comment guid to be deleted.
 * @apiParamExample {json} PAYLOAD
 *    {
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *   {
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
 *   }
 *
 * @apiError 404 Issue not found
 * @apiError 401 Not authorized, when the user is not the owner
 * @apiError 400 Issue comment sealed, when the user is trying to delete a comment that is sealed
 * @apiError 400 GUID invalid, when the user sent an invalid guid
 * */
router.delete("/risks/:rid/comments", middlewares.issue.canComment, deleteComment, middlewares.chat.onCommentDeleted, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/risks/:riskId/comments Add an comment for an issue
 * @apiName commentIssue
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} riskId Unique Issue ID to update.
 * @apiParam {Json} PAYLOAD The data with the comment to be added.
 * @apiParamExample {json} PAYLOAD
 *    {
 *      "comment": "This is a commment",
 *      "viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *   {
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
 *       comment: "This is a commment",
 *       created: 1558534690327,
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
 *       owner: "username",
 *       viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
 *   }
 *
 * @apiError 404 Issue not found
 * @apiError 400 Comment with no text
 * */
router.post("/risks/:riskId/comments", middlewares.issue.canComment, addComment, middlewares.chat.onCommentCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/risks/:riskId/comments Deletes an comment from an issue
 * @apiName commentIssue
 * @apiGroup Issues
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} riskId	 Unique Issue ID to update.
 * @apiParam {Json} PAYLOAD The data with the comment guid to be deleted.
 * @apiParamExample {json} PAYLOAD
 *    {
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *   {
 *       guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
 *   }
 *
 * @apiError 404 Issue not found
 * @apiError 401 Not authorized, when the user is not the owner
 * @apiError 400 Issue comment sealed, when the user is trying to delete a comment that is sealed
 * @apiError 400 GUID invalid, when the user sent an invalid guid
 * */
router.delete("/risks/:riskId/comments", middlewares.issue.canComment, deleteComment, middlewares.chat.onCommentDeleted, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/risks/ Delete risks
 * @apiName deleteRisks
 * @apiGroup Risks
 */
router.delete("/risks/", middlewares.issue.canCreate, deleteRisks);

function storeRisk(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};
	const data = req.body;

	data.owner = req.session.user.username;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];
	data.revId = req.params.rid;

	Risk.createRisk(dbCol, data).then(risk => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, risk);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateRisk(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, riskId } = req.params;
	const updateData = req.body;

	const user = req.session.user.username;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	return Risk.update(user, sessionId, account, model, riskId, updateData).then(({updatedTicket, oldTicket, data}) => {
		req.dataModel = updatedTicket;
		req.oldDataModel = oldTicket;
		req.data = data;
		next();
	}).catch((err) => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteRisks(req, res, next) {
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	if (req.query.ids) {
		const ids = req.query.ids.split(",");

		Risk.deleteRisks(dbCol, sessionId, ids).then(() => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "success"});
		}).catch((err) => {
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
		});
	} else {
		responseCodes.respond(place, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

function listRisks(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};

	const branch = req.params.rid ? null : "master";
	const rid = req.params.rid ? req.params.rid : null;
	const ids = req.query.ids ? req.query.ids.split(",") : null;
	const convertCoords = !!req.query.convertCoords;

	Risk.getRisksList(dbCol, req.session.user.username, branch, rid, ids, convertCoords).then(risks => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, risks);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function findRiskById(req, res, next) {
	const params = req.params;
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Risk.findByUID(dbCol, params.riskId).then(risk => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, risk);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function renderRisksHTML(req, res, next) {
	const place = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;
	const rid = req.params.rid;
	const ids = req.query.ids ? req.query.ids.split(",") : undefined;
	Risk.getRisksReport(account, model, req.session.user.username, rid, ids, res).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getScreenshot(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Risk.getScreenshot(dbCol, req.params.riskId, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getScreenshotSmall(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Risk.getSmallScreenshot(dbCol, req.params.riskId, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getThumbnail(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Risk.getThumbnail(dbCol, req.params.riskId).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function addComment(req, res, next) {
	const user = req.session.user.username;
	const data =  req.body;
	const {account, model, riskId} = req.params;

	Comment.addComment(account, model, "risks", riskId, user, data).then(comment => {
		req.dataModel = comment;
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

function deleteComment(req, res, next) {
	const user = req.session.user.username;
	const guid = req.body.guid;
	const {account, model, riskId} = req.params;

	Comment.deleteComment(account, model, "risks", riskId, guid, user).then(comment => {
		req.dataModel = comment;
		next();
	}).catch(err => {
		responseCodes.onError(req, res, err);
	});
}

module.exports = router;
