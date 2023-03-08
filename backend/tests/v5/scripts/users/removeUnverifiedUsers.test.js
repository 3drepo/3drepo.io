/**
 *  Copyright (C) 2022 3D Repo Ltd
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
	db: { reset: resetDB, createUser },
	generateRandomString,
	generateRandomDate,
	generateUserCredentials,
} = require('../../helper/services');

const { times } = require('lodash');

const { src, utilScripts } = require('../../helper/path');

const RemoveUnverifiedUsers = require(`${utilScripts}/users/removeUnverifiedUsers`);
const { disconnect } = require(`${src}/handler/db`);

const { getUsersByQuery } = require(`${src}/models/users`);

const randomDateInFuture = () => generateRandomDate(new Date(Date.now() + 100), new Date(Date.now() + 1000000));
const randomDateInPast = () => generateRandomDate(new Date(Date.now() - 1000000), new Date());

const setupData = async () => {
	const shouldKeep = await Promise.all(times(6, async (n) => {
		const user = generateUserCredentials();
		const extraData = n < 3 ? {} : {
			inactive: true,
			emailVerifyToken: {
				token: generateRandomString(),
				expiredAt: randomDateInFuture(),
			},
		};
		await createUser(user, [], extraData);
		return user.user;
	}));

	await Promise.all(times(6, async () => {
		const user = generateUserCredentials();
		const extraData = {
			inactive: true,
			emailVerifyToken: {
				token: generateRandomString(),
				expiredAt: randomDateInPast(),
			},
		};
		await createUser(user, [], extraData);
	}));

	return shouldKeep;
};

const runTest = () => {
	describe('Remove unverified users with expired tokens', () => {
		let data;
		beforeAll(async () => {
			await resetDB();
			data = await setupData();
		});
		test('should remove all inactive users with expired verify tokens', async () => {
			await RemoveUnverifiedUsers.run();

			const userList = await getUsersByQuery({}, { user: 1, 'customData.emailVerifyToken.expiredAt': 1 });

			expect(userList.length).toBe(data.length);
			expect(userList.map(({ user }) => user)).toEqual(expect.arrayContaining(data));
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
