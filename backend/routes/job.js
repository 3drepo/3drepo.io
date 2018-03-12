/**
 *  Copyright (C) 2017 3D Repo Ltd
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

(function() {
	"use strict";

	const express = require('express');
	const router = express.Router({mergeParams: true});
	const responseCodes = require('../response_codes');
	const middlewares = require('../middlewares/middlewares');
	const Job = require("../models/job");
	const utils = require("../utils");

	router.post("/jobs", middlewares.job.canCreate, createJob);
	router.put("/jobs/:jobId", middlewares.job.canCreate, updateJob);
	router.get("/jobs", middlewares.job.canView, listJobs);
	router.delete("/jobs/:jobId", middlewares.job.canDelete, deleteJob);


	function createJob(req, res, next){

		const newJob = {
			_id: req.body._id,
			color: req.body.color
		};

		Job.addJob(req.params.account, job).then(() => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, newJob);
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});

	}

	function updateJob(req, res, next){
	
		if(!req.body._id) {
			return Promise.reject(responseCodes.JOB_ID_INVALID);
		}
		Job.findByJob(req.params.account, req.body._id).then( job => {
			return job.updateJob(req.body).then(() => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});
			});
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
		
	}

	function deleteJob(req, res, next){

		Job.removeJob(req.params.account, req.params.jobId).then(() => {
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});

		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	function listJobs(req, res, next){
		Job.getAllJobs(req.params.account).then(jobs => {
			console.log(jobs);
			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, jobs);
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	module.exports = router;
}());
