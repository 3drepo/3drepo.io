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
const ModelFactory = require('./factory/modelFactory');
const responseCodes = require('../response_codes.js');
const schema = mongoose.Schema({
	_id: String,
	color: String,
	users: [String]
});


schema.statics.findByJob = function(teamspace, job) {
	return this.findOne({account: "teamspace"}, {_id: job});
}

schema.statics.addJob = function(teamspace, jobData) {
	if(!job._id) {
		return Promise.reject(responseCodes.JOB_ID_INVALID);
	}
	
	return this.findByJob(teamspace, jobData._id).then(jobFound => {
		if(jobFound) {
			return Promise.reject(responseCodes.DUP_JOB);
		}
		
		const newJobEntry = this.model('Job').createInstance({account: teamspace});
		newJobEntry.save();


	});
}

schema.methods.updateJob = function(updatedData) {
	if(updateData.color)
		this.color = updatedData.color;

	return this.save();
}

schema.statics.removeJob = function(teamspace, jobName) {

	return this.findByJob(teamspace, jobName).then(jobFound => {
		if(!jobFound) {
			return Promise.reject(responseCodes.JOB_NOT_FOUND);
		}
	
		if(jobFound.users.length > 0) {
			return Promise.reject(responseCodes.JOB_ASSIGNED);	
		}

		return Job.remove({account: teamspace}, {_id: jobName});

	});


}

schema.statics.getAllJobs = function(teamspace) {
	return this.find({account: teamspace}).then(jobs => {
		const jobList = [];
		jobs.forEach(job => {
			jobList.push({_id: job._id, color: job.color});
		});
		return jobList;
	});

}

var Job = ModelFactory.createClass(
	'Job',
	schema,
	() => {
		return "jobs";
	});
module.exports = Job;

