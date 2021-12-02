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

const { createResponseCode, templates } = require('../utils/responseCodes');
const config = require('../utils/config');
const db = require('../handler/db');
const { submitLoginLockoutEvent } = require('./intercom');

const User = {};
const COLL_NAME = 'system.users';

const userQuery = (query, projection, sort) => db.findOne('admin', COLL_NAME, query, projection, sort);
const updateUser = async (username, action) => db.updateOne('admin', COLL_NAME, { user: username }, action);

const handleAuthenticateFail = async (user) => {
	const currentTime = new Date();

	const elapsedTime = user.customData?.loginInfo && user.customData.loginInfo.lastFailedLoginAt
		? currentTime - user.customData.loginInfo.lastFailedLoginAt : undefined;

	const failedLoginCount = user.customData?.loginInfo && user.customData.loginInfo.failedLoginCount
		&& elapsedTime && elapsedTime < config.loginPolicy.lockoutDuration
		? user.customData.loginInfo.failedLoginCount + 1 : 1;

	await db.updateOne('admin', COLL_NAME, { user: user.user }, { $set: {
		'customData.loginInfo.lastFailedLoginAt': currentTime,
		'customData.loginInfo.failedLoginCount': failedLoginCount,
	} });

	if (failedLoginCount >= config.loginPolicy.maxUnsuccessfulLoginAttempts) {
		try {
			await submitLoginLockoutEvent(user.customData?.email);
		} catch (err) {
			// Do nothing
		}
	}

	return Math.max(config.loginPolicy.maxUnsuccessfulLoginAttempts - failedLoginCount, 0);
};

User.login = async (user, password) => {
	const updatedUser = user;

	try {
		await db.authenticate(updatedUser.user, password);
	} catch (err) {
		const remainingLoginAttempts = await handleAuthenticateFail(updatedUser, updatedUser.user);

		if (err.code === templates.incorrectUsernameOrPassword.code) {
			if (remainingLoginAttempts <= config.loginPolicy.remainingLoginAttemptsPromptThreshold) {
				throw createResponseCode(templates.incorrectUsernameOrPassword,
					`${templates.incorrectUsernameOrPassword.message} (Remaining attempts: ${remainingLoginAttempts})`);
			}

			throw templates.incorrectUsernameOrPassword;
		}

		throw err;
	}

	if (updatedUser.customData && updatedUser.customData.inactive) {
		throw templates.userNotVerified;
	}

	if (!updatedUser.customData) {
		updatedUser.customData = {};
	}

	const termsPrompt = !updatedUser.customData.lastLoginAt || new Date(config.termsUpdatedAt)
		> updatedUser.customData.lastLoginAt;

	updatedUser.customData.lastLoginAt = new Date();

	await updateUser(updatedUser.user, {
		$set: { 'customData.lastLoginAt': updatedUser.customData.lastLoginAt },
		$unset: { 'customData.loginInfo.failedLoginCount': '' },
	});

	return { username: updatedUser.user, flags: { termsPrompt } };
};

User.getUserByUsername = async (user, projection) => {
	const userDoc = await userQuery({ user }, projection);
	if (!userDoc) {
		throw templates.userNotFound;
	}
	return userDoc;
};

User.getUserByEmail = async (email, projection) => {
	const userDoc = await userQuery({ 'customData.email': email }, projection);
	if (!userDoc) {
		throw templates.userNotFound;
	}
	return userDoc;
};

User.getFavourites = async (user, teamspace) => {
	const { customData } = await User.getUserByUsername(user, { 'customData.starredModels': 1 });
	const favs = customData.starredModels || {};
	return favs[teamspace] || [];
};

User.getAccessibleTeamspaces = async (username) => {
	const userDoc = await User.getUserByUsername(username, { roles: 1 });
	return userDoc.roles.map((role) => role.db);
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
