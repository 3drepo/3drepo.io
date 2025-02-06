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
const { addUser, authenticate, deleteApiKey, generateApiKey,
	getUserByUsername, linkToSso, removeUser, unlinkFromSso, updatePassword, updateProfile, updateResetPasswordToken, verify } = require('../models/users');
const { fileExists, getFile, removeFile, storeFile } = require('../services/filesManager');
const { isEmpty, removeFields } = require('../utils/helper/objects');
const config = require('../utils/config');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateHashString } = require('../utils/helper/strings');
const { generateUserHash } = require('../services/intercom');
const { publish } = require('../services/eventsManager/eventsManager');
const { removeAllUserNotifications } = require('../models/notifications');
const { removeAllUserRecords } = require('../models/loginRecords');
const { sendEmail } = require('../services/mailer');
const { templates } = require('../services/mailer/mailer.constants');

// This is used for the situation where a user has a record from
// the IDP but we don't have a matching record in the db. We need
// to create a record (for now, at least) to know the username mapping
// and also to store info such as API Key.
Users.createNewUserRecord = async (idpUserData) => {
	const { id, email, name, createdAt } = idpUserData;
	const [firstName, ...renaming] = name?.split(' ') ?? ['Anonymous', 'User'];
	const lastName = renaming?.join(' ') ?? '';

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
	return id;
};

Users.signUp = async (newUserData) => {
	const isSso = !!newUserData.sso;
	const formattedNewUserData = { ...newUserData };
	if (isSso) {
		formattedNewUserData.password = generateHashString();
	} else {
		formattedNewUserData.token = generateHashString();
	}

	await addUser(formattedNewUserData);

	if (isSso) {
		publish(events.USER_VERIFIED, {
			username: newUserData.username,
			email: newUserData.email,
			fullName: `${newUserData.firstName} ${newUserData.lastName}`,
			company: newUserData.company,
			mailListOptOut: newUserData.mailListOptOut,
			createdAt: new Date(),
		});
	} else {
		await sendEmail(templates.VERIFY_USER.name, newUserData.email, {
			token: formattedNewUserData.token,
			email: newUserData.email,
			firstName: newUserData.firstName,
			username: newUserData.username,
		});
	}
};

Users.verify = async (username, token) => {
	const customData = await verify(username, token);

	publish(events.USER_VERIFIED, {
		username,
		email: customData.email,
		fullName: `${customData.firstName} ${customData.lastName}`,
		company: customData.billing.billingInfo.company,
		mailListOptOut: customData.mailListOptOut,
		createdAt: customData.createdAt,
	});
};

Users.remove = async (username) => {
	await Promise.all([
		removeAllUserRecords(username),
		removeAllUserNotifications(username),
		removeFile(USERS_DB_NAME, AVATARS_COL_NAME, username),
		removeUser(username),
	]);
};

Users.login = authenticate;

Users.getProfileByUsername = async (username) => {
	const user = await getUserByUsername(username, {
		user: 1,
		'customData.firstName': 1,
		'customData.lastName': 1,
		'customData.email': 1,
		'customData.apiKey': 1,
		'customData.billing.billingInfo.company': 1,
		'customData.billing.billingInfo.countryCode': 1,
		'customData.sso': 1,
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
		...(customData.sso ? { sso: customData.sso.type } : {}),
	};
};

Users.updateProfile = async (username, updatedProfile) => {
	if (updatedProfile.oldPassword) {
		await updatePassword(username, updatedProfile.newPassword);
	}

	const fieldsToUpdate = removeFields(updatedProfile, 'oldPassword', 'newPassword');
	if (!isEmpty(fieldsToUpdate)) {
		await updateProfile(username, fieldsToUpdate);
	}
};

Users.generateApiKey = generateApiKey;

Users.deleteApiKey = deleteApiKey;

Users.getUserByUsername = getUserByUsername;

Users.getAvatar = (username) => getFile(USERS_DB_NAME, AVATARS_COL_NAME, username);

Users.uploadAvatar = (username, avatarBuffer) => storeFile(USERS_DB_NAME, AVATARS_COL_NAME, username, avatarBuffer);

Users.generateResetPasswordToken = async (username) => {
	const expiredAt = new Date();
	expiredAt.setHours(expiredAt.getHours() + config.tokenExpiry.forgotPassword);
	const resetPasswordToken = { token: generateHashString(), expiredAt };

	await updateResetPasswordToken(username, resetPasswordToken);

	const { customData: { email, firstName } } = await getUserByUsername(username, { user: 1,
		'customData.email': 1,
		'customData.firstName': 1 });
	await sendEmail(templates.FORGOT_PASSWORD.name, email, { token: resetPasswordToken.token,
		email,
		username,
		firstName });
};

Users.updatePassword = updatePassword;

Users.unlinkFromSso = unlinkFromSso;

Users.linkToSso = linkToSso;

module.exports = Users;
