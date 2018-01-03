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


"use strict";

const mongoose = require("mongoose");
const schema = mongoose.Schema({
	_id: String,
	color: String
});
const responseCodes = require('../response_codes.js');

const methods = {

	init: function(user, jobs) {

		this.user = user;
		this.jobs = jobs;
		return this;
	},

	findById: function(id){
		return this.jobs.id(id);
	},

	add: function(job) {
		if(!job._id){
			return Promise.reject(responseCodes.JOB_ID_VALID);
		} else if (this.findById(job._id)){
			return Promise.reject(responseCodes.DUP_JOB);
		} else {
			this.jobs.push(job);
			return this.user.save();
		}

	},

	update: function(job) {
	
		const jobToUpdate = this.findById(job._id);

		if(!job._id){
			return Promise.reject(responseCodes.JOB_ID_VALID);
		}
		else if (!jobToUpdate) {
			return Promise.reject(responseCodes.JOB_NOT_FOUND);
		} else {
			jobToUpdate.color = job.color;
			return this.user.save();
		}

	},

	remove: function(name){

		let job = this.findById(name);
		let isInUse = false;	
		this.user.customData.billing.subscriptions.findByJob(name).forEach( sub => {
			//We can ignore empty subscriptions. So only return error code if 
			//not empty.
			if(sub.assignedUser) {
				isInUse = true;
			}
		});
		
		if (!job) {
			return Promise.reject(responseCodes.JOB_NOT_FOUND);
		} else if(isInUse) {
			return Promise.reject(responseCodes.JOB_ASSIGNED);
		}
		else {
			job.remove();
			return this.user.save();
		}
		
	},

	get: function(){
		return this.jobs;
	}
};

// Mongoose doesn't support subschema static method
module.exports = {
	schema, methods
};

