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
const responseCodes = require("../response_codes.js");
const db = require("../handler/db");
const { UUIDToString, stringToUUID } = require(`${v5Path}/utils/helper/uuids.js`);

const JOBS_COLLECTION_NAME = "jobs";

const Job = {};

Job.addUserToJob = async function(teamspace, jobId, user) {
	// Check if user is member of teamspace
	const User = require("./user");
	await User.teamspaceMemberCheck(user, teamspace);

	const job = await Job.findByJob(teamspace, jobId);

	if (!job) {
		return Promise.reject(responseCodes.JOB_NOT_FOUND);
	}

	if(!job.users.includes(user)) {
		job.users.push(user);

		await db.updateOne(teamspace, JOBS_COLLECTION_NAME, {_id: job._id}, {$set: {users: job.users}});
	}
};

Job.findByJob = async function(teamspace, jobId) {
	const foundJob = await db.findOne(teamspace, JOBS_COLLECTION_NAME,  { _id: stringToUUID(jobId) });

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

Job.findUsersWithJobs = async function(teamspace, jobIds) {
	const foundJobs = await db.find(teamspace, JOBS_COLLECTION_NAME, { _id: { $in: jobIds.map(stringToUUID) } });

	return foundJobs.reduce((users, jobItem) => users.concat(jobItem.users), []);
};

Job.removeUserFromAnyJob = (teamspace, userToRemove) => db.updateMany(teamspace, JOBS_COLLECTION_NAME, { users: userToRemove }, { $pull: { users: userToRemove } });

Job.usersWithJob = async function(teamspace) {
	const foundJobs = await db.find(teamspace, JOBS_COLLECTION_NAME, {}, {_id: 1, users : 1});
	const userToJob = {};

	foundJobs.forEach(job => {
		if (job.users) {
			job.users.forEach(user => {
				userToJob[user] = UUIDToString(job._id);
			});
		}
	});

	return userToJob;
};

module.exports = Job;

