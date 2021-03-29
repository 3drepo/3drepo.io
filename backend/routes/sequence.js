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
const SequenceActivities = require("../models/sequenceActivities");

/**
 * @apiDefine Sequences Sequences
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} [revId] Revision unique ID
 */

/**
 * @apiDefine ActivityBodyObject
 *
 * @apiParam (Request body) {String} name The name of the activity
 * @apiParam (Request body) {Number} startDate The starting timestamp date of the activity
 * @apiParam (Request body) {Number} endDate The ending timestamp date of the activity
 * @apiParam (Request body) {String} [parent] The parent id if it has one. This parent must exist previously
 * @apiParam (Request body) {Object} [resources] The resources asoociated with the activity
 * @apiParam (Request body) {KeyValue[]} [data] An array of key value pairs with metadata for the activity
 */

/**
 * @apiDefine ActivityBodyObjectOptional
 *
 * @apiParam (Request body) {String} [name] The name of the activity
 * @apiParam (Request body) {Number} [startDate] The starting timestamp date of the activity
 * @apiParam (Request body) {Number} [endDate] The ending timestamp date of the activity
 * @apiParam (Request body) {String} [parent] The parent id if it has one. This parent must exist previously
 * @apiParam (Request body) {Object} [resources] The resources asoociated with the activity
 * @apiParam (Request body) {KeyValue[]} [data] An array of key value pairs with metadata for the activity
 */

/**
 * @apiDefine ActivityTreeObject
 *
 * @apiParam (Type: Activity) {String} name The name of the activity
 * @apiParam (Type: Activity) {Number} startDate The starting timestamp date of the activity
 * @apiParam (Type: Activity) {Number} endDate The ending timestamp date of the activity
 * @apiParam (Type: Activity) {Object} [resources] The resources asoociated with the activity
 * @apiParam (Type: Activity) {KeyValue[]} [data] An array of key value pairs with metadata for the activity
 * @apiParam (Type: Activity) {Activity[]} [subActivities] An array of activities that will be children of the activity
 *
 */

/**
 * @apiDefine KeyValueObject
 *
 * @apiParam (Type: KeyValue) {String} key The key of the pair
 * @apiParam (Type: KeyValue) {Any} value The value of the pair
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
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/sequences/00000000-0000-0000-0001-000000000001/state/00000000-0000-0000-0001-000000000002 HTTP/1.1
 *
 * @apiExample {get} Example usage (/:revId)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/sequences/00000000-0000-0000-0001-000000000001/state/00000000-0000-0000-0001-000000000002 HTTP/1.1
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
router.get("/revision/:revId/sequences/:sequenceId/state/:stateId", middlewares.issue.canView, getSequenceState);

/**
 * @api {patch} /:teamspace/:model/revision(/master/head/|/:revId)/sequences/:sequenceID Update a sequence
 * @apiName updateSequence
 * @apiGroup Sequences
 * @apiDescription Update a sequence (note: currently only name chance is supported
 *
 * @apiUse Sequences
 *
 * @apiExample {patch} Example usage (/master/head)
 * PATCH /acme/00000000-0000-0000-0000-000000000000/revision/master/head/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiExample {patch} Example usage (/:revId)
 * PATCH /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/sequences/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiParam (Request body) {String} name The new name of the sequence
 *
 * @apiExample {patch} Example usage:
 * {
 * 	  "name": "Building works"
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {}
 */

router.patch("/revision/master/head/sequences/:sequenceId", middlewares.hasUploadAccessToModel, updateSequence);
router.patch("/revision/:revId/sequences/:sequenceId", middlewares.hasUploadAccessToModel, updateSequence);

/**
 * @api {put} /:teamspace/:model/revision(/master/head/|/:revId)/sequences/:sequenceID/legend Add/Update legend
 * @apiName updateLegend
 * @apiGroup Sequences
 * @apiDescription Update/add a legend to this sequence
 *
 * @apiUse Sequences
 *
 * @apiExample {put} Example usage (/master/head)
 * PUT /acme/00000000-0000-0000-0000-000000000000/revision/master/head/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1
 *
 * @apiExample {put} Example usage (/:revId)
 * PUT /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1
 *
 * @apiExample {put} Example usage:
 * {
 * 	  "Building works": "#aabbcc"
 * 	  "Temporary works": "#ffffff66"
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {}
 */

