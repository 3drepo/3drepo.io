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

UsersModel.canLogIn.mockImplementation((user) => user);
UsersModel.authenticate.mockResolvedValue('user1');

const user = {
	user: 'user1',
	customData: {
		firstname: 'Will',
		lastname: 'Smith',
		email: 'example@email.com',
		avatar: true,
		apiKey: 123,
	},
};
const getUserByUsernameMock = UsersModel.getUserByUsername.mockImplementation(() => user);
const updateUserByUsernameMock = UsersModel.updateProfile.mockImplementation(() => {});

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
			};

			const res = await Users.getProfileByUsername();
			expect(res).toEqual(formatUser(user));
			expect(getUserByUsernameMock.mock.calls.length).toBe(1);
			expect(getUserByUsernameMock.mock.calls[0][1]).toEqual(projection);
		});
	});
};

const tesUpdateProfile = () => {
	describe('Update user profile by username', () => {
		test('should return user profile', async () => {
			const updatedProfile = {
				firstname: 'Nick',
			};

			await Users.updateProfile('user 1', updatedProfile);
			expect(updateUserByUsernameMock.mock.calls.length).toBe(1);
			expect(updateUserByUsernameMock.mock.calls[0][1]).toEqual(updatedProfile);
		});
	});
};

describe('processors/users', () => {
	testLogin();
	tesGetProfileByUsername();
	tesUpdateProfile();
});
