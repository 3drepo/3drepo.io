/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
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
const router = express.Router({ mergeParams: true });
const Middleware = require("../middlewares/middlewares");
const responseCodes = require("../response_codes.js");
const Group = require("../models/group");
const C = require("../constants");
const {v5Path} = require("../../interop");
const GroupsV5 = require(`${v5Path}/processors/teamspaces/projects/models/commons/groups`);
const { serialiseGroupArray} = require(`${v5Path}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/groups`);
const { validateGroupsExportData, validateGroupsImportData } = require(`${v5Path}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/groups`);
const utils = require("../utils");
const systemLogger = require("../logger.js").systemLogger;

/**
 * @apiDefine Groups Groups
 * A grouping of model elements. Groups can either comprise of a set of manually
 * defined elements or rules (smart group) that define the criteria for its
 * elements.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

/**
 * @apiDefine GroupsBodyGroupObject
 *
 * @apiParam (Request body) {String} author Username of group creator
 * @apiParam (Request body) {Number[]} color RGB colour values
 * @apiParam (Request body) {String} description Group description
 * @apiParam (Request body) {String} name Group name
 * @apiParam (Request body) {Object[]} objects List of objects in group
 * @apiParam (Request body) {Object[]} [rules] List of rules in group
 * @apiParam (Request body) {Number[]} [transformation] Flat 16 element array representation of 4x4 transformation matrix
 */

/**
 * @apiDefine GroupsSuccessGroupObject
 *
 * @apiSuccess (200) {String} author Username of group creator
 * @apiSuccess (200) {Number[]} color RGB colour values
 * @apiSuccess (200) {Number} createdAt Group creation timestamp in milliseconds
 * @apiSuccess (200) {String} description Group description
 * @apiSuccess (200) {String} name Group name
 * @apiSuccess (200) {Object[]} objects List of objects in group
 * @apiSuccess (200) {Object[]} rules List of rules in group
 * @apiSuccess (200) {Number[]} transformation Flat 16 element array representation of 4x4 transformation matrix
 * @apiSuccess (200) {Number} updatedAt Group update timestamp in milliseconds
 * @apiSuccess (200) {Number} updatedBy Username of last user to amend group
 * @apiSuccess (200) {String} _id Unique ID of group
 */

/**
 * @api {get} /:teamspace/:model/revision(/master/head/|/:revId)/groups?[query] List all groups
 * @apiName listGroups
 * @apiGroup Groups
 * @apiDescription List all groups associated with the model.
 *
 * @apiUse Groups
 *
 * @apiParam {String} [revId] Revision unique ID
 * @apiParam (Query) {Boolean} [ifcguids] Flag that returns IFC GUIDs for group elements
 * @apiParam (Query) {Boolean} [noIssues] Flag that hides groups for issues
 * @apiParam (Query) {Boolean} [noRisks] Flag that hides groups for risks
 * @apiParam (Query) {Boolean} [noViews] Flag that hides groups for risks
 * @apiParam (Query) {Number} [updatedSince] Only return issues that has been updated since this value (in epoch value)
 * @apiSuccess (200) {Object[]} objects List of group objects
 *
 * @apiExample {get} Example usage (/master/head)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
 *
 * @apiExample {get} Example usage (/:revId)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups HTTP/1.1
 *
 * @apiExample {get} Example usage (no issue/risk groups)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups?noIssues=true&noRisks=true HTTP/1.1
 *
 * @apiExample {get} Example usage (with IFC GUIDs)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups?ifcguids=true HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"author":"alice",
 * 		"color":[255,0,0],
 * 		"createdAt":1520592300000,
 * 		"description":"This is the description text for the first group.",
 * 		"name":"Group 1",
 * 		"objects":[
 * 			{
 * 				"account": "acme",
 * 				"model": "00000000-0000-0000-0000-000000000000",
 * 				"ifc_guids": [],
 * 				"shared_ids": [
 * 					"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 * 					"db18ef69-6d6e-49a0-846e-907346abb39d",
 * 					"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 * 					"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 * 					"3f881fa8-2b7b-443e-920f-396c1c85e903"
 * 				]
 * 			}
 * 		],
 * 		"updatedAt":1552128300000,
 * 		"updatedBy":"alice",
 * 		"_id":"00000000-0000-0000-0000-000000000002"
 * 	},
 * 	{
 * 		"author":"alice",
 * 		"color":[0,255,0],
 * 		"createdAt":1520592300000,
 * 		"description":"(No description)",
 * 		"name":"Group 2",
 * 		"objects":[
 * 			{
 * 				"account": "acme",
 * 				"model": "00000000-0000-0000-0000-000000000000",
 * 				"ifc_guids": [],
 * 				"shared_ids": [
 * 					"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 * 					"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d"
 * 				]
 * 			}
 * 		],
 * 		"rules":[],
 * 		"updatedAt":1552128300000,
 * 		"updatedBy":"alice",
 * 		"_id":"00000000-0000-0000-0000-000000000003"
 * 	}
 * ]
 */
