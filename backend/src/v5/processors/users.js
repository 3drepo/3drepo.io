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
const { addUser, authenticate, canLogIn, deleteApiKey, generateApiKey,
	getUserByUsername, updatePassword, updateProfile, updateResetPasswordToken, verify } = require('../models/users');
const { fileExists, getFile, storeFile } = require('../services/filesManager');
const { isEmpty, removeFields } = require('../utils/helper/objects');
const config = require('../utils/config');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateHashString } = require('../utils/helper/strings');
const { generateUUIDString } = require('../utils/helper/uuids');
const { generateUserHash } = require('../services/intercom');
const { publish } = require('../services/eventsManager/eventsManager');
const { sendEmail } = require('../services/mailer');
const { templates } = require('../services/mailer/mailer.constants');

Users.signUp = async (newUserData, generatePassword) => {
	const token = generateHashString();

	const formattedNewUserData = { ...newUserData, token };
	if (generatePassword) {
		formattedNewUserData.password = generateUUIDString();
	}

	await addUser(formattedNewUserData);

	await sendEmail(templates.VERIFY_USER.name, newUserData.email, {
		token,
		email: newUserData.email,
		firstName: newUserData.firstName,
		username: newUserData.username,
	});
};

Users.verify = async (username, token) => {
	const customData = await verify(username, token);

	publish(events.USER_VERIFIED, {
		username,
		email: customData.email,
		fullName: `${customData.firstName} ${customData.lastName}`,
		company: customData.billing.billingInfo.company,
		mailListOptOut: customData.mailListOptOut,
	});
};

Users.login = async (username, password) => {
	await canLogIn(username);
	return authenticate(username, password);
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

	const hasAvatar = await fileExists(username);

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

module.exports = Users;
