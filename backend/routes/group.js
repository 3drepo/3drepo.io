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
 * RUOP ROUP GROUP GORUP <strong>RGPORU</strong>
 */

/**
 * @apiDeprecated use {get} /:teamspace/:model/revision/master/head/groups instead
 * @api {get} /:teamspace/:model/groups/revision/master/head List all groups
 * @apiName listGroupsDep
 * @apiGroup Groups
 * @apiDescription List all groups associated with the model.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
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
 *
 * @apiExample {put} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/groups/revision/master/head HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"author":"alice",
 * 		"color":[255,0,0],
 * 		"createdAt":1552128300000,
 * 		"description":"",
 * 		"name":"Group 1",
 * 		"objects":[],
 * 		"updatedAt":1552128300000,
 * 		"updatedBy":"alice",
 * 		"_id":"00000000-0000-0000-0000-000000000001"
 * 	},
 * 	{
 * 		"author":"alice",
 * 		"color":[0,255,0],
 * 		"createdAt":1552128300000,
 * 		"description":"",
 * 		"name":"Group 2",
 * 		"objects":[],
 * 		"rules":[],
 * 		"updatedAt":1552128300000,
 * 		"updatedBy":"alice",
 * 		"_id":"00000000-0000-0000-0000-000000000002"
 * 	}
 * ]
 */
router.get("/groups/revision/master/head/", middlewares.issue.canView, listGroups);

/**
 * @api {get} /:teamspace/:model/revision/master/head/groups List all groups
 * @apiName listGroups
 * @apiGroup Groups
 * @apiDescription List all groups associated with the model.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
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
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"author":"alice",
 * 		"color":[255,0,0],
 * 		"createdAt":1552128300000,
 * 		"description":"",
 * 		"name":"Group 1",
 * 		"objects":[],
 * 		"updatedAt":1552128300000,
 * 		"updatedBy":"alice",
 * 		"_id":"00000000-0000-0000-0000-000000000001"
 * 	},
 * 	{
 * 		"author":"alice",
 * 		"color":[0,255,0],
 * 		"createdAt":1552128300000,
 * 		"description":"",
 * 		"name":"Group 2",
 * 		"objects":[],
 * 		"rules":[],
 * 		"updatedAt":1552128300000,
 * 		"updatedBy":"alice",
 * 		"_id":"00000000-0000-0000-0000-000000000002"
 * 	}
 * ]
 */
router.get("/revision/master/head/groups", middlewares.issue.canView, listGroups);

/**
 * @apiDeprecated Use /:teamspace/:model/revision/:rid/groups/ instead
 * @apiName listGroupsByRevisionDep
 * @apiGroup Groups
 * @apiDescription List all groups associated with a model and revision.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID
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
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"author":"alice",
 * 		"color":[255,0,0],
 * 		"createdAt":1552128300000,
 * 		"description":"",
 * 		"name":"Group 1",
 * 		"objects":[],
 * 		"updatedAt":1552128300000,
 * 		"updatedBy":"alice",
 * 		"_id":"00000000-0000-0000-0000-000000000001"
 * 	}
 * ]
 */
router.get("/groups/revision/:rid/", middlewares.issue.canView, listGroups);

/**
 * @api {get} /:teamspace/:model/revision/:rid/groups/ List model groups by revision
 * @apiName listGroupsByRevision
 * @apiGroup Groups
 * @apiDescription List all groups associated with a model and revision.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID
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
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"author":"alice",
 * 		"color":[255,0,0],
 * 		"createdAt":1552128300000,
 * 		"description":"",
 * 		"name":"Group 1",
 * 		"objects":[],
 * 		"updatedAt":1552128300000,
 * 		"updatedBy":"alice",
 * 		"_id":"00000000-0000-0000-0000-000000000001"
 * 	}
 * ]
 */

router.get("/revision/:rid/groups", middlewares.issue.canView, listGroups);

/**
 * @apiDeprecated Use /:teamspace/:model/groups/revision/master/head/groups/:uid instead
 * @api {get} /:teamspace/:model/groups/revision/master/head/:uid Find group by ID
 * @apiName findGroupDep
 * @apiGroup Groups
 * @apiDescription Find group by ID.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Group unique ID.
 * @apiParam {String} ifcguids Query string ifcguids returns IFC GUIDs if true where available.
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
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/groups/revision/master/head/00000000-0000-0000-0000-000000000001 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"author":"alice",
 * 	"color":[255,0,0],
 * 	"createdAt":1552128300000,
 * 	"description":"",
 * 	"name":"Group 1",
 * 	"objects":[],
 * 	"updatedAt":1552128300000,
 * 	"updatedBy":"alice",
 * 	"_id":"00000000-0000-0000-0000-000000000001"
 * }
 */
router.get("/groups/revision/master/head/:uid", middlewares.issue.canView, findGroup);

