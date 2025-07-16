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

const { src } = require('../../helper/path');

const { cloneDeep, times, update } = require('lodash');

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);

jest.mock('../../../../src/v5/services/sso/frontegg');
const FrontEggMock = require(`${src}/services/sso/frontegg`);

const { templates } = require(`${src}/utils/responseCodes`);
const { generateRandomString, determineTestGroup, generateRandomObject } = require('../../helper/services');
const { USERS_DB_NAME, USERS_COL } = require('../../../../src/v5/models/users.constants');

const apiKey = 'b284ab93f936815306fbe5b2ad3e447d';
jest.mock('../../../../src/v5/utils/helper/strings', () => ({
	...jest.requireActual('../../../../src/v5/utils/helper/strings'),
	generateHashString: jest.fn().mockImplementation(() => apiKey),
}));

const User = require(`${src}/models/users`);

const testGetAccessibleTeamspaces = () => {
	describe('Get accessible teamspaces', () => {
		test('should return list of teamspaces if user exists', async () => {
			const expectedData = {
				roles: [
					{ db: 'ts1', role: 'a' },
					{ db: 'ts2', role: 'b' },
					{ db: USERS_DB_NAME, role: generateRandomString() },
				],
			};
			jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const res = await User.getAccessibleTeamspaces('user');
			expect(res).toEqual(['ts1', 'ts2']);
		});

		test('should return error if user does not exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			await expect(User.getAccessibleTeamspaces('user'))
				.rejects.toEqual(templates.userNotFound);
		});
	});
};

const testGetFavourites = () => {
	const favouritesData = {
		teamspace1: [],
		teamspace2: ['a', 'b', 'c'],
	};
	describe.each([
		['xxx', 'teamspace1', favouritesData.teamspace1],
		['xxx', 'teamspace2', favouritesData.teamspace2],
		['xxx', 'teamspace3', []],
	])('Get favourites', (user, teamspace, result) => {
		test(`Getting favourites for ${teamspace} should return ${result.length} entries`, async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { starredModels: favouritesData } });
			const res = await User.getFavourites(user, teamspace);
			expect(res).toEqual(result);
		});
	});

	describe('Get favourites (no data)', () => {
		test('Getting favourites when the user has no favourites entry should return an empty array', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: {} });
			const res = await User.getFavourites('xxx', 'yyy');
			expect(res).toEqual([]);
		});
	});
};

const testAppendFavourites = () => {
	const favouritesData = {
		starredModels: {
			teamspace1: ['a', 'b', 'c'],
			teamspace2: ['d'],
		},
	};

	const user = 'xxx';

	const determineAction = (teamspace, favToAdd, dataOverride) => {
		const results = cloneDeep(dataOverride || favouritesData.starredModels);
		results[teamspace] = results[teamspace] || [];
		favToAdd.forEach((id) => {
			if (!results[teamspace].includes(id)) results[teamspace].push(id);
		});
		return { $set: { 'customData.starredModels': results } };
	};

	const checkResults = (fn, teamspace, arr, dataOverride) => {
		expect(fn.mock.calls.length).toBe(1);
		expect(fn.mock.calls[0][2]).toEqual({ user });
		expect(fn.mock.calls[0][3]).toEqual(determineAction(teamspace, arr, dataOverride));
	};

	describe('Add containers to favourites', () => {
		test('Should add favourite containers if the user has no favourites entry', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: {} });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			const teamspace = 'teamspace3';
			const arr = ['e', 'f'];
			await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBeUndefined();
			checkResults(fn, teamspace, arr, {});
		});

		test('Should add favourite containers under a new teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			const teamspace = 'teamspace3';
			const arr = ['e', 'f'];
			await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBeUndefined();
			checkResults(fn, teamspace, arr);
		});

		test('Should add favourite containers on an existing teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			const teamspace = 'teamspace1';
			const arr = ['d', 'e'];
			await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBeUndefined();
			checkResults(fn, teamspace, arr);
		});

		test('Should add favourite containers on an existing teamspace and ignore duplicate entries', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			const teamspace = 'teamspace1';
			const arr = ['a', 'b', 'c', ' d', 'e'];
			await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBeUndefined();
			checkResults(fn, teamspace, arr);
		});

		test('Should return error when trying to add favourites to a user that doesnt exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			await expect(User.appendFavourites(user, 'teamspace3', ['e', 'f']))
				.rejects.toEqual(templates.userNotFound);
			expect(fn.mock.calls.length).toBe(0);
		});
	});
};

