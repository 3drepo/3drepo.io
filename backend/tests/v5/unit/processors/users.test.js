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
const { AVATARS_COL_NAME, USERS_DB_NAME } = require('../../../../src/v5/models/users.constants');
const { src } = require('../../helper/path');

const Users = require(`${src}/processors/users`);

jest.mock('../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

jest.mock('../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

jest.mock('../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../src/v5/models/loginRecords');
const LoginRecords = require(`${src}/models/loginRecords`);

jest.mock('../../../../src/v5/models/notifications');
const Notifications = require(`${src}/models/notifications`);

jest.mock('../../../../src/v5/services/intercom');
const Intercom = require(`${src}/services/intercom`);

const { generateRandomString } = require('../../helper/services');

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);

const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

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

UsersModel.getUserByUsername.mockImplementation((username) => {
	if (username === user.user) {
		return user;
	}

	throw templates.userNotFound;
});

const verifyMock = UsersModel.verify.mockImplementation(() => user.customData);

const testLogin = () => {
	describe('Login', () => {
		test('should login with username', async () => {
			UsersModel.authenticate.mockResolvedValueOnce(user.user);
			const res = await Users.login(user.user);
			expect(res).toEqual(user.user);
		});

		test('should return whatever failure authentication returns', async () => {
			const err = new Error(generateRandomString());
			UsersModel.authenticate.mockRejectedValueOnce(err);
			await expect(Users.login(user.user)).rejects.toEqual(err);
		});
	});
};

const formatUser = (userProfile, hasAvatar, hash, sso) => ({
	username: userProfile.user,
	firstName: userProfile.customData.firstName,
	lastName: userProfile.customData.lastName,
	email: userProfile.customData.email,
	hasAvatar,
	apiKey: userProfile.customData.apiKey,
	countryCode: userProfile.customData.billing.billingInfo.countryCode,
	company: userProfile.customData.billing.billingInfo.company,
	...(hash ? { intercomRef: hash } : {}),
	...(sso ? { sso } : {}),
});

const tesGetProfileByUsername = () => {
	describe('Get user profile by username', () => {
		const projection = {
			user: 1,
			'customData.firstName': 1,
			'customData.lastName': 1,
			'customData.email': 1,
			'customData.apiKey': 1,
			'customData.billing.billingInfo.countryCode': 1,
			'customData.billing.billingInfo.company': 1,
			'customData.sso': 1,
		};

		test('should return user profile', async () => {
			UsersModel.getUserByUsername.mockResolvedValueOnce(user);
			FilesManager.fileExists.mockResolvedValueOnce(false);

			const res = await Users.getProfileByUsername(user.user);
			expect(res).toEqual(formatUser(user, false));
			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(user.user, projection);
		});

		test('should return user profile with intercom reference if configured', async () => {
			UsersModel.getUserByUsername.mockResolvedValueOnce(user);
			FilesManager.fileExists.mockResolvedValueOnce(false);

			const hash = generateRandomString();
			Intercom.generateUserHash.mockReturnValueOnce(hash);
			const res = await Users.getProfileByUsername(user.user);
			expect(res).toEqual(formatUser(user, false, hash));
			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(user.user, projection);
		});

		test('should return user profile with avatar', async () => {
			UsersModel.getUserByUsername.mockResolvedValueOnce(user);
			FilesManager.fileExists.mockResolvedValueOnce(true);

			const res = await Users.getProfileByUsername(user.user);
			expect(res).toEqual(formatUser(user, true));
			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(user.user, projection);
		});

		test('should return user profile with SSO user', async () => {
			const ssoType = generateRandomString();
			UsersModel.getUserByUsername.mockResolvedValueOnce({
				...user, customData: { ...user.customData, sso: { id: generateRandomString(), type: ssoType } },
			});
			FilesManager.fileExists.mockResolvedValueOnce(true);

			const res = await Users.getProfileByUsername(user.user);
			expect(res).toEqual(formatUser(user, true, undefined, ssoType));
			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(user.user, projection);
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
				.toHaveBeenCalledWith(user.user, { token: expect.any(String), expiredAt });
			expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
			expect(Mailer.sendEmail).toHaveBeenCalledWith(emailTemplates.FORGOT_PASSWORD.name, user.customData.email,
				{
					token: expect.any(String),
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
		beforeAll(() => {
			jest.useFakeTimers('modern');
			jest.setSystemTime(new Date(2020, 3, 1));
		});

		const newUserData = {
			username: generateRandomString(),
			email: generateRandomString(),
			password: generateRandomString(),
			firstName: generateRandomString(),
			lastName: generateRandomString(),
			company: generateRandomString(),
			mailListOptOut: true,
		};

		test('should sign a user up and send verification email (non SSO user)', async () => {
			await Users.signUp(newUserData);
			expect(UsersModel.addUser).toHaveBeenCalledTimes(1);
			expect(UsersModel.addUser).toHaveBeenCalledWith({ ...newUserData, token: expect.any(String) });
			expect(Mailer.sendEmail).toHaveBeenCalledTimes(1);
			expect(Mailer.sendEmail).toHaveBeenCalledWith(emailTemplates.VERIFY_USER.name, newUserData.email, {
				token: expect.any(String),
				email: newUserData.email,
				firstName: newUserData.firstName,
				username: newUserData.username,
			});
			expect(EventsManager.publish).not.toHaveBeenCalled();
		});

		test('should generate a password sign a user up and fire VERIFY_USER event (SSO user)', async () => {
			const sso = { id: generateRandomString() };
			jest.mock('../../../../src/v5/models/users');
			const UsersModel = require(`${src}/models/users`);
			await Users.signUp({ ...newUserData, sso });
			expect(UsersModel.addUser).toHaveBeenCalledTimes(1);
			expect(UsersModel.addUser).toHaveBeenCalledWith({
				...newUserData,
				password: expect.any(String),
				sso,
			});
			expect(Mailer.sendEmail).not.toHaveBeenCalled();
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.USER_VERIFIED, {
				username: newUserData.username,
				email: newUserData.email,
				fullName: `${newUserData.firstName} ${newUserData.lastName}`,
				company: newUserData.company,
				mailListOptOut: newUserData.mailListOptOut,
				createdAt: new Date(),
			});
		});
	});

	afterAll(() => {
		jest.useRealTimers();
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
				createdAt: user.customData.createdAt,
			});
		});
	});
};

