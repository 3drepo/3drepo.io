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

const responseCodes = require("../response_codes.js");
const utils = require("../utils");
const Sequence = require("../models/sequence");

/**
 * @apiDefine Sequences Sequences
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

/**
 * @api {get} /:teamspace/:model/revision(/master/head/|/:revId)/sequences List all sequences
 * @apiName listSequences
 * @apiGroup Sequences
 * @apiDescription List all sequences associated with the model.
 *
 * @apiUse Sequences
 *
 * @apiParam {String} [revId] Revision unique ID
 *
 * @apiExample {get} Example usage (/master/head)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/sequences HTTP/1.1
 *
 * @apiExample {get} Example usage (/:revId)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/sequences HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"rev_id":"00000000-0000-0000-0000-000000000001",
 * 		"name":"Sequence 1",
 * 		"frames":[
 * 			{
 * 				"dateTime":"2015-11-04T08:00:00.000Z",
 * 				"state":"00000000-0000-0000-0001-000000000002",
 * 				"tasks":[
 * 					{
 * 						"name":"Task 1",
 * 						"startDate":"2015-11-04T08:00:00.000Z",
 * 						"endDate":"2015-11-04T09:00:00.000Z",
 * 						"_id":"00000000-0000-0001-0001-000000000002"
 * 					},
 * 					{
 * 						"name":"Task 2",
 * 						"startDate":"2015-11-04T08:00:00.000Z",
 * 						"endDate":"2015-11-04T10:00:00.000Z",
 * 						"_id":"00000000-0000-0002-0001-000000000002"
 * 					},
 * 					{
 * 						"name":"Task 2",
 * 						"startDate":"2015-11-04T09:00:00.000Z",
 * 						"endDate":"2015-11-04T12:00:00.000Z",
 * 						"_id":"00000000-0000-0003-0001-000000000002"
 * 					}
 * 				]
 * 			},
 * 			{
 * 				"dateTime":"2015-11-05T08:00:00.000Z",
 * 				"state":"00000000-0000-0000-0002-000000000002"
 * 				"tasks":[
 * 					{
 * 						"name":"Task 2",
 * 						"startDate":"2015-11-05T08:00:00.000Z",
 * 						"endDate":"2015-11-05T12:00:00.000Z",
 * 						"_id":"00000000-0000-0001-0002-000000000002"
 * 					}
 * 				]
 *			}
 * 		],
 * 		"_id":"00000000-0000-0000-0000-000000000002"
 * 	}
 * ]
 */
router.get("/revision/master/head/sequences", middlewares.issue.canView, listSequences);
router.get("/revision/:rid/sequences", middlewares.issue.canView, listSequences);

function listSequences(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, rid } = req.params;
	const branch = rid ? null : "master";

	Sequence.getList(account, model, branch, rid, true).then(sequences => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, sequences);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