router.get("/revision/master/head/groups", Middleware.hasViewIssueAccessToModel, listGroups);

router.get("/revision/:rid/groups", Middleware.hasViewIssueAccessToModel, listGroups);

/**
 * @api {get} /:teamspace/:model/revision(/master/head|/:revId)/groups/:groupId?[query] Find group
 * @apiName findGroup
 * @apiGroup Groups
 * @apiDescription Find a group.
 *
 * @apiUse Groups
 * @apiUse GroupsSuccessGroupObject
 *
 * @apiParam {String} [revId] Revision ID
 * @apiParam {String} groupId Group ID
 * @apiParam (Query) {Boolean} [ifcguids] Flag that returns IFC GUIDs for group elements
 *
 * @apiExample {get} Example usage (/master/head)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiExample {get} Example usage (/:revId)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiExample {get} Example usage (with IFC GUIDs)
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000004?ifcguids=true HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"author":"alice",
 * 	"color":[255,0,0],
 * 	"createdAt":1520592300000,
 * 	"description":"This is the description text for the first group.",
 * 	"name":"Group 1",
 * 	"objects":[
 * 		{
 * 			"account": "acme",
 * 			"model": "00000000-0000-0000-0000-000000000000",
 * 			"ifc_guids": [],
 * 			"shared_ids": [
 * 				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 * 				"db18ef69-6d6e-49a0-846e-907346abb39d",
 * 				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 * 				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 * 				"3f881fa8-2b7b-443e-920f-396c1c85e903"
 * 			]
 * 		}
 * 	],
 * 	"updatedAt":1552128300000,
 * 	"updatedBy":"alice",
 * 	"_id":"00000000-0000-0000-0000-000000000002"
 * }
 *
 * @apiSuccessExample {json} Success-Response (with IFC GUIDs)
 * HTTP/1.1 200 OK
 * {
 * 	"author":"alice",
 * 	"color":[255,0,0],
 * 	"createdAt":1520592300000,
 * 	"description":"This is a smart group of objects with type IfcWall or IfcDoor with area > 5.",
 * 	"name":"Smart 1",
 * 	"objects":[
 * 		{
 * 			"account": "acme",
 * 			"model": "00000000-0000-0000-0000-000000000000",
 * 			"ifc_guids": [
 * 				"2cx1GdQ9fAgRIWgfhfBb84",
 * 				"13NEEUJ8DEE8fEH0aHgm2z",
 * 				"3OLNF2_DL6hfPgh8Bw7fI7"
 * 			],
 * 			"shared_ids": [
 * 				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 * 				"db18ef69-6d6e-49a0-846e-907346abb39d",
 * 				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 * 				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 * 				"3f881fa8-2b7b-443e-920f-396c1c85e903"
 * 			]
 * 		}
 * 	],
 * 	"rules":[
 * 		{
 * 			"field": {
 *				"operator": "IS",
 *				"values": ["Area"]
 * 			},
 * 			"operator":"GT",
 * 			"values":[5]
 * 		},
 * 		{
 * 			"field": {
 *				"operator": "IS",
 *				"values": ["IFC Type"]
 * 			},
 * 			"operator":"IS",
 * 			"values":[
 *				"IfcWall",
 *				"IfcDoor"
 * 			]
 * 		}
 * 	],
 * 	"updatedAt":1552128300000,
 * 	"updatedBy":"alice",
 * 	"_id":"00000000-0000-0000-0000-000000000004"
 * }
 */
router.get("/revision/master/head/groups/:uid", Middleware.hasViewIssueAccessToModel, findGroup);

router.get("/revision/:rid/groups/:uid", Middleware.hasViewIssueAccessToModel, findGroup);

/**
 * @api {put} /:teamspace/:model/revision(/master/head|/:revId)/groups/:groupId/ Update group
 * @apiName updateGroup
 * @apiGroup Groups
 * @apiDescription Update a group.
 *
 * @apiUse Groups
 * @apiUse GroupsBodyGroupObject
 * @apiUse GroupsSuccessGroupObject
 *
 * @apiParam {String} [revId] Revision ID
 * @apiParam {String} groupId Group ID
 *
 * @apiExample {put} Example usage (/master/head)
 * PUT /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiExample {put} Example usage (/:revId)
 * PUT /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"author":"alice",
 * 	"color":[255,0,0],
 * 	"createdAt":1520592300000,
 * 	"description":"Updated description text.",
 * 	"name":"Group 1",
 * 	"objects":[
 * 		{
 * 			"account": "acme",
 * 			"model": "00000000-0000-0000-0000-000000000000",
 * 			"ifc_guids": [],
 * 			"shared_ids": [
 * 				"db18ef69-6d6e-49a0-846e-907346abb39d",
 * 				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 * 				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 * 				"3f881fa8-2b7b-443e-920f-396c1c85e903"
 * 			]
 * 		}
 * 	],
 * 	"updatedAt":1552128300000,
 * 	"updatedBy":"alice",
 * 	"_id":"00000000-0000-0000-0000-000000000002"
 * }
 */