const testDeleteFromFavourites = () => {
	const favouritesData = {
		starredModels: {
			teamspace1: ['a', 'b', 'c'],
			teamspace2: ['d'],
		},
	};

	const user = 'xxx';

	const determineAction = (teamspace, favToRm) => {
		const results = cloneDeep(favouritesData.starredModels);
		if (results[teamspace]) {
			if (favToRm?.length) {
				const newArr = results[teamspace].filter((id) => !favToRm.includes(id));

				return newArr.length ? { $set: { 'customData.starredModels': results } }
					: { $unset: { [`customData.starredModels.${teamspace}`]: 1 } };
			}
			return { $unset: { [`customData.starredModels.${teamspace}`]: 1 } };
		}

		return undefined;
	};

	const checkResults = (fn, teamspace, arr) => {
		expect(fn.mock.calls.length).toBe(1);
		expect(fn.mock.calls[0][2]).toEqual({ user });
		expect(fn.mock.calls[0][3]).toEqual(determineAction(teamspace, arr));
	};

	describe('Remove container from favourites', () => {
		test('Should remove all favourite containers from a teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			const teamspace = 'teamspace2';
			const arr = ['d'];
			await expect(User.deleteFavourites('xxx', teamspace, arr)).resolves.toBeUndefined();
			checkResults(fn, teamspace, arr);
		});

		test('Should remove all favourite containers from a teamspace if an array is not provided', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			const teamspace = 'teamspace2';
			await expect(User.deleteFavourites('xxx', teamspace)).resolves.toBeUndefined();
			checkResults(fn, teamspace);
		});

		test('Should remove some favourite containers from teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			const teamspace = 'teamspace1';
			const arr = ['c'];
			await expect(User.deleteFavourites('xxx', teamspace, arr)).resolves.toBeUndefined();
			checkResults(fn, teamspace, arr);
		});

		test('Should return error when trying to remove favourites from a user that doesnt exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			await expect(User.deleteFavourites('xxx', 'teamspace1', ['a', 'b']))
				.rejects.toEqual(templates.userNotFound);
			expect(fn.mock.calls.length).toBe(0);
		});

		test('Should return error when trying to remove favourites that are not in users favourites list', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			await expect(User.deleteFavourites('xxx', 'teamspace3', ['e', 'f']))
				.rejects.toEqual({ ...templates.invalidArguments, message: "The IDs provided are not in the user's favourites list" });
			expect(fn.mock.calls.length).toBe(0);
		});

		test('Should not return error when trying to remove all favourites from a specific teamspace but the user doesn\'t have any', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValueOnce({ customData: {} });
			const fn = jest.spyOn(db, 'updateOne').mockImplementationOnce(() => { });
			await expect(User.deleteFavourites('xxx', 'teamspace3')).resolves.toBeUndefined();
			expect(fn).not.toHaveBeenCalled();
		});

		test('Should return error when trying to remove favourites from a user that has no favourites', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: {} });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			await expect(User.deleteFavourites('xxx', 'teamspace1', ['a', 'b']))
				.rejects.toEqual({ ...templates.invalidArguments, message: "The IDs provided are not in the user's favourites list" });
			expect(fn.mock.calls.length).toBe(0);
		});
	});
};

