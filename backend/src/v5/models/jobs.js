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

const findMany = (ts, query, projection, sort) => db.find(ts, COL_NAME, query, projection, sort);
const updateOne = (ts, query, action) => db.updateOne(ts, COL_NAME, query, action);
const updateMany = (ts, query, action) => db.updateMany(ts, COL_NAME, query, action);

Jobs.getJobsToUsers = (teamspace) => findMany(teamspace, {}, { _id: 1, users: 1 });

Jobs.getJobs = (teamspace) => findMany(teamspace, {}, { _id: 1, color: 1 });

Jobs.addDefaultJobs = async (teamspace) => {
	await db.insertMany(teamspace, COL_NAME, DEFAULT_JOBS.map((job) => ({ ...job, users: [] })));
};

Jobs.assignUserToJob = async (teamspace, job, username) => {
	await updateOne(teamspace, { _id: job }, { $push: { users: username } });
};

Jobs.removeUserFromJobs = async (teamspace, userToRemove) => {
	await updateMany(teamspace, { users: userToRemove }, { $pull: { users: userToRemove } });
};

Jobs.getAccessibleJobs = async (teamspace, users) => {
	const jobs = await findMany(teamspace, { users: { $in: users } }, { _id: 1 });
	return jobs.map((j) => j._id);
};

module.exports = Jobs;
