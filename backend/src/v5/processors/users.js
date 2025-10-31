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

const Users = {};

const { AVATARS_COL_NAME, USERS_DB_NAME } = require('../models/users.constants');
const { addUser, deleteApiKey, generateApiKey, getUserByUsername,
	getUserId, removeUser, updatePassword, updateProfile } = require('../models/users');
const { getFile, removeFile, storeFile } = require('../services/filesManager');
const { getUserAvatarBuffer, getUserById, triggerPasswordReset, updateUserDetails, uploadAvatar } = require('../services/sso/frontegg');
const { deleteIfUndefined } = require('../utils/helper/objects');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { fileExtensionFromBuffer } = require('../utils/helper/typeCheck');
const { generateHashString } = require('../utils/helper/strings');
const { generateUserHash } = require('../services/intercom');
const { logger } = require('../utils/logger');
const { publish } = require('../services/eventsManager/eventsManager');
const { removeAllUserNotifications } = require('../models/notifications');
const { removeAllUserRecords } = require('../models/loginRecords');
const { splitName } = require('../utils/helper/strings');
const { templates } = require('../utils/responseCodes');

// This is used for the situation where a user has a record from
// the IDP but we don't have a matching record in the db. We need
// to create a record (for now, at least) to know the username mapping
// and also to store info such as API Key.
Users.createNewUserRecord = async (idpUserData) => {
	const { id, email, name, createdAt } = idpUserData;

	// idp should always return the email as the firstname so the fall back should, in theory, never be used..
	const [firstName, lastName] = splitName(name) ?? ['UnknownUser', ''];

	const userData = {
		username: id,
		password: generateHashString(),
		firstName,
		lastName,
		email,
		createdAt: new Date(createdAt),
		userId: id,
	};

	await addUser(userData);

	publish(events.USER_CREATED, { username: id, email, fullName: [firstName, lastName].join(' ').trim(), createdAt: userData.createdAt });
	return id;
};

Users.remove = async (username) => {
	await Promise.all([
		removeAllUserRecords(username),
		removeAllUserNotifications(username),
		removeFile(USERS_DB_NAME, AVATARS_COL_NAME, username),
		removeUser(username),
	]);
};

Users.getProfileByUsername = async (username) => {
	const { user, customData: { userId, apiKey } } = await getUserByUsername(username, {
		user: 1,
		'customData.userId': 1,
		'customData.apiKey': 1,
	});
	const { name, email, profilePictureUrl, company, countryCode } = await getUserById(userId);
	const [firstName, lastName] = splitName(name);
	const hasAvatar = !!profilePictureUrl;
	const intercomRef = generateUserHash(email);

	return deleteIfUndefined({
		username: user,
		firstName,
		lastName,
		email,
		hasAvatar,
		apiKey,
		company,
		countryCode,
		intercomRef,
	});
};

Users.updateProfile = async (username, fieldsToUpdate) => {
	const userId = await getUserId(username);

	await Promise.all([
		updateUserDetails(userId, fieldsToUpdate),
		updateProfile(username, fieldsToUpdate),
	]);
};

Users.resetPassword = async (user) => {
	try {
		const { customData: { email } } = await getUserByUsername(user, {
			'customData.email': 1,
		});
		await triggerPasswordReset(email);
	} catch (err) {
		logger.logError(`Failed to reset password: ${err.message}`);

		throw templates.unknown;
	}
};

Users.getAvatar = async (username) => {
	try {
		// NOTE: commenting out the ability to get avatar from IDP for now - we're hitting rate limiting issues.
		// const userId = await getUserId(username);
		// let avatarBuffer = await getUserAvatarBuffer(userId);
		// if (!avatarBuffer) {
		// this means the avatar is not a generated one, so we don't have it cached
		const avatarBuffer = await getFile(USERS_DB_NAME, AVATARS_COL_NAME, username);
		// }
		const fileExt = await fileExtensionFromBuffer(avatarBuffer);

		return {
			buffer: avatarBuffer,
			extension: fileExt || 'png',
		};
	} catch (error) {
		throw templates.fileNotFound;
	}
};

Users.uploadAvatar = async (username, fileObj) => {
	const userId = await getUserId(username);
	await Promise.all([
		uploadAvatar(userId, fileObj),
		storeFile(USERS_DB_NAME, AVATARS_COL_NAME, username, fileObj.buffer),
	]);
};

Users.generateApiKey = generateApiKey;

Users.deleteApiKey = deleteApiKey;

Users.getUserByUsername = getUserByUsername;

Users.updatePassword = updatePassword;

module.exports = Users;
