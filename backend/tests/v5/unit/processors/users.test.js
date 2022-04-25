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

const { templates: emailTemplates } = require('../../../../src/v5/services/mailer/mailer.constants');
const { templates } = require('../../../../src/v5/utils/responseCodes');
const { src } = require('../../helper/path');

const Users = require(`${src}/processors/users`);

jest.mock('../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);
jest.mock('../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);
jest.mock('../../../../src/v5/utils/helper/strings');
const Strings = require(`${src}/utils/helper/strings`);
jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { generateRandomString } = require('../../helper/services');

const exampleHashString = generateRandomString();

const user = {
	user: generateRandomString(),
	customData: {
		firstName: generateRandomString(),
		lastName: generateRandomString(),
		email: generateRandomString(),
		avatar: true,
		apiKey: 123,
		billing: {
			billingInfo: {
				countryCode: 'GB',
				company: generateRandomString(),
			},
		},
		resetPasswordToken: {
			token: generateRandomString(),
			expiredAt: new Date(2030, 1, 1),
		},

		mailListOptOut: false,
	},
};

const getUserByUsernameMock = UsersModel.getUserByUsername.mockImplementation((username) => {
	if (username === user.user) {
		return user;
	}

	throw templates.userNotFound;
});

const verifyMock = UsersModel.verify.mockImplementation(() => user.customData);
UsersModel.canLogIn.mockImplementation(() => user);
UsersModel.authenticate.mockResolvedValue(user.user);
Strings.generateHashString.mockImplementation(() => exampleHashString);
Strings.formatPronouns.mockImplementation((str) => str);

const testLogin = () => {
	describe('Login', () => {
		test('should login with username', async () => {
			const res = await Users.login(user.user);
			expect(res).toEqual(user.user);
		});

		test('should fail if canLogIn fails', async () => {
			UsersModel.canLogIn.mockImplementationOnce(() => { throw templates.userNotFound; });
			await expect(Users.login(user.user)).rejects.toEqual(templates.userNotFound);
		});
	});
};

const formatUser = (userProfile) => ({
	username: userProfile.user,
	firstName: userProfile.customData.firstName,
	lastName: userProfile.customData.lastName,
	email: userProfile.customData.email,
	hasAvatar: !!userProfile.customData.avatar,
	apiKey: userProfile.customData.apiKey,
	countryCode: userProfile.customData.billing.billingInfo.countryCode,
	company: userProfile.customData.billing.billingInfo.company,
});

const tesGetProfileByUsername = () => {
	describe('Get user profile by username', () => {
		test('should return user profile', async () => {
			const projection = {
				user: 1,
				'customData.firstName': 1,
				'customData.lastName': 1,
				'customData.email': 1,
				'customData.avatar': 1,
				'customData.apiKey': 1,
				'customData.billing.billingInfo.countryCode': 1,
				'customData.billing.billingInfo.company': 1,
			};

			const res = await Users.getProfileByUsername(user.user);
			expect(res).toEqual(formatUser(user));
			expect(getUserByUsernameMock.mock.calls.length).toBe(1);
			expect(getUserByUsernameMock.mock.calls[0][1]).toEqual(projection);
		});
	});
};

const tesUpdateProfile = () => {
	describe('Update user profile by username', () => {
		test('should update user profile', async () => {
			const updatedProfile = { firstName: 'Nick' };
			await Users.updateProfile(user.user, updatedProfile);
			expect(UsersModel.updateProfile.mock.calls.length).toBe(1);
			expect(UsersModel.updateProfile.mock.calls[0][1]).toEqual(updatedProfile);
		});

		test('should update user profile and password', async () => {
			const updatedProfile = { firstName: 'Nick', oldPassword: 'oldPass', newPassword: 'newPass' };
			await Users.updateProfile(user.user, updatedProfile);
			expect(UsersModel.updateProfile.mock.calls.length).toBe(1);
			expect(UsersModel.updateProfile.mock.calls[0][1]).toEqual({ firstName: 'Nick' });
			expect(UsersModel.updatePassword.mock.calls.length).toBe(1);
			expect(UsersModel.updatePassword.mock.calls[0][1]).toEqual('newPass');
		});

		test('should update password', async () => {
			const updatedProfile = { oldPassword: 'oldPass', newPassword: 'newPass' };
			await Users.updateProfile(user.user, updatedProfile);
			expect(UsersModel.updateProfile.mock.calls.length).toBe(0);
			expect(UsersModel.updatePassword.mock.calls.length).toBe(1);
			expect(UsersModel.updatePassword.mock.calls[0][1]).toEqual('newPass');
		});
	});
};

const testGenerateResetPasswordToken = () => {
	describe('Reset password token', () => {
		test('should reset password token', async () => {
			await Users.generateResetPasswordToken(user.user);
			expect(UsersModel.updateResetPasswordToken).toHaveBeenCalledTimes(1);
			expect(UsersModel.updateResetPasswordToken.mock.calls[0][1]).toHaveProperty('expiredAt');
			const { expiredAt } = UsersModel.updateResetPasswordToken.mock.calls[0][1];
			expect(UsersModel.updateResetPasswordToken)
				.toHaveBeenCalledWith(user.user, { token: exampleHashString, expiredAt });
			expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
			expect(Mailer.sendEmail).toHaveBeenCalledWith(emailTemplates.FORGOT_PASSWORD.name, user.customData.email,
				{
					token: exampleHashString,
					email: user.customData.email,
					username: user.user,
					firstName: user.customData.firstName,
				});
		});

		test('should reset password token', async () => {
			await expect(Users.generateResetPasswordToken('user2'))
				.rejects.toEqual(templates.userNotFound);
		});
	});
};

const testSignUp = () => {
	describe('Sign up a user', () => {
		const newUserData = {
			username: generateRandomString(),
			email: generateRandomString(),
			password: generateRandomString(),
			firstName: generateRandomString(),
		};

		test('should sign a user up', async () => {
			await Users.signUp(newUserData);
			expect(UsersModel.addUser).toHaveBeenCalledTimes(1);
			expect(UsersModel.addUser).toHaveBeenCalledWith({ ...newUserData, token: exampleHashString });
			expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
			expect(Mailer.sendEmail).toHaveBeenCalledWith(emailTemplates.VERIFY_USER.name, newUserData.email, {
				token: exampleHashString,
				email: newUserData.email,
				firstName: newUserData.firstName,
				username: newUserData.username,
			});
		});
	});
};

const testVerify = () => {
	describe('Verify a user', () => {
		test('should verify a user', async () => {
			const token = generateRandomString();
			await Users.verify(user.user, token);
			expect(verifyMock).toHaveBeenCalledTimes(1);
			expect(verifyMock).toHaveBeenCalledWith(user.user, token);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.USER_VERIFIED, {
				username: user.user,
				email: user.customData.email,
				fullName: `${user.customData.firstName} ${user.customData.lastName}`,
				company: user.customData.billing.billingInfo.company,
				mailListOptOut: user.customData.mailListOptOut,
			});
		});
	});
};

describe('processors/users', () => {
	testLogin();
	tesGetProfileByUsername();
	tesUpdateProfile();
	testGenerateResetPasswordToken();
	testSignUp();
	testVerify();
});
