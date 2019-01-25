/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");
const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Viewpoint = require("../models/viewpoint");
const utils = require("../utils");
const systemLogger = require("../logger.js").systemLogger;

/**
 * @api {get} /viewpoints List all Viewpoints
 * @apiName listViewpoints
 * @apiGroup Viewpoint
 */

router.get("/viewpoints/", middlewares.issue.canView, listViewpoints);

/**
 * @api {get} /viewpoints/:uid Find a Viewpoint
 * @apiName findViewpoint
 * @apiGroup Viewpoint
 *
 * @apiParam {String} id Unique Viewpoint ID
 */

router.get("/viewpoints/:uid", middlewares.issue.canView, findViewpoint);

/**
 * @api {put} /viewpoints/:uid Update a Viewpoint
 * @apiName updateViewpoint
 * @apiGroup Viewpoint
 *
 * @apiParam {String} id Unique Viewpoint ID
 */

router.put("/viewpoints/:uid", middlewares.issue.canCreate, updateViewpoint);

/**
 * @api {post} /viewpoints/ Create a Viewpoint
 * @apiName createViewpoint
 * @apiGroup Viewpoint
 */

router.post("/viewpoints/", middlewares.issue.canCreate, createViewpoint);

/**
 * @api {delete} /viewpoints/:uid Delete a Viewpoint
 * @apiName deleteViewpoint
 * @apiGroup Viewpoint
 */

router.delete("/viewpoints/:uid", middlewares.issue.canCreate, deleteViewpoint);

/**
 * @api {get} /viewpoints/:uid Get a Viewpoint Thumbnail
 * @apiName getViewpointThumbnail
 * @apiGroup Viewpoint
 *
 * @apiParam {String} id Unique Viewpoint ID
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
		responseCodes.respond(place, req, res, next, responseCodes.OK, buffer, "png");
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});

}

module.exports = router;
