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
	db: { reset: resetDB, createTeamspace },
	generateRandomString,
	generateRandomDate,
	generateRandomNumber,
} = require('../../helper/services');

const { readFileSync } = require('fs');
const DayJS = require('dayjs');

const { src, utilScripts, tmpDir } = require('../../helper/path');

const { disconnect } = require(`${src}/handler/db`);

const AllExpiredLicenses = require(`${utilScripts}/teamspaces/allExpiredLicenses`);

const { editSubscriptions } = require(`${src}/models/teamspaceSettings`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);

const runTest = (testData) => {
	describe('Get all expired license', () => {
		test('should provide all teamspaces with expired license', async () => {
			const outFile = `${tmpDir}/${generateRandomString()}.csv`;
			await AllExpiredLicenses.run(outFile);
			expect(fileExists(outFile)).toBeTruthy();

			// first line is csv titles, last line is always empty
			const content = readFileSync(outFile).toString().split('\n').slice(1, -1);
			expect(content.length).toBe(testData.expiredLicenses.length);
			const result = content.map((str) => {
				const [name, type, data, collaborators, expiryDate] = str.split(',');
				return deleteIfUndefined({ name, type, data, collaborators, expiryDate });
			});

			const goldenData = testData.expiredLicenses.map(
				({ expiryDate, collaborators, data, ...others }) => deleteIfUndefined({
					...others,
					collaborators: String(collaborators),
					data: String(data),
					expiryDate: expiryDate ? DayJS(expiryDate).format('DD/MM/YYYY') : '',

				}),
			);

			expect(result).toEqual(expect.arrayContaining(goldenData));
		});
	});
};

const randomDateInFuture = () => generateRandomDate(new Date(), new Date(Date.now() + 1000000));

const createTeamspaceLicenseData = () => [
	{
		teamspaceName: generateRandomString(),
		validLicenses: [
			{
				expiryDate: randomDateInFuture(),
				type: 'enterprise',
				collaborators: 'unlimited',
				data: Math.round(generateRandomNumber(0)),
			},
		],
		expiredLicenses: [
			{
				expiryDate: generateRandomDate(),
				type: 'discretionary',
				collaborators: 'unlimited',
				data: Math.round(generateRandomNumber(0)),
			},
			{
				expiryDate: generateRandomDate(),
				type: 'pilot',
				collaborators: 'unlimited',
				data: Math.round(generateRandomNumber(0)),
			},
		],
		invalidLicenses: [
			{
				expiryDate: generateRandomDate(),
				type: generateRandomString(),
				collaborators: 'unlimited',
				data: Math.round(generateRandomNumber(0)),
			},
		],
	},
	{
		teamspaceName: generateRandomString(),
		validLicenses: [
			{
				expiryDate: randomDateInFuture(),
				type: 'enterprise',
				data: Math.round(generateRandomNumber(0)),
			},
			{
				name: generateRandomString(),
				expiryDate: randomDateInFuture(),
				type: 'discretionary',
				collaborators: 5,
			},
		],
		expiredLicenses: [
			{
				expiryDate: generateRandomDate(),
				type: 'internal',
				collaborators: 3,
				data: Math.round(generateRandomNumber(0)),
			},
		],
	},
	{
		teamspaceName: generateRandomString(),
	},
];

const setupTeamspacesAndLicenseData = async (teamspaceLicenseData) => {
	// eslint-disable-next-line max-len
	await Promise.all(teamspaceLicenseData.map(async ({ teamspaceName, validLicenses = [], expiredLicenses = [], invalidLicenses = [] }) => {
		// create the teamspace
		await createTeamspace(teamspaceName);
		// create the licenses for the above teamspace
		const licenses = [...validLicenses, ...expiredLicenses, ...invalidLicenses];
		await Promise.all(licenses.map(({ type, ...subData }) => editSubscriptions(teamspaceName, type, subData)));
	}));
};

describe(determineTestGroup(__filename), () => {
	const teamspaceLicenseData = createTeamspaceLicenseData();
	beforeAll(async () => {
		resetFileshare();
		await resetDB();
		await setupTeamspacesAndLicenseData(teamspaceLicenseData);
	});
	runTest(teamspaceLicenseData);
	afterAll(disconnect);
});