router.put("/revision/master/head/sequences/:sequenceId/legend", middlewares.hasUploadAccessToModel, updateLegend);
router.put("/revision/:revId/sequences/:sequenceId/legend", middlewares.hasUploadAccessToModel, updateLegend);

/**
 * @api {get} /:teamspace/:model/revision(/master/head/|/:revId)/sequences/:sequenceID/legend get the legend
 * @apiName getLegend
 * @apiGroup Sequences
 * @apiDescription Get the legend for this sequence
 *
 * @apiUse Sequences
 *
 * @apiExample {get} Example usage (/master/head)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1
 *
 * @apiExample {get} Example usage (/:revId)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	  "Building works": "#aabbcc"
 * 	  "Temporary works": "#ffffff66"
 * }
 *
 */
router.get("/revision/master/head/sequences/:sequenceId/legend", middlewares.issue.canView, getLegend);
router.get("/revision/:revId/sequences/:sequenceId/legend", middlewares.issue.canView, getLegend);

/**
 * @api {delete} /:teamspace/:model/revision(/master/head/|/:revId)/sequences/:sequenceID/legend Delete legend
 * @apiName deleteLegend
 * @apiGroup Sequences
 * @apiDescription Delete the legend associated to this sequence
 *
 * @apiUse Sequences
 *
 * @apiExample {delete} Example usage (/master/head)
 * DELETE /acme/00000000-0000-0000-0000-000000000000/revision/master/head/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1
 *
 * @apiExample {delete} Example usage (/:revId)
 * DELETE /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/sequences/00000000-0000-0000-0000-000000000002/legend HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {}
 */

router.delete("/revision/master/head/sequences/:sequenceId/legend", middlewares.hasUploadAccessToModel, deleteLegend);
router.delete("/revision/:revId/sequences/:sequenceId/legend", middlewares.hasUploadAccessToModel, deleteLegend);

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
 * 				"state":"00000000-0000-0000-0001-000000000002"
 * 			},
 * 			{
 * 				"dateTime":1244419200000,
 * 				"state":"00000000-0000-0000-0002-000000000002"
 *			}
 * 		],
 * 		"_id":"00000000-0000-0000-0000-000000000002"
 * 	}
 * ]
 */
router.get("/revision/master/head/sequences", middlewares.issue.canView, listSequences);
router.get("/revision/:revId/sequences", middlewares.issue.canView, listSequences);

/**
 * @api {get} /:teamspace/:model/sequences/:sequenceId/activities/:activityId Get activity
 * @apiName getSequenceActivityDetail
 * @apiGroup Sequences
 * @apiDescription Get sequence activity details.
 *
 * @apiUse Sequences
 *
 * @apiParam {String} sequenceId Sequence ID
 * @apiParam {String} activityId Activity ID
 *
 * @apiExample {get} Example usage
 * GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/00000000-0000-0002-0001-000000000001 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *  "id":"00000000-0000-0002-0001-000000000001",
 *  "name":"Construct tunnel",
 *  "sequenceId": "00000000-0000-0000-0001-000000000001",
 *  "parent": "00000130-2300-0002-0001-000567000001"
 *  "startDate": 1610000000000,
 *  "endDate": 1615483938124,
 *  "data":[
 *    {"key":"Name","value":"Construction"},
 *    {"key":"Status","value":"Planned"},
 *    {"key":"Is Compound Task","value":"Yes"},
 *    {"key":"Code","value":"ST00020"},
 *    {"key":"Planned Start","value":"15 Apr 2020 10:00:00"},
 *    {"key":"Type","value":"Work"},
 *    {"key":"Constraint","value":"No Constraint"},
 *    {"key":"Planned Finish","value":"11 Sep 2020 18:00:00"},
 *    {"key":"Percentage Complete","value":0},
 *    {"key":"Physical Volume Unity","value":"Unknown"},
 *    {"key":"Estimated Rate","value":0},
 *    {"key":"Planned Physical Volume","value":6.6},
 *    {"key":"Actual Physical Volume","value":0.9},
 *    {"key":"Remaining Physical Volume","value":5.7},
 *    {"key":"Budgeted Cost","value":30},
 *    {"key":"Actual Cost","value":9999.99}
 *  ]
 * }
 */
