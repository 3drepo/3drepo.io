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

router.get("/risks/:uid/viewpoints/:vid/screenshot.png", middlewares.issue.canView, getScreenshot);
router.get("/risks/:uid/viewpoints/:vid/screenshotSmall.png", middlewares.issue.canView, getScreenshotSmall);
router.get("/revision/:rid/risks.json", middlewares.issue.canView, listRisks);

router.get("/risks.html", middlewares.issue.canView, renderRisksHTML);

router.get("/revision/:rid/risks.html", middlewares.issue.canView, renderRisksHTML);

router.post("/risks.json", middlewares.connectQueue, middlewares.issue.canCreate, storeRisk);
router.put("/risks/:riskId.json", middlewares.connectQueue, middlewares.issue.canComment, updateRisk);

router.post("/revision/:rid/risks.json", middlewares.connectQueue, middlewares.issue.canCreate, storeRisk);
router.put("/revision/:rid/risks/:riskId.json", middlewares.connectQueue, middlewares.issue.canComment, updateRisk);

function clean(dbCol, risk) {
	const keys = ["_id", "rev_id", "parent"];
	const commentKeys = ["rev_id", "guid"];
	const vpKeys = ["hidden_group_id", "highlighted_group_id", "shown_group_id", "guid"];

	risk.account = dbCol.account;
	risk.model = (risk.origin_model) ? risk.origin_model : dbCol.model;

	if (risk.scribble) {
		risk.scribble = risk.scribble.toString("base64");
	}

	keys.concat(vpKeys).forEach((key) => {
		if (risk[key]) {
			risk[key] = utils.uuidToString(risk[key]);
		}
	});

	if (risk.comments) {
		risk.comments.forEach((comment, i) => {
			commentKeys.forEach((key) => {
				if (risk.comments[i] && risk.comments[i][key]) {
					risk.comments[i][key] = utils.uuidToString(risk.comments[i][key]);
				}
			});
		});
	}

	if (risk.viewpoints) {
		risk.viewpoints.forEach((vp, i) => {
			vpKeys.forEach((key) => {
				if (risk.viewpoints[i] && risk.viewpoints[i][key]) {
					risk.viewpoints[i][key] = utils.uuidToString(risk.viewpoints[i][key]);
				}
			});
		});

		risk.viewpoints.forEach((vp, i) => {
			if (risk.viewpoints[i].screenshot) {
				risk.viewpoints[i].screenshot = risk.account + "/" + risk.model + "/risks/" + risk._id + "/viewpoints/" + risk.viewpoints[i].guid + "/screenshot.png";
				risk.viewpoints[i].screenshotSmall = risk.account + "/" + risk.model + "/risks/" + risk._id + "/viewpoints/" + risk.viewpoints[i].guid + "/screenshotSmall.png";
			}
		});

		if (risk.viewpoints.length > 0) {
			risk.viewpoint = risk.viewpoints[0];
			delete risk.viewpoints;
		}
	}

	if (risk.thumbnail && risk.thumbnail.flag) {
		risk.thumbnail = risk.account + "/" + risk.model + "/risks/" + risk._id + "/thumbnail.png";
	}

	return risk;
}

function storeRisk(req, res, next) {

	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model};
	const data = req.body;

	data.owner = req.session.user.username;
	data.sessionId = req.headers[C.HEADER_SOCKET_ID];
	data.revId = req.params.rid;

	Risk.createRisk(dbCol, data).then(risk => {
		risk = clean(dbCol, risk);

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
		const resData = {
			_id: riskId,
			account: req.params.account,
			model: req.params.model,
			risk: risk,
			risk_id : riskId,
			number: risk.number,
			owner: risk.owner,
			created: risk.created
		};

		responseCodes.respond(place, req, res, next, responseCodes.OK, resData);

	}).catch((err) => {

		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function listRisks(req, res, next) {

	const place = utils.APIInfo(req);
	const dbCol = {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};
	const projection = {
		extras: 0,
		"comments": 0,
		"viewpoints.extras": 0,
		"viewpoints.scribble": 0,
		"viewpoints.screenshot.content": 0,
		"viewpoints.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	let findRisks;

	if (req.query.shared_id) {
		findRisks = Risk.findBySharedId(dbCol, req.query.shared_id, req.query.number);
	} else if (req.params.rid) {
		findRisks = Risk.findRisksByModelName(dbCol, req.session.user.username, null, req.params.rid, projection);
	} else {
		findRisks = Risk.findRisksByModelName(dbCol, req.session.user.username, "master", null, projection);
	}

	findRisks.then(risks => {
		risks = risks.map(risk => clean(dbCol, risk));

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

		risk = clean(dbCol, risk);

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
		"viewpoints.extras": 0,
		"viewpoints.scribble": 0,
		"viewpoints.screenshot.content": 0,
		"viewpoints.screenshot.resizedContent": 0,
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

		risks = risks.map(risk => clean(dbCol, risk));

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
