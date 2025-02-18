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
const { AVATARS_COL_NAME, USERS_DB_NAME } = require('../../../../src/v5/models/users.constants');
const { src } = require('../../helper/path');

const Users = require(`${src}/processors/users`);

jest.mock('../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

jest.mock('../../../../src/v5/services/filesManager');
const FilesManager = require(`${src}/services/filesManager`);

jest.mock('../../../../src/v5/models/loginRecords');
const LoginRecords = require(`${src}/models/loginRecords`);

jest.mock('../../../../src/v5/models/notifications');
const Notifications = require(`${src}/models/notifications`);

jest.mock('../../../../src/v5/services/intercom');
const Intercom = require(`${src}/services/intercom`);

const { generateRandomString } = require('../../helper/services');

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
	tesGetProfileByUsername();
	tesUpdateProfile();
	testGetAvatarStream();
	testUploadAvatar();
	testRemoveUser();
});
