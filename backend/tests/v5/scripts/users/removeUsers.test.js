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
const {
	determineTestGroup,
	db: { createUser, createTeamspace, reset: resetDB },
	generateUserCredentials,
	generateRandomString,

} = require('../../helper/services');

const { src, utilScripts } = require('../../helper/path');

const RemoveUsers = require(`${utilScripts}/users/removeUsers`);
const { disconnect } = require(`${src}/handler/db`);
const { getUserByUsername } = require(`${src}/models/users`);

const { times } = require('lodash');

const { templates } = require(`${src}/utils/responseCodes`);

const generateData = () => ({
	keep: times(8, () => generateUserCredentials()),
	remove: times(15, () => generateUserCredentials()),
});

const setupData = async (userList) => {
	const listOfTeamspaces = times(5, () => generateRandomString());
	await Promise.all(listOfTeamspaces.map(async (teamspace) => {
		await createTeamspace(teamspace);
	}));
	await Promise.all(userList.map(async (user, index) => {
		if (index % 2 === 0) {
			await createUser(user, listOfTeamspaces);
		} else {
			await createUser(user);
		}
	}));
};

const checkUsers = async (users, exists) => {
	await Promise.all(users.map(async (user) => {
		if (exists) {
			await expect(getUserByUsername(user.user)).resolves.not.toBeUndefined();
		} else {
			await expect(getUserByUsername(user.user)).rejects.toEqual(templates.userNotFound);
		}
	}));
};

const runTest = () => {
	describe('Remove users', () => {
		const data = generateData();
		const listOfUsers = [
			...data.keep,
			...data.remove,
		];

		beforeEach(async () => {
			await resetDB();

			await setupData(listOfUsers);
		});

		const expectedError = new Error('A list of users must be provided');

		test('should throw error if a user list is not provided', async () => {
			await expect(RemoveUsers.run()).rejects.toThrow(expectedError);
		});
		test('should do nothing if no users are provided', async () => {
			await expect(RemoveUsers.run(' ')).resolves.toBeUndefined();
			await checkUsers(listOfUsers, true);
		});
		test('should remove users from the system', async () => {
			const usersToRemove = data.remove.map((user) => user.user).join(',');
			await expect(RemoveUsers.run(usersToRemove)).resolves.toBeUndefined();
			await checkUsers(data.keep, true);
			await checkUsers(data.remove, false);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
