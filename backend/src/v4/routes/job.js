/**
 *  Copyright (C) 2020 3D Repo Ltd
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
(function() {
	const express = require("express");
	const router = express.Router({mergeParams: true});
	const responseCodes = require("../response_codes");
	const middlewares = require("../middlewares/middlewares");
	const Job = require("../models/job");
	const utils = require("../utils");

	/**
	 * @api {get} /:teamspace/myJob Get user job
	 * @apiName getUserJob
	 * @apiGroup Jobs
	 * @apiDescription Get job assigned to current user.
	 *
	 * @apiUse Jobs
	 *
	 * @apiExample {get} Example usage:
	 * GET /acme/myJob HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * {
	 * 	_id":"Job1",
	 * 	"color":"ff00000"
	 * }
	 */
	router.get("/myJob", middlewares.isTeamspaceMember, getUserJob);

	function getUserJob(req, res, next) {
		// middleware checks if user is in teamspace, so this member check should not be necessary here.
		Job.getUserJob(req.params.account, req.session.user.username).then((job) => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, job);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	module.exports = router;
}());
