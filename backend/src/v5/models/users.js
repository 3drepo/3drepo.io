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

const User = {};
const COLL_NAME = 'system.users';

const userQuery = (query, projection, sort) => db.findOne('admin', COLL_NAME, query, projection, sort);
const updateUser = async (username, action) => await db.updateOne('admin', COLL_NAME, { user: username }, action);

User.login = async (user, password) => {
	try {
		await db.authenticate(user.user, password);
	} catch (err) {
		const remainingLoginAttempts = await handleAuthenticateFail(user, user.user);

		if(err.code === templates.incorrectUsernameOrPassword.code){
			if (remainingLoginAttempts <= config.loginPolicy.remainingLoginAttemptsPromptThreshold) {
				throw appendRemainingLoginsInfo(err, remainingLoginAttempts);
			}	

			throw templates.incorrectUsernameOrPassword;
		}
		
		throw err;
	}

	if (user.customData && user.customData.inactive) {
		throw templates.userNotVerified;
	}

	if (!user.customData) {
		user.customData = {};
	}

	const termsPrompt = !hasReadLatestTerms(user);

	user.customData.lastLoginAt = new Date();

	await updateUser(user.user, {
		$set: {"customData.lastLoginAt": user.customData.lastLoginAt},
		$unset: {"customData.loginInfo.failedLoginCount":""}
	});

	return { username: user.user, flags:{ termsPrompt } };
};

const hasReadLatestTerms = function (user) {
	return !user.customData.lastLoginAt || new Date(config.termsUpdatedAt) < user.customData.lastLoginAt;
};

const handleAuthenticateFail = async function (user) {
	const currentTime = new Date();

	const elapsedTime = user.customData.loginInfo && user.customData.loginInfo.lastFailedLoginAt ?
		currentTime - user.customData.loginInfo.lastFailedLoginAt : undefined;

	const failedLoginCount = user.customData.loginInfo && user.customData.loginInfo.failedLoginCount &&
		elapsedTime && elapsedTime < config.loginPolicy.lockoutDuration ?
		user.customData.loginInfo.failedLoginCount + 1 : 1;

	await db.updateOne("admin", COLL_NAME, {user: user.user}, {$set: {
		"customData.loginInfo.lastFailedLoginAt": currentTime,
		"customData.loginInfo.failedLoginCount": failedLoginCount
	}});

	if (failedLoginCount >= config.loginPolicy.maxUnsuccessfulLoginAttempts) {
		try {
			await Intercom.submitLoginLockoutEvent(user.customData.email);
		} catch (err) {
			systemLogger.logError("Failed to submit login lockout event in intercom", username, err);
		}
	}

	return Math.max(config.loginPolicy.maxUnsuccessfulLoginAttempts - failedLoginCount, 0);
};

User.getUserByUsername = async (user, projection) => {
	const userDoc = await userQuery({ user }, projection);
	if (!userDoc) {
		throw templates.userNotFound;
	}
	return userDoc;
};

User.getUserByEmail = async (email, projection) => {
	const userDoc = await userQuery({ "customData.email" : email }, projection);
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

User.checkUserExists = async (user) => {
	const userDoc = await userQuery({ user });
	if (!userDoc) {
		throw templates.userNotFound;
	}
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
