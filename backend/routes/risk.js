/**
 *  Copyright (C) 2018 3D Repo Ltd
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

const express = require("express");
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");

const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Risk = require("../models/risk");
const utils = require("../utils");

/**
 * @api {get} /risks/:uid.json Find Risk by ID
 * @apiName findRiskById
 * @apiGroup Risks
 *
 * @apiParam {String} id Risk unique ID.
 */

router.get("/risks/:uid.json", middlewares.issue.canView, findRiskById);

/**
 * @api {get} /risks/:uid/thumbnail.png Get Risks Thumbnail
 * @apiName getThumbnail
 * @apiGroup Risks
 *
 * @apiParam {String} id Risk unique ID.
 */

router.get("/risks/:uid/thumbnail.png", middlewares.issue.canView, getThumbnail);

/**
 * @api {get} /risks.json List All Risks
 * @apiName listRisks
 * @apiGroup Risks
 */

router.get("/risks.json", middlewares.issue.canView, listRisks);

/**
 * @api {get} /risks/:uid/screenshot.png  Get Risks Screenshot
 * @apiName getScreenshot
 * @apiGroup Risks
 */

router.get("/risks/:uid/screenshot.png", middlewares.issue.canView, getScreenshot);

/**
 * @api {get} /risks/:uid/screenshotSmall.png  Get Small Risks Screenshot
 * @apiName getScreenshotSmall
 * @apiGroup Risks
 *
 * @apiParam {String} id Risk unique ID.
 */

router.get("/risks/:uid/screenshotSmall.png", middlewares.issue.canView, getScreenshotSmall);

/**
 * @api {get} /risks/:rid/risks.json  List all Risks by revision ID
 * @apiName listRisks
 * @apiGroup Risks
 *
 * @apiParam {String} id Revision unique ID.
 */

router.get("/revision/:rid/risks.json", middlewares.issue.canView, listRisks);

/**
 * @api {get} /risks.html  Render all Risks as HTML
 * @apiName renderRisksHTML
 * @apiGroup Risks
 */

router.get("/risks.html", middlewares.issue.canView, renderRisksHTML);

/**
 * @api {get} /risks.html  Render all Risks as HTML by revision ID
 * @apiName renderRisksHTML
 * @apiGroup Risks
 *
 * @apiParam {String} id Revision unique ID.
 */

router.get("/revision/:rid/risks.html", middlewares.issue.canView, renderRisksHTML);

/**
 * @api {post} /risks.json  Store Risks
 * @apiName storeRisk
 * @apiGroup Risks
 *
 * @apiParam {String} id Revision unique ID.
 */

router.post("/risks.json", middlewares.issue.canCreate, storeRisk);

/**
 * @api {put} /risks/riskId.json  Update risks based on revision
 * @apiName updateRisk
 * @apiGroup Risks
 *
 * @apiParam {String} riskId.json Risk unique ID.
 */

router.put("/risks/:riskId.json", middlewares.issue.canComment, updateRisk);

/**
 * @api {post} /revision/:rid/risks.json  Store risks based on Revision ID
 * @apiName storeRisk
 * @apiGroup Risks
 *
 * @apiParam {String} rid Revision unique ID.
 */

router.post("/revision/:rid/risks.json", middlewares.issue.canCreate, storeRisk);

/**
 * @api {put} /revision/:rid/risks/:riskId.json  Update Risk based on revision ID
 * @apiName  updateRisk
 * @apiGroup Risks
 *
 * @apiParam {String} rid Revision unique ID.
 * @apiParam {String} rid Risk unique ID.
 */

router.put("/revision/:rid/risks/:riskId.json", middlewares.issue.canComment, updateRisk);

/**
 * @api {delete} /risks/ Delete risks
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

	const projection = {
		extras: 0,
		"comments": 0,
		"viewpoint.extras": 0,
		"viewpoint.scribble": 0,
		"viewpoint.screenshot.content": 0,
		"viewpoint.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	let findRisks;

	if (req.params.rid) {
		findRisks = Risk.findRisksByModelName(dbCol, req.session.user.username, null, req.params.rid, projection);
	} else {
		findRisks = Risk.findRisksByModelName(dbCol, req.session.user.username, "master", null, projection);
	}

	findRisks.then(risks => {
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

	Risk.getScreenshot(dbCol, req.params.uid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

function getScreenshotSmall(req, res, next) {

	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};

	Risk.getSmallScreenshot(dbCol, req.params.uid).then(buffer => {
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