const testUpdateProfile = () => {
	describe('Update user profile', () => {
		test('should update a user profile', async () => {
			const fn1 = jest.spyOn(db, 'updateOne').mockImplementationOnce(() => { });
			const updatedProfileMock = generateRandomObject();
			const updateDataMock = {};

			Object.keys(updatedProfileMock).forEach((key) => {
				updateDataMock[`customData.${key}`] = updatedProfileMock[key];
			});

			await expect(User.updateProfile('user 1', updatedProfileMock)).resolves.toBeUndefined();

			expect(fn1.mock.calls.length).toBe(1);
			expect(fn1.mock.calls[0][3]).toEqual({ $set: updateDataMock });
		});

		test('should update a user profile with billing data', async () => {
			const fn1 = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			const billingInfoFields = ['countryCode', 'company'];
			const updatedProfileMock = generateRandomObject();
			updatedProfileMock.countryCode = generateRandomString();
			updatedProfileMock.company = generateRandomString();
			const updateDataMock = {};
			Object.keys(updatedProfileMock).forEach((key) => {
				if (billingInfoFields.includes(key)) {
					updateDataMock[`customData.billing.billingInfo.${key}`] = updatedProfileMock[key];
				} else {
					updateDataMock[`customData.${key}`] = updatedProfileMock[key];
				}
			});

			await expect(User.updateProfile('user 1', updatedProfileMock)).resolves.toBeUndefined();
			expect(fn1.mock.calls.length).toBe(1);
			expect(fn1.mock.calls[0][3]).toEqual({
				$set: updateDataMock,
			});
		});
	});
};

const testGenerateApiKey = () => {
	describe('Generate Api Key and assign it to the user', () => {
		test('should generate an Api key and assign it to the user', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			const res = await User.generateApiKey('user1');
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][3]).toEqual({ $set: { 'customData.apiKey': apiKey } });
			expect(res).toEqual(apiKey);
		});
	});
};

const testDeleteApiKey = () => {
	describe('Delete Api Key of the user', () => {
		test('should delete the Api key of the user', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => { });
			await User.deleteApiKey('user1');
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][3]).toEqual({ $unset: { 'customData.apiKey': 1 } });
		});
	});
};

const testGetUserByUsernameOrEmail = () => {
	describe('Get user by username or email', () => {
		test('should return user by username if user exists', async () => {
			const username = 'user';
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({ user: username });
			const res = await User.getUserByUsernameOrEmail(username);
			expect(res).toEqual({ user: username });
			expect(fn.mock.calls.length).toBe(1);
			// eslint-disable-next-line security/detect-non-literal-regexp
			expect(fn.mock.calls[0][2]).toEqual({ $or: [{ user: username }, { 'customData.email': new RegExp(`^${username.replace(/(\W)/g, '\\$1')}$`, 'i') }] });
		});

		test('should return user by email if user exists', async () => {
			const email = 'example@email.com';
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({ user: 'user' });
			const res = await User.getUserByUsernameOrEmail(email);
			expect(res).toEqual({ user: 'user' });
			expect(fn.mock.calls.length).toBe(1);
			// eslint-disable-next-line security/detect-non-literal-regexp
			expect(fn.mock.calls[0][2]).toEqual({ $or: [{ user: email }, { 'customData.email': new RegExp(`^${email.replace(/(\W)/g, '\\$1')}$`, 'i') }] });
		});

		test('should throw error if user does not exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(User.getUserByUsernameOrEmail('user')).rejects.toEqual(templates.userNotFound);
		});
	});
};

const testGetUserByEmail = () => {
	describe('Get user by email', () => {
		test('should return user by email if user exists', async () => {
			const email = 'example@email.com';
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({ user: 'user' });
			const res = await User.getUserByEmail(email);
			expect(res).toEqual({ user: 'user' });
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(USERS_DB_NAME, USERS_COL, { 'customData.email': 'example@email.com' }, undefined, undefined);
		});

		test('should throw error if user does not exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(User.getUserByEmail('user')).rejects.toEqual(templates.userNotFound);
		});
	});
};

