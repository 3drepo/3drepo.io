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
 * @apiDeprecated use {get} /:teamspace/:model/revision/master/head/groups instead
 * @api {get} /:teamspace/:model/groups/revision/master/head
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
 * {
 *   "_id":"model_ID",
 *   "__v":0,
 *   "name":"Changed",
 *   "author":"username",
 *   "createdAt":1536747251756,
 *   "updatedBy":"username",
 *   "updatedAt":1536747551043,
 *   "color":[152,233,75],
 *   "objects":[]
 * }
 */
router.get("/groups/revision/master/head/", middlewares.issue.canView, listGroups);

/**
 * @api {get} /:teamspace/:model/revision/master/head/groups/ List model groups
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
 * {
 *   "_id":"model_ID",
 *   "__v":0,
 *   "name":"Changed",
 *   "author":"username",
 *   "createdAt":1536747251756,
 *   "updatedBy":"username",
 *   "updatedAt":1536747551043,
 *   "color":[152,233,75],
 *   "objects":[]
 * }
 */
router.get("/revision/master/head/groups", middlewares.issue.canView, listGroups);

/**
 * @apiDeprecated Use /:teamspace/:model/revision/:rid/groups/ instead
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
 *   {
 *     "_id": "model_ID",
 *     "name": "Group 1",
 *     "description": "This is test group for revision 2",
 *     "author": "username",
 *     "updatedBy": "username",
 *     "updatedAt": 1546537564888,
 *     "createdAt": 1546537564888,
 *     "__v": 0,
 *     "color": [
 *       121,
 *       130,
 *       211
 *     ],
 *     "objects": []
 *   }
 * ]
 */

router.get("/groups/revision/:rid/", middlewares.issue.canView, listGroups);

/**
 * @api {get} /:teamspace/:model/revision/:rid/groups/ List model groups by revision
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
 *   {
 *     "_id": "model_ID",
 *     "name": "Group 1",
 *     "description": "This is test group for revision 2",
 *     "author": "username",
 *     "updatedBy": "username",
 *     "updatedAt": 1546537564888,
 *     "createdAt": 1546537564888,
 *     "__v": 0,
 *     "color": [
 *       121,
 *       130,
 *       211
 *     ],
 *     "objects": []
 *   }
 * ]
 */

router.get("/revision/:rid/groups", middlewares.issue.canView, listGroups);

/**
 * @apiDeprecated /:teamspace/:model/groups/revision/master/head/groups/:uid/
 * @api {get} /:teamspace/:model/groups/revision/master/head/:uid/ Find group in model
 * @apiDescription Find a group by model using the group ID
 * @apiName findGroup
 * @apiGroup Groups
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Group unique ID.
 * @apiParam {String} ifcguids Query string ifcguids returns IFC GUIDs if true where available.
 *
 * @apiDescription Find a group using it's Group ID
 *
 * @apiSuccess (200) {Object} Group matching provided ID.
 * @apiSuccessExample {json} Success-Response
 *
 * HTTP/1.1 200 OK
 * {
 *   "_id": "group_ID",
 *   "color": [
 *     121,
 *     130,
 *     211
 *   ],
 *   "objects": []
 * }
 */
router.get("/groups/revision/master/head/:uid", middlewares.issue.canView, findGroup);

/**
 * @api {get} /:teamspace/:model/revision/master/head/groups/:uid/ Find group in model
 * @apiDescription Find a group by model using the group ID
 * @apiName findGroup
 * @apiGroup Groups
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 * @apiParam {String} id Group unique ID.
 * @apiParam {String} ifcguids Query string ifcguids returns IFC GUIDs if true where available.
 *
 * @apiDescription Find a group using it's Group ID
 *
 * @apiSuccess (200) {Object} Group matching provided ID.
 * @apiSuccessExample {json} Success-Response
 *
 * HTTP/1.1 200 OK
 * {
 *   "_id": "group_ID",
 *   "color": [
 *     121,
 *     130,
 *     211
 *   ],
 *   "objects": []
 * }
 */
router.get("/revision/master/head/groups/:uid", middlewares.issue.canView, findGroup);

/**
 * @apiDeprecated use {get} /:teamspace/:model/revision/:rid/groups/:uid/ instead
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
 * @apiParam {String} ifcguids Query string ifcguids returns IFC GUIDs if true where available.
 *
 * @apiSuccess (200) {Object} Group
 * @apiSuccessExample {json} Success-Response
 *
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "_id": "789b2ed0-0f7f-11e9-b909-833ae21f045f",
 *     "name": "Group 1",
 *     "description": "This is test group for revision 2",
 *     "author": "username",
 *     "updatedBy": "username",
 *     "updatedAt": 1546553617888,
 *     "createdAt": 1546537564888,
 *     "__v": 0,
 *     "color": [
 *       121,
 *       130,
 *       211
 *     ],
 *     "objects": [
 *       {
 *         "account": "account_username",
 *         "model": "6e7d81fb-85c8-4b09-9ad6-6ba099261099",
 *         "ifc_guids": [],
 *         "shared_ids": [
 *           "24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 *           "db18ef69-6d6e-49a0-846e-907346abb39d",
 *           "c532ff34-6669-4807-b7f3-6a0ffb17b027",
 *           "fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 *           "3f881fa8-2b7b-443e-920f-396c1c85e903"
 *         ]
 *       }
 *     ]
 *   }
 * ]
 * @apiError GROUP_NOT_FOUND Group Not Found
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Group not found",
 *   "status": 404,
 *   "code": "GROUP_NOT_FOUND",
 *   "value": 53,
 *   "place": "PUT /groups/revision"
 * }
 */
