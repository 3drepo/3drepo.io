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

const YupHelper = require(`${src}/utils/helper/yup`);

const testId = () => {
	describe.each([
		['1', false],
		['5c6ea70f-a55f-4cf2-9055-93db43503944', true],
		[0, false],
		[true, false],
	])('ID validator', (data, res) => {
		test(`${data} should return ${res}`, async () => {
			await expect(YupHelper.types.id.isValid(data)).resolves.toBe(res);
		});
	});
};

const testColorArr = () => {
	describe.each([
		['1', false],
		[0, false],
		[true, false],
		[[], false],
		[['2', '3', '4'], false],
		[[1], false],
		[[1, 2, 3], true],
		[[256, 256, 256], false],
		[[0, 0, 0], true],
		[[-1, -1, -1], false],
		[[1, 2, 3, 4], true],
		[[1, 2, 3, 5, 5], false],
		[[0.1, 2, 3, 4], false],
	])('Colour array validator', (data, res) => {
		test(`${data} should return ${res}`, async () => {
			await expect(YupHelper.types.colorArr.isValid(data)).resolves.toBe(res);
		});
	});
};

describe('utils/helper/yup', () => {
	testId();
	testColorArr();
});