/**
 * @api {get} /:teamspace/:model/revision/master/head/groups/:uid Find group by ID
 * @apiName findGroup
 * @apiGroup Groups
 * @apiDescription Find group by ID.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} uid Group ID
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
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000001 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"author":"alice",
 * 	"color":[255,0,0],
 * 	"createdAt":1552128300000,
 * 	"description":"",
 * 	"name":"Group 1",
 * 	"objects":[],
 * 	"updatedAt":1552128300000,
 * 	"updatedBy":"alice",
 * 	"_id":"00000000-0000-0000-0000-000000000001"
 * }
 */
router.get("/revision/master/head/groups/:uid", middlewares.issue.canView, findGroup);

/**
 * @apiDeprecated use {get} /:teamspace/:model/revision/:rid/groups/:uid instead
 * @api {get} /:teamspace/:model/groups/revision/:rid/:uid Find group
 * @apiName findGroupByRevisionDep
 * @apiGroup Groups
 * @apiDescription Find group.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID
 * @apiParam {String} uid Group ID
 * @apiSuccess (200) {Object[]} Group objects
 * @apiError GROUP_NOT_FOUND Group not found
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/groups/revision/00000000-0000-0000-0000-000000000001/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"_id": "00000000-0000-0000-0000-000000000002",
 * 		"name": "Group 1",
 * 		"description": "This is test group for revision 2",
 * 		"author": "username",
 * 		"updatedBy": "username",
 * 		"updatedAt": 1546553617888,
 * 		"createdAt": 1546537564888,
 * 		"color": [
 * 			121,
 * 			130,
 * 			211
 * 		],
 * 		"objects": [
 * 			{
 * 				"account": "account_username",
 * 				"model": "6e7d81fb-85c8-4b09-9ad6-6ba099261099",
 * 				"ifc_guids": [],
 * 				"shared_ids": [
 * 					"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 * 					"db18ef69-6d6e-49a0-846e-907346abb39d",
 * 					"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 * 					"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 * 					"3f881fa8-2b7b-443e-920f-396c1c85e903"
 * 				]
 * 			}
 * 		]
 * 	}
 * ]
 */
router.get("/groups/revision/:rid/:uid", middlewares.issue.canView, findGroup);

/**
 * @api {get} /:teamspace/:model/revision/:rid/groups/:uid/ Find group
 * @apiName findGroupByRevision
 * @apiGroup Groups
 * @apiDescription Find a group.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID
 * @apiParam {String} uid Group ID
 * @apiSuccess (200) {Object[]} Group objects
 * @apiError GROUP_NOT_FOUND Group Not Found
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"_id": "00000000-0000-0000-0000-000000000002",
 * 		"name": "Group 1",
 * 		"description": "This is test group for revision 2",
 * 		"author": "username",
 * 		"updatedBy": "username",
 * 		"updatedAt": 1546553617888,
 * 		"createdAt": 1546537564888,
 * 		"color": [
 * 			121,
 * 			130,
 * 			211
 * 		],
 * 		"objects": [
 * 			{
 * 				"account": "account_username",
 * 				"model": "6e7d81fb-85c8-4b09-9ad6-6ba099261099",
 * 				"ifc_guids": [],
 * 				"shared_ids": [
 * 					"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 * 					"db18ef69-6d6e-49a0-846e-907346abb39d",
 * 					"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 * 					"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 * 					"3f881fa8-2b7b-443e-920f-396c1c85e903"
 * 				]
 * 			}
 * 		]
 * 	}
 * ]
 */
router.get("/revision/:rid/groups/:uid", middlewares.issue.canView, findGroup);

/**
 * @apiDeprecated Use {put} /:teamspace/:model/revision/:rid/groups/:uid/ instead
 * @api {put} /:teamspace/:model/groups/:uid/ Update group
 * @apiName updateGroupDep
 * @apiGroup Groups
 * @apiDescription Update a group.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID
 * @apiParam {String} uid Group ID
 * @apiSuccess (200) {Object} Group Object
 * @apiError GROUP_NOT_FOUND Group Not Found
 *
 * @apiExample {get} Example usage:
 * PUT /acme/00000000-0000-0000-0000-000000000000/groups/revision/00000000-0000-0000-0000-000000000001/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *	 "_id":"00000000-0000-0000-0000-000000000002"
 * }
 */
router.put("/groups/:uid", middlewares.issue.canCreate, updateGroup);

/**
 * @api {put} /:teamspace/:model/revision/:rid/groups/:uid/
 * @apiName updateGroup
 * @apiGroup Groups
 * @apiDescription Update a group.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID
 * @apiParam {String} uid Group ID
 * @apiSuccess (200) {Object} Group Object
 * @apiError GROUP_NOT_FOUND Group Not Found
 *
 * @apiExample {get} Example usage:
 * PUT /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *	 "_id":"00000000-0000-0000-0000-000000000002"
 * }
 */