const testGetUsersByQuery = () => {
	describe('Get users by query', () => {
		test('should return users that satisfies the query', async () => {
			const expectedRes = times(10, () => ({ [generateRandomString()]: generateRandomString() }));
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedRes);
			const query = { [generateRandomString()]: generateRandomString() };
			const proj = { [generateRandomString()]: generateRandomString() };
			const res = await User.getUsersByQuery(query, proj);
			expect(res).toEqual(expectedRes);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(USERS_DB_NAME, USERS_COL, query, proj);
		});
	});
};

const formatNewUserData = (newUserData, createdAt) => {
	const formattedData = {
		createdAt,
		firstName: newUserData.firstName,
		lastName: newUserData.lastName,
		email: newUserData.email,
		userId: newUserData.userId,
		mailListOptOut: !newUserData.mailListAgreed,
		billing: {
			billingInfo: {
				firstName: newUserData.firstName,
				lastName: newUserData.lastName,
				countryCode: newUserData.countryCode,
				company: newUserData.company,
			},
		},
	};
	return formattedData;
};

const testAddUser = () => {
	describe('Add a new user', () => {
		test('should add a new user', async () => {
			const newUserData = {
				username: generateRandomString(),
				userId: generateRandomString(),
				email: 'example@email.com',
				password: generateRandomString(),
				firstName: generateRandomString(),
				lastName: generateRandomString(),
				mailListAgreed: true,
				countryCode: 'GB',
				company: generateRandomString(),
			};

			const fn = jest.spyOn(db, 'createUser');
			await User.addUser(newUserData);
			expect(fn).toHaveBeenCalledTimes(1);
			const userCustomData = fn.mock.calls[0][2];
			expect(userCustomData).toHaveProperty('createdAt');
			const expectedCustomData = formatNewUserData(newUserData, userCustomData.createdAt);
			expect(fn).toHaveBeenCalledWith(newUserData.username, newUserData.password, expectedCustomData);
		});

		test('should add a new user with the specified createdAt timestamp if it is provided', async () => {
			const newUserData = {
				username: generateRandomString(),
				userId: generateRandomString(),
				createdAt: new Date(),
				email: 'example@email.com',
				password: generateRandomString(),
				firstName: generateRandomString(),
				lastName: generateRandomString(),
				mailListAgreed: true,
				countryCode: 'GB',
				company: generateRandomString(),
			};

			const fn = jest.spyOn(db, 'createUser');
			await User.addUser(newUserData);
			expect(fn).toHaveBeenCalledTimes(1);
			const expectedCustomData = formatNewUserData(newUserData, newUserData.createdAt);
			expect(fn).toHaveBeenCalledWith(newUserData.username, newUserData.password, expectedCustomData);
		});
	});
};

const testRemoveUser = () => {
	describe('Drop user', () => {
		test('Should call deleteOne to remove the user from the database', async () => {
			const fn = jest.spyOn(db, 'deleteOne').mockResolvedValueOnce(undefined);

			const username = generateRandomString();
			await expect(User.removeUser(username)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(USERS_DB_NAME, USERS_COL, { user: username });
		});
	});
};

const testRemoveUsers = () => {
	describe('Drop users', () => {
		test('Should call deleteMany to remove the users from the database', async () => {
			const users = times(10, () => generateRandomString());
			const fn = jest.spyOn(db, 'deleteMany').mockResolvedValueOnce(undefined);

			await expect(User.removeUsers(users)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(USERS_DB_NAME, USERS_COL, { user: { $in: users } });
		});
	});
};

const testUpdateUserId = () => {
	describe('Set user ref Id', () => {
		test('Should update the reference ID as instructed', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			const refId = generateRandomString();
			const user = generateRandomString();
			await User.updateUserId(user, refId);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(USERS_DB_NAME, USERS_COL, { user }, { $set: { 'customData.userId': refId } });
		});
	});
};

const testGetUserId = () => {
	describe('Get user ref Id', () => {
		test('Should get the reference ID as instructed', async () => {
			const refId = generateRandomString();
			const user = generateRandomString();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ customData: { userId: refId } });
			await expect(User.getUserId(user)).resolves.toEqual(refId);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(USERS_DB_NAME, USERS_COL, { user },
				{ 'customData.userId': 1 }, undefined);
		});
	});
};

