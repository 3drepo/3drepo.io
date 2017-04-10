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
	const middlewares = require('./middlewares');
	const User = require("../models/user");
	const utils = require("../utils");

	router.post("/jobs", middlewares.isAccountAdmin, createJob);
	router.delete("/jobs/:jobId", middlewares.isAccountAdmin, deleteJob);


	function createJob(req, res, next){

		User.findByUserName(req.params.account).then(user => {

	
			return user.customData.jobs.add({
				_id: req.body._id,
				color: req.body.color
			});

		}).then(user => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, user.customData.jobs);
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
		
	}

	function deleteJob(req, res, next){

		User.findByUserName(req.params.account).then(user => {

			return user.customData.jobs.remove(req.params.jobId);

		}).then(user => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {});
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
	}

	module.exports = router;
}());
