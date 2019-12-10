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
 * 		"sequence":[
 * 			{
 * 				"dateTime":"2015-11-04T08:00:00.000Z",
 * 				"tasks":[
 * 					{
 * 						"action":"COLOR",
 * 						"value":[
 * 							255,
 * 							0,
 * 							0
 * 						],
 * 						"shared_ids":[
 * 							"11111111-1111-1111-1111-111111111111",
 * 							"22222222-2222-2222-2222-222222222222",
 * 							"33333333-3333-3333-3333-333333333333",
 * 							"44444444-4444-4444-4444-444444444444",
 * 							"55555555-5555-5555-5555-555555555555"
 * 						],
 * 						"_id":"00000000-0000-0000-0001-000000000002"
 * 					},
 * 					{
 * 						"action":"VISIBILITY",
 * 						"value":0.0,
 * 						"shared_ids":[
 * 							"11111111-1111-1111-1111-111111111111",
 * 							"22222222-2222-2222-2222-222222222222",
 * 							"66666666-6666-6666-6666-666666666666",
 * 							"77777777-7777-7777-7777-777777777777"
 * 						],
 * 						"_id":"00000000-0000-0000-0002-000000000002"
 * 					},
 * 					{
 * 						"action":"CAMERA",
 * 						"value":{
 * 							"position":[
 * 								-5828.818359375,
 * 								5268.15625,
 * 								7829.76171875
 * 							],
 * 							"forward":[
 * 								-2445.6826171875,
 * 								3515.4658203125,
 * 								2434.966552734375
 * 							],
 * 							"up":[
 * 								0.14098820090293884,
 * 								0.9641460180282593,
 * 								-0.22482173144817352
 * 							],
 * 							"fov":1.05,
 * 							"isPerspective":true
 * 						},
 * 						"_id":"00000000-0000-0000-0003-000000000002"
 * 					}
 * 				]
 * 			},
 * 			{
 * 				"dateTime":"2015-11-05T08:00:00.000Z",
 * 				"tasks":[
 * 					{
 * 						"action":"COLOR",
 * 						"value":[
 * 							255,
 * 							255,
 * 							0
 * 						],
 * 						"shared_ids":[
 * 							"33333333-3333-3333-3333-333333333333",
 * 							"44444444-4444-4444-4444-444444444444",
 * 							"55555555-5555-5555-5555-555555555555"
 * 						],
 * 						"_id":"00000000-0000-0000-0004-000000000002"
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
