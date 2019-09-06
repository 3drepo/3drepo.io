/**
 *	Copyright (C) 2018 3D Repo Ltd
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
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");
const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Viewpoint = require("../models/viewpoint");
const utils = require("../utils");
const systemLogger = require("../logger.js").systemLogger;
const config = require("../config");

/**
 * @apiDefine Viewpoints Viewpoints
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

/**
 * @apiDefine SuccessViewpointObject
 *
 * @apiSuccess (Viewpoint object) {String} _id Viewpoint ID
 * @apiSuccess (Viewpoint object) {Number[]} clippingPlanes Array of clipping planes
 * @apiSuccess (Viewpoint object) {Object} viewpoint Viewpoint properties
 * @apiSuccess (Viewpoint object) {Object} screenshot Screenshot object
 * @apiSuccess (Viewpoint object) {String} name Name of viewpoint
 */

/**
 * @api {get} /:teamspace/:model/viewpoints List all viewpoints
 * @apiName listViewpoints
 * @apiGroup Viewpoints
 * @apiDescription List all model viewpoints.
 *
 * @apiUse Viewpoints
 * @apiUse SuccessViewpointObject
 *
 * @apiSuccess {Object[]} viewpoints List of viewpoint objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/viewpoints HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"_id":"00000000-0000-0000-0000-000000000001",
 * 		"clippingPlanes":[],
 * 		"viewpoint":{
 * 			"right":[1.0,-0.0,0.0],
 * 			"up":[0.0,0.0,-1.0],
 * 			"position":[35000.0,150000.0,20000.0],
 * 			"look_at":[35000.0,3000.0,20000.0],
 * 			"view_dir":[-0.0,-1,-0.0],
 * 			"near":100.0,
 * 			"far":100000.0,
 * 			"fov":1.0,
 * 			"aspect_ratio":1.185,
 * 			"highlighted_group_id":""
 * 		},
 * 		"screenshot":{
 * 			"thumbnailUrl":<binary image>,
 * 			"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001/thumbnail.png"
 * 		},
 * 		"name":"View1"
 * 	},
 * 	{
 * 		"_id":"00000000-0000-0000-0000-000000000002",
 * 		"clippingPlanes":[],
 * 		"viewpoint":{
 * 			"right":[1.0,-0.0,0.5],
 * 			"up":[0.0,0.0,-1.0],
 * 			"position":[20000.0,-50000.0,10000.0],
 * 			"look_at":[20000.0,5000.0,10000.0],
 * 			"view_dir":[0.0,-1,0.0],
 * 			"near":100.0,
 * 			"far":100000.0,
 * 			"fov":1.0,
 * 			"aspect_ratio":1.185,
 * 			"highlighted_group_id":""
 * 		},
 * 		"screenshot":{
 * 			"thumbnailUrl":<binary image>,
 * 			"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000002/thumbnail.png"
 * 		},
 * 		"name":"View2"
 * 	}
 * ]
 */
router.get("/viewpoints/", middlewares.issue.canView, listViewpoints);

/**
 * @api {get} /:teamspace/:model/viewpoints/:viewId Get viewpoint
 * @apiName findViewpoint
 * @apiGroup Viewpoints
 * @apiDescription Retrieve a viewpoint.
 *
 * @apiUse Viewpoints
 * @apiUse SuccessViewpointObject
 *
 * @apiParam {String} viewId Viewpoint ID
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001 HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000001",
 * 	"clippingPlanes":[],
 * 	"viewpoint":{
 * 		"right":[1.0,-0.0,0.0],
 * 		"up":[0.0,0.0,-1.0],
 * 		"position":[35000.0,150000.0,20000.0],
 * 		"look_at":[35000.0,3000.0,20000.0],
 * 		"view_dir":[-0.0,-1,-0.0],
 * 		"near":100.0,
 * 		"far":100000.0,
 * 		"fov":1.0,
 * 		"aspect_ratio":1.185,
 * 		"highlighted_group_id":""
 * 	},
 * 	"screenshot":{
 * 		"thumbnailUrl":<binary image>,
 * 		"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001/thumbnail.png"
 * 	},
 * 	"name":"View1"
 * }
 */
router.get("/viewpoints/:uid", middlewares.issue.canView, findViewpoint);

/**
 * @api {put} /:teamspace/:model/viewpoints/:viewId Update viewpoint
 * @apiName updateViewpoint
 * @apiGroup Viewpoints
 * @apiDescription Update a viewpoint.
 *
 * @apiUse Viewpoints
 *
 * @apiParam {String} viewId Viewpoint ID
 * @apiParam (Request body) {String} name Name of viewpoint
 *
 * @apiExample {put} Example usage:
 * PUT /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001 HTTP/1.1
 * {
 * 	"name":"NewName"
 * }
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000001"
 * }
 */
router.put("/viewpoints/:uid", middlewares.issue.canCreate, updateViewpoint);

