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

const usersById = new Map();
const usersByEmail = new Map();
const teamspaceByAccount = new Map();
const usersInAccount = new Map();
const tenantsByUsers = {};

const basicAvatar = 'basicAvatarUrl';

const Cache = {};

// Teamspace by account cache
Cache.addAccount = (accountId, teamspaceName) => {
	teamspaceByAccount.set(accountId, teamspaceName);
	return accountId;
};

Cache.getTeamspaceByAccount = (accountId) => teamspaceByAccount.get(accountId);

Cache.removeAccount = (accountId) => {
	if (teamspaceByAccount.has(accountId)) {
		teamspaceByAccount.delete(accountId);
	}
};

// Users in account cache
Cache.addUserToAccount = (accountId, userEntry) => {
	if (!usersInAccount.has(accountId)) {
		usersInAccount.set(accountId, [userEntry]);
	}
	usersInAccount.set(accountId, [...usersInAccount.get(accountId), userEntry]);
	const userId = userEntry.id;
	tenantsByUsers[userId] = tenantsByUsers[userId] || [];
	if (!tenantsByUsers[userId].includes(accountId)) {
		tenantsByUsers[userId].push(accountId);
	}
};

Cache.getAllUsersInAccount = (accountId) => {
	if (!usersInAccount.has(accountId)) {
		usersInAccount.set(accountId, []);
		return [];
	}
	return usersInAccount.get(accountId).map(({ id }) => Cache.getUserById(id));
};

Cache.removeUserFromAccount = (accountId, userId) => {
	if (!usersInAccount.has(accountId)) return;
	// const users = usersInAccount.get(accountId);
	usersInAccount.set(accountId, usersInAccount.get(accountId).filter((u) => u.id !== userId));
	const userTenants = tenantsByUsers[userId] || [];
	tenantsByUsers[userId] = userTenants.filter((t) => t !== accountId);
};

Cache.removeAllUsersFromAccount = (accountId) => {
	if (usersInAccount.has(accountId)) {
		usersInAccount.get(accountId).forEach((userId) => {
			tenantsByUsers[userId] = tenantsByUsers[userId] || [];
			tenantsByUsers[userId] = tenantsByUsers[userId].filter((t) => t !== accountId);
		});
		usersInAccount.delete(accountId);
	}
};

// Users by Id cache
Cache.getUserById = (userId) => {
	if (!usersById.has(userId)) return null;
	const { metadata, ...user } = usersById.get(userId);
	return {
		...user,
		profilePictureUrl: user.profilePictureUrl || basicAvatar,
		...metadata,
		tenantIds: tenantsByUsers[userId] || [],
	};
};

Cache.addUserById = (userId, userData) => {
	usersById.set(userId, {
		...userData,
		profilePictureUrl: userData.profilePictureUrl || basicAvatar,
	});
};

Cache.updateUserById = (userId, userData) => {
	if (usersById.has(userId)) {
		usersById.set(userId, { ...usersById.get(userId), ...userData });

		return userId;
	}
	Cache.addUserById(userId, userData);
	return userId;
};

Cache.deleteUserById = (userId) => {
	usersById.delete(userId);
};

// Users by Email cache
Cache.getUserByEmail = (email) => {
	if (!usersByEmail.has(email)) return null;

	const user = usersByEmail.get(email);

	return {
		...user,
		profilePictureUrl: user.profilePictureUrl || basicAvatar,
		tenantIds: tenantsByUsers[user.id] || [],
	};
};

Cache.addUserByEmail = (email, userData) => {
	usersByEmail.set(email, {
		...userData,
		profilePictureUrl: userData.profilePictureUrl || basicAvatar,
	});
};

Cache.updateUserByEmail = (userEmail, userData) => {
	if (usersByEmail.has(userEmail)) {
		usersByEmail.set(userEmail, { ...usersByEmail.get(userEmail), ...userData });
		return userEmail;
	}
	Cache.addUserByEmail(userEmail, userData);
	return userEmail;
};

Cache.deleteUserByEmail = (userEmail) => {
	usersByEmail.delete(userEmail);
};

Cache.doesUserExist = (userEmail) => {
	if (usersByEmail.has(userEmail)) {
		const user = usersByEmail.get(userEmail);
		return user.id;
	}
	return false;
};

module.exports = Cache;
