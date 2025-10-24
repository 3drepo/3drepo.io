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

const { generateRandomString, generateRandomObject, determineTestGroup } = require('../../helper/services');

const user = {
	user: generateRandomString(),
	customData: {
		userId: generateRandomString(),
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

const ssoUser = {
	name: `${user.customData.firstName} ${user.customData.lastName}`,
	email: user.customData.email,
	profilePictureUrl: generateRandomString(),
	company: user.customData.billing.billingInfo.company,
	countryCode: user.customData.billing.billingInfo.countryCode,
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
	countryCode: userProfile.customData.billing?.billingInfo.countryCode,
	company: userProfile.customData.billing?.billingInfo.company,
	...(hash ? { intercomRef: hash } : {}),
});

const tesGetProfileByUsername = () => {
	describe('Get user profile by username', () => {
		const projection = {
			user: 1,
			'customData.userId': 1,
			'customData.apiKey': 1,
		};

		test('should return user profile', async () => {
			UsersModel.getUserByUsername.mockResolvedValueOnce(user);
			FronteggService.getUserById.mockResolvedValueOnce(ssoUser);

			const res = await Users.getProfileByUsername(user.user);
			expect(res).toEqual(formatUser(user, true));
			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(user.user, projection);
			expect(FronteggService.getUserById).toHaveBeenCalledTimes(1);
			expect(FronteggService.getUserById).toHaveBeenCalledWith(user.customData.userId);
		});

		test('should return user profile with empty metadata if it does not exist', async () => {
			const userWithoutMetadata = {
				user: generateRandomString(),
				customData: {
					userId: generateRandomString(),
					firstName: generateRandomString(),
					lastName: generateRandomString(),
					email: generateRandomString(),
					avatar: true,
					apiKey: 123,
					resetPasswordToken: {
						token: generateRandomString(),
						expiredAt: new Date(2030, 1, 1),
					},

					mailListOptOut: false,
				},
			};
			const ssoUserNoMeta = {
				name: `${userWithoutMetadata.customData.firstName} ${userWithoutMetadata.customData.lastName}`,
				email: userWithoutMetadata.customData.email,
				profilePictureUrl: generateRandomString(),
			};
			UsersModel.getUserByUsername.mockResolvedValueOnce(userWithoutMetadata);
			FronteggService.getUserById.mockResolvedValueOnce(ssoUserNoMeta);

			const res = await Users.getProfileByUsername(userWithoutMetadata.user);
			expect(res).toEqual(formatUser(userWithoutMetadata, true));
			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(userWithoutMetadata.user, projection);
			expect(FronteggService.getUserById).toHaveBeenCalledTimes(1);
			expect(FronteggService.getUserById).toHaveBeenCalledWith(userWithoutMetadata.customData.userId);
		});

		test('should return user profile with intercom reference if configured', async () => {
			UsersModel.getUserByUsername.mockResolvedValueOnce(user);
			FronteggService.getUserById.mockResolvedValueOnce(ssoUser);

			const hash = generateRandomString();
			Intercom.generateUserHash.mockReturnValueOnce(hash);
			const res = await Users.getProfileByUsername(user.user);
			expect(res).toEqual(formatUser(user, true, hash));
			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(user.user, projection);
			expect(FronteggService.getUserById).toHaveBeenCalledTimes(1);
			expect(FronteggService.getUserById).toHaveBeenCalledWith(user.customData.userId);
		});

		test('should return user profile with SSO user', async () => {
			UsersModel.getUserByUsername.mockResolvedValueOnce(user);
			FronteggService.getUserById.mockResolvedValueOnce(ssoUser);

			const res = await Users.getProfileByUsername(user.user);
			expect(res).toEqual(formatUser(user, true));
			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(user.user, projection);
			expect(FronteggService.getUserById).toHaveBeenCalledTimes(1);
			expect(FronteggService.getUserById).toHaveBeenCalledWith(user.customData.userId);
		});
	});
};

const tesUpdateProfile = () => {
	describe('Update user profile by username', () => {
		test('should update user profile', async () => {
			UsersModel.getUserId.mockResolvedValueOnce(user.user);
			const updatedProfile = { firstName: 'Nick', lastName: 'Doe', countryCode: 'US', company: '3D Repo' };

			await Users.updateProfile(user.user, updatedProfile);

			expect(UsersModel.updateProfile.mock.calls.length).toBe(1);
			expect(UsersModel.updateProfile.mock.calls[0][0]).toEqual(user.user);
			expect(UsersModel.updateProfile.mock.calls[0][1]).toEqual(updatedProfile);
			expect(FronteggService.updateUserDetails.mock.calls.length).toBe(1);
			expect(FronteggService.updateUserDetails.mock.calls[0][0]).toEqual(user.user);
			expect(FronteggService.updateUserDetails.mock.calls[0][1]).toEqual(updatedProfile);
		});
	});
};

const testGetAvatar = () => {
	describe('Get avatar', () => {
		test('should get avatar', async () => {
			const username = generateRandomString();
			const mockImageBuffer = generateRandomString();
			const expectedPayload = { buffer: mockImageBuffer, extension: 'png' };

			UsersModel.getUserId.mockResolvedValueOnce(username);
			FronteggService.getUserAvatarBuffer.mockResolvedValueOnce(mockImageBuffer);

			await expect(Users.getAvatar(username)).resolves.toEqual(expectedPayload);

			expect(FronteggService.getUserAvatarBuffer).toHaveBeenCalledTimes(1);
			expect(FronteggService.getUserAvatarBuffer).toHaveBeenCalledWith(username);

			expect(FilesManager.getFile).not.toHaveBeenCalled();
		});
		test('should fallback and get the image from db if avatar is not found', async () => {
			const username = generateRandomString();
			const mockImageBuffer = generateRandomString();
			const expectedPayload = { buffer: mockImageBuffer, extension: 'png' };

			UsersModel.getUserId.mockResolvedValueOnce(username);
			FronteggService.getUserAvatarBuffer.mockResolvedValueOnce(null);
			FilesManager.getFile.mockResolvedValueOnce(mockImageBuffer);

			await expect(Users.getAvatar(username)).resolves.toEqual(expectedPayload);

			expect(FronteggService.getUserAvatarBuffer).toHaveBeenCalledTimes(1);
			expect(FronteggService.getUserAvatarBuffer).toHaveBeenCalledWith(username);

			expect(FilesManager.getFile).toHaveBeenCalledTimes(1);
			expect(FilesManager.getFile).toHaveBeenCalledWith(USERS_DB_NAME, AVATARS_COL_NAME, username);
		});
		test('should throw an error if something happens', async () => {
			const username = generateRandomString();

			UsersModel.getUserId.mockResolvedValueOnce(username);
			FronteggService.getUserAvatarBuffer.mockRejectedValueOnce(new Error('Failed to fetch avatar'));

			await expect(Users.getAvatar(username)).rejects.toEqual(templates.fileNotFound);
			expect(FronteggService.getUserAvatarBuffer).toHaveBeenCalledTimes(1);
			expect(FronteggService.getUserAvatarBuffer).toHaveBeenCalledWith(username);
			expect(FilesManager.getFile).not.toHaveBeenCalled();
		});
	});
};

const testUploadAvatar = () => {
	describe('Remove old avatar and upload a new one', () => {
		const avatarObject = generateRandomObject();
		test('should upload new avatar and remove the temporary file', async () => {
			const username = generateRandomString();
			const userId = generateRandomString();
			const tenantId = generateRandomString();

			UsersModel.getUserId.mockResolvedValueOnce(userId);
			FronteggService.uploadAvatar.mockResolvedValueOnce(undefined);
			FronteggService.getUserById.mockResolvedValueOnce({ tenantId });

			await expect(Users.uploadAvatar(username, avatarObject)).resolves.toEqual(undefined);
			expect(FronteggService.uploadAvatar).toHaveBeenCalledTimes(1);
			expect(FronteggService.uploadAvatar).toHaveBeenCalledWith(
				userId, avatarObject,
			);
		});
		test('should fail removing the temporary avatar file', async () => {
			const username = generateRandomString();
			const userId = generateRandomString();
			const tenantId = generateRandomString();

			UsersModel.getUserId.mockResolvedValueOnce(userId);
			FronteggService.uploadAvatar.mockResolvedValueOnce(undefined);
			FronteggService.getUserById.mockResolvedValueOnce({ tenantId });

			await expect(Users.uploadAvatar(username, avatarObject)).resolves.toEqual(undefined);
			expect(FronteggService.uploadAvatar).toHaveBeenCalledTimes(1);
			expect(FronteggService.uploadAvatar).toHaveBeenCalledWith(
				userId, avatarObject,
			);
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
			const firstName = 'UnknownUser';
			const lastName = '';

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
				fullName: [firstName, lastName].join(' ').trim(),
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
				fullName: `${firstName}`,
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
	testGetAvatar();
	testUploadAvatar();
	testRemoveUser();
	testCreateNewUserRecord();
	testResetPassword();
});
