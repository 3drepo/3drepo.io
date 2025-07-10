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
const { src, image } = require('../../helper/path');
const fs = require('fs');

const Users = require(`${src}/processors/users`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);

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

jest.mock('../../../../src/v5/services/sso/frontegg');
const FronteggService = require(`${src}/services/sso/frontegg`);

const { generateRandomString, determineTestGroup } = require('../../helper/services');

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

const formatUser = (userProfile, hasAvatar, hash) => ({
	username: userProfile.user,
	firstName: userProfile.customData.firstName,
	lastName: userProfile.customData.lastName,
	email: userProfile.customData.email,
	hasAvatar,
	apiKey: userProfile.customData.apiKey,
	countryCode: userProfile.customData.billing.billingInfo.countryCode,
	company: userProfile.customData.billing.billingInfo.company,
	...(hash ? { intercomRef: hash } : {}),
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
			UsersModel.getUserByUsername.mockResolvedValueOnce(user);
			FilesManager.fileExists.mockResolvedValueOnce(true);

			const res = await Users.getProfileByUsername(user.user);
			expect(res).toEqual(formatUser(user, true));
			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(user.user, projection);
		});
	});
};

const tesUpdateProfile = () => {
	describe('Update user profile by username', () => {
		test('should update user profile', async () => {
			const updatedProfile = { firstName: 'Nick', lastName: 'Doe', countryCode: 'US', company: '3D Repo' };
			const backupDataExpected = {
				'customData.firstName': updatedProfile.firstName,
				'customData.lastName': updatedProfile.lastName,
				'customData.billing.billingInfo.countryCode': updatedProfile.countryCode,
				'customData.billing.billingInfo.company': updatedProfile.company,
			};
			const updateProfileExpected = {
				name: `${updatedProfile.firstName} ${updatedProfile.lastName}`,
				metadata: JSON.stringify({ countryCode: updatedProfile.countryCode, company: updatedProfile.company }),
			};
			await Users.updateProfile(user.user, updatedProfile);
			expect(UsersModel.updateProfile.mock.calls.length).toBe(1);
			expect(UsersModel.updateProfile.mock.calls[0][1]).toEqual(updateProfileExpected);
			expect(UsersModel.updateProfile.mock.calls[0][2]).toEqual(backupDataExpected);
		});
	});
};

const testGetAvatarStream = () => {
	describe('Get avatar stream', () => {
		test('should get avatar stream', async () => {
			const username = generateRandomString();
			const imageBuffer = fs.readFileSync(image);
			const mockImageStream = new Blob([imageBuffer], { type: 'image/png' });

			mockImageStream.arrayBuffer = jest.fn().mockResolvedValueOnce(imageBuffer);

			UsersModel.getAvatarStream.mockResolvedValueOnce(mockImageStream);

			await Users.getAvatar(username);
			expect(UsersModel.getAvatarStream).toHaveBeenCalledTimes(1);
			expect(UsersModel.getAvatarStream).toHaveBeenCalledWith(username);
		});
	});
};

