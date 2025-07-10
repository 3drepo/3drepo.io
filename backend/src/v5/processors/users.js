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
const { addUser, deleteApiKey, generateApiKey, getAvatarStream,
	getUserByUsername, removeUser, updatePassword, updateProfile } = require('../models/users');
const { fileExists, removeFile, storeFile } = require('../services/filesManager');
const { getUserById, triggerPasswordReset, updateUserDetails, uploadAvatar } = require('../services/sso/frontegg');
const FormData = require('form-data');
const Path = require('path');
const { createReadStream } = require('fs');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { fileExtensionFromBuffer } = require('../utils/helper/typeCheck');
const { generateHashString } = require('../utils/helper/strings');
const { generateUserHash } = require('../services/intercom');
const { logger } = require('../utils/logger');
const { publish } = require('../services/eventsManager/eventsManager');
const { removeAllUserNotifications } = require('../models/notifications');
const { removeAllUserRecords } = require('../models/loginRecords');
const { templates } = require('../utils/responseCodes');

// This is used for the situation where a user has a record from
// the IDP but we don't have a matching record in the db. We need
// to create a record (for now, at least) to know the username mapping
// and also to store info such as API Key.
Users.createNewUserRecord = async (idpUserData) => {
	const { id, email, name, createdAt } = idpUserData;
	const [firstName, ...remaining] = name?.split(' ') ?? ['Anonymous', 'User'];
	const lastName = remaining?.join(' ');

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

	publish(events.USER_CREATED, { username: id, email, fullName: [firstName, remaining].join(' '), createdAt: userData.createdAt });
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
	const user = await getUserByUsername(username, {
		user: 1,
		'customData.firstName': 1,
		'customData.lastName': 1,
		'customData.email': 1,
		'customData.apiKey': 1,
		'customData.billing.billingInfo.company': 1,
		'customData.billing.billingInfo.countryCode': 1,
	});

	const { customData } = user;

	const hasAvatar = await fileExists(USERS_DB_NAME, AVATARS_COL_NAME, username);

	const intercomRef = generateUserHash(customData.email);

	return {
		username: user.user,
		firstName: customData.firstName,
		lastName: customData.lastName,
		email: customData.email,
		hasAvatar,
		apiKey: customData.apiKey,
		company: customData.billing?.billingInfo?.company,
		countryCode: customData.billing?.billingInfo?.countryCode,
		...(intercomRef ? { intercomRef } : {}),
	};
};

Users.updateProfile = async (username, fieldsToUpdate) => {
	const name = `${fieldsToUpdate.firstName} ${fieldsToUpdate.lastName}`.trim();
	const metadata = {};
	const backupData = {};
	const billingInfoFields = ['countryCode', 'company'];

	Object.keys(fieldsToUpdate).forEach((key) => {
		if (billingInfoFields.includes(key)) {
			backupData[`customData.billing.billingInfo.${key}`] = fieldsToUpdate[key];
			metadata[key] = fieldsToUpdate[key];
		} else {
			backupData[`customData.${key}`] = fieldsToUpdate[key];
		}
	});

	await updateProfile(username, { name, metadata: JSON.stringify(metadata) }, backupData);
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
	const avatarStream = await getAvatarStream(username);
	const arrayBuffer = await avatarStream.arrayBuffer();
	const fileExt = await fileExtensionFromBuffer(Buffer.from(arrayBuffer));

	return {
		buffer: Buffer.from(arrayBuffer),
		extension: fileExt,
	};
};

Users.uploadAvatar = async (username, avatarObject) => {
	const { customData: { userId } } = await getUserByUsername(username, { 'customData.userId': 1 });
	const { tenantId } = await getUserById(userId);

	const filePath = Path.resolve(avatarObject.path);
	const formData = new FormData();
	formData.append('image', createReadStream(filePath));

	const profilePictureUrl = await uploadAvatar(
		userId,
		tenantId,
		formData,
	);

	await updateUserDetails(userId, { profilePictureUrl });

	storeFile(USERS_DB_NAME, AVATARS_COL_NAME, username, avatarObject.buffer);
};

Users.generateApiKey = generateApiKey;

Users.deleteApiKey = deleteApiKey;

Users.getUserByUsername = getUserByUsername;

Users.updatePassword = updatePassword;

module.exports = Users;
