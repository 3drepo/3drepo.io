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

const {
	LICENSE_ADMIN_READ,
	LICENSE_ADMIN_WRITE,
	SYSTEM_ADMIN_READ,
	SYSTEM_ADMIN_WRITE,
	SYSTEM_ROLES,
} = require('../utils/permissions/permissions.constants');
const { createResponseCode, templates } = require('../utils/responseCodes');

const config = require('../utils/config');
const db = require('../handler/db');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { publish } = require('../services/eventsManager/eventsManager');

const User = {};
const COLL_NAME = 'system.users';

const userQuery = (query, projection, sort) => db.findOne('admin', COLL_NAME, query, projection, sort);
const updateUser = (username, action) => db.updateOne('admin', COLL_NAME, { user: username }, action);

const recordSuccessfulAuthAttempt = async (user) => {
	const { customData: { lastLoginAt } = {} } = await User.getUserByUsername(user, { 'customData.lastLoginAt': 1 });

	await updateUser(user, {
		$set: { 'customData.lastLoginAt': new Date() },
		$unset: { 'customData.loginInfo.failedLoginCount': '' },
	});

	const termsPrompt = !lastLoginAt || new Date(config.termsUpdatedAt) > lastLoginAt;

	return { username: user, flags: { termsPrompt } };
};

const recordFailedAuthAttempt = async (user) => {
	const projection = { 'customData.loginInfo': 1, 'customData.email': 1 };
	const { customData: { loginInfo, email } = {} } = await User.getUserByUsername(user, projection);

	const currentTime = new Date();

	const { lastFailedLoginAt = 0, failedLoginCount = 0 } = loginInfo || {};

	const resetCounter = (currentTime - lastFailedLoginAt) > config.loginPolicy.lockoutDuration;

	const newCount = resetCounter ? 1 : failedLoginCount + 1;

	await db.updateOne('admin', COLL_NAME, { user }, { $set: {
		'customData.loginInfo.lastFailedLoginAt': currentTime,
		'customData.loginInfo.failedLoginCount': newCount,
	} });

	publish(events.FAILED_LOGIN_ATTEMPT, { email, failedLoginCount: newCount });

	return config.loginPolicy.maxUnsuccessfulLoginAttempts - newCount;
};

User.canLogIn = async (user) => {
	const projection = { 'customData.loginInfo': 1, 'customData.inactive': 1 };
	const { customData: { loginInfo, inactive } = {} } = await User.getUserByUsername(user, projection);

	if (inactive) {
		throw templates.userNotVerified;
	}

	const now = new Date();
	const { lastFailedLoginAt = now, failedLoginCount } = loginInfo || {};
	const timeElapsed = now - lastFailedLoginAt;

	const { lockoutDuration, maxUnsuccessfulLoginAttempts } = config.loginPolicy;

	if (lastFailedLoginAt
		&& timeElapsed < lockoutDuration
		&& failedLoginCount >= maxUnsuccessfulLoginAttempts) {
		throw templates.tooManyLoginAttempts;
	}
};

User.authenticate = async (user, password) => {
	try {
		await db.authenticate(user, password);
	} catch (err) {
		if (err.code === templates.incorrectUsernameOrPassword.code) {
			const remainingLoginAttempts = await recordFailedAuthAttempt(user);
			if (remainingLoginAttempts <= config.loginPolicy.remainingLoginAttemptsPromptThreshold) {
				throw createResponseCode(templates.incorrectUsernameOrPassword,
					`${templates.incorrectUsernameOrPassword.message} (Remaining attempts: ${remainingLoginAttempts})`);
			}
		}

		throw err;
	}

	return recordSuccessfulAuthAttempt(user);
};

User.getUserByQuery = async (query, projection) => {
	const userDoc = await userQuery(query, projection);
	if (!userDoc) {
		throw templates.userNotFound;
	}
	return userDoc;
};

User.getUserByUsername = async (user, projection) => User.getUserByQuery({ user }, projection);

User.getFavourites = async (user, teamspace) => {
	const { customData } = await User.getUserByUsername(user, { 'customData.starredModels': 1 });
	const favs = customData.starredModels || {};
	return favs[teamspace] || [];
};

User.getAccessibleTeamspaces = async (username) => {
	const userDoc = await User.getUserByUsername(username, { roles: 1 });
	return userDoc.roles.map((role) => role.db);
};

User.getUsersWithRole = async (users = [], roles = []) => {
	let usersObj;
	const returningUsers = [];
	const checkUsers = users.length > 0;
	const checkRoles = roles.length > 0;
	if (checkUsers) { usersObj = users; } else { usersObj = 1; }
	const usersInfoCmd = {
		usersInfo: usersObj,
	};

	const usersInfo = await db.runCommand('admin', usersInfoCmd);

	usersInfo.users.forEach((user) => {
		user.roles.forEach((role) => {
			const userExists = users.includes(user.user);
			const roleExists = roles.includes(role.role);
			const validRole = SYSTEM_ROLES.includes(role.role);
			const returnUser = (
				(!checkUsers && !checkRoles)
					|| (
						(userExists && roleExists && checkUsers && checkRoles)
					)
					|| (
						(roleExists && checkRoles && !checkUsers)
					)
					|| (
						(userExists && checkUsers && !checkRoles)
					)
			)
				&& validRole;
			if (returnUser) {
				if (!returningUsers.includes(user.user)) {
					returningUsers.push(
						{
							user: user.user,
							roles: []
						}
					)
				}
				returningUsers(user.user.roles).push(role.role),
			}
		});
	});
	if (!returningUsers) {
		throw templates.userNotFound;
	}
	return returningUsers;
};