const testUploadAvatar = () => {
	describe('Remove old avatar and upload a new one', () => {
		test('should upload new avatar', async () => {
			const username = generateRandomString();
			const userId = generateRandomString();
			const tenantId = generateRandomString();
			const avatarUrl = generateRandomString();
			FronteggService.uploadAvatar.mockResolvedValueOnce(avatarUrl);
			FronteggService.updateUserDetails.mockResolvedValueOnce(generateRandomString());
			UsersModel.getUserByUsername.mockResolvedValueOnce({ customData: { userId } });
			FronteggService.getUserById.mockResolvedValueOnce({ tenantId });

			const avatarObject = {
				path: 'avatar.png',
				buffer: generateRandomString(),
			};
			await Users.uploadAvatar(username, avatarObject);
			expect(FronteggService.uploadAvatar).toHaveBeenCalledTimes(1);
			expect(FronteggService.uploadAvatar).toHaveBeenCalledWith(
				userId, tenantId, expect.any(Object),
			);
			expect(FronteggService.updateUserDetails).toHaveBeenCalledTimes(1);
			expect(FronteggService.updateUserDetails).toHaveBeenCalledWith(userId,
				{ profilePictureUrl: avatarUrl },
			);
			expect(FilesManager.storeFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.storeFile).toHaveBeenCalledWith(USERS_DB_NAME, AVATARS_COL_NAME, username,
				avatarObject.buffer);
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

const testCreateNewUserRecord = () => {
	describe('Create new user record', () => {
		test(`Should create a new user record and trigger the ${events.USER_CREATED} event`, async () => {
			const firstName = generateRandomString();
			const lastName = generateRandomString();
			const userData = {
				id: generateRandomString(),
				name: `${firstName} ${lastName}`,
				createdAt: Date.now(),
				email: generateRandomString(),
			};

			await expect(Users.createNewUserRecord(userData)).resolves.toEqual(userData.id);

			expect(UsersModel.addUser).toHaveBeenCalledTimes(1);
			expect(UsersModel.addUser).toHaveBeenCalledWith({
				username: userData.id,
				password: expect.any(String),
				firstName,
				lastName,
				email: userData.email,
				createdAt: new Date(userData.createdAt),
				userId: userData.id,
			});

			const eventData = {
				username: userData.id,
				email: userData.email,
				createdAt: new Date(userData.createdAt),
				fullName: userData.name,
			};

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.USER_CREATED, eventData);
		});

		test('Should generate a name if none is provided', async () => {
			const userData = {
				id: generateRandomString(),
				createdAt: Date.now(),
				email: generateRandomString(),
			};
			const firstName = 'Anonymous';
			const lastName = 'User';

			await expect(Users.createNewUserRecord(userData)).resolves.toEqual(userData.id);

			expect(UsersModel.addUser).toHaveBeenCalledTimes(1);
			expect(UsersModel.addUser).toHaveBeenCalledWith({
				username: userData.id,
				password: expect.any(String),
				firstName,
				lastName,
				email: userData.email,
				createdAt: new Date(userData.createdAt),
				userId: userData.id,
			});

			const eventData = {
				username: userData.id,
				email: userData.email,
				createdAt: new Date(userData.createdAt),
				fullName: `${firstName} ${lastName}`,
			};

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.USER_CREATED, eventData);
		});

		test('Should work if only a first name is provided', async () => {
			const firstName = generateRandomString();
			const userData = {
				id: generateRandomString(),
				createdAt: Date.now(),
				email: generateRandomString(),
				name: firstName,
			};

			await expect(Users.createNewUserRecord(userData)).resolves.toEqual(userData.id);

			expect(UsersModel.addUser).toHaveBeenCalledTimes(1);
			expect(UsersModel.addUser).toHaveBeenCalledWith({
				username: userData.id,
				password: expect.any(String),
				firstName,
				lastName: '',
				email: userData.email,
				createdAt: new Date(userData.createdAt),
				userId: userData.id,
			});

			const eventData = {
				username: userData.id,
				email: userData.email,
				createdAt: new Date(userData.createdAt),
				fullName: `${firstName} `,
			};

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.USER_CREATED, eventData);
		});
	});
};

const testResetPassword = () => {
	describe('Reset password', () => {
		test('Should get the email from the database then trigger a password reset', async () => {
			const username = generateRandomString();
			const email = generateRandomString();
			UsersModel.getUserByUsername.mockResolvedValueOnce({ customData: { email } });

			await Users.resetPassword(username);

			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(username, { 'customData.email': 1 });

			expect(FronteggService.triggerPasswordReset).toHaveBeenCalledTimes(1);
			expect(FronteggService.triggerPasswordReset).toHaveBeenCalledWith(email);
		});

		test(`Should throw with ${templates.unknown.code} if it failed`, async () => {
			const username = generateRandomString();
			UsersModel.getUserByUsername.mockRejectedValueOnce({ message: generateRandomString() });

			await expect(Users.resetPassword(username)).rejects.toEqual(templates.unknown);

			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(username, { 'customData.email': 1 });

			expect(FronteggService.triggerPasswordReset).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	tesGetProfileByUsername();
	tesUpdateProfile();
	testGetAvatarStream();
	testUploadAvatar();
	testRemoveUser();
	testCreateNewUserRecord();
	testResetPassword();
});