router.get("/groups/revision/:rid/:uid", middlewares.issue.canView, findGroup);

/**
 * @api {get} /:teamspace/:model/revision/:rid/groups/:uid/ Find group in model by revision
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
 * @apiParam {String} ifcguids Query string ifcguids returns IFC GUIDs if true where available.
 *
 * @apiSuccess (200) {Object} Group
 * @apiSuccessExample {json} Success-Response
 *
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "_id": "789b2ed0-0f7f-11e9-b909-833ae21f045f",
 *     "name": "Group 1",
 *     "description": "This is test group for revision 2",
 *     "author": "username",
 *     "updatedBy": "username",
 *     "updatedAt": 1546553617888,
 *     "createdAt": 1546537564888,
 *     "__v": 0,
 *     "color": [
 *       121,
 *       130,
 *       211
 *     ],
 *     "objects": [
 *       {
 *         "account": "account_username",
 *         "model": "6e7d81fb-85c8-4b09-9ad6-6ba099261099",
 *         "ifc_guids": [],
 *         "shared_ids": [
 *           "24fdcf2d-b9eb-4fa2-a614-dfe2532493b3",
 *           "db18ef69-6d6e-49a0-846e-907346abb39d",
 *           "c532ff34-6669-4807-b7f3-6a0ffb17b027",
 *           "fec16ea6-bb7b-4f12-b39b-f06fe6bf041d",
 *           "3f881fa8-2b7b-443e-920f-396c1c85e903"
 *         ]
 *       }
 *     ]
 *   }
 * ]
 * @apiError GROUP_NOT_FOUND Group Not Found
 * @apiErrorExample {json} Error-Response
 *
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Group not found",
 *   "status": 404,
 *   "code": "GROUP_NOT_FOUND",
 *   "value": 53,
 *   "place": "PUT /groups/revision"
 * }
 */
router.get("/revision/:rid/groups/:uid", middlewares.issue.canView, findGroup);

/**
 * @apiDeprecated Use {put} /:teamspace/:model/revision/:rid/groups/:uid/ instead
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
 * {
 *   "message": "Group not found",
 *   "status": 404,
 *   "code": "GROUP_NOT_FOUND",
 *   "value": 53,
 *   "place": "PUT /groups/"
 * }
 */
router.put("/groups/:uid", middlewares.issue.canCreate, updateGroup);

/**
 * @api {put} /:teamspace/:model/revision/:rid/groups/:uid/
 * @apiName updateGroup
 * @apiGroup Groups
 *
 * @apiDescription Update a specific group using a unique group ID, in respective of the latest revision
 *
 * @apiSuccess (200) {Object} Group Object
 */
router.put("/revision/master/head/groups/:uid", middlewares.issue.canCreate, updateGroup);

/**
 * @api {put} /:teamspace/:model/revision/:rid/groups/:uid/
 * @apiName updateGroup
 * @apiGroup Groups
 *
 * @apiDescription Update a specific group using a unique group ID, in respective of the specified revision
 *
 * @apiSuccess (200) {Object} Group Object
 */
router.put("/revision/:rid/groups/:uid", middlewares.issue.canCreate, updateGroup);

/**
 * @apiDeprecated use {post} /:teamspace/:model/revision/:rid/groups/ instead
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
 *   "_id":"efa67a80-0fab-11e9-a0ed-edada3f501fd",
 *   "name":"Group 1","description":"",
 *   "author":"username",
 *   "createdAt":"2019-01-03T23:03:37.411Z",
 *   "color":[44,50,125],
 *   "objects":[]
 * }
 */
router.post("/groups/", middlewares.issue.canCreate, createGroup);

/**
 * @api {post} /:teamspace/:model/revision/master/head/groups/ Create a group
 * @apiName createGroup
 * @apiDescription Add a group to the model, in the perspective of the current revision
 * @apiGroup Groups
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiSuccess (200) {Object} Group Created
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "_id":"efa67a80-0fab-11e9-a0ed-edada3f501fd",
 *   "name":"Group 1","description":"",
 *   "author":"username",
 *   "createdAt":"2019-01-03T23:03:37.411Z",
 *   "color":[44,50,125],
 *   "objects":[]
 * }
 */
router.post("/revision/master/head/groups/", middlewares.issue.canCreate, createGroup);

/**
 * @api {post} /:teamspace/:model/revision/:rid/groups/ Create a group
 * @apiName createGroup
 * @apiDescription Add a group to the model, in the perspective of the :rid
 * @apiGroup Groups
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 *
 * @apiSuccess (200) {Object} Group Created
 * @apiSuccessExample {json} Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "_id":"efa67a80-0fab-11e9-a0ed-edada3f501fd",
 *   "name":"Group 1","description":"",
 *   "author":"username",
 *   "createdAt":"2019-01-03T23:03:37.411Z",
 *   "color":[44,50,125],
 *   "objects":[]
 * }
 */
router.post("/revision/:rid/groups/", middlewares.issue.canCreate, createGroup);

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
 *   "status":"success"
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
