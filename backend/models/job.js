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
const db = require("../handler/db");
const schema = mongoose.Schema({
	_id: String,
	color: String,
	users: [String]
});

function validateJobName(job) {
	const regex = "^[^/?=#+]{0,119}[^/?=#+ ]{1}$";
	return job && job.match(regex);
}

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
	return Job.findByJob(teamspace, jobData._id).then(jobFound => {
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

schema.statics.findByJob = function(teamspace, job) {
	return this.findOne({account: teamspace}, {_id: job});
};

function getCollection(teamspace) {
	return db.getCollection(teamspace, "jobs");
}

const Job = ModelFactory.createClass(
	"Job",
	schema,
	() => {
		return "jobs";
	});

Job.addDefaultJobs = function(teamspace) {
	const promises = [];

	C.DEFAULT_JOBS.forEach(job => {
		promises.push(Job.addJob(teamspace, job));
	});

	return Promise.all(promises);
};

/*
Job.addUserToJob = async function(teamspace, user, jobName) {
	console.log("addUserToJob");
	console.log(teamspace)
	console.log(user);
	console.log(jobName);
	// Check if user is member of teamspace
	const User = require("./user");
	await User.teamspaceMemberCheck(teamspace, user);

	const job = await Job.findByJob(teamspace, jobName);
	console.log("job");
	console.log(job);

	if (!job) {
		return Promise.reject(responseCodes.JOB_NOT_FOUND);
	}

	await Job.removeUserFromAnyJob(teamspace, user);

	console.log("job2");
	console.log(job);
	job.users.push(user);

	console.log("job3");
	console.log(job);
	const jobsColl = await getCollection(teamspace);
	const result = jobsColl.update({_id: jobName}, job);
	console.log(result);
	console.log(await result);
	// error due to cyclic dependency on serialisation
	// rejected> Error: cyclic dependency detected
	// at serializeObject (/Users/charencewong/Workspace/3drepo.io/backend/node_modules/bson/lib/bson/parser/serializer.js:333:34)
	// at serializeInto (/Users/charencewong/Workspace/3drepo.io/backend/node_modules/bson/lib/bson/parser/serializer.js:937:17)
	return result;
};
*/

/*
Job.findByJob = async function(teamspace, job) {
	console.log("findByJob");
	console.log("teamspace");
	console.log(teamspace);
	console.log("job");
	console.log(job);
	const jobsColl = await getCollection(teamspace);
	console.log("jobsColl");
	console.log(jobsColl);
	const foundJob = await jobsColl.findOne({_id: job});

	console.log("foundJob");
	console.log(foundJob);
	return foundJob;
};
*/

Job.findByUser = async function(teamspace, user) {
	const jobsColl = await getCollection(teamspace);
	const foundJob = await jobsColl.findOne({users: user});

	if (foundJob) {
		if (!foundJob.color) {
			foundJob.color = [];
		}

		if (!foundJob.users) {
			foundJob.users = [];
		}
	}

	return foundJob;
};

Job.findUsersWithJobs = async function(teamspace, jobNames) {
	const jobsColl = await getCollection(teamspace);
	const foundJobs = await (await jobsColl.find({ _id: { $in: jobNames } })).toArray();

	return foundJobs.reduce((users, jobItem) => users.concat(jobItem.users), []);
};

Job.getAllColors = async function(teamspace) {
	const jobs = await Job.getAllJobs(teamspace);
	return compact(uniq(map(jobs, "color")));
};

Job.getAllJobs = async function(teamspace) {
	const jobsColl = await getCollection(teamspace);
	const jobs = await (await jobsColl.find()).toArray();

	return jobs.map(({_id, color}) => {
		return {_id, color};
	});
};

Job.removeJob = async function(teamspace, jobName) {
	const foundJob = await Job.findByJob(teamspace, jobName);

	if (!foundJob) {
		throw responseCodes.JOB_NOT_FOUND;
	}

	if (foundJob.users.length > 0) {
		throw responseCodes.JOB_ASSIGNED;
	}

	const jobsColl = await getCollection(teamspace);
	return jobsColl.remove({_id: jobName});
};

Job.removeUserFromAnyJob = async function(teamspace, user) {
	const job = await Job.findByUser(teamspace, user);
	let result;

	if (job) {
		result = Job.removeUserFromJob(teamspace, job._id, user);
	}

	return result;
};

Job.removeUserFromJob = async function(teamspace, jobName, user) {
	const foundJob = await Job.findByJob(teamspace, jobName);
	let result;

	if (!foundJob) {
		throw responseCodes.JOB_NOT_FOUND;
	}

	if (foundJob.users) {
		const jobsColl = await getCollection(teamspace);
		foundJob.users.splice(foundJob.users.indexOf(user), 1);
		result = await jobsColl.update({_id: jobName}, {
			user: foundJob.users,
			color: foundJob.color
		});
	}

	return result;
};

Job.updateJob = async function(teamspace, jobName, updatedData) {
	if (!jobName) {
		throw responseCodes.JOB_ID_INVALID;
	}

	const foundJob = await Job.findByJob(teamspace, jobName);
	let result;

	if (!foundJob) {
		throw responseCodes.JOB_NOT_FOUND;
	}

	if (updatedData.color) {
		const jobsColl = await getCollection(teamspace);
		result = await jobsColl.update({_id: jobName}, {
			users: foundJob.users,
			color: updatedData.color
		});
	}

	return result;
};

Job.usersWithJob = async function(teamspace) {
	const jobsColl = await getCollection(teamspace);
	const jobs = await (await jobsColl.find({}, {_id: 1, users : 1})).toArray();
	const userToJob = {};

	jobs.forEach(job => {
		if (job.users) {
			job.users.forEach(user => {
				userToJob[user] = job._id;
			});
		}
	});

	return userToJob;
};

module.exports = Job;

