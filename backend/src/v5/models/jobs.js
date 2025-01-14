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

const Jobs = {};

const COL_NAME = 'jobs';
const { DEFAULT_JOBS } = require('./jobs.constants');
const db = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');
const { templates } = require('../utils/responseCodes');

const findOne = (ts, query, projection) => db.findOne(ts, COL_NAME, query, projection);
const findMany = (ts, query, projection, sort) => db.find(ts, COL_NAME, query, projection, sort);
const updateOne = (ts, query, action) => db.updateOne(ts, COL_NAME, query, action);
const updateMany = (ts, query, action) => db.updateMany(ts, COL_NAME, query, action);

Jobs.getJobsToUsers = (teamspace) => findMany(teamspace, {}, { _id: 1, users: 1 });

Jobs.getJobs = (teamspace, projection = { _id: 1, color: 1 }) => findMany(teamspace, {}, projection);

Jobs.getJobById = async (teamspace, jobId, projection) => {
	const job = await findOne(teamspace, { _id: jobId }, projection);

	if (!job) {
		throw templates.jobNotFound;
	}

	return job;
};

Jobs.addDefaultJobs = async (teamspace) => {
	await db.insertMany(teamspace, COL_NAME, DEFAULT_JOBS.map((job) => ({ ...job, users: [] })));
};

Jobs.assignUserToJob = async (teamspace, job, username) => {
	await updateOne(teamspace, { _id: job }, { $push: { users: username } });
};

Jobs.removeUserFromJobs = async (teamspace, userToRemove) => {
	await updateMany(teamspace, { users: userToRemove }, { $pull: { users: userToRemove } });
};

Jobs.getJobsByUsers = async (teamspace, users) => {
	const jobs = await findMany(teamspace, { users: { $in: users } }, { _id: 1 });
	return jobs.map((j) => j._id);
};

Jobs.createJob = async (teamspace, job) => {
	const addedJob = { _id: generateUUID(), ...job };
	await db.insertOne(teamspace, COL_NAME, addedJob);
	return addedJob._id;
};

Jobs.updateJob = (teamspace, job, updatedJob) => updateOne(teamspace, { _id: job }, { $set: updatedJob });

Jobs.deleteJob = (teamspace, job) => db.deleteOne(teamspace, COL_NAME, { _id: job });

module.exports = Jobs;
