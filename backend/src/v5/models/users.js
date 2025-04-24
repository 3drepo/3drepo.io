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
const { generateHashString, sanitiseRegex } = require('../utils/helper/strings');
const db = require('../handler/db');
const { logger } = require('../utils/logger');

const User = {};

const userQuery = (query, projection, sort) => db.findOne(USERS_DB_NAME, USERS_COL, query, projection, sort);
const updateUser = (username, action) => db.updateOne(USERS_DB_NAME, USERS_COL, { user: username }, action);

User.getUsersByQuery = (query, projection) => db.find(USERS_DB_NAME, USERS_COL, query, projection);

User.getUserByQuery = async (query, projection) => {
	const userDoc = await userQuery(query, projection);
	if (!userDoc) {
		throw templates.userNotFound;
	}
	return userDoc;
};

User.getUserId = async (user) => {
	const { customData: { userId } } = await User.getUserByUsername(user, { 'customData.userId': 1 });
	return userId;
};

User.getUserByUsername = (user, projection) => User.getUserByQuery({ user }, projection);

User.getUserByEmail = (email, projection) => User.getUserByQuery({ 'customData.email': email }, projection);

User.getUserByUsernameOrEmail = (usernameOrEmail, projection) => {
	const sanitisedUsernameOrEmail = sanitiseRegex(usernameOrEmail);
	return User.getUserByQuery({
		$or: [{ user: usernameOrEmail },
		// eslint-disable-next-line security/detect-non-literal-regexp
			{ 'customData.email': new RegExp(`^${sanitisedUsernameOrEmail}$`, 'i') }],
	}, projection);
};

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

User.updateUserId = async (username, userId) => {
	await updateUser(username, { $set: { 'customData.userId': userId } });
};

User.generateApiKey = async (username) => {
	const apiKey = generateHashString();
	await updateUser(username, { $set: { 'customData.apiKey': apiKey } });
	return apiKey;
};

User.deleteApiKey = (username) => updateUser(username, { $unset: { 'customData.apiKey': 1 } });

User.addUser = async (newUserData) => {
	const customData = {
		createdAt: newUserData.createdAt ?? new Date(),
		userId: newUserData.userId,
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
	};

	await db.createUser(newUserData.username, newUserData.password, customData);
};

User.removeUser = (user) => db.deleteOne(USERS_DB_NAME, USERS_COL, { user });
User.removeUsers = (users) => db.deleteMany(USERS_DB_NAME, USERS_COL, { user: { $in: users } });

User.ensureIndicesExist = async () => {
	try {
		await db.createIndex(USERS_DB_NAME, USERS_COL, { 'customData.userId': 1 }, { runInBackground: true });
	} catch (err) {
		logger.logWarning(`Failed to create index on user ID: ${err?.message}`);
	}
};

module.exports = User;
