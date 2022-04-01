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

const { addDefaultJobs, assignUserToJob, getJobsToUsers } = require('../../models/jobs');
const { createTeamspaceRole, grantTeamspaceRoleToUser } = require('../../models/roles');
const { createTeamspaceSettings, getMembersInfo } = require('../../models/teamspaces');
const { getAccessibleTeamspaces, grantTeamspacePermissionsToUser } = require('../../models/users');
const { DEFAULT_JOBS } = require('../../models/jobs.constants');
const { isTeamspaceAdmin } = require('../../utils/permissions/permissions');
const { logger } = require('../../utils/logger');

const Teamspaces = {};

Teamspaces.initTeamspace = async (username) => {
	try {
		await createTeamspaceRole(username);
		await Promise.all([
			grantTeamspaceRoleToUser(username, username),
			addDefaultJobs(username),
			createTeamspaceSettings(username),
			grantTeamspacePermissionsToUser(username, username, ['teamspace_admin']),			
		]);
		await assignUserToJob(username, DEFAULT_JOBS.find((j) => j._id === 'Admin')._id, username);
	} catch (err) {
		logger.logError(`Failed to initialize teamspace for ${username}`);
	}
};

Teamspaces.getTeamspaceListByUser = async (user) => {
	const tsList = await getAccessibleTeamspaces(user);
	return Promise.all(tsList.map(async (ts) => ({ name: ts, isAdmin: await isTeamspaceAdmin(ts, user) })));
};

Teamspaces.getTeamspaceMembersInfo = async (teamspace) => {
	const [membersList, jobsList] = await Promise.all([
		getMembersInfo(teamspace),
		getJobsToUsers(teamspace),
	]);

	const usersToJob = {};
	jobsList.forEach(({ _id, users }) => {
		users.forEach((user) => {
			usersToJob[user] = _id;
		});
	});

	return membersList.map(
		(member) => (usersToJob[member.user] ? { ...member, job: usersToJob[member.user] } : member),
	);
};

module.exports = Teamspaces;
