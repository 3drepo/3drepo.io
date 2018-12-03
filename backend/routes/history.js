/**
 *  Copyright (C) 2016 3D Repo Ltd
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
const History = require("../models/history");
const utils = require("../utils");

/**
 * @api {get} /revisions.json List all revisions
 * @apiName listRevisions
 * @apiGroup Revisions
 */

router.get("/revisions.json", middlewares.hasReadAccessToModel, listRevisions);

/**
 * @api {get} /revisions/:branch.json List all revisions by branch
 * @apiName listRevisionsByBranch
 * @apiGroup Revisions
 * @apiParam {String} branch.json Branch values 
 */

router.get("/revisions/:branch.json", middlewares.hasReadAccessToModel, listRevisionsByBranch);

/**
 * @api {put} /revisions/:id/tag Update Revision Tag 
 * @apiName updateRevisionTag
 * @apiGroup Revisions
 * @apiParam {String} id Unique Revision ID
 * @apiParam {String} tag Tag to update
 */

router.put("/revisions/:id/tag", middlewares.hasReadAccessToModel, updateRevisionTag);

function listRevisions(req, res, next) {

	const place = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;

	History.listByBranch({account, model}, null, {_id : 1, tag: 1, timestamp: 1, desc: 1, author: 1}).then(histories => {

		histories = History.clean(histories);

		histories.forEach(function(history) {
			history.branch = history.branch || C.MASTER_BRANCH_NAME;
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, histories);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode ? err.resCode : err, err.resCode ? err.resCode : err);
	});
}

function listRevisionsByBranch(req, res, next) {

	const place = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;

	History.listByBranch({account, model}, req.params.branch, {_id : 1, tag: 1, timestamp: 1, desc: 1, author: 1}).then(histories => {

		histories = History.clean(histories);

		histories.forEach(function(history) {
			history.branch = history.branch || req.params.branch;
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, histories);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode ? err.resCode : err, err.resCode ? err.resCode : err);
	});
}

function updateRevisionTag(req, res, next) {

	const place = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;

	History.findByUID({account, model}, req.params.id, {_id : 1, tag: 1}).then(history => {
		if (!history) {
			return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
		} else {
			history.tag = req.body.tag;
			return history.save();
		}
	}).then(history => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, history.clean());
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

module.exports = router;
