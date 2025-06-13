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

const { DEFAULT_OWNER_ROLE, DEFAULT_ROLES } = require('../../models/roles.constants');
const { createGroup, getAllUsersInAccount, getGroupById, getGroups, removeGroup } = require('../../services/sso/frontegg');
const { getUserId, getUsersByQuery } = require('../../models/users');
const { getTeamspaceRefId } = require('../../models/teamspaceSettings');
const { templates } = require('../../utils/responseCodes');

const Roles = {};

// FIXME: check who uses this and make sure it still works
Roles.getRoles = async (teamspace) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	const groups = await getGroups(teamspaceId);
	const roles = await Promise.all(groups.map(async ({ id, name, color, users }) => {
		const groupInfo = { id, name, color };

		if (users?.length) {
			const userEmails = users.map(({ email }) => email);

			const userDocs = await getUsersByQuery({ 'customData.email': { $in: userEmails } }, { user: 1 });
			groupInfo.users = userDocs.map(({ user }) => user);
		}

		return groupInfo;
	}));
	return roles;
};

Roles.getRoleById = async (teamspace, roleId) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	try {
		const group = await getGroupById(teamspaceId, roleId);
		return group;
	} catch (err) {
		console.log(err);
		throw templates.roleNotFound;
	}
};

Roles.isRoleNameUsed = async (teamspace, name) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	const groups = await getGroups(teamspaceId, false);
	const nameToCheck = name.toLowerCase().trim();
	return groups.some(({ name: groupName }) => groupName.toLowerCase() === nameToCheck);
};

const getUserIdMapping = async (teamspaceId) => {
	const accountUsers = await getAllUsersInAccount(teamspaceId);
	const emailToUserId = {};
	const usernameToUserId = {};
	const emails = accountUsers.map(({ id, email }) => {
		emailToUserId[email] = id;
		return email;
	});

	const usersMatchedEmails = await getUsersByQuery({ 'customData.email': { $in: emails } }, { user: 1, 'customData.email': 1 });
	usersMatchedEmails.forEach(({ user, customData: { email } }) => {
		const id = emailToUserId[email];
		if (id) {
			usernameToUserId[user] = id;
		}
	});
	return usernameToUserId;
};

Roles.createRole = async (teamspace, { name, color, users }) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	let userIds;

	if (users?.length) {
		const usernameToUserId = await getUserIdMapping(teamspaceId);
		userIds = users.flatMap((user) => usernameToUserId[user] || []);
	}

	return createGroup(teamspaceId, name, color, userIds);
};

Roles.createDefaultRoles = async (teamspace, firstAdmin) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	const userId = await getUserId(firstAdmin);
	await Promise.all(DEFAULT_ROLES.map(({ name, color }) => createGroup(teamspaceId, name, color,
		name === DEFAULT_OWNER_ROLE ? [userId] : undefined)));
};

Roles.createRoles = async (teamspace, roles) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	const usernameToUserId = await getUserIdMapping(teamspaceId);

	return Promise.all(roles.map(async ({ name, color, users }) => {
		let userIds;
		if (users?.length) {
			userIds = users.flatMap((user) => usernameToUserId[user] || []);
		}
		const roleId = await createGroup(teamspaceId, name, color, userIds);
		return { id: roleId, name };
	}));
};
// FIXME Split update between user assignmnets and ac
Roles.updateRole = (teamspace, role, updatedRole) => {};

Roles.deleteRole = async (teamspace, roleId) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	await removeGroup(teamspaceId, roleId);
};

module.exports = Roles;
