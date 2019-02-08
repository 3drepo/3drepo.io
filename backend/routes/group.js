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
 * @api {get} /:teamspace/:model/groups/revision/master/head/ List model groups
 * @apiName listGroups
 * @apiGroup Groups
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiDescription Get all groups for current model.
 *
 * @apiSuccess (200) {Object[]} List of all Groups
 * @apiSuccessExample {json} Success-Response
 *
 * HTTP/1.1 200 OK
 *	{
 *		"_id":"model_ID",
 *		"__v":0,
 *		"name":"Changed",
 *		"author":"username",
 *		"createdAt":1536747251756,
 *		"updatedBy":"username",
 *		"updatedAt":1536747551043,
 *		"color":[152,233,75],
 *		"objects":[]
 * }
 */

router.get("/groups/revision/master/head/", middlewares.issue.canView, listGroups);
/**
 * @api {get} /:teamspace/:model/groups/revision/:rid/ List model groups by revision
 * @apiDescription List all groups using the revision ID
 * @apiName listGroupsByRevision
 * @apiGroup Groups
 *
 * @apiDescription List all groups using based on which revision is currently selected.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID.
 *
 * @apiSuccess (200) {Object[]} List of all Groups based on Revision ID.
 * @apiSuccessExample {json} Success-Response
 *
 * HTTP/1.1 200 OK
 * [
 *	{
 *		"_id": "model_ID",
 *		"name": "Group 1",
 *		"description": "This is test group for revision 2",
 *		"author": "username",
 *		"updatedBy": "username",
 *		"updatedAt": 1546537564888,
 *		"createdAt": 1546537564888,
 *		"__v": 0,
 *		"color": [
 *		121,
 *		130,
 *		211
 *	],
 *		"objects": []
 *	}
 *	]
 */

router.get("/groups/revision/:rid/", middlewares.issue.canView, listGroups);

/**
 * @api {get} /:teamspace/:model/groups/revision/master/head/:uid/ Find group in model
 * @apiDescription Find a group by model using the group ID
 * @apiName findGroup
 * @apiGroup Groups
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Group unique ID.
 *
 * @apiDescription Find a group using it's Group ID
 *
 * @apiSuccess (200) {Object} Group matching provided ID.
 * @apiSuccessExample {json} Success-Response
 *
 * HTTP/1.1 200 OK
 * {
 * 	"_id": "group_ID",
 *	"color": [
 *		121,
 *		130,
 *		211
 *	],
 *	"objects": []
 * }
 */

router.get("/groups/revision/master/head/:uid", middlewares.issue.canView, findGroup);
/**
 * @api {get} /:teamspace/:model/groups/revision/:rid/:uid/ Find group in model by revision
 * @apiName findGroupByRevision
 * @apiDescription Find a group by revision ID and Group ID
 * @apiGroup Groups
 *
 * @apiDescription Find a single group using the unique Group ID and a Revision ID.
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Revision unique ID.
 * @apiParam {String} id Group unique ID.
 *
 * @apiSuccess (200) {Object} Group
 * @apiSuccessExample {json} Success-Response
 *
 * HTTP/1.1 200 OK
 * [
 *		{
 *			"_id": "789b2ed0-0f7f-11e9-b909-833ae21f045f",
 *			"name": "Group 1",
 *			"description": "This is test group for revision 2",
 *			"author": "username",
 *			"updatedBy": "username",
 *			"updatedAt": 1546553617888,
 *			"createdAt": 1546537564888,
 *			"__v": 0,
 *			"color": [
 *				121,
 *				130,
 *				211
 *			],
 *			"objects": [
 *					{
 *						"account": "account_username",
 *						"model": "6e7d81fb-85c8-4b09-9ad6-6ba099261099",
 *						"ifc_guids": [],
 *						"shared_ids": [
 *						"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 *						"db18ef69-6d6e-49a0-846e-907346abb39d",
 *						"c532ff34-6669-4807-b7f3-6a0ffb17b027",
 *						"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 *						"3f881fa8-2b7b-443e-920f-396c1c85e903"
 *					]
 *				}
 *			]
 *		}
 *	]
 * @apiError GROUP_NOT_FOUND Group Not Found
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 404 Not Found
 *	{
 *	  "message": "Group not found",
 *	  "status": 404,
 *	  "code": "GROUP_NOT_FOUND",
 *	  "value": 53,
 *	  "place": "PUT /groups/revision"
 *	}
 */