const testGetAvatarStream = () => {
	describe('Get avatar stream', () => {
		test('should get avatar stream', async () => {
			const username = generateRandomString();
			const stream = generateRandomString();
			FilesManager.getFile.mockResolvedValueOnce(stream);
			await Users.getAvatar(username);
			expect(FilesManager.getFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFile).toHaveBeenCalledWith(USERS_DB_NAME, AVATARS_COL_NAME, username);
		});
	});
};

const testUploadAvatar = () => {
	describe('Remove old avatar and upload a new one', () => {
		test('should upload new avatar', async () => {
			const username = generateRandomString();
			const avatarBuffer = generateRandomString();
			await Users.uploadAvatar(username, avatarBuffer);
			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(USERS_DB_NAME, AVATARS_COL_NAME, username,
				avatarBuffer);
		});
	});
};

const testRemoveUser = () => {
	describe('Removing a user', () => {
		test('Should call all relevant functions to clean up user data', async () => {
			const username = generateRandomString();
			await Users.remove(username);

			expect(UsersModel.removeUser).toHaveBeenCalledTimes(1);
			expect(UsersModel.removeUser).toHaveBeenCalledWith(username);

			expect(FilesManager.removeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.removeFile).toHaveBeenCalledWith(USERS_DB_NAME, AVATARS_COL_NAME, username);

			expect(LoginRecords.removeAllUserRecords).toHaveBeenCalledTimes(1);
			expect(LoginRecords.removeAllUserRecords).toHaveBeenCalledWith(username);

			expect(Notifications.removeAllUserNotifications).toHaveBeenCalledTimes(1);
			expect(Notifications.removeAllUserNotifications).toHaveBeenCalledWith(username);
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
	testGetAvatarStream();
	testUploadAvatar();
	testRemoveUser();
});
