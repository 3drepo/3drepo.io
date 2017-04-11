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

(() => {
	"use strict";

	const mongoose = require("mongoose");
	const jobSchema = mongoose.Schema({
		_id: String,
		color: String
	});
	const responseCodes = require('../response_codes.js');

	const Job = {

		init: function(user, jobs) {
			console.log('init called');
			this.user = user;
			this.jobs = jobs;
			return this;
		},

		add: function(job) {
			if (!this.jobs.find(myJob => myJob._id == job._id)){
				this.jobs.push(job);
				return this.user.save();
			} else {
				return Promise.reject(responseCodes.DUP_JOB);
			}

		},

		remove: function(name){

			let job = this.jobs.id(name);
		
			if(job){
				job.remove();
				return this.user.save();
			} else {
				return Promise.reject(responseCodes.JOB_NOT_FOUND);
			}
			
		}
	}

	// Mongoose doesn't support subschema static method
	module.exports = {
		schema: jobSchema,
		Job: Job
	};

})();