router.get("/sequences/:sequenceId/activities/:activityId", middlewares.hasReadAccessToModel, getSequenceActivityDetail);

/**
 * @api {get} /:teamspace/:model/sequences/:sequenceId/activities Get all activities
 * @apiName getSequenceActivities
 * @apiGroup Sequences
 * @apiDescription Get all sequence activities.
 *
 * @apiUse Sequences
 *
 * @apiParam {String} sequenceId Sequence unique ID
 *
 * @apiExample {get} Example usage
 * GET /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities HTTP/1.1
 * *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"activities":[
 * 		{
 * 			"id":"00000000-0000-0001-0001-000000000001",
 * 			"name":"Construction",
 * 			"startDate":1244246400000,
 * 			"endDate":1244246450000,
 * 			"subActivities":[
 * 				{
 * 					"id":"00000000-0001-0001-0001-000000000001",
 * 					"name":"Prepare site",
 * 					"startDate":1244246400000,
 * 					"endDate":1244246430000,
 * 					"subActivities":[
 * 						{
 * 							"id":"00000001-0001-0001-0001-000000000001",
 * 							"name":"Erect site hoarding",
 * 							"startDate":1244246400000,
 * 							"endDate":1244246410000
 * 						},
 * 						{
 * 							"id":"00000002-0001-0001-0001-000000000001",
 * 							"name":"Clear existing structures",
 * 							"startDate":1244246410000,
 * 							"endDate":1244246420000
 * 						},
 * 						{
 * 							"id":"00000003-0001-0001-0001-000000000001",
 * 							"name":"Smooth work surfaces",
 * 							"startDate":1244246420000,
 * 							"endDate":1244246430000
 * 						}
 * 					]
 * 				},
 * 				{
 * 					"id":"00000001-0002-0001-0001-000000000001",
 * 					"name":"Construct tunnel",
 * 					"startDate":1244246430000,
 * 					"endDate":1244246450000,
 * 					"subActivities":[
 * 						{
 * 							"id":"00000001-0002-0001-0001-000000000001",
 * 							"name":"Deploy instant tunnel",
 * 							"startDate":1244246430000,
 * 							"endDate":1244246440000
 * 						},
 * 						{
 * 							"id":"00000002-0002-0001-0001-000000000001",
 * 							"name":"Add road markings",
 * 							"startDate":1244246440000,
 * 							"endDate":1244246450000
 * 						}
 * 					]
 * 				}
 * 			]
 * 		}
 * 	]
 * }
 */
router.get("/sequences/:sequenceId/activities", middlewares.hasReadAccessToModel, getSequenceActivities);

/**
 * @api {post} /:teamspace/:model/sequences/:sequenceId/activities/ Create one or more activities
 * @apiName createSequenceActivities
 * @apiGroup Sequences
 * @apiDescription Creates a sequence activity tree.
 *
 * @apiUse Sequences
 * @apiParam (Request body) {Activity[]} activity An array of the activity tree that will be created
 * @apiParam (Request body) {Boolean} [overwrite] This flag indicates whether the request will replace the currently stored activities or just added at the end of the currently stored activities array. If not present it will be considered as false.
 *
 * @apiParam {String} sequenceId Sequence unique ID
 * @apiUse ActivityTreeObject
 * @apiUse KeyValueObject
 *
 * @apiExample {post} Example usage
 * POST /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities HTTP/1.1
 * {
 *   "overwrite": true,
 *   "activities": [
 *     {
 *       "name": "Clinc Construction",
 *       "startDate": 1603184400000,
 *       "endDate": 1613062800000,
 *       "data": [
 *         {
 *           "key": "Color",
 *           "value": "green"
 *         }
 *       ],
 *       "subActivities": [
 *         {
 *           "name": "Site Work & Logistics",
 *           "startDate": 1603184400000,
 *           "endDate": 1613062800000,
 *           "data": [
 *             {
 *               "key": "Heigh",
 *               "value": 12
 *             }
 *           ],
 *           "subActivities": [
 *             {
 *               "name": "Site Office Installation",
 *               "startDate": 1603184400000,
 *               "endDate": 1603213200000,
 *               "data": [
 *                 {
 *                   "key": "Size",
 *                   "value": "Big"
 *                 }
 *               ]
 *             },
 *             {
 *               "name": "Excavation",
 *               "startDate": 1603270800000,
 *               "endDate": 1603299600000
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 **/
router.post("/sequences/:sequenceId/activities", middlewares.hasUploadAccessToModel, createActivities);

