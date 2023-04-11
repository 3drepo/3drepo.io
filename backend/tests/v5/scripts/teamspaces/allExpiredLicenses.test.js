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
			expect(content.length).toBe(testData.invalidLicenses.length);
			const result = content.map((str) => {
				const [name, type, data, collaborators, expiryDate] = str.split(',');
				return deleteIfUndefined({ name, type, data, collaborators, expiryDate });
			});

			const goldenData = testData.invalidLicenses.map(
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

const createData = () => ({
	validLicenses: [{
		name: generateRandomString(),
		expiryDate: randomDateInFuture(),
		type: 'enterprise',
		collaborators: 'unlimited',
		data: Math.round(generateRandomNumber(0)),
	},
	{
		name: generateRandomString(),
		expiryDate: randomDateInFuture(),
		type: 'discretionary',
		collaborators: 3,
		data: Math.round(generateRandomNumber(0)),
	},
	{
		name: generateRandomString(),
		expiryDate: randomDateInFuture(),
		type: 'enterprise',
		data: Math.round(generateRandomNumber(0)),
	}, {
		name: generateRandomString(),
		expiryDate: randomDateInFuture(),
		type: 'enterprise',
		collaborators: 'unlimited',
	},
	{
		name: generateRandomString(),
		type: 'enterprise',
		collaborators: 'unlimited',
		data: Math.round(generateRandomNumber(0)),
	},
	],
	invalidLicenses: [
		{
			name: generateRandomString(),
			expiryDate: generateRandomDate(),
			type: 'enterprise',
			collaborators: 'unlimited',
			data: Math.round(generateRandomNumber(0)),
		},
		{
			name: generateRandomString(),
			expiryDate: generateRandomDate(),
			type: 'discretionary',
			collaborators: 'unlimited',
			data: Math.round(generateRandomNumber(0)),
		},
		{
			name: generateRandomString(),
			expiryDate: generateRandomDate(),
			type: generateRandomString(),
			collaborators: 'unlimited',
			data: Math.round(generateRandomNumber(0)),
		},
		{
			// no license
			name: generateRandomString(),
		},
	],

});

const setupData = async ({ validLicenses, invalidLicenses }) => {
	const allTeamspaces = [...validLicenses, ...invalidLicenses];
	await Promise.all(allTeamspaces.map(async ({ name, type, ...subData }) => {
		await createTeamspace(name);
		if (type) {
			await editSubscriptions(name, type, subData);
		}
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
