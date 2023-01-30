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

const { USERS_COL, USERS_DB_NAME } = require('./users.constants');
const { createResponseCode, templates } = require('../utils/responseCodes');
const config = require('../utils/config');
const db = require('../handler/db');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateHashString } = require('../utils/helper/strings');
const { publish } = require('../services/eventsManager/eventsManager');

const User = {};

const userQuery = (query, projection, sort) => db.findOne(USERS_DB_NAME, USERS_COL, query, projection, sort);
const updateUser = (username, action) => db.updateOne(USERS_DB_NAME, USERS_COL, { user: username }, action);

User.isAccountActive = async (user) => {
	const projection = { 'customData.inactive': 1 };
	const { customData: { inactive } = {} } = await User.getUserByUsername(user, projection);
	return !inactive;
};

User.authenticate = async (user, password) => {
	if (await db.authenticate(user, password)) return;

	publish(events.FAILED_LOGIN_ATTEMPT, { user });
	throw templates.incorrectUsernameOrPassword;
};

User.getUserByQuery = async (query, projection) => {
	const userDoc = await userQuery(query, projection);
	if (!userDoc) {
		throw templates.userNotFound;
	}
	return userDoc;
};

User.getUserByUsername = (user, projection) => User.getUserByQuery({ user }, projection);

User.getUserByEmail = (email, projection) => User.getUserByQuery({ 'customData.email': email }, projection);

User.getUserByUsernameOrEmail = (usernameOrEmail, projection) => User.getUserByQuery({
	$or: [{ user: usernameOrEmail },
	// eslint-disable-next-line security/detect-non-literal-regexp
		{ 'customData.email': new RegExp(`^${usernameOrEmail.replace(/(\W)/g, '\\$1')}$`, 'i') }],
}, projection);

User.getFavourites = async (user, teamspace) => {
	const { customData } = await User.getUserByUsername(user, { 'customData.starredModels': 1 });
	const favs = customData.starredModels || {};
	return favs[teamspace] || [];
};

User.getAccessibleTeamspaces = async (username) => {
	const userDoc = await User.getUserByUsername(username, { roles: 1 });
	return userDoc.roles.flatMap(({ db: roleDB }) => (roleDB !== USERS_DB_NAME ? [roleDB] : []));
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
		if (favouritesToRemove?.length) {
			const updatedFav = favourites[teamspace].filter((i) => !favouritesToRemove.includes(i));
			if (updatedFav.length) {
				favourites[teamspace] = updatedFav;
				await updateUser(username, { $set: { 'customData.starredModels': favourites } });
			} else {
				const action = { $unset: { [`customData.starredModels.${teamspace}`]: 1 } };
				await updateUser(username, action);
			}
		} else {
			const action = { $unset: { [`customData.starredModels.${teamspace}`]: 1 } };
			await updateUser(username, action);
		}
	} else if (favouritesToRemove?.length) {
		throw createResponseCode(templates.invalidArguments, "The IDs provided are not in the user's favourites list");
	}
};

User.updatePassword = async (username, newPassword) => {
	await db.setPassword(username, newPassword);
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

User.addUser = async (newUserData) => {
	const customData = {
		createdAt: new Date(),
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
		...(newUserData.sso ? { sso: newUserData.sso } : { inactive: true }),
	};

	if (!newUserData.sso) {
		const expiryAt = new Date();
		expiryAt.setHours(expiryAt.getHours() + config.tokenExpiry.emailVerify);
		customData.emailVerifyToken = { token: newUserData.token, expiredAt: expiryAt };
	}

	await db.createUser(newUserData.username, newUserData.password, customData);
};

User.removeUser = (user) => db.deleteOne(USERS_DB_NAME, USERS_COL, { user });

User.verify = async (username) => {
	const { customData } = await db.findOneAndUpdate(USERS_DB_NAME, USERS_COL, { user: username },
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

User.updateResetPasswordToken = (username, resetPasswordToken) => updateUser(username,
	{ $set: { 'customData.resetPasswordToken': resetPasswordToken } });

User.unlinkFromSso = async (username, newPassword) => {
	await updateUser(username, { $unset: { 'customData.sso': 1 } });
	await User.updatePassword(username, newPassword);
};

User.linkToSso = (username, email, firstName, lastName, ssoData) => updateUser(username,
	{
		$set: {
			'customData.email': email,
			'customData.firstName': firstName,
			'customData.lastName': lastName,
			'customData.sso': ssoData,
		},
	});

User.isSsoUser = async (username) => {
	const { customData: { sso } } = await User.getUserByUsername(username, { 'customData.sso': 1 });
	return !!sso;
};

module.exports = User;