/**
 * @api {put} /:teamspace/:model/sequences/:sequenceId/activities/:activityId Edit an activity
 * @apiName editSequenceActivity
 * @apiGroup Sequences
 * @apiDescription Edits a sequence activity.
 *
 * @apiUse Sequences
 *
 * @apiParam {String} sequenceId Sequence unique ID
 * @apiParam {String} activityId The activity unique ID
 *
 * @apiUse ActivityBodyObjectOptional
 * @apiUse KeyValueObject
 *
 * @apiExample {put} Example usage
 * PUT /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/fe94be44-5cd8-4aaf-b020-afc1456680d3 HTTP/1.1
 * {
 *    "name":"Renamed activity"
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 *
 * */
router.put("/sequences/:sequenceId/activities/:activityId",middlewares.hasUploadAccessToModel, editActivity);

/**
 * @api {delete} /:teamspace/:model/sequences/:sequenceId/activities/:activityId Edit an activity
 * @apiName deleteSequenceActivity
 * @apiGroup Sequences
 * @apiDescription Delete a sequence activity.
 *
 * @apiUse Sequences
 *
 * @apiParam {String} sequenceId Sequence unique ID
 * @apiParam {String} activityId The activity unique ID
 *
 * @apiExample {delete} Example usage
 * DELETE /acme/00000000-0000-0000-0000-000000000000/sequences/00000000-0000-0000-0001-000000000001/activities/fe94be44-5cd8-4aaf-b020-afc1456680d3 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 *
 * */
router.delete("/sequences/:sequenceId/activities/:activityId", middlewares.hasUploadAccessToModel, removeActivity);

function getSequenceState(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, stateId } = req.params;

	Sequence.getSequenceState(account, model, stateId).then(state => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, state);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getLegend(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, sequenceId } = req.params;

	Sequence.getLegend(account, model, sequenceId).then(({ legend }) => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, legend);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteLegend(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, sequenceId } = req.params;

	Sequence.deleteLegend(account, model, sequenceId).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateLegend(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, sequenceId } = req.params;

	Sequence.updateLegend(account, model, sequenceId, req.body).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function updateSequence(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, sequenceId } = req.params;

	Sequence.updateSequence(account, model, sequenceId, req.body).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function listSequences(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, revId } = req.params;
	const branch = revId ? null : "master";

	Sequence.getList(account, model, branch, revId, true).then(sequences => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, sequences);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getSequenceActivityDetail(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, activityId, sequenceId } = req.params;

	SequenceActivities.getSequenceActivityDetail(account, model, sequenceId, activityId).then(activity => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, activity);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getSequenceActivities(req, res, next) {
	const { account, model, sequenceId } = req.params;
	const place = utils.APIInfo(req);

	SequenceActivities.get(account, model, sequenceId).then(activites => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, activites);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function createActivities(req, res, next) {
	const { account, model, sequenceId } = req.params;
	const place = utils.APIInfo(req);

	SequenceActivities.createActivities(account, model, sequenceId, req.body.activities, req.body.overwrite).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function editActivity(req, res, next) {
	const { account, model, sequenceId, activityId } = req.params;
	const place = utils.APIInfo(req);

	SequenceActivities.edit(account, model, sequenceId, activityId, req.body).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function removeActivity(req, res, next) {
	const { account, model, sequenceId, activityId } = req.params;
	const place = utils.APIInfo(req);

	SequenceActivities.remove(account, model, sequenceId, activityId).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
