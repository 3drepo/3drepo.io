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
const { addUsersToGroup, createGroup, getAllUsersInAccount, getGroupById, getGroups, removeGroup, removeUsersFromGroup, updateGroup } = require('../../services/sso/frontegg');
const { getUserId, getUsersByQuery } = require('../../models/users');
const { getTeamspaceRefId } = require('../../models/teamspaceSettings');
const { isEmpty } = require('../../utils/helper/objects');
const { templates } = require('../../utils/responseCodes');

const Roles = {};

const convertUsersToUsernames = async (users) => {
	const userEmails = users.map(({ email }) => email);
	const userDocs = await getUsersByQuery({ 'customData.email': { $in: userEmails } }, { user: 1 });
	return userDocs.map(({ user }) => user);
};

Roles.getRoles = async (teamspace) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	const groups = await getGroups(teamspaceId);
	const roles = await Promise.all(groups.map(async ({ id, name, color, users }) => {
		const groupInfo = { id, name, color };

		if (users?.length) {
			groupInfo.users = convertUsersToUsernames(users);
		}

		return groupInfo;
	}));
	return roles;
};

Roles.getRoleById = async (teamspace, roleId, fetchUsers = false) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	try {
		const groupInfo = await getGroupById(teamspaceId, roleId, fetchUsers);
		if (groupInfo.users?.length) {
			groupInfo.users = convertUsersToUsernames(groupInfo.users);
		}
		return groupInfo;
	} catch (err) {
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

Roles.updateRole = async (teamspace, role, { users, ...others }) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	if (!isEmpty(others)) {
		await updateGroup(teamspaceId, role, others);
	}

	if (users?.length) {
		const { users: existingUsers = [] } = await getGroupById(teamspaceId, role);

		const usersInRole = {};
		existingUsers.forEach(({ id }) => { usersInRole[id] = true; });

		const toAdd = [];

		users.forEach((user) => {
			if (usersInRole[user]) {
				// User already exists in the role, no need to add/remove
				delete usersInRole[user];
			} else {
				toAdd.push(user);
			}
		});

		await Promise.all([
			addUsersToGroup(teamspaceId, role, toAdd),
			removeUsersFromGroup(teamspaceId, role, Object.keys(usersInRole)),
		]);
	}
};

Roles.deleteRole = async (teamspace, roleId) => {
	const teamspaceId = await getTeamspaceRefId(teamspace);
	await removeGroup(teamspaceId, roleId);
};

module.exports = Roles;