/**
 * @api {post} /:teamspace/:model/viewpoints/ Create viewpoint
 * @apiName createViewpoint
 * @apiGroup Viewpoints
 * @apiDescription Create a new viewpoint.
 *
 * @apiUse Viewpoints
 *
 * @apiParam (Request body) {String} name Name of viewpoint
 * @apiParam (Request body) {String} viewpoint Viewpoint
 * @apiParam (Request body) {String} screenshot Screenshot
 * @apiParam (Request body) {String} [clippingPlanes] List of clipping planes
 * @apiParam (Request body: screenshot) {String} base64 Screenshot image in base64
 *
 * @apiExample {post} Example usage:
 * POST /acme/00000000-0000-0000-0000-000000000000/viewpoints HTTP/1.1
 * {
 * 	"clippingPlanes":[],
 * 	"name":"View 3",
 * 	"screenshot":{
 * 		"base64":<base64 image>
 * 	}
 * 	"viewpoint":{
 * 		"aspect_ratio":1.1715909242630005,
 * 		"far":233419.5625,
 * 		"fov":1.0471975803375244,
 * 		"highlighted_group_id":"",
 * 		"look_at":[34448.78125, 2989.078125, 17619.7265625],
 * 		"near":466.839111328125,
 * 		"position":[34448.78125, 163958.484375, 17620.015625],
 * 		"right":[0.9999919533729553, -7.683411240577698e-9, 0.00400533527135849],
 * 		"up":[0.00400533527135849, 0.0000017881393432617188, -0.9999920129776001],
 * 		"view_dir":[-6.984919309616089e-10, -1, -0.0000017881393432617188]
 * 	}
 * }
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000001"
 * }
 */
router.post("/viewpoints/", middlewares.issue.canCreate, createViewpoint);

/**
 * @api {delete} /:teamspace/:model/viewpoints/:viewId Delete viewpoint
 * @apiName deleteViewpoint
 * @apiGroup Viewpoints
 * @apiDescription Delete a viewpoint.
 *
 * @apiUse Viewpoints
 *
 * @apiParam {String} viewId Viewpoint ID
 *
 * @apiExample {delete} Example usage:
 * DELETE /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000000 HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"status":"success"
 * }
 */
router.delete("/viewpoints/:uid", middlewares.issue.canCreate, deleteViewpoint);

/**
 * @api {get} /:teamspace/:model/viewpoints/:viewId/thumbnail.png Get viewpoint thumbnail
 * @apiName getViewpointThumbnail
 * @apiGroup Viewpoints
 * @apiDescription Retrieve a viewpoint's thumbnail image.
 *
 * @apiUse Viewpoints
 *
 * @apiParam {String} viewId Viewpoint ID
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000000/thumbnail.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/viewpoints/:uid/thumbnail.png", middlewares.issue.canView, getViewpointThumbnail);

const getDbColOptions = function(req) {
	return {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};
};

function listViewpoints(req, res, next) {

	const dbCol = getDbColOptions(req);
	const place = utils.APIInfo(req);

	Viewpoint.listViewpoints(dbCol, req.query)
		.then(viewpoints => {

			responseCodes.respond(place, req, res, next, responseCodes.OK, viewpoints);

		}).catch(err => {

			systemLogger.logError(err.stack);
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);

		});
}

function findViewpoint(req, res, next) {

	const dbCol = getDbColOptions(req);
	const place = utils.APIInfo(req);

	Viewpoint.findByUID(dbCol, req.params.uid, undefined, true)
		.then(view => {
			if(!view) {
				return Promise.reject({resCode: responseCodes.VIEW_NOT_FOUND});
			} else {
				return Promise.resolve(view);
			}
		}).then(view => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, view);
		}).catch(err => {
			systemLogger.logError(err.stack);
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
}

function createViewpoint(req, res, next) {
	if (Object.keys(req.body).length >= 3 &&
			Object.prototype.toString.call(req.body.name) === "[object String]" &&
			Object.prototype.toString.call(req.body.viewpoint) === "[object Object]" &&
			Object.prototype.toString.call(req.body.screenshot) === "[object Object]" &&
			(!req.body.clippingPlanes || Object.prototype.toString.call(req.body.clippingPlanes) === "[object Array]")) {
		const place = utils.APIInfo(req);
		const sessionId = req.headers[C.HEADER_SOCKET_ID];
		Viewpoint.createViewpoint(getDbColOptions(req), sessionId, req.body)
			.then(view => {
				responseCodes.respond(place, req, res, next, responseCodes.OK, view);
			}).catch(err => {
				responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
	} else {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

function deleteViewpoint(req, res, next) {

	const place = utils.APIInfo(req);
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	Viewpoint.deleteViewpoint(getDbColOptions(req), req.params.uid, sessionId).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "success"});
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function updateViewpoint(req, res, next) {
	if (Object.keys(req.body).length >= 1 &&
			Object.prototype.toString.call(req.body.name) === "[object String]") {
		const dbCol = getDbColOptions(req);
		const place = utils.APIInfo(req);
		const sessionId = req.headers[C.HEADER_SOCKET_ID];

		Viewpoint.findByUID(dbCol, req.params.uid)
			.then(view => {
				if(!view) {
					return Promise.reject({resCode: responseCodes.VIEW_NOT_FOUND});
				} else {
					return Viewpoint.updateViewpoint(dbCol, sessionId, req.body, utils.stringToUUID(req.params.uid));
				}
			}).then(view => {
				responseCodes.respond(place, req, res, next, responseCodes.OK, view);
			}).catch(err => {
				systemLogger.logError(err.stack);
				responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
	} else {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
	}
}

function getViewpointThumbnail(req, res, next) {

	const dbCol = getDbColOptions(req);
	const place = utils.APIInfo(req);

	Viewpoint.getThumbnail(dbCol, req.params.uid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png" , config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

module.exports = router;
