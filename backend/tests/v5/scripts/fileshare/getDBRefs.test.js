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

const { determineTestGroup, fileExists, generateRandomString } = require('../../helper/services');
const { utilScripts, src, tmpDir } = require('../../helper/path');
const { times } = require('lodash');

const { unlinkSync, readFileSync } = require('fs');

const { storeFile } = require(`${src}/services/filesManager`);
const { getRefsByQuery } = require(`${src}/models/fileRefs`);
const { disconnect } = require(`${src}/handler/db`);

const GetDBRefs = require(`${utilScripts}/fileshare/getDBRefs`);

const setupData = (data) => Promise.all(
	data.map(({ db, colData }) => Promise.all(
		colData.map(({ name, ids }) => Promise.all(ids.map((id) => {
			const buffer = Buffer.from(generateRandomString(), 'utf-8');
			return storeFile(db, name, id, buffer);
		}))),
	)),
);

const findRefs = async (data) => {
	const allIds = await Promise.all(data.map(async ({ db, colData }) => {
		const idsInDB = await Promise.all(colData.map(async ({ name, ids }) => {
			const res = await getRefsByQuery(db, name, { _id: { $in: ids } }, { link: 1 });
			return res.map(({ link }) => link);
		}));

		return idsInDB.flat();
	}));

	return allIds.flat();
};

const genOutFileName = () => `${tmpDir}/${generateRandomString()}.csv`;

const runTest = (data) => {
	const dbArrError = new Error('Database name must be provided to execute this script');
	const dbNames = data.map(({ db }) => db).join(',');
	describe.each([
		['list of database is undefined', undefined, genOutFileName(), false, dbArrError],
		['list of database is empty', '', genOutFileName(), false, dbArrError],
		['valid database names are provided', dbNames, genOutFileName(), true],
		['valid database names are provided (no output file)', dbNames, undefined, true],
	])('Get refs from database', (desc, dbArr, outFile, success, expectedOut) => {
		test(`Should ${success ? 'succeed' : 'throw an error'} if ${desc}`, async () => {
			if (success) {
				await GetDBRefs.run(dbArr, outFile);
				const output = outFile ?? 'links.csv';
				expect(fileExists(output)).toBeTruthy();

				const refList = await findRefs(data);
				// filter to remove empty string
				const content = readFileSync(output).toString().split('\n').filter((a) => a.length);
				expect(content.length).toEqual(refList.length);
				expect(content).toEqual(expect.arrayContaining(refList));
				unlinkSync(output);
			} else {
				await expect(GetDBRefs.run(dbArr, outFile)).rejects.toEqual(expectedOut);
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	const data = times(2, () => {
		const db = generateRandomString();
		const colData = times(2, () => {
			const colName = generateRandomString();
			const ids = times(3, () => generateRandomString());

			return { name: colName, ids };
		});

		return { db, colData };
	});
	beforeAll(async () => { await setupData(data); });
	afterAll(disconnect);
	runTest(data);
});
