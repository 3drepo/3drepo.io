/**
 * Copyright (C) 2020 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
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
const C = require("../constants");
const responseCodes = require("../response_codes.js");
const View = new (require("../models/view"))();
const utils = require("../utils");
const config = require("../config");

/**
 * @apiDefine Views Views
 *
 * @apiParam {String} teamspace Name of teamspace
 * @apiParam {String} model Model ID
 */

/**
 * @apiDefine SuccessViewObject
 *
 * @apiSuccess (View object) {String} _id View ID
 * @apiSuccess (View object) {String} name Name of view
 * @apiSuccess (View object) {String} thumbnail Thumbnail image
 * @apiSuccess (View object) {Object} viewpoint Viewpoint properties
 * @apiSuccess (View object) {Number[]} clippingPlanes [DEPRECATED] Array of clipping planes
 * @apiSuccess (View object) {Object} screenshot [DEPRECATED] Screenshot object
 */

/**
 * @api {get} /:teamspace/:model/viewpoints List all views
 * @apiName listViews
 * @apiGroup Views
 * @apiDescription List all model views.
 *
 * @apiUse Views
 * @apiUse SuccessViewObject
 *
 * @apiSuccess {Object[]} views List of view objects
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/viewpoints HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * [
 * 	{
 * 		"_id":"00000000-0000-0000-0000-000000000001",
 * 		"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001/thumbnail.png",
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
 * 			"clippingPlanes":[],
 * 			"highlighted_group_id":""
 * 		},
 * 		"clippingPlanes":[],
 * 		"screenshot":{
 * 			"thumbnailUrl":<binary image>,
 * 			"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001/thumbnail.png"
 * 		},
 * 		"name":"View1"
 * 	},
 * 	{
 * 		"_id":"00000000-0000-0000-0000-000000000002",
 * 		"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000002/thumbnail.png",
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
 * 			"clippingPlanes":[],
 * 			"highlighted_group_id":""
 * 		},
 * 		"clippingPlanes":[],
 * 		"screenshot":{
 * 			"thumbnailUrl":<binary image>,
 * 			"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000002/thumbnail.png"
 * 		},
 * 		"name":"View2"
 * 	}
 * ]
 */
router.get("/viewpoints/", middlewares.issue.canView, listViews);

/**
 * @api {get} /:teamspace/:model/viewpoints/:viewId Get view
 * @apiName findView
 * @apiGroup Views
 * @apiDescription Retrieve a view.
 *
 * @apiUse Views
 * @apiUse SuccessViewObject
 *
 * @apiParam {String} viewId View ID
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001 HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * {
 * 	"_id":"00000000-0000-0000-0000-000000000001",
 * 	"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001/thumbnail.png",
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
 * 		"clippingPlanes":[],
 * 		"highlighted_group_id":""
 * 	},
 * 	"clippingPlanes":[],
 * 	"screenshot":{
 * 		"thumbnailUrl":<binary image>,
 * 		"thumbnail":"charence/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000001/thumbnail.png"
 * 	},
 * 	"name":"View1"
 * }
 */
router.get("/viewpoints/:uid", middlewares.issue.canView, findView);

/**
 * @api {put} /:teamspace/:model/viewpoints/:viewId Update view
 * @apiName updateView
 * @apiGroup Views
 * @apiDescription Update a view.
 *
 * @apiUse Views
 *
 * @apiParam {String} viewId View ID
 * @apiParam (Request body) {String} name Name of view
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
router.put("/viewpoints/:uid", middlewares.issue.canCreate, updateView);

/**
 * @api {post} /:teamspace/:model/viewpoints/ Create view
 * @apiName createView
 * @apiGroup Views
 * @apiDescription Create a new view.
 *
 * @apiUse Views
 *
 * @apiParam (Request body) {String} name Name of view
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
router.post("/viewpoints/", middlewares.issue.canCreate, createView);

/**
 * @api {delete} /:teamspace/:model/viewpoints/:viewId Delete view
 * @apiName deleteView
 * @apiGroup Views
 * @apiDescription Delete a view.
 *
 * @apiUse Views
 *
 * @apiParam {String} viewId View ID
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
router.delete("/viewpoints/:uid", middlewares.issue.canCreate, deleteView);

/**
 * @api {get} /:teamspace/:model/viewpoints/:viewId/thumbnail.png Get view thumbnail
 * @apiName getThumbnail
 * @apiGroup Views
 * @apiDescription Retrieve a view's thumbnail image.
 *
 * @apiUse Views
 *
 * @apiParam {String} viewId View ID
 *
 * @apiExample {get} Example usage:
 * GET /acme/00000000-0000-0000-0000-000000000000/viewpoints/00000000-0000-0000-0000-000000000000/thumbnail.png HTTP/1.1
 *
 * @apiSuccessExample {png} Success-Response
 * HTTP/1.1 200 OK
 * <binary image>
 */
router.get("/viewpoints/:uid/thumbnail.png", middlewares.issue.canView, getThumbnail);

function listViews(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model } = req.params;

	View.getList(account, model).then(views => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, views);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function findView(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, uid } = req.params;

	View.findByUID(account, model, uid).then(view => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, view);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function createView(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model } = req.params;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	View.create(sessionId, account, model, req.body).then(view => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, view);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function deleteView(req, res, next) {
	const place = utils.APIInfo(req);
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const { account, model, uid } = req.params;

	View.deleteViewpoint(account, model, uid, sessionId).then(() => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "success"});
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

function updateView(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, uid } = req.params;
	const updateData = req.body;

	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	return View.update(sessionId, account, model, uid, updateData).then((id) => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, id);
	}).catch((err) => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function getThumbnail(req, res, next) {
	const place = utils.APIInfo(req);
	const { account, model, uid } = req.params;

	View.getThumbnail(account, model, uid).then(buffer => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png" , config.cachePolicy);
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

module.exports = router;
