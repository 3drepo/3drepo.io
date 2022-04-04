/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { v5Path } = require('../../../interop');
const { getTeamspaceList } = require('../utils');

const { findOne, updateOne, insertOne } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);

const addAdminJob = async (teamspace, username) => {
	// Check if user is assigned any job
	const userJob = await findOne(teamspace, 'jobs', { users: username }, { _id: 1 });
	if (!userJob) {
		// Check if admin job exists
		const adminJob = await findOne(teamspace, 'jobs', { _id: 'Admin' }, { _id: 1 });
		if (!adminJob) {
			await insertOne(teamspace, 'jobs', { _id: 'Admin', color: '#f7f7b2', users: [username] });
		} else {
			await updateOne(teamspace, 'jobs', { _id: 'Admin' }, { $push: { users: username } });
		}
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (let i = 0; i < teamspaces.length; ++i) {
		logger.logInfo(`\t\t-${teamspaces[i]}`);
		// eslint-disable-next-line no-await-in-loop
		await addAdminJob(teamspaces[i], teamspaces[i]);
	}
};

module.exports = run;
