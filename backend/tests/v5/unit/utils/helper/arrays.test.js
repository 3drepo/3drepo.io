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

const { src } = require('../../../helper/path');
const { determineTestGroup } = require('../../../helper/services');

const ArrHelper = require(`${src}/utils/helper/arrays`);

const testSplitArrayIntoChunks = () => {
	describe.each([
		[[1, 2, 3], 4, [[1, 2, 3]]],
		[[1, 2, 3], 2, [[1, 2], [3]]],
		[[1, 2, 3], 1, [[1], [2], [3]]],
	])('Split array into chunks', (array, length, results) => {
		test(`with ${array} should result in ${results}`, () => {
			expect(ArrHelper.splitArrayIntoChunks(array, length)).toEqual(results);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testSplitArrayIntoChunks();
});
