/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { uniqueElements } = require('../../../../../src/v5/utils/helper/arrays');
const Objects = require('../../../../../src/v5/utils/helper/objects');
const { deleteIfUndefined } = require('../../../../../src/v5/utils/helper/objects');
const { src } = require('../../path');

const { generateUUIDString } = require(`${src}/utils/helper/uuids`);
const { membershipStatus } = require(`${src}/services/sso/frontegg/frontegg.constants`);

const Accounts = {};

const teamspaceByAccount = {};
const usersInAccount = {};
const emailToUser = {};
const groupsByAccount = {};

Accounts.getTeamspaceByAccount = (accountId) => teamspaceByAccount[accountId];

Accounts.setMFAPolicy = () => Promise.resolve();

Accounts.getClaimedDomains = () => Promise.resolve([]);

Accounts.createAccount = (name) => {
	const accountId = generateUUIDString();
	teamspaceByAccount[accountId] = name;

	return Promise.resolve(accountId);
};

Accounts.getAllUsersInAccount = (accountId) => Promise.resolve(usersInAccount[accountId] ?? []);

Accounts.addUserToAccount = (accountId, email) => {
	const id = emailToUser[email] ?? generateUUIDString();
	emailToUser[email] = id;
	usersInAccount[accountId] = usersInAccount[accountId] ?? [];
	usersInAccount[accountId].push({ id, email });
	return id;
};

Accounts.getUserStatusInAccount = (accountId, userId) => (usersInAccount?.[accountId]?.some((u) => u.id === userId)
	? Promise.resolve(membershipStatus.ACTIVE)
	: Promise.resolve(membershipStatus.NOT_MEMBER));

Accounts.removeUserFromAccount = (accountId, userId) => {
	usersInAccount[accountId] = usersInAccount[accountId] ?? [];
	usersInAccount[accountId] = usersInAccount[accountId].filter((u) => u.id !== userId);
};

Accounts.removeAccount = (accountId) => {
	delete usersInAccount[accountId];
	delete teamspaceByAccount[accountId];
};

Accounts.addUsersToGroup = (accountId, groupId, userIds) => {
	if (groupsByAccount[accountId]?.[groupId]) {
		const group = groupsByAccount[accountId][groupId];
		group.users = group.users || [];
		group.users = [...group.users, ...userIds];
		uniqueElements(group.users);
	} else {
		throw new Error(`Group with ID ${groupId} not found in account: ${accountId}`);
	}
};

Accounts.removeUsersFromGroup = (accountId, groupId, userIds) => {
	if (groupsByAccount[accountId]?.[groupId]) {
		groupsByAccount[accountId][groupId].users = groupsByAccount[accountId][groupId]
			.users.filter((user) => !userIds.includes(user.id));
	} else {
		throw new Error(`Group with ID ${groupId} not found in account: ${accountId}`);
	}
};

Accounts.getGroups = (accountId, getUsers = true) => {
	if (groupsByAccount[accountId]) {
		return Object.values(groupsByAccount[accountId]).map((group) => {
			if (getUsers) {
				return group;
			}
			const { users, ...groupData } = group;
			return groupData;
		});
	}

	throw new Error(`No groups found for account: ${accountId}`);
};

Accounts.getGroupById = (accountId, groupId, fetchUsers) => {
	if (groupsByAccount[accountId]?.[groupId]) {
		if (fetchUsers) {
			return groupsByAccount[accountId][groupId];
		}
		const { users, ...groupData } = groupsByAccount[accountId][groupId];
		return groupData;
	}
	throw new Error(`Group with ID ${groupId} not found in account: ${accountId}`);
};

Accounts.createGroup = (accountId, name, color, users) => {
	groupsByAccount[accountId] = groupsByAccount[accountId] || {};

	const groupId = generateUUIDString();

	groupsByAccount[accountId][groupId] = deleteIfUndefined({
		id: groupId,
		name,
		color,
		users,
	});
};

Accounts.updateGroup = (accountId, groupId, { name, color }) => {
	if (groupsByAccount[accountId]?.[groupId]) {
		groupsByAccount[accountId][groupId] = deleteIfUndefined({
			...groupsByAccount[accountId][groupId],
			name,
			color,
		});
	} else {
		throw new Error(`Group with ID ${groupId} not found in account: ${accountId}`);
	}
};

Accounts.removeGroup = (accountId, groupId) => {
	if (groupsByAccount[accountId]?.[groupId]) {
		delete groupsByAccount[accountId][groupId];
	} else {
		throw new Error(`Group with ID ${groupId} not found in account: ${accountId}`);
	}
};

module.exports = Accounts;
