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
const config = require("../config");

/**
 * @apiDefine Risks Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

/**
 * @api {get} /:teamspace/:model/risks/:riskId Get a risk
 * @apiName findRiskById
 * @apiGroup Risks
 * @apiDescription Retrieve a risk. The response includes all comments
 * and screenshot URLs.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiSuccess {Object} issue The Issue matching the Issue ID
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000001 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response.
 * HTTP/1.1 200 OK
 * {
 * }
 */
router.get("/risks/:riskId", middlewares.issue.canView, findRiskById);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/thumbnail.png Get risk thumbnail
 * @apiName getThumbnail
 * @apiGroup Risks
 * @apiDescription Retrieve a risk thumbnail image.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiSuccess {png} image Thumbnail image
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000001/thumbnail.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/risks/:riskId/thumbnail.png", middlewares.issue.canView, getThumbnail);

/**
 * @api {get} /:teamspace/:model/risks List all risks
 * @apiName listRisks
 * @apiGroup Risks
 * @apiDescription Retrieve all model risks.
 *
 * @apiUse Risks
 *
 * @apiSuccess (200) {Object[]} risks Risk objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * ]
 */
router.get("/risks", middlewares.issue.canView, listRisks);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/screenshot.png Get risk screenshot
 * @apiName getScreenshot
 * @apiGroup Risks
 * @apiDescription Retrieve a risk screenshot image.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiSuccess {png} image Screenshot image
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000001/screenshot.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/risks/:riskId/viewpoints/:vid/screenshot.png", middlewares.issue.canView, getScreenshot);

/**
 * @api {get} /:teamspace/:model/risks/:riskId/screenshotSmall.png Get low-res screenshot
 * @apiName getScreenshotSmall
 * @apiGroup Risks
 * @apiDescription Retrieve a low-resolution risk screenshot image.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiSuccess {png} image Small screenshot image
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000001/screenshotSmall.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/risks/:riskId/viewpoints/:vid/screenshotSmall.png", middlewares.issue.canView, getScreenshotSmall);

/**
 * @api {get} /:teamspace/:model/revision/:revId/risks List all revision risks
 * @apiName listRisksByRevision
 * @apiGroup Risks
 * @apiDescription Retrieve all risks associated with a model revision.
 *
 * @apiUse Risks
 *
 * @apiParam {String} revId Revision ID
 * @apiSuccess (200) {Object[]} risks Risk objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * ]
 */
router.get("/revision/:rid/risks", middlewares.issue.canView, listRisks);

/**
 * @api {get} /:teamspace/:model/risks.html Render risks as HTML
 * @apiName renderRisksHTML
 * @apiGroup Risks
 * @apiDescription Retrieve HTML page of all risks.
 *
 * @apiUse Risks
 *
 * @apiParam (Query) {String} ids Risk IDs to show
 * @apiSuccess (200) {Object[]} risks Risk objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks.html?[query] HTTP/1.1
 *
 * @apiSuccessExample {html} Success-Response
 * HTTP/1.1 200 OK
 * <html page>
 */
router.get("/risks.html", middlewares.issue.canView, renderRisksHTML);

/**
 * @api {get} /:teamspace/:model/revision/:revId/risks.html  Render revision risks as HTML
 * @apiName renderRisksHTMLBRevision
 * @apiGroup Risks
 * @apiDescription Retrieve HTML page of all risks associated with a model revision.
 *
 * @apiUse Risks
 *
 * @apiParam {String} revId Revision ID
 * @apiParam (Query) {String} ids Risk IDs to show
 * @apiSuccess (200) {Object[]} risks Risk objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks.html?[query] HTTP/1.1
 *
 * @apiSuccessExample {html} Success-Response
 * HTTP/1.1 200 OK
 * <html page>
 */
router.get("/revision/:rid/risks.html", middlewares.issue.canView, renderRisksHTML);

/**
 * @api {post} /:teamspace/:model/risks Create a risk
 * @apiName storeRisk
 * @apiGroup Risks
 * @apiDescription Create a model risk.
 *
 * @apiUse Risks
 *
 * @apiExample {post} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
 * {
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * }
 */
router.post("/risks", middlewares.issue.canCreate, storeRisk);

/**
 * @api {patch} /:teamspace/:model/risks/:riskId Update risk
 * @apiName updateRisk
 * @apiGroup Risks
 * @apiDescription Update model risk.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 *
 * @apiExample {put} Example usage:
 * PUT /acme/00000000-0000-0000-0000-000000000000/risks/00000000-0000-0000-0000-000000000001 HTTP/1.1
 * {
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * }
 */
