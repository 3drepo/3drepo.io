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
const responseCodes = require("../response_codes");
const C = require("../constants");
const utils = require("../utils");
const Presentation = require("../models/presentation");

/**
 * @api {put} /:teamspace/:model/presentation/:code/start Starts a presentation session and returns the presentation code
 * @apiName startPresentation
 * @apiGroup Presentation
 *
 * @apiParam {String} teamspace The teamspace where the presentation is taking place
 * @apiParam {String} model The model where the presentation is taking place
 * @apiParam {String} code The code that users need to join in order to get the viewpoint.
 *
 * @apiExample {get} Example usage:
 * POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/presentation/start HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * { code: "aASnk" }
 */
router.post("/presentation/start", middlewares.hasReadAccessToModel, startPresentation);

/**
 * @api {put} /:teamspace/:model/presentation/:code/start Starts a presentation session and returns the presentation code
 * @apiName startPresentation
 * @apiGroup Presentation
 *
 * @apiParam {String} teamspace The teamspace where the presentation is taking place
 * @apiParam {String} model The model where the presentation is taking place
 * @apiParam {String} code The code that users need to join in order to get the viewpoint.
 *
 * @apiExample {get} Example usage:
 * POST /teamSpace1/5ce7dd19-1252-4548-a9c9-4a5414f2e0c5/presentation/start HTTP/1.1
 *
 * @apiSuccessExample {json} Success:
 * { code: "aASnk" }
 */
router.post("/presentation/:code/end", middlewares.hasReadAccessToModel, endPresentation);

/**
 * @api {put} /:teamspace/:model/presentation/:code/stream Streams a viewpoint
 * @apiName streamPresentation
 * @apiGroup Presentation

 * @apiParam {String} teamspace The teamspace where the presentation is taking place
 * @apiParam {String} model The model where the presentation is taking place
 * @apiParam {String} code The code that users need to join in order to get the viewpoint.
 * @apiBody {Object} StreamingViewpoint The viewpoint
 *
 */
router.put("/presentation/:code/stream", middlewares.hasReadAccessToModel, streamPresentation);

router.get("/presentation/:code/exists", middlewares.hasReadAccessToModel, existsPresentation);

function startPresentation(req, res, next) {
	const username = req.session.user.username;
	const { account, model } = req.params;

	Presentation.startPresenting(account, model, username).then(code => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {code});
	}).catch(err => {
		err = err.resCode ? err.resCode : err;
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function streamPresentation(req, res, next) {
	const {model, account, code} = req.params;
	const username = req.session.user.username;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];
	const viewpoint = req.body;

	Presentation.streamPresentation(account , model, username, code, viewpoint, sessionId).then(() => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});
	}).catch(err => {
		err = err.resCode ? err.resCode : err;
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function endPresentation(req, res, next) {
	const {model, account, code} = req.params;
	const username = req.session.user.username;
	const sessionId = req.headers[C.HEADER_SOCKET_ID];

	Presentation.endPresentation(account , model, username, code, sessionId).then(() => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {presentationEnded: true});
	}).catch(err => {
		err = err.resCode ? err.resCode : err;
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

function existsPresentation (req, res, next) {
	const {model, account, code} = req.params;

	Presentation.exists(account, model, code).then((exists) => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {exists});
	}).catch(err => {
		err = err.resCode ? err.resCode : err;
		responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
	});
}

module.exports = router;
