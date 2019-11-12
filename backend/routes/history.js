/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.ap
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
 * @api {get} /:teamspace/:model/revisions.json List all revisions
 * @apiName listRevisions
 * @apiGroup History
 * @apiDescription List all revisions for a model.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiSuccess (200) {Object} Revisions object
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revisions.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"_id":"00000000-0000-0000-0000-000000000001",
 * 		"author":"alice",
 * 		"timestamp":"2009-06-06T00:00:00.000Z",
 * 		"name":"00000000-0000-0000-0000-000000000001",
 * 		"branch":"master"
 * 	}
 * ]
 */
router.get("/revisions.json", middlewares.hasReadAccessToModel, listRevisions);

/**
 * @api {get} /:teamspace/:model/revisions/:branch.json List all revisions by branch
 * @apiName listRevisionsByBranch
 * @apiGroup History
 * @apiDescription List all model revisions from a branch.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} branch Name of revision branch
 * @apiSuccess (200) Revisions object for a branch
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revisions/staging.json HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"_id":"00000000-0000-0000-0000-000000000004",
 * 		"author": "alice",
 * 		"desc": "For coordination",
 * 		"timestamp": "2015-10-21T07:28:00.000Z",
 * 		"name":"00000000-0000-0000-0000-000000000004",
 * 		"branch": "staging"
 * 	},
 * 	{
 * 		"_id":"00000000-0000-0000-0000-000000000003",
 * 		"author": "alice",
 * 		"desc": "Roof access added",
 * 		"timestamp": "1985-10-26T09:00:00.000Z",
 * 		"name":"00000000-0000-0000-0000-000000000003",
 * 		"branch": "staging"
 * 	},
 * 	{
 * 		"_id":"00000000-0000-0000-0000-000000000002",
 * 		"author": "alice",
 * 		"desc": "Initial design",
 * 		"timestamp": "1955-11-12T06:38:00.000Z",
 * 		"name":"00000000-0000-0000-0000-000000000002",
 * 		"branch": "staging"
 * 	}
 * ]
 *
 */
router.get("/revisions/:branch.json", middlewares.hasReadAccessToModel, listRevisionsByBranch);

/**
 * @api {put} /:teamspace/:model/revisions/:id/tag Update Revision Tag
 * @apiName updateRevisionTag
 * @apiGroup Revisions
 *
 * @apiDescription Update revision tag
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Unique Revision ID or tag
 * @apiParam {String} tag Tag to update
 *
 */

router.put("/revisions/:id/tag", middlewares.hasReadAccessToModel, updateRevisionTag);

/**
 * @api {patch} /:teamspace/:model/revisions/:id
 * @apiName updateRevisionStatus
 * @apiGroup Revisions
 *
 * @apiDescription Update the status of revision, setting it to void/active
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Unique Revision ID or tag
 *
 * @apiParamExample {json} Input
 *    {
 *       "void": true
 *    }
 *
 * @apiSuccessExample {json} Success
 *    HTTP/1.1 200 OK
 *    {}
 *
 */

router.patch("/revisions/:id", middlewares.hasReadAccessToModel, updateRevision);

function listRevisions(req, res, next) {

	const place = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;
	const branch = req.params.branch;
	const showVoid = req.query.showVoid !== undefined;

	const projection = {_id : 1, tag: 1, timestamp: 1, desc: 1, author: 1, void: 1, rFile: 1};

	History.listByBranch({account, model}, branch || null, projection, showVoid).then(histories => {

		histories = History.clean(histories);

		histories.forEach(function(history) {
			history.branch = history.branch || branch || C.MASTER_BRANCH_NAME;
			if(history.rFile && history.rFile.length > 0) {
				const orgFileArr = history.rFile[0].split("_");
				history.fileType = orgFileArr[orgFileArr.length - 1].toUpperCase();
			}
			delete history.rFile;
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

function updateRevision(req, res, next) {

	const place = utils.APIInfo(req);
	const account = req.params.account;
	const model = req.params.model;

	History.updateRevision({account, model}, req.params.id, req.body).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, {});
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
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
