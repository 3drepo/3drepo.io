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
	db: { reset: resetDB, createUser, createTeamspace, addLoginRecords },
	generateRandomString,
	generateUserCredentials,
	fileExists,
	generateRandomNumber,
} = require('../../helper/services');

const { times } = require('lodash');
const { readFileSync } = require('fs');
const DayJS = require('dayjs');

const { src, utilScripts, tmpDir } = require('../../helper/path');

const DBHandler = require(`${src}/handler/db`);
const { ADMIN_DB } = require(`${src}/handler/db.constants`);
const { USERS_COL } = require(`${src}/models/users.constants`);

const IdentifyInactiveUsers = require(`${utilScripts}/users/identifyInactiveUsers`);
const { disconnect } = require(`${src}/handler/db`);

const generateLoginRecord = (user) => {
	const loginTime = new Date();
	loginTime.setMonth(loginTime.getMonth() - Math.round(generateRandomNumber(1, 12)));
	return { _id: generateRandomString(), user, loginTime };
};

const setupData = async () => {
	const teamspace = generateRandomString();
	const teamspace2 = generateRandomString();
	const users = times(20, () => generateUserCredentials());
	delete users[1].basicData.billing.billingInfo.company;

	await Promise.all([
		createTeamspace(teamspace, [], undefined, false),
		createTeamspace(teamspace2, [], undefined, false),
	]);

	await Promise.all(users.map(async (user, index) => {
		await createUser(user, [teamspace, teamspace2]);

		if (index % 2 === 0) {
			const loginRecords = times(5, () => generateLoginRecord(user.user));
			await addLoginRecords(loginRecords);

			const [lastLoginRecord] = loginRecords.sort((a, b) => b.loginTime - a.loginTime);
			// eslint-disable-next-line no-param-reassign
			user.lastLogin = lastLoginRecord.loginTime;
		}

		if (index % 10 === 0) {
			await DBHandler.updateOne(ADMIN_DB, USERS_COL, { user: user.user }, { $set: { roles: [] } });
			// eslint-disable-next-line no-param-reassign
			user.invalidUser = true;
		}
	}));

	return users;
};

const runTest = () => {
	describe('Identify inactive users', () => {
		let users;

		beforeAll(async () => {
			await resetDB();
			users = await setupData();
		});

		const formatDate = (date) => (date ? DayJS(date).format('DD/MM/YYYY') : '');

		test('should provide a list of users that have not logged in for a specified number of months', async () => {
			const outFile = `${tmpDir}/${generateRandomString()}.csv`;
			const monthsOfInactivity = Math.round(generateRandomNumber(1, 5));

			await IdentifyInactiveUsers.run(monthsOfInactivity, outFile);

			expect(fileExists(outFile)).toBeTruthy();

			// first line is csv titles, last line is always empty
			const content = readFileSync(outFile).toString().split('\n').slice(1, -1);
			const res = content.map((str) => {
				const [user, firstName, lastName, email, company, lastLogin, teamspaceNumber] = str.split(',');
				return { user, firstName, lastName, email, company, lastLogin, teamspaceNumber };
			});

			const thresholdDate = new Date();
			thresholdDate.setMonth(thresholdDate.getMonth() - monthsOfInactivity);

			const expectedResult = users.flatMap(({ user, invalidUser, basicData, lastLogin }) => {
				if (!invalidUser && (!lastLogin || lastLogin < thresholdDate)) {
					const { email, firstName, lastName, billing } = basicData;
					return { user, email, firstName, lastName, company: billing.billingInfo.company ?? '', lastLogin: formatDate(lastLogin), teamspaceNumber: '2' };
				}

				return [];
			});

			expect(res.length).toBe(expectedResult.length);
			expect(res.sort((a, b) => a.user.localeCompare(b.user)))
				.toEqual(expectedResult.sort((a, b) => a.user.localeCompare(b.user)));
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