router.get("/groups/revision/:rid/:uid", middlewares.issue.canView, findGroup);

/**
 * @api {put} /:teamspace/:model/groups/:uid/ Update group
 * @apiName updateGroup
 * @apiGroup Groups
 *
 * @apiDescription Update a specific group using a unique group ID.
 *
 * @apiSuccess (200) {Object} Group Object
 *
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *	 "_id":"c5f0fd00-0fab-11e9-bf22-eb8649763304"
 * }
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Group unique ID.
 *
 * @apiError GROUP_NOT_FOUND Group Not Found
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 404 Not Found
 *	{
 *	  "message": "Group not found",
 *	  "status": 404,
 *	  "code": "GROUP_NOT_FOUND",
 *	  "value": 53,
 *	  "place": "PUT /groups/"
 *	}
 */
router.put("/groups/:uid", middlewares.issue.canCreate, updateGroup);

/**
 * @api {post} /:teamspace/:model/groups/ Create a group
 * @apiName createGroup
 * @apiDescription Add a group to the model.
 * @apiGroup Groups
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiSuccess (200) {Object} Group Created
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *		"__v":0,
 *		"_id":"efa67a80-0fab-11e9-a0ed-edada3f501fd",
 *		"name":"Group 1","description":"",
 *		"author":"username",
 *		"updatedBy":"username",
 *		"updatedAt":"2019-01-03T23:03:37.411Z",
 *		"createdAt":"2019-01-03T23:03:37.411Z",
 *		"color":[44,50,125],
 *		"objects":[]
 * }
 */

router.post("/groups/", middlewares.issue.canCreate, createGroup);

// @deprecated -  use deleteGroups with single id instead.
router.delete("/groups/:id", middlewares.issue.canCreate, deleteGroup);

/**
 * @api {delete} /:teamspace/:model/groups/ Delete groups
 * @apiName deleteGroups
 * @apiDescription Delete groups from the model.
 * @apiGroup Groups
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiDescription Delete single group using unique group ID.
 *
 * @apiSuccess (200) Status success
 * @apiSuccessExample {json} Success-Response
 *
 * HTTP/1.1 200 OK
 * {
 *	"status":"success"
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

	let groupList;
	if (req.params.rid) {
		groupList = Group.listGroups(dbCol, req.query, null, req.params.rid);
	} else {
		groupList = Group.listGroups(dbCol, req.query, "master", null);
	}

	groupList.then(groups => {

		groups.forEach((group, i) => {
			groups[i] = group.clean();
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, groups);

	}).catch(err => {

		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);

	});
}

function findGroup(req, res, next) {

	const dbCol = getDbColOptions(req);
	const place = utils.APIInfo(req);

	let groupItem;
	if (req.params.rid) {
		groupItem = Group.findByUIDSerialised(dbCol, req.params.uid, null, req.params.rid);
	} else {
		groupItem = Group.findByUIDSerialised(dbCol, req.params.uid, "master", null);
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

	if (req.body.objects) {
		const create = Group.createGroup(getDbColOptions(req), sessionId, req.body);

		create.then(group => {

			responseCodes.respond(place, req, res, next, responseCodes.OK, group);

		}).catch(err => {
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
		});
	} else {
		responseCodes.respond(place, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
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

	let groupItem;
	if (req.params.rid) {
		groupItem = Group.findByUID(dbCol, req.params.uid, null, req.params.rid);
	} else {
		groupItem = Group.findByUID(dbCol, req.params.uid, "master", null);
	}

	groupItem.then(group => {

		if (!group) {
			return Promise.reject({ resCode: responseCodes.GROUP_NOT_FOUND });
		} else {
			return group.updateGroup(dbCol, sessionId, req.body);
		}

	}).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group);
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
	});
}

module.exports = router;
