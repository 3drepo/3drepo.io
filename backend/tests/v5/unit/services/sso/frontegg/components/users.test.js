/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { src } = require('../../../../../helper/path');

const { determineTestGroup, generateRandomString, generateRandomObject } = require('../../../../../helper/services');

jest.mock('../../../../../../../src/v5/services/sso/frontegg/components/connections');
const Connections = require(`${src}/services/sso/frontegg/components/connections`);

jest.mock('../../../../../../../src/v5/utils/webRequests');
const WebRequests = require(`${src}/utils/webRequests`);

const { HEADER_USER_ID } = require(`${src}/services/sso/frontegg/frontegg.constants`);

const Users = require(`${src}/services/sso/frontegg/components/users`);

const bearerHeader = { [generateRandomString()]: generateRandomString() };

const postOptions = { headers: bearerHeader };

Connections.getBearerHeader.mockResolvedValue(bearerHeader);
Connections.getConfig.mockResolvedValue({});

const testGetUserById = () => {
	describe('Get user by ID', () => {
		test('Should get user information', async () => {
			const userId = generateRandomString();
			const res = generateRandomObject();

			WebRequests.get.mockResolvedValueOnce({ data: res });

			await expect(Users.getUserById(userId)).resolves.toEqual(res);

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			expect(WebRequests.get.mock.calls[0][0].includes(userId)).toBeTruthy();
		});

		test('Should throw error if it failed', async () => {
			const userId = generateRandomString();

			WebRequests.get.mockRejectedValueOnce({ message: generateRandomString() });

			await expect(Users.getUserById(userId)).rejects.not.toBeUndefined();

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			expect(WebRequests.get.mock.calls[0][0].includes(userId)).toBeTruthy();
		});
	});
};

const testDoesUserExist = () => {
	describe('Does user exist', () => {
		test('Should return user Id if it exists', async () => {
			const email = generateRandomString();
			const userId = generateRandomString();

			WebRequests.get.mockResolvedValueOnce({ data: { id: userId } });

			await expect(Users.doesUserExist(email)).resolves.toEqual(userId);

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			expect(WebRequests.get.mock.calls[0][0].includes(email)).toBeTruthy();
		});

		test('Should return false if it does not exist', async () => {
			const email = generateRandomString();

			WebRequests.get.mockRejectedValueOnce({ message: generateRandomString() });

			await expect(Users.doesUserExist(email)).resolves.toBe(false);

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			expect(WebRequests.get.mock.calls[0][0].includes(email)).toBeTruthy();
		});
	});
};

const testDestroyAllSessions = () => {
	describe('Destroy all sessions', () => {
		test('Should destroy sessions for the user ID specified', async () => {
			const userId = generateRandomString();

			await Users.destroyAllSessions(userId);

			const expectedHeader = { ...bearerHeader,
				[HEADER_USER_ID]: userId,
			};

			expect(WebRequests.delete).toHaveBeenCalledTimes(1);
			expect(WebRequests.delete).toHaveBeenCalledWith(expect.any(String), expectedHeader);
		});

		test('Should reject if something went wrong', async () => {
			const userId = generateRandomString();

			WebRequests.delete.mockRejectedValueOnce({ message: generateRandomString() });

			await expect(Users.destroyAllSessions(userId)).rejects.not.toBeUndefined();

			const expectedHeader = { ...bearerHeader,
				[HEADER_USER_ID]: userId,
			};

			expect(WebRequests.delete).toHaveBeenCalledTimes(1);
			expect(WebRequests.delete).toHaveBeenCalledWith(expect.any(String), expectedHeader);
		});
	});
};

const testTriggerPasswordReset = () => {
	describe('Trigger password reset', () => {
		test('Should trigger password reset with the email provided', async () => {
			const email = generateRandomString();

			await Users.triggerPasswordReset(email);

			expect(WebRequests.post).toHaveBeenCalledTimes(1);
			expect(WebRequests.post).toHaveBeenCalledWith(expect.any(String), { email }, postOptions);
		});

		test('Should throw error it failed to trigger password reset', async () => {
			const email = generateRandomString();

			WebRequests.post.mockRejectedValueOnce({ message: generateRandomString() });

			await expect(Users.triggerPasswordReset(email)).rejects.not.toBeUndefined();

			expect(WebRequests.post).toHaveBeenCalledTimes(1);
			expect(WebRequests.post).toHaveBeenCalledWith(expect.any(String), { email }, postOptions);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetUserById();
	testDoesUserExist();
	testDestroyAllSessions();
	testTriggerPasswordReset();
});