router.patch("/risks/:riskId", middlewares.issue.canComment, updateRisk,  middlewares.chat.onUpdateRisk,responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/revision/:revId/risks Create a risk on revision
 * @apiName storeRiskByRevision
 * @apiGroup Risks
 * @apiDescription Create a model risk on a revision.
 *
 * @apiUse Risks
 *
 * @apiParam {String} revId Revision ID
 *
 * @apiExample {post} Example usage:
 * PUT /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks HTTP/1.1
 * {
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * }
 */
router.post("/revision/:rid/risks", middlewares.issue.canCreate, storeRisk);

/**
 * @api {patch} /:teamspace/:model/revision/:revId/risks/:riskId Update risk on revision
 * @apiName  updateRiskByRevision
 * @apiGroup Risks
 * @apiDescription Update model risk.
 *
 * @apiUse Risks
 *
 * @apiParam {String} revId Revision ID
 * @apiParam {String} riskId Risk ID
 *
 * @apiExample {put} Example usage:
 * PUT /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/risks/00000000-0000-0000-0000-000000000002 HTTP/1.1
 * {
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * }
 */
router.patch("/revision/:rid/risks/:riskId", middlewares.issue.canComment, updateRisk, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/risks/:riskId/comments Add a comment
 * @apiName commentRisk
 * @apiGroup Risks
 * @apiDescription Create a comment in a risk.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiParam {Json} PAYLOAD The data with the comment to be added.
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/risks HTTP/1.1
 *
 * @apiParamExample {json} PAYLOAD
 * {
 * 	"comment": "This is a commment",
 * 	"viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
 * }
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 * 	guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
 * 	comment: "This is a commment",
 * 	created: 1558534690327,
 * 	guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
 * 	owner: "username",
 * 	viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
 * }
 **/
router.post("/risks/:riskId/comments", middlewares.issue.canComment, addComment, middlewares.chat.onCommentCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/risks/:riskId/comments Deletes a comment
 * @apiName deleteComment
 * @apiGroup Risks
 * @apiDescription Delete a risk comment.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiParam {Json} PAYLOAD The data with the comment guid to be deleted.
 *
 * @apiParamExample {json} PAYLOAD
 * {
 * 	guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
 * }
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 * 	guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
 * }
 **/
router.delete("/risks/:riskId/comments", middlewares.issue.canComment, deleteComment, middlewares.chat.onCommentDeleted, responseCodes.onSuccessfulOperation);

/**
 * @api {post} /:teamspace/:model/risks/:riskId/comments Add a comment
 * @apiName commentIssue
 * @apiGroup Risks
 * @apiDescription Add a model risk comment.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Unique Issue ID to update.
 * @apiParam {Json} PAYLOAD The data with the comment to be added.
 *
 * @apiParamExample {json} PAYLOAD
 * {
 * 	"comment": "This is a commment",
 * 	"viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
 * }
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 * 	guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
 * 	comment: "This is a commment",
 * 	created: 1558534690327,
 * 	guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e",
 * 	owner: "username",
 * 	viewpoint: {right: [-0.0374530553817749, -7.450580596923828e-9, -0.9992983341217041],…}
 * }
 **/
router.post("/risks/:riskId/comments", middlewares.issue.canComment, addComment, middlewares.chat.onCommentCreated, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/risks/:riskId/comments Delete a comment
 * @apiName deleteRiskComment
 * @apiGroup Issues
 * @apiDescription Delete a risk comment.
 *
 * @apiUse Risks
 *
 * @apiParam {String} riskId Risk ID
 * @apiParam {Json} PAYLOAD The data with the comment guid to be deleted.
 *
 * @apiParamExample {json} PAYLOAD
 * {
 * 	guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
 * }
 *
 * @apiSuccessExample {json} Success
 * HTTP/1.1 200 OK
 * {
 * 	guid: "096de7ed-e3bb-4d5b-ae68-17a5cf7a5e5e"
 * }
 * */
router.delete("/risks/:riskId/comments", middlewares.issue.canComment, deleteComment, middlewares.chat.onCommentDeleted, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /:teamspace/:model/risks?ids=:ids Delete risks
 * @apiName deleteRisks
 * @apiGroup Risks
 * @apiDescription Delete model risks.
 *
 * @apiUse Risks
 *
 * @apiParam (Query) {String} ids Comma separated list of IDs of risks to delete
 *
 * @apiExample {delete} Example usage:
 * DELETE /acme/00000000-0000-0000-0000-000000000000/risks?ids=00000000-0000-0000-0000-000000000001 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {}
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
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getScreenshotSmall(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Risk.getSmallScreenshot(dbCol, req.params.riskId, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getThumbnail(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Risk.getThumbnail(dbCol, req.params.riskId).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png", config.cachePolicy);
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
