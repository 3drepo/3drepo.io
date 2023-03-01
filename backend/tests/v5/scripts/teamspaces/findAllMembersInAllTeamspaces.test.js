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
	fileExists,
	resetFileshare,
	generateUserCredentials,
	db: { reset: resetDB, createTeamspace, createUser },
	generateRandomString,
	generateRandomDate,
} = require('../../helper/services');

const { readFileSync } = require('fs');
const DayJS = require('dayjs');

const { times } = require('lodash');

const { src, utilScripts, tmpDir } = require('../../helper/path');

const FindAllMembers = require(`${utilScripts}/teamspaces/findAllMembersInAllTeamspaces`);

const { saveSuccessfulLoginRecord } = require(`${src}/models/loginRecords`);
const { INTERNAL_DB } = require(`${src}/handler/db.constants`);
const { disconnect, updateOne } = require(`${src}/handler/db`);

const runTest = (testData) => {
	describe('Find all members in all teamspaces', () => {
		test('should provide a list of members in each teamspace', async () => {
			const outFile = `${tmpDir}/${generateRandomString()}.csv`;
			await FindAllMembers.run(outFile);
			expect(fileExists(outFile)).toBeTruthy();

			// first line is csv titles, last line is always empty
			const content = readFileSync(outFile).toString().split('\n').slice(1, -1);
			const res = content.map((str) => {
				const [teamspace, user, lastLogin] = str.split(',');
				return { teamspace, user, lastLogin };
			});

			const goldenData = testData.flatMap(({ name, users }) => {
				const owner = {
					teamspace: name,
					user: name,
					lastLogin: '',
				};
				if (!users.length) return [owner];

				return [owner, ...users.map(({ name: user, lastLogin }) => ({
					teamspace: name,
					user,
					lastLogin: lastLogin ? DayJS(lastLogin).format('DD/MM/YYYY') : '',
				}))];
			});

			const compare = ({ teamspace: ts1, user: user1 }, { teamspace: ts2, user: user2 }) => {
				if (ts1 < ts2) return -1;
				if (ts1 > ts2) return 1;

				if (user1 > user2) return 1;
				return user1 < user2 ? -1 : 0;
			};

			res.sort(compare);
			goldenData.sort(compare);

			expect(res.length).toBe(goldenData.length);
			expect(res).toEqual(expect.arrayContaining(goldenData));
		});
	});
};

const createTeamspaceData = (nMembers) => {
	const ts = generateRandomString();
	return {
		name: ts,
		users: nMembers ? times(nMembers, () => ({
			name: generateRandomString(),
			lastLogin: generateRandomDate(),

		})) : [],
	};
};

const createData = () => [
	createTeamspaceData(0),
	createTeamspaceData(1),
	createTeamspaceData(2),
	createTeamspaceData(10),
];

const setupData = async (data) => {
	await Promise.all(data.map(async ({ name, users }) => {
		await createTeamspace(name);
		await Promise.all(users.map(async ({ name: user, lastLogin }) => {
			if (name === user) return;
			const userCred = { ...generateUserCredentials(), user };
			await createUser(userCred, [name]);
			if (lastLogin) {
				await saveSuccessfulLoginRecord(user);
				await updateOne(INTERNAL_DB, 'loginRecords', { user }, { $set: { loginTime: lastLogin } });
			}
		}));
	}));
};

describe(determineTestGroup(__filename), () => {
	const data = createData();
	beforeAll(async () => {
		resetFileshare();
		await resetDB();
		await setupData(data);
	});
	runTest(data);
	afterAll(disconnect);
});
