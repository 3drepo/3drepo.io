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
			const metadata = generateRandomObject();
			const mockedRetVal = generateRandomObject();
			const expectedData = { ...mockedRetVal, ...metadata, metadata };

			WebRequests.get.mockResolvedValueOnce({ data: { ...mockedRetVal, metadata: JSON.stringify(metadata) } });

			await expect(Users.getUserById(userId)).resolves.toEqual(expectedData);

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			expect(WebRequests.get.mock.calls[0][0].includes(userId)).toBeTruthy();
		});

		test('Should get user information (no metadata)', async () => {
			const userId = generateRandomString();
			const res = generateRandomObject();

			WebRequests.get.mockResolvedValueOnce({ data: res });

			await expect(Users.getUserById(userId)).resolves.toEqual({ ...res, metadata: {} });

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

const testGetUserAvatarBuffer = () => {
	describe('Get user avatar buffer', () => {
		test('Should get user avatar buffer', async () => {
			const userId = generateRandomString();
			const profilePictureUrl = generateRandomString();
			const data = generateRandomString();

			jest.spyOn(Users, 'getUserById').mockResolvedValueOnce({ profilePictureUrl });
			WebRequests.getArrayBuffer.mockResolvedValueOnce({
				data,
			});

			await expect(Users.getUserAvatarBuffer(userId)).resolves.toEqual(Buffer.from(data));

			expect(Users.getUserById).toHaveBeenCalledTimes(1);
			expect(Users.getUserById).toHaveBeenCalledWith(userId);

			expect(WebRequests.getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(WebRequests.getArrayBuffer).toHaveBeenCalledWith(profilePictureUrl);
		});

		test('Should throw error if it failed', async () => {
			const userId = generateRandomString();
			const profilePictureUrl = generateRandomString();
			const errorMessage = generateRandomString();

			jest.spyOn(Users, 'getUserById').mockResolvedValueOnce({ profilePictureUrl });
			WebRequests.getArrayBuffer.mockRejectedValueOnce(new Error(errorMessage));

			await expect(Users.getUserAvatarBuffer(userId)).rejects.not.toBeUndefined();

			expect(Users.getUserById).toHaveBeenCalledTimes(1);
			expect(Users.getUserById).toHaveBeenCalledWith(userId);

			expect(WebRequests.getArrayBuffer).toHaveBeenCalledTimes(1);
			expect(WebRequests.getArrayBuffer).toHaveBeenCalledWith(profilePictureUrl);
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

const testUploadAvatar = () => {
	describe('Upload avatar', () => {
		test('Should upload avatar for the user ID specified', async () => {
			const userId = generateRandomString();
			const userData = { tenantId: generateRandomString() };
			const fileObj = { buffer: generateRandomString(),
				originalname: generateRandomString(),
				mimetype: generateRandomString() };
			const responseMock = { data: generateRandomString() };

			jest.spyOn(Users, 'getUserById').mockReturnValueOnce(userData);
			WebRequests.put.mockResolvedValueOnce(responseMock);
			jest.spyOn(Users, 'updateUserDetails').mockResolvedValueOnce();

			await expect(Users.uploadAvatar(userId, fileObj)).resolves.toEqual(undefined);

			expect(WebRequests.put).toHaveBeenCalledTimes(1);
			expect(Users.updateUserDetails).toHaveBeenCalledTimes(1);
			expect(Users.updateUserDetails).toHaveBeenCalledWith(userId, { profilePictureUrl: responseMock.data });
		});

		test('Should throw error if it failed to upload avatar', async () => {
			const userId = generateRandomString();
			const userData = { tenantId: generateRandomString() };
			const fileObj = { buffer: generateRandomString(),
				originalname: generateRandomString(),
				mimetype: generateRandomString() };
			jest.spyOn(Users, 'getUserById').mockReturnValueOnce(userData);

			const mockResponse = { message: generateRandomString() };

			WebRequests.put.mockRejectedValueOnce(mockResponse);
			await expect(Users.uploadAvatar(userId, fileObj)).rejects.not.toBeUndefined();

			expect(WebRequests.put).toHaveBeenCalledTimes(1);
		});
	});
};

const testUpdateUserDetails = () => {
	describe('Update user details', () => {
		test('Should update user details', async () => {
			const userId = generateRandomString();
			const metadataInfo = generateRandomObject();
			const firstName = generateRandomString();
			const lastName = generateRandomString();
			const profilePictureUrl = generateRandomString();
			const existingUser = {
				name: `${generateRandomString()} ${generateRandomString()}`,
				profilePictureUrl: generateRandomString(),
			};

			const expectedPayload = {
				name: `${firstName} ${lastName}`,
				profilePictureUrl,
				metadata: JSON.stringify(metadataInfo),
			};

			jest.spyOn(Users, 'getUserById').mockResolvedValueOnce(existingUser);
			WebRequests.put.mockResolvedValueOnce();

			await expect(Users.updateUserDetails(
				userId,
				{ firstName, lastName, profilePictureUrl, ...metadataInfo },
			)).resolves.toEqual(undefined);

			expect(WebRequests.put).toHaveBeenCalledTimes(1);
			expect(WebRequests.put).toHaveBeenCalledWith(
				expect.any(String), expectedPayload, { headers: bearerHeader },
			);
		});

		test('Should autopopulate the metadata if available and not provided', async () => {
			const userId = generateRandomString();
			const metadataInfo = generateRandomObject();
			const firstName = generateRandomString();
			const lastName = generateRandomString();
			const profilePictureUrl = generateRandomString();
			const existingUser = {
				name: `${generateRandomString()} ${generateRandomString()}`,
				profilePictureUrl: generateRandomString(),
				metadata: metadataInfo,
			};

			const expectedPayload = {
				name: `${firstName} ${lastName}`,
				profilePictureUrl,
				metadata: JSON.stringify(metadataInfo),
			};

			jest.spyOn(Users, 'getUserById').mockResolvedValueOnce(existingUser);
			WebRequests.put.mockResolvedValueOnce();

			await expect(Users.updateUserDetails(
				userId,
				{ firstName, lastName, profilePictureUrl },
			)).resolves.toEqual(undefined);

			expect(WebRequests.put).toHaveBeenCalledTimes(1);
			expect(WebRequests.put).toHaveBeenCalledWith(
				expect.any(String), expectedPayload, { headers: bearerHeader },
			);
		});

		test('Should merge the metadata if there is new and old', async () => {
			const userId = generateRandomString();
			const company = generateRandomString();
			const countryCode = generateRandomString();
			const metadataInfo = {
				[generateRandomString()]: generateRandomString(), countryCode: generateRandomString(),
			};
			const firstName = generateRandomString();
			const lastName = generateRandomString();
			const profilePictureUrl = generateRandomString();
			const existingUser = {
				name: `${generateRandomString()} ${generateRandomString()}`,
				profilePictureUrl: generateRandomString(),
				metadata: metadataInfo,
			};

			const expectedPayload = {
				name: `${firstName} ${lastName}`,
				profilePictureUrl,
				metadata: JSON.stringify({ ...metadataInfo, company, countryCode }),
			};

			jest.spyOn(Users, 'getUserById').mockResolvedValueOnce(existingUser);
			WebRequests.put.mockResolvedValueOnce();

			await expect(Users.updateUserDetails(
				userId,
				{ firstName, lastName, profilePictureUrl, company, countryCode },
			)).resolves.toEqual(undefined);

			expect(WebRequests.put).toHaveBeenCalledTimes(1);
			expect(WebRequests.put).toHaveBeenCalledWith(
				expect.any(String), expectedPayload, { headers: bearerHeader },
			);
		});

		test('Should update user\'s first name only', async () => {
			const userId = generateRandomString();
			const metadataInfo = generateRandomObject();
			const firstName = generateRandomString();
			const profilePictureUrl = generateRandomString();
			const existingLastName = generateRandomString();
			const existingUser = {
				name: `${generateRandomString()} ${existingLastName}`,
				profilePictureUrl: generateRandomString(),
			};

			const expectedPayload = {
				name: `${firstName} ${existingLastName}`,
				profilePictureUrl,
				metadata: JSON.stringify(metadataInfo),
			};

			jest.spyOn(Users, 'getUserById').mockResolvedValueOnce(existingUser);
			WebRequests.put.mockResolvedValueOnce();

			await expect(Users.updateUserDetails(
				userId,
				{ firstName, profilePictureUrl, ...metadataInfo },
			)).resolves.toEqual(undefined);

			expect(WebRequests.put).toHaveBeenCalledTimes(1);
			expect(WebRequests.put).toHaveBeenCalledWith(
				expect.any(String), expectedPayload, { headers: bearerHeader },
			);
		});

		test('Should update user\'s first name only', async () => {
			const userId = generateRandomString();
			const metadataInfo = generateRandomObject();
			const lastName = generateRandomString();
			const profilePictureUrl = generateRandomString();
			const existingFirstName = generateRandomString();
			const existingUser = {
				name: `${existingFirstName} ${generateRandomString()}`,
				profilePictureUrl: generateRandomString(),
			};

			const expectedPayload = {
				name: `${existingFirstName} ${lastName}`,
				profilePictureUrl,
				metadata: JSON.stringify(metadataInfo),
			};

			jest.spyOn(Users, 'getUserById').mockResolvedValueOnce(existingUser);
			WebRequests.put.mockResolvedValueOnce();

			await expect(Users.updateUserDetails(
				userId,
				{ lastName, profilePictureUrl, ...metadataInfo },
			)).resolves.toEqual(undefined);

			expect(WebRequests.put).toHaveBeenCalledTimes(1);
			expect(WebRequests.put).toHaveBeenCalledWith(
				expect.any(String), expectedPayload, { headers: bearerHeader },
			);
		});

		test('Should throw error if it failed to update user details', async () => {
			const userId = generateRandomString();
			const metadataInfo = generateRandomObject();
			const firstName = generateRandomString();
			const lastName = generateRandomString();

			jest.spyOn(Users, 'getUserById').mockResolvedValueOnce({ name: [firstName, lastName].join(' ') });
			WebRequests.put.mockRejectedValueOnce({ message: generateRandomString() });
			await expect(Users.updateUserDetails(
				userId,
				{ firstName, lastName, ...metadataInfo },
			)).rejects.not.toBeUndefined();

			expect(WebRequests.put).toHaveBeenCalledTimes(1);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetUserById();
	testGetUserAvatarBuffer();
	testDoesUserExist();
	testDestroyAllSessions();
	testTriggerPasswordReset();
	testUploadAvatar();
	testUpdateUserDetails();
});
