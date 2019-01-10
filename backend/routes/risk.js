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
const config = require("../config.js");

router.get("/risks/:uid.json", middlewares.issue.canView, findRiskById);
router.get("/risks/:uid/thumbnail.png", middlewares.issue.canView, getThumbnail);

router.get("/risks.json", middlewares.issue.canView, listRisks);

router.get("/risks/:uid/screenshot.png", middlewares.issue.canView, getScreenshot);
router.get("/risks/:uid/screenshotSmall.png", middlewares.issue.canView, getScreenshotSmall);
router.get("/revision/:rid/risks.json", middlewares.issue.canView, listRisks);

router.get("/risks.html", middlewares.issue.canView, renderRisksHTML);

router.get("/revision/:rid/risks.html", middlewares.issue.canView, renderRisksHTML);

router.post("/risks.json", middlewares.issue.canCreate, storeRisk);
router.put("/risks/:riskId.json", middlewares.issue.canComment, updateRisk);

router.post("/revision/:rid/risks.json", middlewares.issue.canCreate, storeRisk);
router.put("/revision/:rid/risks/:riskId.json", middlewares.issue.canComment, updateRisk);

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
	const dbCol = {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};

	const projection = {
		extras: 0,
		"viewpoint.extras": 0,
		"viewpoint.scribble": 0,
		"viewpoint.screenshot.content": 0,
		"viewpoint.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	let ids;
	let findRisk;

	if (req.query.ids) {
		ids = req.query.ids.split(",");
	}

	if (req.params.rid) {
		findRisk = Risk.findRisksByModelName(dbCol, req.session.user.username, null, req.params.rid, projection, ids);
	} else {
		findRisk = Risk.findRisksByModelName(dbCol, req.session.user.username, "master", null, projection, ids);
	}

	findRisk.then(risks => {
		// Split risks by status
		const splitRisks = {open : [], closed: []};

		for (let i = 0; i < risks.length; i++) {
			if (risks[i].closed || risks[i].status === "closed") {
				risks[i].created = new Date(risks[i].created).toString();
				splitRisks.closed.push(risks[i]);
			} else {
				risks[i].created = new Date(risks[i].created).toString();
				splitRisks.open.push(risks[i]);
			}
		}

		res.render("risks.pug", {
			risks : splitRisks,
			url: function (path) {
				return config.apiAlgorithm.apiUrl(C.GET_API, path);
			}
		});

	}).catch(err => {
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
