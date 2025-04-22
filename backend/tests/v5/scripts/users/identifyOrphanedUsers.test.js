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
	outOfOrderArrayEqual,
} = require('../../helper/services');

const { times } = require('lodash');
const { readFileSync } = require('fs');
const DayJS = require('dayjs');

const { src, utilScripts, tmpDir } = require('../../helper/path');

const IdentifyOrphanedUsers = require(`${utilScripts}/users/identifyOrphanedUsers`);
const { disconnect } = require(`${src}/handler/db`);

const generateLoginRecord = (user) => {
	const loginTime = new Date();
	loginTime.setMonth(loginTime.getMonth() - Math.round(generateRandomNumber(1, 12)));
	return { _id: generateRandomString(), user, loginTime };
};

const setupData = async () => {
	const teamspace = generateRandomString();
	const normalUsers = times(10, () => generateUserCredentials());
	const orphanedUsers = times(10, () => generateUserCredentials());
	delete orphanedUsers[0].basicData.billing.billingInfo.company;

	const tsUsers = [];

	await Promise.all(normalUsers.map(async (user) => {
		await createUser(user);
		tsUsers.push(user.user);
	}));

	await createTeamspace(teamspace, tsUsers, undefined, false);

	await Promise.all(orphanedUsers.map(async (user, index) => {
		await createUser(user, []);

		if (index % 2 === 0) {
			const loginRecords = times(5, () => generateLoginRecord(user.user));
			await addLoginRecords(loginRecords);

			const [lastLoginRecord] = loginRecords.sort((a, b) => b.loginTime - a.loginTime);
			// eslint-disable-next-line no-param-reassign
			user.lastLogin = lastLoginRecord.loginTime;
		}
	}));

	return orphanedUsers;
};

const runTest = () => {
	describe('Identify orphaned users', () => {
		let orphanedUsers;

		beforeAll(async () => {
			await resetDB();
			orphanedUsers = await setupData();
		});

		const formatDate = (date) => (date ? DayJS(date).format('DD/MM/YYYY') : '');

		test('should provide a list of users with no access to teamspace', async () => {
			const outFile = `${tmpDir}/${generateRandomString()}.csv`;
			await IdentifyOrphanedUsers.run(outFile);
			expect(fileExists(outFile)).toBeTruthy();

			// first line is csv titles, last line is always empty
			const content = readFileSync(outFile).toString().split('\n').slice(1, -1);
			const res = content.map((str) => {
				const [user, firstName, lastName, email, company, lastLogin] = str.split(',');
				return { user, firstName, lastName, email, company, lastLogin };
			});

			const expectedResult = orphanedUsers.map(({ user, basicData, lastLogin }) => {
				const { email, firstName, lastName, billing } = basicData;
				return { user, email, firstName, lastName, company: billing.billingInfo.company ?? '', lastLogin: formatDate(lastLogin) };
			});

			outOfOrderArrayEqual(res, expectedResult);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
