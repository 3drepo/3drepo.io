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
const { addUserToAccount, createAccount, getAccountsByUser, getAllUsersInAccount, getTeamspaceByAccount, getUserStatusInAccount, removeAccount, removeUserFromAccount } = require('../../services/sso/frontegg');
const { createIndex, dropDatabase } = require('../../handler/db');
const { createTeamspaceRole, grantTeamspaceRoleToUser, removeTeamspaceRole, revokeTeamspaceRoleFromUser } = require('../../models/roles');
const {
	createTeamspaceSettings,
	getAddOns,
	getTeamspaceRefId,
	grantAdminToUser,
	removeUserFromAdminPrivilege,
} = require('../../models/teamspaceSettings');
const { deleteFavourites, getUserByUsername, getUserId, getUserInfoFromEmailArray, updateUserId } = require('../../models/users');
const { deleteIfUndefined, isEmpty } = require('../../utils/helper/objects');
const { getCollaboratorsAssigned, getQuotaInfo, getSpaceUsed } = require('../../utils/quota');
const { getFile, removeAllFilesFromTeamspace } = require('../../services/filesManager');
const { COL_NAME } = require('../../models/projectSettings.constants');
const { DEFAULT_OWNER_JOB } = require('../../models/jobs.constants');
const { addDefaultTemplates } = require('../../models/tickets.templates');
const { createNewUserRecord } = require('../users');
const { getInvitationsByTeamspace } = require('../../models/invitations');
const { isTeamspaceAdmin } = require('../../utils/permissions');
const { logger } = require('../../utils/logger');
const { membershipStatus } = require('../../services/sso/frontegg/frontegg.constants');
const { removeAllTeamspaceNotifications } = require('../../models/notifications');
const { removeUserFromAllModels } = require('../../models/modelSettings');
const { removeUserFromAllProjects } = require('../../models/projectSettings');
const { splitName } = require('../../utils/helper/strings');
const { templates } = require('../../utils/responseCodes');

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

Teamspaces.initTeamspace = async (teamspaceName, owner, accountId) => {
	try {
		let teamspaceId;
		if (accountId) {
			if (!await getTeamspaceByAccount(accountId)) throw templates.teamspaceNotFound;
			teamspaceId = accountId;
		} else {
			teamspaceId = await createAccount(teamspaceName);
		}
		await Promise.all([
			createTeamspaceRole(teamspaceName),
			addDefaultJobs(teamspaceName),
			createIndex(teamspaceName, COL_NAME, { name: 1 }, { unique: true }),
		]);
		await Promise.all([
			createTeamspaceSettings(teamspaceName, teamspaceId),
			addDefaultTemplates(teamspaceName),
		]);
		if (owner) {
			await Promise.all([
				assignUserToJob(teamspaceName, DEFAULT_OWNER_JOB, owner),
				Teamspaces.addTeamspaceMember(teamspaceName, owner),
				grantAdminToUser(teamspaceName, owner),
			]);
		}
	} catch (err) {
		logger.logError(`Failed to initialize teamspace for ${teamspaceName}:${err.message}`);
		throw err;
	}
};

Teamspaces.removeTeamspace = async (teamspace, removeAssociatedAccount = true) => {
	const teamspaceRef = await getTeamspaceRefId(teamspace);
	await Promise.all([
		removeAllUsersFromTS(teamspace),
		removeAllFilesFromTeamspace(teamspace),
		removeAllTeamspaceNotifications(teamspace),
	]);
	await Promise.all([
		dropDatabase(teamspace),
		removeTeamspaceRole(teamspace),
	]);
	if (removeAssociatedAccount) await removeAccount(teamspaceRef);
};

Teamspaces.getTeamspaceListByUser = async (user) => {
	const userId = await getUserId(user);

	const accountIds = await getAccountsByUser(userId);

	const teamspaceInfo = await Promise.all(accountIds.map(async (accountId) => {
		try {
			const teamspace = await getTeamspaceByAccount(accountId);
			if (teamspace) {
				const isAdmin = await isTeamspaceAdmin(teamspace, user);
				return { name: teamspace, isAdmin };
			}

			return undefined;
		} catch (err) {
			return undefined;
		}
	}));

	return teamspaceInfo.filter((info) => !!info);
};

Teamspaces.getAllMembersInTeamspace = async (teamspace) => {
	const tenantId = await getTeamspaceRefId(teamspace);
	const accountUsers = await getAllUsersInAccount(tenantId);

	const projection = {
		_id: 0,
		user: 1,
		'customData.userId': 1,
		'customData.email': 1,
	};

	const emailToUsers = {};

	const emails = accountUsers.map((user) => {
		const { email } = user;
		emailToUsers[email] = user;

		return email;
	});

	const userEntryFromDB = await getUserInfoFromEmailArray(emails, projection);

	const extractUserDetailsFromFronteggEntry = (entry) => {
		const { name, id, company } = entry;
		const [firstName, lastName] = splitName(name) ?? ['UnknownUser', ''];

		return { id, firstName, lastName, company };
	};

	const membersInTeamspace = await Promise.all(userEntryFromDB.map(async ({
		user: username, customData: { email, userId: userIdInDB },
	}) => {
		const { id, ...details } = extractUserDetailsFromFronteggEntry(emailToUsers[email]);

		if (userIdInDB !== id) await updateUserId(username, id);
		delete emailToUsers[email];

		return deleteIfUndefined(
			{ user: username, ...details },
		);
	}));

	// check for unprocessed users
	if (!isEmpty(emailToUsers)) {
		const teamspaceInvites = await getInvitationsByTeamspace(teamspace);

		// Invitees (i.e. emails with 3drepo invites stored in mongo) are currently not considered
		// real users, disregard them
		teamspaceInvites.forEach(({ _id: email }) => {
			delete emailToUsers[email];
		});

		await Promise.all(Object.values(emailToUsers).map(async (userRec) => {
			await createNewUserRecord(userRec);
			const { id, ...details } = extractUserDetailsFromFronteggEntry(userRec);
			logger.logDebug(`User not found: ${id}, creating user based on info from IDP...`);
			membersInTeamspace.push(deleteIfUndefined(
				{ user: id, ...details },
			));
		}));
	}

	return membersInTeamspace;
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

Teamspaces.isTeamspaceMember = async (teamspace, username, bypassStatusCheck) => {
	try {
		const [accountId, userId] = await Promise.all([
			getTeamspaceRefId(teamspace),
			getUserId(username),
		]);
		const memStatus = await getUserStatusInAccount(accountId, userId);
		return bypassStatusCheck ? memStatus !== membershipStatus.NOT_MEMBER
			: memStatus === membershipStatus.ACTIVE || memStatus === membershipStatus.PENDING_LOGIN;
	} catch (err) {
		return false;
	}
};

Teamspaces.getAddOns = getAddOns;

module.exports = Teamspaces;