router.put("/revision/master/head/groups/:uid", middlewares.issue.canCreate, updateGroup);

/**
 * @api {put} /:teamspace/:model/revision/:rid/groups/:uid/ Update group
 * @apiName updateGroup
 * @apiGroup Groups
 * @apiDescription Update a group.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID
 * @apiParam {String} uid Group ID
 * @apiSuccess (200) {Object} Group Object
 * @apiError GROUP_NOT_FOUND Group Not Found
 *
 * @apiExample {get} Example usage:
 * PUT /acme/00000000-0000-0000-0000-000000000000/revision/00000000-0000-0000-0000-000000000001/groups/00000000-0000-0000-0000-000000000002 HTTP/1.1
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *	 "_id":"00000000-0000-0000-0000-000000000002"
 * }
 */
router.put("/revision/:rid/groups/:uid", middlewares.issue.canCreate, updateGroup);

/**
 * @apiDeprecated use {post} /:teamspace/:model/revision/:rid/groups instead
 * @api {post} /:teamspace/:model/groups Create a group
 * @apiName createGroup
 * @apiGroup Groups
 * @apiDescription Add a group to the model.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID
 * @apiSuccess (200) {Object} Group Created
 *
 * @apiExample {get} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/groups HTTP/1.1
 * {
 * 	"name":"Group 1","description":"",
 * 	"author":"username",
 * 	"createdAt":"2019-01-03T23:03:37.411Z",
 * 	"color":[44,50,125],
 * 	"objects":[]
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"efa67a80-0fab-11e9-a0ed-edada3f501fd",
 * 	"name":"Group 1","description":"",
 * 	"author":"username",
 * 	"createdAt":"2019-01-03T23:03:37.411Z",
 * 	"color":[44,50,125],
 * 	"objects":[]
 * }
 */
router.post("/groups/", middlewares.issue.canCreate, createGroup);

/**
 * @api {post} /:teamspace/:model/revision/master/head/groups Create a group
 * @apiName createGroupAtHead
 * @apiGroup Groups
 * @apiDescription Add a group to the model.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiSuccess (200) {Object} Group Created
 *
 * @apiExample {get} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
 * {
 * 	"name":"Group 1",
 * 	"description":"",
 * 	"author":"username",
 * 	"createdAt":"2019-01-03T23:03:37.411Z",
 * 	"color":[44,50,125],
 * 	"objects":[]
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"efa67a80-0fab-11e9-a0ed-edada3f501fd",
 * 	"name":"Group 1",
 * 	"description":"",
 * 	"author":"username",
 * 	"createdAt":"2019-01-03T23:03:37.411Z",
 * 	"color":[44,50,125],
 * 	"objects":[]
 * }
 */
router.post("/revision/master/head/groups/", middlewares.issue.canCreate, createGroup);

/**
 * @api {post} /:teamspace/:model/revision/:rid/groups Create a group
 * @apiName createGroupAtRevision
 * @apiGroup Groups
 * @apiDescription Add a group to the model.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} rid Revision ID
 * @apiSuccess (200) {Object} Group Created
 *
 * @apiExample {get} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/revision/master/head/groups HTTP/1.1
 * {
 * 	"name":"Group 1",
 * 	"description":"",
 * 	"author":"username",
 * 	"createdAt":"2019-01-03T23:03:37.411Z",
 * 	"color":[44,50,125],
 * 	"objects":[]
 * }
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"efa67a80-0fab-11e9-a0ed-edada3f501fd",
 * 	"name":"Group 1",
 * 	"description":"",
 * 	"author":"username",
 * 	"createdAt":"2019-01-03T23:03:37.411Z",
 * 	"color":[44,50,125],
 * 	"objects":[]
 * }
 */
router.post("/revision/:rid/groups/", middlewares.issue.canCreate, createGroup);

/**
 * @apiDeprecated use {delete} /:teamspace/:model/groups instead
 * @api {delete} /:teamspace/:model/groups/:groupId Delete a group
 * @apiName deleteGroup
 * @apiGroup Groups
 * @apiDescription Delete a group.
 */
router.delete("/groups/:id", middlewares.issue.canCreate, deleteGroup);

/**
 * @api {delete} /:teamspace/:model/groups Delete groups
 * @apiName deleteGroups
 * @apiGroup Groups
 * @apiDescription Delete groups.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiSuccess (200) Status success
 * @apiSuccessExample {json} Success-Response
 *
 * HTTP/1.1 200 OK
 * {
 * 	"status":"success"
 * }
 *
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

/**
 * @deprecated -  use deleteGroups with single id instead.
 */
function deleteGroup(req, res, next) {

	req.query.ids = req.params.id;

	return deleteGroups(req, res, next);
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
