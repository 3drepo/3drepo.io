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
const FileRef = require("../models/fileRef");
const Sequence = require("../models/sequence");

/**
 * @apiDefine Sequences Sequences
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} [revId] Revision unique ID
 */

/**
 * @api {get} /:teamspace/:model/revision(/master/head/|/:revId)/sequences/:sequenceId/state/:stateId Get state
 * @apiName getSequenceState
 * @apiGroup Sequences
 * @apiDescription Get state of model in sequence.
 *
 * @apiUse Sequences
 *
 * @apiParam {String} sequenceId Sequence unique ID
 * @apiParam {String} stateId State unique ID
 *
 * @apiExample {get} Example usage (/master/head)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/sequences/00000000-0000-0000-0000-000000000002/state/00000000-0000-0000-0001-000000000002 HTTP/1.1
 *
 * @apiExample {get} Example usage (/:revId)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/sequences/00000000-0000-0000-0000-000000000002/state/00000000-0000-0000-0001-000000000002 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"transparency":[
 * 		{
 * 			"value":1,
 * 			"shared_ids":[
 * 				11111111-1111-1111-1111-111111111111,
 * 				22222222-2222-2222-2222-222222222222,
 * 				33333333-3333-3333-3333-333333333333
 * 			]
 * 		}
 * 	],
 * 	"color":[
 * 		{
 * 			"value":[
 * 				0,
 * 				1,
 * 				0
 * 			],
 * 			"shared_ids":[
 * 				44444444-4444-4444-4444-444444444444,
 * 				55555555-5555-5555-5555-555555555555,
 * 				66666666-6666-6666-6666-666666666666
 * 			]
 * 		}
 * 	],
 * 	"transform":[
 * 		{
 * 			"value":[
 * 				1, 0, 0, -0.0036411285400390625,
 * 				0, 1, 0, 0.0012891292572021484,
 * 				0, 0, 1, 0,
 * 				0, 0, 0, 1
 * 			],
 * 			"shared_ids":[
 * 				77777777-7777-7777-7777-777777777777,
 * 				88888888-8888-8888-8888-888888888888,
 * 				99999999-9999-9999-9999-999999999999
 * 			]
 * 		},
 * 		{
 * 			"value":[
 * 				1, 0, 0, -0.0036411285400390625,
 * 				0, 1, 0, 0.0012891292572021484,
 * 				0, 0, 1, 0,
 * 				0, 0, 0, 1
 * 			],
 * 			"shared_ids":[
 * 				66666666-6666-6666-6666-666666666666
 * 			]
 * 		},
 * 		{
 * 			"value":[
 * 				1, 0, 0, -0.0036411285400390625,
 * 				0, 1, 0, 0.0012891292572021484,
 * 				0, 0, 1, 0,
 * 				0, 0, 0, 1
 * 			],
 * 			"shared_ids":[
 * 				44444444-4444-4444-4444-444444444444,
 * 				aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa,
 * 				bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb,
 * 				cccccccc-cccc-cccc-cccc-cccccccccccc
 * 			]
 * 		}
 * 	]
 */
router.get("/revision/master/head/sequences/:sequenceId/state/:stateId", middlewares.issue.canView, getSequenceState);
router.get("/revision/:rid/sequences/:sequenceId/state/:stateId", middlewares.issue.canView, getSequenceState);

/**
 * @api {get} /:teamspace/:model/revision(/master/head/|/:revId)/sequences List all sequences
 * @apiName listSequences
 * @apiGroup Sequences
 * @apiDescription List all sequences associated with the model.
 *
 * @apiUse Sequences
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
 * 		"teamspace":"alice",
 * 		"model":"00000000-0000-0000-0000-000000000000",
 * 		"rev_id":"00000000-0000-0000-0000-000000000001",
 * 		"name":"Sequence 1",
 * 		"frames":[
 * 			{
 * 				"dateTime":1244246400000,
 * 				"state":"00000000-0000-0000-0001-000000000002",
 * 				"tasks":[
 * 					{
 * 						"name":"Task 1",
 * 						"startDate":1244246400000,
 * 						"endDate":1244246410000,
 * 						"_id":"00000000-0000-0001-0001-000000000002"
 * 					},
 * 					{
 * 						"name":"Task 2",
 * 						"startDate":1244246410000,
 * 						"endDate":1244246420000,
 * 						"_id":"00000000-0000-0002-0001-000000000002"
 * 					},
 * 					{
 * 						"name":"Task 3",
 * 						"startDate":1244246420000,
 * 						"endDate":1244246430000,
 * 						"_id":"00000000-0000-0003-0001-000000000002"
 * 					}
 * 				]
 * 			},
 * 			{
 * 				"dateTime":1244419200000,
 * 				"state":"00000000-0000-0000-0002-000000000002"
 * 				"tasks":[
 * 					{
 * 						"name":"Task 2",
 * 						"startDate":1244419200000,
 * 						"endDate":1245369600000,
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

function getSequenceState(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, stateId } = req.params;

	FileRef.getSequenceStateFile(account, model, stateId).then(state => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, state);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

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
