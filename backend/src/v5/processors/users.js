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

const { addUser, authenticate, canLogIn, deleteApiKey, generateApiKey, getAvatar,
	getUserByUsername, updatePassword, updateProfile, updateResetPasswordToken, uploadAvatar, verify } = require('../models/users');
const { isEmpty, removeFields } = require('../utils/helper/objects');
const config = require('../utils/config');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateHashString } = require('../utils/helper/strings');
const { publish } = require('../services/eventsManager/eventsManager');
const { templates } = require('../services/mailer/mailer.constants');
const { sendEmail } = require('../services/mailer');

Users.signUp = async (newUserData) => {
	const token = generateHashString();
	await addUser({ ...newUserData, token });
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
		'customData.avatar': 1,
		'customData.apiKey': 1,
		'customData.billing.billingInfo.company': 1,
		'customData.billing.billingInfo.countryCode': 1,
	});

	const { customData } = user;

	return {
		username: user.user,
		firstName: customData.firstName,
		lastName: customData.lastName,
		email: customData.email,
		hasAvatar: !!customData.avatar,
		apiKey: customData.apiKey,
		company: customData.billing?.billingInfo?.company,
		countryCode: customData.billing?.billingInfo?.countryCode,
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

Users.getAvatar = getAvatar;

Users.uploadAvatar = uploadAvatar;

Users.generateResetPasswordToken = async (username) => {
	const expiredAt = new Date();
	expiredAt.setHours(expiredAt.getHours() + config.tokenExpiry.forgotPassword);
	const resetPasswordToken = { token: generateHashString(), expiredAt };

	await updateResetPasswordToken(username, resetPasswordToken);

	const { customData: { email, firstName } } = await getUserByUsername(username, { user: 1, 'customData.email': 1, 'customData.firstName': 1 });
	sendEmail(templates.FORGOT_PASSWORD.name, email, { token: resetPasswordToken.token, email, username, firstName });
};

Users.updatePassword = updatePassword;

module.exports = Users;