User.hasAccessToWriteSystemRole = async (username) => {
	const usersInfoCmd = {
		usersInfo: username,
		showPrivileges: true,
	};
	const usersInfo = await db.runCommand('admin', usersInfoCmd);
	let foundrole = false;
	usersInfo.users[0].inheritedRoles.forEach((role) => {
		if (role.db === 'admin' && role.role === SYSTEM_ADMIN_WRITE) {
			foundrole = true;
		}
	});
	return foundrole;
};

User.hasAccessToReadSystemRole = async (username) => {
	const usersInfoCmd = {
		usersInfo: username,
		showPrivileges: true,
	};
	const usersInfo = await db.runCommand('admin', usersInfoCmd);
	let foundrole = false;
	usersInfo.users[0].inheritedRoles.forEach((role) => {
		if (role.db === 'admin' && role.role === SYSTEM_ADMIN_READ) {
			foundrole = true;
		}
	});
	return foundrole;
};

User.hasAccessToWriteLicenseRole = async (username) => {
	const usersInfoCmd = {
		usersInfo: username,
		showPrivileges: true,
	};
	const usersInfo = await db.runCommand('admin', usersInfoCmd);
	let foundrole = false;
	usersInfo.users[0].inheritedRoles.forEach((role) => {
		if (role.db === 'admin' && role.role === LICENSE_ADMIN_WRITE) {
			foundrole = true;
		}
	});
	return foundrole;
};

User.hasAccessToReadLicenseRole = async (username) => {
	const usersInfoCmd = {
		usersInfo: username,
		showPrivileges: true,
	};
	const usersInfo = await db.runCommand('admin', usersInfoCmd);
	let foundrole = false;
	usersInfo.users[0].inheritedRoles.forEach((role) => {
		if (role.db === 'admin' && role.role === LICENSE_ADMIN_READ) {
			foundrole = true;
		}
	});
	return foundrole;
};

User.hasAdministrativeRole = async (username, role) => {
	if (SYSTEM_ROLES.includes(role)) {
		const usersInfoCmd = {
			usersInfo: username,
			showPrivileges: true,
		};
		const usersInfo = await db.runCommand('admin', usersInfoCmd);
		if (!usersInfo) {
			throw templates.userNotFound;
		}
		let foundrole = false;
		if (usersInfo.users.length === 1) {
			await usersInfo.users[0].inheritedRoles.forEach((inheritedRoles) => {
				if (inheritedRoles.db === 'admin' && inheritedRoles.role === role) {
					foundrole = true;
				}
			});
		}
		return foundrole;
	}
	throw templates.invalidArguments;
};

User.grantAdministrativeRole = async (username, role) => {
	const grantRolesToUserCmd = {
		grantRolesToUser: username,
		roles: [role],
	};
	const grantRolesInfo = await db.runCommand('admin', grantRolesToUserCmd);
	return grantRolesInfo.ok;
};

User.revokeAdministrativeRole = async (username, role) => {
	const revokeRolesFromUserCmd = {
		revokeRolesFromUser: username,
		roles: [role],
	};
	const grantRolesInfo = await db.runCommand('admin', revokeRolesFromUserCmd);
	return grantRolesInfo.ok;
};

User.appendFavourites = async (username, teamspace, favouritesToAdd) => {
	const userProfile = await User.getUserByUsername(username, { 'customData.starredModels': 1 });

	const favourites = userProfile.customData.starredModels || {};
	if (!favourites[teamspace]) {
		favourites[teamspace] = [];
	}

	favouritesToAdd.forEach((fav) => {
		if (!favourites[teamspace].includes(fav)) {
			favourites[teamspace].push(fav);
		}
	});

	await updateUser(username, { $set: { 'customData.starredModels': favourites } });
};

User.deleteFavourites = async (username, teamspace, favouritesToRemove) => {
	const userProfile = await User.getUserByUsername(username, { 'customData.starredModels': 1 });

	const favourites = userProfile.customData.starredModels || {};

	if (favourites[teamspace]) {
		const updatedFav = favourites[teamspace].filter((i) => !favouritesToRemove.includes(i));
		if (updatedFav.length) {
			favourites[teamspace] = updatedFav;
			await updateUser(username, { $set: { 'customData.starredModels': favourites } });
		} else {
			const action = { $unset: { [`customData.starredModels.${teamspace}`]: 1 } };
			await updateUser(username, action);
		}
	} else {
		throw createResponseCode(templates.invalidArguments, "The IDs provided are not in the user's favourites list");
	}
};

module.exports = User;
