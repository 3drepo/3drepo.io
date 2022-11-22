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

const { determineTestGroup, generateRandomString } = require('../../helper/services');
const { utilScripts, src } = require('../../helper/path');

const GetDBRefs = require(`${utilScripts}/fileshare/getDBRefs`);

const runTest = () => {
	const dbArrError = new Error('Database name must be provided to execute this script');
	describe.each([
		['list of database is undefined', undefined, generateRandomString, false, dbArrError],
	])('Get refs from database', (desc, dbArr, outFile, success, expectedOut) => {
		test(`Should ${success ? 'succeed' : 'throw an error'} if ${desc}`, async () => {
			if (success) {
			} else {
				await expect(GetDBRefs.run(dbArr, outFile)).rejects.toEqual(expectedOut);
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
});
