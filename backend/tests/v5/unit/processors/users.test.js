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

const exampleHashString = 'example token';

const user = {
	user: 'user1',
	customData: {
		firstName: 'Will',
		lastName: 'Smith',
		email: 'example@email.com',
		avatar: true,
		apiKey: 123,
		billing: {
			billingInfo: {
				countryCode: 'GB',
				company: '3D Repo',
			},
		},
		resetPasswordToken: {
			token: 'valid token',
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
const updateUserByUsernameMock = UsersModel.updateProfile.mockImplementation(() => {});
const updatePasswordMock = UsersModel.updatePassword.mockImplementation(() => {});
const updateResetPasswordTokenMock = UsersModel.updateResetPasswordToken.mockImplementation(() => {});
const addUserMock = UsersModel.addUser.mockImplementation(() => {});
const verifyMock = UsersModel.verify.mockImplementation(() => {});
const publishFn = EventsManager.publish.mockImplementation(() => { });
UsersModel.canLogIn.mockImplementation(() => user);
UsersModel.authenticate.mockResolvedValue('user1');
const sendResetPasswordEmailMock = Mailer.sendResetPasswordEmail.mockImplementation(() => {});
Strings.generateHashString.mockImplementation(() => exampleHashString);
Strings.capitalizeFirstLetter.mockImplementation((s) => s);
Strings.formatPronouns.mockImplementation((str) => str);

const testLogin = () => {
	describe('Login', () => {
		test('should login with username', async () => {
			const res = await Users.login('user1');
			expect(res).toEqual('user1');
		});

		test('should fail if canLogIn fails', async () => {
			UsersModel.canLogIn.mockImplementationOnce(() => { throw templates.userNotFound; });
			await expect(Users.login('user1')).rejects.toEqual(templates.userNotFound);
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

			const res = await Users.getProfileByUsername('user1');
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
			await Users.updateProfile('user1', updatedProfile);
			expect(updateUserByUsernameMock.mock.calls.length).toBe(1);
			expect(updateUserByUsernameMock.mock.calls[0][1]).toEqual(updatedProfile);
		});

		test('should update user profile and password', async () => {
			const updatedProfile = { firstName: 'Nick', oldPassword: 'oldPass', newPassword: 'newPass' };
			await Users.updateProfile('user1', updatedProfile);
			expect(updateUserByUsernameMock.mock.calls.length).toBe(1);
			expect(updateUserByUsernameMock.mock.calls[0][1]).toEqual({ firstName: 'Nick' });
			expect(updatePasswordMock.mock.calls.length).toBe(1);
			expect(updatePasswordMock.mock.calls[0][1]).toEqual('newPass');
		});

		test('should update password', async () => {
			const updatedProfile = { oldPassword: 'oldPass', newPassword: 'newPass' };
			await Users.updateProfile('user1', updatedProfile);
			expect(updateUserByUsernameMock.mock.calls.length).toBe(0);
			expect(updatePasswordMock.mock.calls.length).toBe(1);
			expect(updatePasswordMock.mock.calls[0][1]).toEqual('newPass');
		});
	});
};

const testGenerateResetPasswordToken = () => {
	describe('Reset password token', () => {
		test('should reset password token', async () => {
			await Users.generateResetPasswordToken('user1');
			expect(updateResetPasswordTokenMock.mock.calls.length).toBe(1);
			expect(updateResetPasswordTokenMock.mock.calls[0][0]).toBe('user1');
			expect(updateResetPasswordTokenMock.mock.calls[0][1]).toHaveProperty('expiredAt');
			const { expiredAt } = updateResetPasswordTokenMock.mock.calls[0][1];
			expect(updateResetPasswordTokenMock.mock.calls[0][1])
				.toStrictEqual({ token: exampleHashString, expiredAt });
			expect(sendResetPasswordEmailMock.mock.calls.length).toBe(1);
			expect(sendResetPasswordEmailMock.mock.calls[0][0]).toBe(user.customData.email);
			expect(sendResetPasswordEmailMock.mock.calls[0][1]).toStrictEqual({ token: exampleHashString,
				email: user.customData.email,
				username: 'user1',
				firstName: user.customData.firstName });
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
			username: 'newUsername',
			email: 'newEmail',
			password: 'newPassword',
			firstName: 'newname',
		};

		test('should sign a user up', async () => {
			const sendVerifyUserEmailMock = Mailer.sendVerifyUserEmail.mockImplementation(() => {});

			await Users.signUp(newUserData);
			expect(addUserMock.mock.calls.length).toBe(1);
			expect(addUserMock.mock.calls[0][0]).toEqual({ ...newUserData, token: exampleHashString });
			expect(sendVerifyUserEmailMock.mock.calls.length).toBe(1);
			expect(sendVerifyUserEmailMock.mock.calls[0][0]).toEqual(newUserData.email);
			expect(sendVerifyUserEmailMock.mock.calls[0][1]).toEqual({
				token: exampleHashString,
				email: newUserData.email,
				firstName: newUserData.firstName,
				username: newUserData.username,
			});
		});

		test('should sign a user up even if verification email fails to be sent', async () => {
			const sendVerifyUserEmailMock = Mailer.sendVerifyUserEmail.mockImplementation(() => {
				throw templates.unknown;
			});

			await Users.signUp(newUserData);
			expect(addUserMock.mock.calls.length).toBe(1);
			expect(addUserMock.mock.calls[0][0]).toEqual({ ...newUserData, token: exampleHashString });
			expect(sendVerifyUserEmailMock.mock.calls.length).toBe(1);
			expect(sendVerifyUserEmailMock.mock.calls[0][0]).toEqual(newUserData.email);
			expect(sendVerifyUserEmailMock.mock.calls[0][1]).toEqual({
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
			await Users.verify(user.user, 'someToken');
			expect(verifyMock.mock.calls.length).toBe(1);
			expect(verifyMock.mock.calls[0][0]).toEqual(user.user);
			expect(verifyMock.mock.calls[0][1]).toEqual('someToken');
			expect(getUserByUsernameMock.mock.calls.length).toBe(1);
			expect(getUserByUsernameMock.mock.calls[0][0]).toEqual(user.user);
			expect(getUserByUsernameMock.mock.calls[0][1]).toEqual({
				'customData.firstName': 1,
				'customData.lastName': 1,
				'customData.email': 1,
				'customData.billing.billingInfo.company': 1,
				'customData.mailListOptOut': 1,
			});
			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.USER_VERIFIED);
			expect(publishFn.mock.calls[0][1]).toEqual({
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