router.put("/revision/master/head/groups/:uid", Middleware.hasCommenterAccessToModel, updateGroup);

router.put("/revision/:rid/groups/:uid", Middleware.hasCommenterAccessToModel, updateGroup);

/**
 * @api {post} /:teamspace/:model/revision(/master/head|/:revId)/groups Create group
 * @apiName createGroup
 * @apiGroup Groups
 * @apiDescription Add a group to the model.
 *
 * @apiUse Groups
 * @apiUse GroupsBodyGroupObject
 * @apiUse GroupsSuccessGroupObject
 *
 * @apiParam {String} [revId] Revision ID
 *
 * @apiExample {post} Example usage (/master/head)
 * POST /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
 * {
 * 	"name":"Group 1",
 * 	"description":"This is the description text for the first group.",
 * 	"author":"alice",
 * 	"color":[255,0,0],
 * 	"objects":[
 * 		{
 * 			"account":"acme",
 * 			"model":"00000000-0000-0000-0000-000000000000",
 * 			"shared_ids":[
 * 				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 * 				"db18ef69-6d6e-49a0-846e-907346abb39d",
 * 				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 * 				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 * 				"3f881fa8-2b7b-443e-920f-396c1c85e903"
 * 			]
 * 		}
 * 	]
 * }
 *
 * @apiExample {post} Example usage (/:revId)
 * POST /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups HTTP/1.1
 * {
 * 	"name":"Group 1",
 * 	"description":"This is the description text for the first group.",
 * 	"author":"alice",
 * 	"color":[255,0,0],
 * 	"objects":[
 * 		{
 * 			"account":"acme",
 * 			"model":"00000000-0000-0000-0000-000000000000",
 * 			"shared_ids":[
 * 				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 * 				"db18ef69-6d6e-49a0-846e-907346abb39d",
 * 				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 * 				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 * 				"3f881fa8-2b7b-443e-920f-396c1c85e903"
 * 			]
 * 		}
 * 	]
 * }
 *
 * @apiExample {post} Example usage (smart group)
 * POST /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
 * {
 * 	"name":"Smart 1",
 * 	"description":"This is a smart group of objects with type IfcWall or IfcDoor with area > 5.",
 * 	"author":"alice",
 * 	"color":[255,0,0],
 * 	"objects":[],
 * 	"rules":[
 * 		{
 *			"field": {
 *				"operator": "IS",
 *				"values": ["Area"]
 * 			},
 * 			"operator":"GT",
 * 			"values":[5]
 * 		},
 * 		{
 *			"field": {
 *				"operator": "IS",
 *				"values": ["IFC Type"]
 * 			},
 * 			"operator":"IS",
 * 			"values":[
 *				"IfcWall",
 *				"IfcDoor"
 * 			]
 * 		}
 * 	]
 * }
 *
 * @apiSuccessExample {json} Success-Response (normal group)
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000002",
 * 	"name":"Group 1",
 * 	"description":"This is the description text for the first group.",
 * 	"author":"alice",
 * 	"createdAt":"2018-03-09T10:45:00.000Z",
 * 	"color":[255,0,0],
 * 	"objects":[
 * 		{
 * 			"account":"acme",
 * 			"model":"00000000-0000-0000-0000-000000000000",
 * 			"ifc_guids":[],
 * 			"shared_ids":[
 * 				"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 * 				"db18ef69-6d6e-49a0-846e-907346abb39d",
 * 				"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 * 				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 * 				"3f881fa8-2b7b-443e-920f-396c1c85e903"
 * 			]
 * 		}
 * 	],
 * 	"rules":[]
 * }
 *
 * @apiSuccessExample {json} Success-Response (smart group)
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000004",
 * 	"name":"Smart 1",
 * 	"description":"This is a smart group of objects with type IfcWall or IfcDoor with area > 5.",
 * 	"author":"alice",
 * 	"createdAt":"2018-03-09T10:45:00.000Z",
 * 	"color":[255,0,0],
 * 	"objects":[
 * 		{
 * 			"account":"acme",
 * 			"model":"00000000-0000-0000-0000-000000000000",
 * 			"ifc_guids":[],
 * 			"shared_ids":[
 * 				"db18ef69-6d6e-49a0-846e-907346abb39d",
 * 				"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 * 				"3f881fa8-2b7b-443e-920f-396c1c85e903"
 * 			]
 * 		}
 * 	],
 * 	"rules":[
 * 		{
 *			"field": {
 *				"operator": "IS",
 *				"values": ["Area"]
 * 			},
 * 			"operator":"GT",
 * 			"values":[5]
 * 		},
 * 		{
 *			"field": {
 *				"operator": "IS",
 *				"values": ["IFC Type"]
 * 			},
 * 			"operator":"IS",
 * 			"values":[
 *				"IfcWall",
 *				"IfcDoor"
 * 			]
 * 		}
 * 	]
 * }
 */
