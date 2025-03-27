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
const { addUserToAccount, createAccount, createUser, getUserById, removeAccount, removeUserFromAccount } = require('../../services/sso/frontegg');
const { createIndex, dropDatabase } = require('../../handler/db');
const { createTeamspaceRole, grantTeamspaceRoleToUser, removeTeamspaceRole, revokeTeamspaceRoleFromUser } = require('../../models/roles');
const {
	createTeamspaceSettings,
	getAddOns,
	getMembersInfo,
	getTeamspaceRefId,
	grantAdminToUser,
	removeUserFromAdminPrivilege,
} = require('../../models/teamspaceSettings');
const { deleteFavourites, getAccessibleTeamspaces, getUserByUsername, getUserId, updateUserId } = require('../../models/users');
const { getCollaboratorsAssigned, getQuotaInfo, getSpaceUsed } = require('../../utils/quota');
const { getFile, removeAllFilesFromTeamspace } = require('../../services/filesManager');
const { COL_NAME } = require('../../models/projectSettings.constants');
const { DEFAULT_OWNER_JOB } = require('../../models/jobs.constants');
const { addDefaultTemplates } = require('../../models/tickets.templates');
const { isTeamspaceAdmin } = require('../../utils/permissions');
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

Teamspaces.initTeamspace = async (teamspaceName, owner) => {
	try {
		const teamspaceId = await createAccount(teamspaceName);
		await Promise.all([
			createTeamspaceRole(teamspaceName),
			addDefaultJobs(teamspaceName),
			createIndex(teamspaceName, COL_NAME, { name: 1 }, { unique: true }),
		]);
		await Promise.all([
			createTeamspaceSettings(teamspaceName, teamspaceId),
			assignUserToJob(teamspaceName, DEFAULT_OWNER_JOB, owner),
			addDefaultTemplates(teamspaceName),
		]);
		await Promise.all([
			Teamspaces.addTeamspaceMember(teamspaceName, owner),
			grantAdminToUser(teamspaceName, owner),
		]);
	} catch (err) {
		logger.logError(`Failed to initialize teamspace for ${teamspaceName}:${err.message}`);
		throw err;
	}
};

Teamspaces.removeTeamspace = async (teamspace) => {
	const teamspaceRef = await getTeamspaceRefId(teamspace);
	await Promise.all([
		removeAllUsersFromTS(teamspace),
		removeAllFilesFromTeamspace(teamspace),
		removeAllTeamspaceNotifications(teamspace),
	]);
	await Promise.all([
		dropDatabase(teamspace),
		removeTeamspaceRole(teamspace),
		removeAccount(teamspaceRef),
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

Teamspaces.addTeamspaceMember = async (teamspace, userToAdd) => {
	const [accountId, userId] = await Promise.all([
		getTeamspaceRefId(teamspace),
		getUserId(userToAdd),

	]);

	// double check the user is known in frontegg, it could've been deleted
	// and we are out of sync.
	const userExistsInFrontegg = await getUserById(userId).catch(() => false);

	if (userExistsInFrontegg) {
		await addUserToAccount(accountId, userId);
	} else {
		const { customData: { email, firstName, lastName } } = await getUserByUsername(userToAdd, {
			'customData.email': 1,
			'customData.firstName': 1,
			'customData.lastName': 1,
		});

		const newUserId = await createUser(accountId, email, [firstName, lastName].join(' '));

		await updateUserId(userToAdd, newUserId);
	}

	await grantTeamspaceRoleToUser(teamspace, userToAdd);
};

Teamspaces.removeTeamspaceMember = async (teamspace, userToRemove, removePermissions = true) => {
	const [accountId, userId] = await Promise.all([
		getTeamspaceRefId(teamspace),
		getUserId(userToRemove),
		...(removePermissions ? [
			removeUserFromAllModels(teamspace, userToRemove),
			removeUserFromAllProjects(teamspace, userToRemove),
			removeUserFromAdminPrivilege(teamspace, userToRemove),
		] : []),
	]);

	await Promise.all([
		removePermissions ? removeUserFromJobs(teamspace, userToRemove) : Promise.resolve(),
		removeUserFromAccount(accountId, userId),
		revokeTeamspaceRoleFromUser(teamspace, userToRemove),
	]);
};

Teamspaces.getAddOns = getAddOns;

module.exports = Teamspaces;
