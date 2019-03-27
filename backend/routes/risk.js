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

/**
 * @api {get} /:teamspace/:model/risks/:uid.json Find Risk by ID
 * @apiName findRiskById
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Risk ID.
 */
router.get("/risks/:uid.json", middlewares.issue.canView, findRiskById);

/**
 * @api {get} /:teamspace/:model/risks/:uid/thumbnail.png Get Risks Thumbnail
 * @apiName getThumbnail
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Risk ID.
 */
router.get("/risks/:uid/thumbnail.png", middlewares.issue.canView, getThumbnail);

/**
 * @api {get} /:teamspace/:model/risks.json List All Risks
 * @apiName listRisks
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */
router.get("/risks.json", middlewares.issue.canView, listRisks);

/**
 * @api {get} /:teamspace/:model/risks/:uid/screenshot.png	Get Risks Screenshot
 * @apiName getScreenshot
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */
router.get("/risks/:uid/viewpoints/:vid/screenshot.png", middlewares.issue.canView, getScreenshot);

/**
 * @api {get} /:teamspace/:model/risks/:uid/screenshotSmall.png  Get Small Risks Screenshot
 * @apiName getScreenshotSmall
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Risk ID.
 */
router.get("/risks/:uid/viewpoints/:vid/screenshotSmall.png", middlewares.issue.canView, getScreenshotSmall);

/**
 * @api {get} /:teamspace/:model/risks/:rid/risks.json	List all Risks by revision ID
 * @apiName listRisks
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision ID.
 */
router.get("/revision/:rid/risks.json", middlewares.issue.canView, listRisks);

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
 * @api {get} /:teamspace/:model/risks.html  Render all Risks as HTML by revision ID
 * @apiName renderRisksHTML
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID.
 */
router.get("/revision/:rid/risks.html", middlewares.issue.canView, renderRisksHTML);

/**
 * @api {post} /:teamspace/:model/risks.json  Store Risks
 * @apiName storeRisk
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision ID.
 */
router.post("/risks.json", middlewares.issue.canCreate, storeRisk);

/**
 * @api {put} /:teamspace/:model/risks/riskId.json	Update risks based on revision
 * @apiName updateRisk
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} riskId.json Risk ID.
 */
router.put("/risks/:riskId.json", middlewares.issue.canComment, updateRisk);

/**
 * @api {post} /:teamspace/:model/revision/:rid/risks.json	Store risks based on Revision ID
 * @apiName storeRisk
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID.
 */
router.post("/revision/:rid/risks.json", middlewares.issue.canCreate, storeRisk);

/**
 * @api {put} /:teamspace/:model/revision/:rid/risks/:riskId.json  Update Risk based on revision ID
 * @apiName  updateRisk
 * @apiGroup Risks
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID.
 * @apiParam {String} riskId Risk ID.
 */
router.put("/revision/:rid/risks/:riskId.json", middlewares.issue.canComment, updateRisk);

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
	const dbCol = {account: req.params.account, model: req.params.model};
	const data = req.body;

	data.owner = req.session.user.username;
	data.requester = req.session.user.username;
	data.revId = req.params.rid;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];

	const riskId = req.params.riskId;

	return Risk.updateAttrs(dbCol, riskId, data).then((risk) => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, risk);

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

	Risk.findByUID(dbCol, params.uid).then(risk => {
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

	Risk.getScreenshot(dbCol, req.params.uid, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getScreenshotSmall(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Risk.getSmallScreenshot(dbCol, req.params.uid, req.params.vid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

function getThumbnail(req, res, next) {
	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Risk.getThumbnail(dbCol, req.params.uid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

module.exports = router;
