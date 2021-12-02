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

const _ = require('lodash');

const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const User = require(`${src}/models/users`);

const testGetAccessibleTeamspaces = () => {
	describe('Get accessible teamspaces', () => {
		test('should return list of teamspaces if user exists', async () => {
			const expectedData = {
				roles: [
					{ db: 'ts1', role: 'a' },
					{ db: 'ts2', role: 'b' },
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
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { } });
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
		const results = _.cloneDeep(dataOverride || favouritesData.starredModels);
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
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			const teamspace = 'teamspace3';
			const arr = ['e', 'f'];
			await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBe(undefined);
			checkResults(fn, teamspace, arr, {});
		});

		test('Should add favourite containers under a new teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			const teamspace = 'teamspace3';
			const arr = ['e', 'f'];
			await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBe(undefined);
			checkResults(fn, teamspace, arr);
		});

		test('Should add favourite containers on an existing teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			const teamspace = 'teamspace1';
			const arr = ['d', 'e'];
			await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBe(undefined);
			checkResults(fn, teamspace, arr);
		});

		test('Should add favourite containers on an existing teamspace and ignore duplicate entries', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			const teamspace = 'teamspace1';
			const arr = ['a', 'b', 'c', ' d', 'e'];
			await expect(User.appendFavourites(user, teamspace, arr)).resolves.toBe(undefined);
			checkResults(fn, teamspace, arr);
		});

		test('Should return error when trying to add favourites to a user that doesnt exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
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
		const results = _.cloneDeep(favouritesData.starredModels);
		if (results[teamspace]) {
			const newArr = results[teamspace].filter((id) => !favToRm.includes(id));

			return newArr.length ? { $set: { 'customData.starredModels': results } }
				: { $unset: { [`customData.starredModels.${teamspace}`]: 1 } };
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
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			const teamspace = 'teamspace2';
			const arr = ['d'];
			await expect(User.deleteFavourites('xxx', teamspace, arr)).resolves.toBe(undefined);
			checkResults(fn, teamspace, arr);
		});

		test('Should remove some favourite containers from teamspace', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			const teamspace = 'teamspace1';
			const arr = ['c'];
			await expect(User.deleteFavourites('xxx', teamspace, arr)).resolves.toBe(undefined);
			checkResults(fn, teamspace, arr);
		});

		test('Should return error when trying to remove favourites from a user that doesnt exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			await expect(User.deleteFavourites('xxx', 'teamspace1', ['a', 'b']))
				.rejects.toEqual(templates.userNotFound);
			expect(fn.mock.calls.length).toBe(0);
		});

		test('Should return error when trying to remove favourites that are not in users favourites list', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: favouritesData });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			await expect(User.deleteFavourites('xxx', 'teamspace3', ['e', 'f']))
				.rejects.toEqual({ ...templates.invalidArguments, message: "The IDs provided are not in the user's favourites list" });
			expect(fn.mock.calls.length).toBe(0);
		});

		test('Should return error when trying to remove favourites from a user that has no favourites', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ customData: { } });
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			await expect(User.deleteFavourites('xxx', 'teamspace1', ['a', 'b']))
				.rejects.toEqual({ ...templates.invalidArguments, message: "The IDs provided are not in the user's favourites list" });
			expect(fn.mock.calls.length).toBe(0);
		});
	});
};

const testGetUserByEmail = () => {
	describe('Get user by email', () => {
		test('should user if list of teamspaces if user exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue({ user: 'user1' });
			const res = await User.getUserByEmail('user');
			expect(res).toEqual({ user: 'user1' });
		});

		test('should return error if user does not exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(User.getUserByEmail('user'))
				.rejects.toEqual(templates.userNotFound);
		});
	});
};

const testLogin = () => {
	describe('Login user', () => {
		test('should log in successfully with user that has accepted the latest T&C', async () => {
			const user = {
				user: 'username1',
				customData: {
					lastLoginAt: new Date(),
				},
			};

			jest.spyOn(db, 'authenticate').mockResolvedValue(undefined);
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			const res = await User.login(user, 'password');
			expect(fn.mock.calls.length).toBe(1);
			expect(res).toEqual({ username: 'username1', flags: { termsPrompt: false } });
		});

		test('should log in successfully with user that has not accepted the latest T&C', async () => {
			const user = {
				user: 'username1',
				customData: {
					lastLoginAt: new Date('1/1/1960'),
				},
			};

			jest.spyOn(db, 'authenticate').mockResolvedValue(undefined);
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			const res = await User.login(user, 'password');
			expect(fn.mock.calls.length).toBe(1);
			expect(res).toEqual({ username: 'username1', flags: { termsPrompt: true } });
		});

		test('should log in successfully with user that has no custom data', async () => {
			const user = { user: 'username1' };
			jest.spyOn(db, 'authenticate').mockResolvedValue(undefined);
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => {});
			const res = await User.login(user, 'password');
			expect(fn.mock.calls.length).toBe(1);
			expect(res).toEqual({ username: 'username1', flags: { termsPrompt: true } });
		});

		test('should return error if user is not verified', async () => {
			const user = {
				user: 'username1',
				customData: {
					inactive: true,
				},
			};

			jest.spyOn(db, 'authenticate').mockResolvedValue(undefined);
			await expect(User.login(user, 'password')).rejects.toEqual(templates.userNotVerified);
		});

		test('should return error if username is incorrect', async () => {
			const user = { user: 'username1' };
			jest.spyOn(db, 'authenticate').mockImplementation(() => { throw templates.incorrectUsernameOrPassword; });
			await expect(User.login(user, 'password')).rejects.toEqual(templates.incorrectUsernameOrPassword);
		});

		test('should return error if db.authenticate throws a different error', async () => {
			const user = { user: 'username1' };
			jest.spyOn(db, 'authenticate').mockImplementation(() => { throw templates.unknown; });
			await expect(User.login(user, 'password')).rejects.toEqual(templates.unknown);
		});

		test('should return error with custom message if invalid login attempts are more than prompt threshold', async () => {
			const currentTime = new Date();
			currentTime.setMinutes(currentTime.getMinutes() - 1);
			const user = {
				user: 'username1',
				customData: {
					loginInfo: {
						failedLoginCount: 5,
						lastFailedLoginAt: currentTime,
					},
				},
			};
			jest.spyOn(db, 'authenticate').mockImplementation(() => { throw templates.incorrectUsernameOrPassword; });

			await expect(User.login(user, 'password')).rejects.toEqual({
				...templates.incorrectUsernameOrPassword, message: 'Incorrect username or password (Remaining attempts: 4)',
			});
		});

		test('should return error and submit lockout event if invalid login attempts are more than the maximum', async () => {
			const currentTime = new Date();
			currentTime.setMinutes(currentTime.getMinutes() - 1);
			const user = {
				user: 'username1',
				emaill: 'example@email.com',
				customData: {
					loginInfo: {
						failedLoginCount: 10,
						lastFailedLoginAt: currentTime,
					},
				},
			};
			jest.spyOn(db, 'authenticate').mockImplementation(() => { throw templates.incorrectUsernameOrPassword; });

			await expect(User.login(user, 'password')).rejects.toEqual({
				...templates.incorrectUsernameOrPassword, message: 'Incorrect username or password (Remaining attempts: 0)',
			});
		});
	});
};

describe('models/users', () => {
	testGetAccessibleTeamspaces();
	testGetFavourites();
	testAppendFavourites();
	testDeleteFromFavourites();
	testGetUserByEmail();
	testLogin();
});
