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

const { AVATARS_COL_NAME, USERS_DB_NAME } = require('../../models/users.constants');
const { addDefaultJobs, assignUserToJob, getJobsToUsers, removeUserFromJobs } = require('../../models/jobs');
const { countLicenses, createTeamspaceSettings, getAddOns, getMembersInfo, grantAdminToUser, removeUserFromAdminPrivilege } = require('../../models/teamspaceSettings');
const { createTeamspaceRole, grantTeamspaceRoleToUser, removeTeamspaceRole, revokeTeamspaceRoleFromUser } = require('../../models/roles');
const { getCollaboratorsAssigned, getQuotaInfo, getSpaceUsed } = require('../../utils/quota');
const { getFile, removeAllFilesFromTeamspace } = require('../../services/filesManager');
const { DEFAULT_OWNER_JOB } = require('../../models/jobs.constants');
const { addDefaultTemplates } = require('../../models/tickets.templates');
const { deleteFavourites } = require('../../models/users');
const { dropDatabase } = require('../../handler/db');
const { getAccessibleTeamspaces } = require('../../models/users');
const { isTeamspaceAdmin } = require('../../utils/permissions/permissions');
const { logger } = require('../../utils/logger');
const { removeAllTeamspaceNotifications } = require('../../models/notifications');
const { removeUserFromAllModels } = require('../../models/modelSettings');
const { removeUserFromAllProjects } = require('../../models/projectSettings');

const Teamspaces = {};

const removeAllUsersFromTS = async (teamspace) => {
	const members = await getMembersInfo(teamspace);
	await Promise.all(
		members.map(async ({ user }) => {
			await Promise.all([
				revokeTeamspaceRoleFromUser(teamspace, user),
				deleteFavourites(user, teamspace),
			]);
		}),
	);
};

Teamspaces.getAvatar = (teamspace) => getFile(USERS_DB_NAME, AVATARS_COL_NAME, teamspace);

Teamspaces.initTeamspace = async (username) => {
	try {
		await Promise.all([
			createTeamspaceRole(username),
			addDefaultJobs(username),
		]);
		await Promise.all([
			grantTeamspaceRoleToUser(username, username),
			createTeamspaceSettings(username),
			assignUserToJob(username, DEFAULT_OWNER_JOB, username),
			addDefaultTemplates(username),
		]);
		await grantAdminToUser(username, username);
	} catch (err) {
		logger.logError(`Failed to initialize teamspace for ${username}:${err.message}`);
	}
};

Teamspaces.removeTeamspace = async (teamspace) => {
	await Promise.all([
		removeAllUsersFromTS(teamspace),
		removeAllFilesFromTeamspace(teamspace),
		removeAllTeamspaceNotifications(teamspace),
	]);
	await Promise.all([
		dropDatabase(teamspace),
		removeTeamspaceRole(teamspace),
	]);
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

Teamspaces.getQuotaInfo = async (teamspace) => {
	const quotaInfo = await getQuotaInfo(teamspace, true);
	const spaceUsed = await getSpaceUsed(teamspace, true);
	const collaboratorsUsed = await getCollaboratorsAssigned(teamspace);

	return {
		freeTier: quotaInfo.freeTier,
		expiryDate: quotaInfo.expiryDate,
		data: { available: quotaInfo.data, used: spaceUsed },
		seats: { available: quotaInfo.collaborators, used: collaboratorsUsed },
	};
};

Teamspaces.removeTeamspaceMember = async (teamspace, userToRemove) => {
	await Promise.all([
		removeUserFromAllModels(teamspace, userToRemove),
		removeUserFromAllProjects(teamspace, userToRemove),
		removeUserFromAdminPrivilege(teamspace, userToRemove),
	]);

	await Promise.all([
		await removeUserFromJobs(teamspace, userToRemove),
		await revokeTeamspaceRoleFromUser(teamspace, userToRemove),
	]);
};

Teamspaces.getAddOns = getAddOns;

// map each teamspace to its name, aggregates (license count, quota info), and licenses based on the passed-in function
Teamspaces.getTeamspaceAggregatesAndLicenses = (teamspaces, getLicensesFunc) => Promise.all(
	teamspaces.map(async (teamspaceName) => {
		const [licenseCount, quotaInfo, spaceUsed, licenses] = await Promise.all([
			countLicenses(teamspaceName),
			getQuotaInfo(teamspaceName),
			getSpaceUsed(teamspaceName),
			getLicensesFunc(teamspaceName),
		]);
		return {
			teamspaceName,
			licenseCount,
			dataTotalMB: quotaInfo.data / (1024 * 1024),
			dataUsedMB: spaceUsed,
			licenses,
		};
	}));

module.exports = Teamspaces;
