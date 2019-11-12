/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
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
const router = express.Router({ mergeParams: true });
const middlewares = require("../middlewares/middlewares");
const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Group = require("../models/group");
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
router.get("/revision/master/head/groups", middlewares.issue.canView, listGroups);

router.get("/revision/:rid/groups", middlewares.issue.canView, listGroups);

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
 * 			"field":"Area",
 * 			"operator":"GT",
 * 			"values":[5]
 * 		},
 * 		{
 * 			"field":"IFC Type",
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
router.get("/revision/master/head/groups/:uid", middlewares.issue.canView, findGroup);

router.get("/revision/:rid/groups/:uid", middlewares.issue.canView, findGroup);

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
router.put("/revision/master/head/groups/:uid", middlewares.issue.canCreate, updateGroup);

router.put("/revision/:rid/groups/:uid", middlewares.issue.canCreate, updateGroup);

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
 * 			"field":"Area",
 * 			"operator":"GT",
 * 			"values":[5]
 * 		},
 * 		{
 * 			"field":"IFC Type",
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
 * 			"field":"Area",
 * 			"operator":"GT",
 * 			"values":[5]
 * 		},
 * 		{
 * 			"field":"IFC Type",
 * 			"operator":"IS",
 * 			"values":[
 *				"IfcWall",
 *				"IfcDoor"
 * 			]
 * 		}
 * 	]
 * }
 */
router.post("/revision/master/head/groups/", middlewares.issue.canCreate, createGroup);

router.post("/revision/:rid/groups/", middlewares.issue.canCreate, createGroup);

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
router.delete("/groups/", middlewares.issue.canCreate, deleteGroups);

const getDbColOptions = function (req) {
	return { account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger };
};

function listGroups(req, res, next) {

	const dbCol = getDbColOptions(req);
	const place = utils.APIInfo(req);

	const showIfcGuids = (req.query.ifcguids) ? JSON.parse(req.query.ifcguids) : false;

	const ids = req.query.ids ? req.query.ids.split(",") : null;
	let groupList;

	if (req.params.rid) {
		groupList = Group.listGroups(dbCol, req.query, null, req.params.rid, ids, showIfcGuids);
	} else {
		groupList = Group.listGroups(dbCol, req.query, "master", null, ids, showIfcGuids);
	}

	groupList.then(groups => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, groups);
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function findGroup(req, res, next) {

	const dbCol = getDbColOptions(req);
	const place = utils.APIInfo(req);
	const showIfcGuids = (req.query.ifcguids) ? JSON.parse(req.query.ifcguids) : false;

	let groupItem;
	if (req.params.rid) {
		groupItem = Group.findByUIDSerialised(dbCol, req.params.uid, null, req.params.rid, showIfcGuids);
	} else {
		groupItem = Group.findByUIDSerialised(dbCol, req.params.uid, "master", null, showIfcGuids);
	}

	groupItem.then(group => {
		if (!group) {
			return Promise.reject({ resCode: responseCodes.GROUP_NOT_FOUND });
		} else {
			return Promise.resolve(group);
		}
	}).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group);
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function createGroup(req, res, next) {
	const place = utils.APIInfo(req);
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const rid = req.params.rid ? req.params.rid : null;
	const branch = rid ? null : "master";
	const create = Group.createGroup(getDbColOptions(req), sessionId, req.body, req.session.user.username, branch, rid);

	create.then(group => {

		responseCodes.respond(place, req, res, next, responseCodes.OK, group);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
	});
}

function deleteGroups(req, res, next) {
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const place = utils.APIInfo(req);

	if (req.query.ids) {
		const ids = req.query.ids.split(",");

		Group.deleteGroups(getDbColOptions(req), sessionId, ids).then(() => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "success" });
		}).catch(err => {
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
		});
	} else {
		responseCodes.respond(place, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

function updateGroup(req, res, next) {
	const dbCol = getDbColOptions(req);
	const place = utils.APIInfo(req);
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	const rid = req.params.rid ? req.params.rid : null;
	const branch = rid ? null : "master";
	const groupItem = Group.findByUID(dbCol, req.params.uid, branch, rid, false);
	groupItem.then(group => {
		if (!group) {
			return Promise.reject({ resCode: responseCodes.GROUP_NOT_FOUND });
		} else {
			return group.updateGroup(dbCol, sessionId, req.body, req.session.user.username, branch, rid);
		}

	}).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group);
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
	});
}

module.exports = router;