const testEnsureIndicesExist = () => {
	describe('Ensure indices exist', () => {
		test('Should call createIndex', async () => {
			const fn = jest.spyOn(db, 'createIndex');
			await User.ensureIndicesExist();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(USERS_DB_NAME, USERS_COL, { 'customData.userId': 1 }, { runInBackground: true });
		});

		test('Should fail gracefully if it failed', async () => {
			const fn = jest.spyOn(db, 'createIndex').mockRejectedValue({ message: generateRandomString() });
			await User.ensureIndicesExist();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(USERS_DB_NAME, USERS_COL, { 'customData.userId': 1 }, { runInBackground: true });
		});
	});
};

const testGetUserInfoFromEmailArray = () => {
	describe('Get users information from an array of emails', () => {
		test('Should retrieve an array of users', async () => {
			const userEntriesMock = times(10, (iterator) => {
				if (iterator % 2 === 0) {
					return {
						user: generateRandomString(),
						customData: {
							email: generateRandomString(),
							userId: generateRandomString(),
							firstName: generateRandomString(),
							lastName: generateRandomString(),
							billing: {} },
					};
				}
				return {
					user: generateRandomString(),
					customData: {
						email: generateRandomString(),
						userId: generateRandomString(),
						firstName: generateRandomString(),
						lastName: generateRandomString(),
						billing: {
							billingInfo: {
								company: generateRandomString(),
							},
						},
					},
				};
			});
			const listOfEmails = userEntriesMock.map(({ customData }) => customData.email);
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(userEntriesMock);
			const mockGetUserByEmail = jest.spyOn(User, 'getUsersByQuery');
			const projection = {
				[generateRandomString()]: generateRandomString(),
			};

			const res = await User.getUserInfoFromEmailArray(listOfEmails, projection);

			expect(res).toEqual(userEntriesMock);
			expect(mockGetUserByEmail).toHaveBeenCalledTimes(1);
			expect(mockGetUserByEmail).toHaveBeenCalledWith(
				{ 'customData.email': { $in: listOfEmails } },
				projection,
			);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(
				USERS_DB_NAME, USERS_COL,
				{ 'customData.email': { $in: listOfEmails } },
				projection,
			);
		});
	});
};

const testGetAvatarStream = () => {
	describe('Get avatar stream', () => {
		test('should return avatar stream if user exists', async () => {
			const mockBlob = new Blob([''], { type: 'image/png' });
			global.fetch = jest.fn(() => Promise.resolve(mockBlob));
			const user = 'user1';
			const userId = generateRandomString();
			const profilePictureUrl = generateRandomString();
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { userId } });
			FrontEggMock.getUserById.mockResolvedValue({ profilePictureUrl });
			const res = await User.getAvatarStream(user);

			expect(res).toEqual(mockBlob);
		});

		test('should throw error if user does not exist', async () => {
			const user = 'user1';
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(User.getAvatarStream(user)).rejects.toEqual(templates.unknown);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetAccessibleTeamspaces();
	testGetFavourites();
	testAppendFavourites();
	testDeleteFromFavourites();
	testUpdateProfile();
	testGenerateApiKey();
	testDeleteApiKey();
	testGetUserByUsernameOrEmail();
	testGetUserByEmail();
	testGetUsersByQuery();
	testAddUser();
	testRemoveUser();
	testRemoveUsers();
	testGetUserId();
	testUpdateUserId();
	testEnsureIndicesExist();
	testGetUserInfoFromEmailArray();
	testGetAvatarStream();
});
