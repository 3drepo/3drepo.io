/**
 *  Copyright (C) 2021 3D Repo Ltd
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
const {map, compact, uniq} = require("lodash");
const responseCodes = require("../response_codes.js");
const C = require("../constants.js");
const db = require("../handler/db");
const { sanitiseRegex } = require(`${v5Path}/utils/helper/strings.js`);

const JOBS_COLLECTION_NAME = "jobs";

const Job = {};

Job.addUserToJob = async function(teamspace, jobName, user) {
	// Check if user is member of teamspace
	const User = require("./user");
	await User.teamspaceMemberCheck(user, teamspace);

	const job = await Job.findByJob(teamspace, jobName);

	if (!job) {
		return Promise.reject(responseCodes.JOB_NOT_FOUND);
	}

	await Job.removeUserFromAnyJob(teamspace, user);

	job.users.push(user);

	return db.updateOne(teamspace, JOBS_COLLECTION_NAME, {_id: jobName}, {$set: {users: job.users}});
};

Job.findByJob = async function(teamspace, jobName, caseSensitive = true) {
	const query = caseSensitive ? { _id: jobName } : { _id: new RegExp(sanitiseRegex(jobName), "i")};
	const foundJob = await db.findOne(teamspace, JOBS_COLLECTION_NAME, query);

	if (foundJob && !foundJob.users) {
		foundJob.users = [];
	}

	return foundJob;
};

Job.findJobByUser = async function(teamspace, user) {
	const foundJob = await db.findOne(teamspace, JOBS_COLLECTION_NAME, {users: user});

	if (foundJob && !foundJob.users) {
		foundJob.users = [];
	}

	return foundJob;
};

Job.findUsersWithJobs = async function(teamspace, jobNames) {
	const foundJobs = await db.find(teamspace, JOBS_COLLECTION_NAME, { _id: { $in: jobNames } });

	return foundJobs.reduce((users, jobItem) => users.concat(jobItem.users), []);
};

Job.getUserJob = async function(teamspace, user) {
	const foundJob = await Job.findJobByUser(teamspace, user);

	return foundJob ? {
		_id: foundJob._id,
		color: foundJob.color
	} : {};
};

Job.removeUserFromAnyJob = async function(teamspace, user) {
	const job = await Job.findJobByUser(teamspace, user);

	if (job) {
		await Job.removeUserFromJob(teamspace, job._id, user);
	}
};

Job.removeUserFromJob = async function(teamspace, jobName, user) {
	const job = await Job.findByJob(teamspace, jobName);
	let result;

	if (!job) {
		throw responseCodes.JOB_NOT_FOUND;
	}

	if (job.users) {
		job.users.splice(job.users.indexOf(user), 1);
		result = await db.updateOne(teamspace, JOBS_COLLECTION_NAME, {_id: jobName}, {$set: {users: job.users}});
	}

	return result;
};

Job.usersWithJob = async function(teamspace) {
	const foundJobs = await db.find(teamspace, JOBS_COLLECTION_NAME, {}, {_id: 1, users : 1});
	const userToJob = {};

	foundJobs.forEach(job => {
		if (job.users) {
			job.users.forEach(user => {
				userToJob[user] = job._id;
			});
		}
	});

	return userToJob;
};

module.exports = Job;

