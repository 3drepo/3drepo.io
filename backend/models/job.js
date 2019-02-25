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

const {map, compact, uniq} = require("lodash");
const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const responseCodes = require("../response_codes.js");
const C = require("../constants.js");
const schema = mongoose.Schema({
	_id: String,
	color: String,
	users: [String]
});

function validateJobName(job) {
	const regex = "^[^/?=#+]{0,119}[^/?=#+ ]{1}$";
	return job && job.match(regex);
}

schema.statics.addDefaultJobs = function(teamspace) {
	const promises = [];
	C.DEFAULT_JOBS.forEach(job => {
		promises.push(this.addJob(teamspace, job));
	});

	return Promise.all(promises);

};

schema.statics.usersWithJob = function(teamspace) {
	return this.find({account: teamspace}, {}, {_id: 1, users : 1}).then((jobs) => {
		const userToJob  = {};

		jobs.forEach(job => {
			job.users.forEach(user => {
				userToJob[user] = job._id;
			});
		});

		return userToJob;

	});

};

schema.statics.removeUserFromAnyJob = function(teamspace, user) {
	return Job.findByUser(teamspace, user).then(job => {
		if(job) {
			return job.removeUserFromJob(user);
		}
	});

};

schema.methods.removeUserFromJob = function(user) {
	this.users.splice(this.users.indexOf(user), 1);
	return this.save();
};

schema.statics.findByJob = function(teamspace, job) {
	return this.findOne({account: teamspace}, {_id: job});

};

schema.statics.findByUser = function(teamspace, user) {
	return this.findOne({account: teamspace}, {users: user});
};

schema.statics.removeUserFromJobs = function(teamspace, user) {
	const User = require("./user");
	return User.teamspaceMemberCheck(teamspace, user).then(() => {
		return Job.removeUserFromAnyJob(teamspace, user);
	});

};

schema.statics.addUserToJob = function(teamspace, user, jobName) {
	// Check if user is member of teamspace
	const User = require("./user");
	return User.teamspaceMemberCheck(teamspace, user).then(() => {
		return Job.findByJob(teamspace, jobName).then((job) => {
			if(!job) {
				return Promise.reject(responseCodes.JOB_NOT_FOUND);
			}

			return Job.removeUserFromAnyJob(teamspace, user).then(() => {
				job.users.push(user);
				return job.save();
			});

		});
	});
};

schema.statics.addJob = function(teamspace, jobData) {
	if(!jobData._id || !validateJobName(jobData._id)) {
		return Promise.reject(responseCodes.JOB_ID_INVALID);
	}
	return this.findByJob(teamspace, jobData._id).then(jobFound => {
		if(jobFound) {
			return Promise.reject(responseCodes.DUP_JOB);
		}

		const newJobEntry = this.model("Job").createInstance({account: teamspace});
		newJobEntry._id = jobData._id;
		if(jobData.color) {
			newJobEntry.color = jobData.color;
		}
		return newJobEntry.save();
	});
};

schema.methods.updateJob = function(updatedData) {
	if(updatedData.color) {
		this.color = updatedData.color;
	}

	return this.save();
};

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

};

schema.statics.getAllJobs = function(teamspace) {
	return this.find({account: teamspace}).then(jobs => {
		return jobs.map(({_id, color}) => {
			return {_id, color};
		});
	});
};

schema.statics.getAllColors = function(teamspace) {
	return Job.getAllJobs(teamspace).then((jobs) => {
		return compact(uniq(map(jobs, "color")));
	});
};

const Job = ModelFactory.createClass(
	"Job",
	schema,
	() => {
		return "jobs";
	});
module.exports = Job;

