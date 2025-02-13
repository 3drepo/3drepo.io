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

const { v5Path } = require("../../interop");
const { httpVerbs, routeDeprecated } = require(`${v5Path}/middleware/common`);

(function () {
	const express = require("express");
	const router = express.Router({ mergeParams: true });

	/**
	 * @apiDefine Jobs Jobs
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 */

	/**
	 * @api {post} /:teamspace/jobs Create a new job
	 * @apiName createJob
	 * @apiGroup Jobs
	 * @apiDescription Create a new job on teamspace.
	 *
	 * @apiUse Jobs
	 *
	 * @apiParam {String} _id Name of job
	 * @apiParam {String} color Colour of job
	 * @apiSuccess (Job object) {String} _id Name of job
	 * @apiSuccess (Job object) {String} color Colour of job
	 *
	 * @apiExample {post} Example usage:
	 * POST /acme/jobs HTTP/1.1
	 * {
	 * 	_id:"Job4",
	 * 	color:"#ffff00"
	 * }
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * {
	 * 	_id:"Job4",
	 * 	color:"#ffff00"
	 * }
	 */
	router.post("/jobs", routeDeprecated(httpVerbs.POST, "/v5/teamspaces/{teamspace}/roles"));

	/**
	 * @api {put} /:teamspace/jobs/:jobId Update job
	 * @apiName updateJob
	 * @apiGroup Jobs
	 * @apiDescription Update job.
	 *
	 * @apiUse Jobs
	 *
	 * @apiParam {String} jobId Job ID
	 * @apiParam {String} _id Name of job
	 * @apiParam {String} color Colour of job
	 *
	 * @apiExample {put} Example usage:
	 * PUT /acme/jobs/Job1 HTTP/1.1
	 * {
	 * 	_id:"Renamed Job",
	 * 	color:"#00ffff"
	 * }
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * {}
	 */
	router.put("/jobs/:jobId", routeDeprecated(httpVerbs.PATCH, "/v5/teamspaces/{teamspace}/roles/{role}"));

	/**
	 * @api {get} /:teamspace/jobs List all jobs
	 * @apiName listJobs
	 * @apiGroup Jobs
	 * @apiDescription List of all jobs defined in teamspace.
	 *
	 * @apiUse Jobs
	 *
	 * @apiSuccess (Job object) {String} _id Name of job
	 * @apiSuccess (Job object) {String} color Colour of job
	 *
	 * @apiExample {get} Example usage:
	 * GET /acme/jobs HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * [
	 * 	{
	 * 		"_id":"Job1",
	 * 		"color":"#ff0000"
	 * 	},
	 * 	{
	 * 		"_id":"Job2",
	 * 		"color":"#00ff00"
	 * 	},
	 * 	{
	 * 		"_id":"Job3",
	 * 		"color":"#0000ff"
	 * 	}
	 * ]
	 */
	router.get("/jobs", routeDeprecated(httpVerbs.GET, "/v5/teamspaces/{teamspace}/roles"));

	/**
	 * @api {post} /:teamspace/jobs/:jobId/:user Assign a job
	 * @apiName addUserToJob
	 * @apiGroup Jobs
	 * @apiDescription Assign a job to a user.
	 *
	 * @apiUse Jobs
	 *
	 * @apiParam jobId Job ID
	 * @apiParam {String} user User
	 *
	 * @apiExample {post} Example usage:
	 * POST /acme/jobs/Job1/alice HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * {}
	 */
	router.post("/jobs/:jobId/:user", routeDeprecated(httpVerbs.PATCH, "/v5/teamspaces/{teamspace}/roles/{role}"));

	/**
	 * @api {delete} /:teamspace/jobs/:jobId Delete a job
	 * @apiName deleteJob
	 * @apiGroup Jobs
	 * @apiDescription Delete a job from teamspace.
	 *
	 * @apiUse Jobs
	 *
	 * @apiParam {String} jobId Job ID
	 *
	 * @apiExample {delete} Example usage:
	 * DELETE /acme/jobs/Job 1 HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response
	 * HTTP/1.1 200 OK
	 * {}
	 */
	router.delete("/jobs/:jobId", routeDeprecated(httpVerbs.DELETE, "/v5/teamspaces/{teamspace}/roles/{role}"));

	module.exports = router;
}());
