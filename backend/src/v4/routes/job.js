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
	 * @apiBody {String} _id Name of job
	 * @apiBody {String} color Colour of job
	 * @apiSuccess (Job object) {String} _id Name of job
	 * @apiSuccess (Job object) {String} color Colour of job
	 *
	 * @apiExample {post} Example usage:
	 * POST /acme/jobs HTTP/1.1
	 * {
	 * 	"_id":"Job4",
	 * 	"color":"#ffff00"
	 * }
	 *
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 * {
	 * 	"_id":"Job4",
	 * 	"color":"#ffff00"
	 * }
	 */
	router.post("/jobs", middlewares.formatV5NewModelParams, middlewares.job.canCreate, createJob);

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
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 * {
	 * 	"_id":"Job1",
	 * 	"color":"#ff0000"
	 * }
	 */
	router.get("/myJob", middlewares.isTeamspaceMember, getUserJob);

	/**
	 * @api {put} /:teamspace/jobs/:jobId Update job
	 * @apiName updateJob
	 * @apiGroup Jobs
	 * @apiDescription Update job.
	 *
	 * @apiUse Jobs
	 *
	 * @apiParam {String} jobId Job ID
	 * @apiBody {String} _id Name of job
	 * @apiBody {String} color Colour of job
	 *
	 * @apiExample {put} Example usage:
	 * PUT /acme/jobs/Job1 HTTP/1.1
	 * {
	 * 	"_id":"Renamed Job",
	 * 	"color":"#00ffff"
	 * }
	 *
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 * {}
	 */
	router.put("/jobs/:jobId", middlewares.formatV5NewModelParams, middlewares.job.canCreate, updateJob);

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
	 * @apiSuccessExample {json} Success-Response:
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
	router.get("/jobs", middlewares.isTeamspaceMember, listJobs);

	/**
	 * @api {post} /:teamspace/jobs/:jobId/:user Assign a job
	 * @apiName addUserToJob
	 * @apiGroup Jobs
	 * @apiDescription Assign a job to a user.
	 *
	 * @apiUse Jobs
	 *
	 * @apiParam {String} jobId Job ID
	 * @apiParam {String} user User
	 *
	 * @apiExample {post} Example usage:
	 * POST /acme/jobs/Job1/alice HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 * {}
	 */
	router.post("/jobs/:jobId/:user", middlewares.formatV5NewModelParams, middlewares.job.canCreate, addUserToJob);

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
	 * DELETE /acme/jobs/Job1 HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 * {}
	 */
	router.delete("/jobs/:jobId", middlewares.formatV5NewModelParams, middlewares.job.canDelete, deleteJob);

	/**
	 * @api {get} /:teamspace/jobs/colors List colours
	 * @apiName listColors
	 * @apiGroup Jobs
	 * @apiDescription List job colours.
	 *
	 * @apiUse Jobs
	 *
	 * @apiSuccess {String[]} colors List of job colours
	 *
	 * @apiExample {get} Example usage:
	 * GET /acme/jobs/colors HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success-Response:
	 * HTTP/1.1 200 OK
	 * [
	 * 	"#ff0000",
	 * 	"#00ff00",
	 * 	"#0000ff"
	 * ]
	 */
	router.get("/jobs/colors", middlewares.isTeamspaceMember, listColors);

	function addUserToJob(req, res, next) {
		Job.addUserToJob(req.params.account, req.params.jobId, req.params.user).then(() => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function getUserJob(req, res, next) {
		// middleware checks if user is in teamspace, so this member check should not be necessary here.
		Job.getUserJob(req.params.account, req.session.user.username).then((job) => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, job);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function createJob(req, res, next) {
		const newJob = {
			_id: req.body._id,
			color: req.body.color
		};

		Job.addJob(req.params.account, newJob).then(() => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, newJob);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function updateJob(req, res, next) {
		Job.updateJob(req.params.account, req.params.jobId, req.body).then(() => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function deleteJob(req, res, next) {
		Job.removeJob(req.params.account, req.params.jobId).then(() => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function listJobs(req, res, next) {
		Job.getAllJobs(req.params.account).then(jobs => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, jobs);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function listColors(req, res, next) {
		Job.getAllColors(req.params.account).then(colors => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, colors);
		}).catch(err => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	module.exports = router;
}());
