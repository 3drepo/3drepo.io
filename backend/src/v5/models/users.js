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
const { TEAMSPACE_ADMIN } = require('../utils/permissions/permissions.constants');
const config = require('../utils/config');
const db = require('../handler/db');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateHashString } = require('../utils/helper/strings');
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

	await db.updateOne('admin', COLL_NAME, { user }, {
		$set: {
			'customData.loginInfo.lastFailedLoginAt': currentTime,
			'customData.loginInfo.failedLoginCount': newCount,
		},
	});

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

User.getUserByUsername = (user, projection) => User.getUserByQuery({ user }, projection);

User.getUserByUsernameOrEmail = (usernameOrEmail, projection) => User.getUserByQuery({
	$or: [{ user: usernameOrEmail },
		// eslint-disable-next-line security/detect-non-literal-regexp
		{ 'customData.email': new RegExp(`^${usernameOrEmail.replace(/(\W)/g, '\\$1')}$`, 'i') }] }, projection);

User.getFavourites = async (user, teamspace) => {
	const { customData } = await User.getUserByUsername(user, { 'customData.starredModels': 1 });
	const favs = customData.starredModels || {};
	return favs[teamspace] || [];
};

User.getAccessibleTeamspaces = async (username) => {
	const userDoc = await User.getUserByUsername(username, { roles: 1 });
	return userDoc.roles.flatMap(({ db: roleDB }) => (roleDB !== 'admin' ? [roleDB] : []));
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

User.updatePassword = async (username, newPassword) => {
	const updateUserCmd = {
		updateUser: username,
		pwd: newPassword,
	};

	await db.runCommand('admin', updateUserCmd);
	await updateUser(username, { $unset: { 'customData.resetPasswordToken': 1 } });
};

User.updateProfile = async (username, updatedProfile) => {
	const updateData = {};
	const billingInfoFields = ['countryCode', 'company'];

	Object.keys(updatedProfile).forEach((key) => {
		if (billingInfoFields.includes(key)) {
			updateData[`customData.billing.billingInfo.${key}`] = updatedProfile[key];
		} else {
			updateData[`customData.${key}`] = updatedProfile[key];
		}
	});

	await updateUser(username, { $set: updateData });
};

User.generateApiKey = async (username) => {
	const apiKey = generateHashString();
	await updateUser(username, { $set: { 'customData.apiKey': apiKey } });
	return apiKey;
};

User.deleteApiKey = (username) => updateUser(username, { $unset: { 'customData.apiKey': 1 } });

User.getAvatar = async (username) => {
	const user = await User.getUserByUsername(username, { 'customData.avatar': 1 });
	const avatar = user.customData?.avatar;

	if (!avatar) {
		throw templates.avatarNotFound;
	}

	return avatar.data.buffer;
};

User.addUser = async (newUserData) => {
	const customData = {
		createdAt: new Date(),
		inactive: true,
		firstName: newUserData.firstName,
		lastName: newUserData.lastName,
		email: newUserData.email,
		mailListOptOut: !newUserData.mailListAgreed,
		billing: {
			billingInfo: {
				firstName: newUserData.firstName,
				lastName: newUserData.lastName,
				countryCode: newUserData.countryCode,
				company: newUserData.company,
			},
		},
		permissions: [],
	};

	const expiryAt = new Date();
	expiryAt.setHours(expiryAt.getHours() + config.tokenExpiry.emailVerify);
	customData.emailVerifyToken = {
		token: newUserData.token,
		expiredAt: expiryAt,
	};

	await db.createUser(newUserData.username, newUserData.password, customData);
};

User.verify = async (username) => {
	const { customData } = await db.findOneAndUpdate('admin', COLL_NAME, { user: username },
		{
			$unset: {
				'customData.inactive': 1,
				'customData.emailVerifyToken': 1,
			},
		},
		{
			'customData.firstName': 1,
			'customData.lastName': 1,
			'customData.email': 1,
			'customData.billing.billingInfo.company': 1,
			'customData.mailListOptOut': 1,
		});

	return customData;
};

User.grantAdminToUser = (teamspace, username) => updateUser(teamspace,
	{ $push: { 'customData.permissions': { user: username, permissions: [TEAMSPACE_ADMIN] } } });

User.uploadAvatar = (username, avatarBuffer) => updateUser(username, { $set: { 'customData.avatar': { data: avatarBuffer } } });

User.updateResetPasswordToken = (username, resetPasswordToken) => updateUser(username,
	{ $set: { 'customData.resetPasswordToken': resetPasswordToken } });

module.exports = User;
