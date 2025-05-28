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
const { addUserToAccount, createAccount, getAllUsersInAccount, getUserStatusInAccount, removeAccount, removeUserFromAccount } = require('../../services/sso/frontegg');
const { createIndex, dropDatabase } = require('../../handler/db');
const { createTeamspaceRole, grantTeamspaceRoleToUser, removeTeamspaceRole, revokeTeamspaceRoleFromUser } = require('../../models/roles');
const {
	createTeamspaceSettings,
	getAddOns,
	getTeamspaceRefId,
	getTeamspaceSetting,
	grantAdminToUser,
	removeUserFromAdminPrivilege,
} = require('../../models/teamspaceSettings');
const { deleteFavourites, getAccessibleTeamspaces, getUserByUsername, getUserId, getUserInfoFromEmailArray, getUserInfoFromId, updateProfile, updateUserId } = require('../../models/users');
const { getCollaboratorsAssigned, getQuotaInfo, getSpaceUsed } = require('../../utils/quota');
const { getFile, removeAllFilesFromTeamspace } = require('../../services/filesManager');
const { COL_NAME } = require('../../models/projectSettings.constants');
const { DEFAULT_OWNER_JOB } = require('../../models/jobs.constants');
const { addDefaultTemplates } = require('../../models/tickets.templates');
const { createNewUserRecord } = require('../users');
const { getUserById } = require('../../services/sso/frontegg');
const { isTeamspaceAdmin } = require('../../utils/permissions');
const { logger } = require('../../utils/logger');
const { membershipStatus } = require('../../services/sso/frontegg/frontegg.constants');
const { removeAllTeamspaceNotifications } = require('../../models/notifications');
const { removeUserFromAllModels } = require('../../models/modelSettings');
const { removeUserFromAllProjects } = require('../../models/projectSettings');

const Teamspaces = {};

const removeAllUsersFromTS = async (teamspace) => {
	const membersList = await Teamspaces.getAllMembersInTeamspace(teamspace);
	await Promise.all(
		membersList.map(async ({ user }) => {
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

Teamspaces.getAllMembersInTeamspace = async (teamspace) => {
	const { refId: tenantId } = await getTeamspaceSetting(teamspace, { refId: 1 });
	const frontEggUsers = await getAllUsersInAccount(tenantId);
	const membersData = await getUserInfoFromEmailArray(frontEggUsers.map((user) => user.email));

	// check any unfound users
	if (frontEggUsers.length !== membersData.length) {
		const foundUsersEmails = membersData.map((userData) => userData.email);
		const unfoundUsers = frontEggUsers.filter(({ email }) => !foundUsersEmails.includes(email));

		unfoundUsers.forEach(async ({ id, email }) => {
			const userStatus = await getUserStatusInAccount(tenantId, id);
			if (userStatus === membershipStatus.ACTIVE) {
				logger.logDebug(`User not found: ${id}, creating user based on info from IDP...`);

				const userData = await getUserById(id);
				await createNewUserRecord(userData);

				membersData.push(await getUserInfoFromId(email));
			}
		});
	}

	// check id discrepancies
	membersData.forEach(async ({ user, email, userId }) => {
		const { id } = frontEggUsers.filter((frontEggUserData) => frontEggUserData.email === email)[0];

		// update the mongo userId to match
		if (userId !== id) await updateProfile(user, { userId: id });
	});

	return membersData.map((memberData) => ({
		user: memberData.user,
		firstName: memberData.firstName,
		lastName: memberData.lastName,
		company: memberData?.company,
	}));
};

Teamspaces.getTeamspaceMembersInfo = async (teamspace) => {
	const membersList = await Teamspaces.getAllMembersInTeamspace(teamspace);
	const jobsList = await getJobsToUsers(teamspace);
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

Teamspaces.addTeamspaceMember = async (teamspace, userToAdd, invitedBy) => {
	const userQueryProjection = {
		'customData.email': 1,
		'customData.userId': 1,
		'customData.firstName': 1,
		'customData.lastName': 1,
	};

	const [
		accountId,
		{ customData: inviteeDetails },
		{ customData: inviterDetails },
	] = await Promise.all([
		getTeamspaceRefId(teamspace),
		getUserByUsername(userToAdd, userQueryProjection),
		invitedBy ? getUserByUsername(invitedBy, userQueryProjection) : Promise.resolve({}),
	]);

	const emailData = invitedBy ? {
		teamspace,
		sender: [inviterDetails.firstName, inviterDetails.lastName].join(' '),

	} : undefined;
	const inviteeName = [inviteeDetails.firstName, inviteeDetails.lastName].join(' ');

	const newUserId = await addUserToAccount(accountId, inviteeDetails.email, inviteeName, emailData);

	// if the user already exists, newUserId is undefined, so update required
	if (newUserId && newUserId !== inviteeDetails.userId) {
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