router.post("/revision/master/head/groups/", Middleware.hasCommenterAccessToModel, createGroup);

router.post("/revision/:rid/groups/", Middleware.hasCommenterAccessToModel, createGroup);

/**
 * @api {delete} /:teamspace/:model/groups?ids=[GROUPS] Delete groups
 * @apiName deleteGroups
 * @apiGroup Groups
 * @apiDescription Delete groups.
 *
 * @apiUse Groups
 *
 * @apiParam (Query) {String} GROUPS Comma separated list of group IDs
 * @apiSuccess (200) {String} status Group deletion result (success|ERROR CODE)
 *
 * @apiExample {delete} Example usage
 * DELETE /acme/00000000-0000-0000-0000-000000000000/groups?ids=00000000-0000-0000-0000-000000000002,00000000-0000-0000-0000-000000000003 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"status":"success"
 * }
 */
router.delete("/groups/", Middleware.hasCommenterAccessToModel, deleteGroups);

/**
 * @api {post} /:teamspace/:model/groups/export Export Groups
 * @apiName exportGroups
 * @apiGroup Groups
 * @apiDescription This is a back-ported endpoint from V5. For details please see V5 documentation /docs/#/Federations/ExportFederationGroups
 */
router.post("/groups/export", Middleware.hasViewIssueAccessToModel, validateGroupsExportData, exportGroups, serialiseGroupArray);

/**
 * @api {post} /:teamspace/:model/groups/import Import Groups
 * @apiName importGroups
 * @apiGroup Groups
 * @apiDescription This is a back-ported endpoint from V5. For details please see V5 documentation /docs/#/Federations/ImportFederationGroups
 */
router.post("/groups/import", Middleware.hasViewIssueAccessToModel, validateGroupsImportData, importGroups);

function exportGroups(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model } = req.params;
	const { groups } = req.body;

	GroupsV5.getGroups(account, model, groups).then((outputData) => {
		req.outputData = outputData;
		next();
	}).catch((err) => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function importGroups(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model } = req.params;
	const { groups } = req.body;

	GroupsV5.importGroups(account, model, groups).then(()=> {
		responseCodes.respond(place, req, res, next, responseCodes.OK);
	}).catch((err) => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function listGroups(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, rid } = req.params;
	const branch = rid ? null : "master";

	const showIfcGuids = (req.query.ifcguids) ? JSON.parse(req.query.ifcguids) : false;
	const ids = req.query.ids ? req.query.ids.split(",") : null;

	let updatedSince = req.query.updatedSince;

	if (updatedSince) {
		updatedSince = parseInt(updatedSince, 10);
		if (isNaN(updatedSince)) {
			return responseCodes.respond(place, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		}
	}

	Group.getList(account, model, branch, rid, ids, req.query, showIfcGuids).then(groups => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, groups);
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function findGroup(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, rid, uid } = req.params;
	const branch = rid ? null : "master";
	const showIfcGuids = (req.query.ifcguids) ? JSON.parse(req.query.ifcguids) : false;

	Group.findByUID(account, model, branch, rid, uid, showIfcGuids, false).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group);
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function createGroup(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model } = req.params;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const rid = req.params.rid ? req.params.rid : null;
	const branch = rid ? null : "master";

	Group.create(account, model, branch, rid, sessionId, req.session.user.username, req.body).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
	});
}

function deleteGroups(req, res, next) {
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const place = utils.APIInfo(req);
	const { account, model } = req.params;

	if (req.query.ids) {
		const ids = req.query.ids.split(",");

		Group.deleteGroups(account, model, sessionId, ids).then(() => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "success" });
		}).catch(err => {
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
		});
	} else {
		responseCodes.respond(place, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

function updateGroup(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, uid } = req.params;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	const rid = req.params.rid ? req.params.rid : null;
	const branch = rid ? null : "master";

	Group.update(account, model, branch, rid, sessionId, req.session.user.username, uid, req.body).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group);
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
	});
}

module.exports = router;
