/**
 *  Copyright (C) 2024 3D Repo Ltd
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
const { generateRandomString } = require('../../../helper/services');

const UnitsHelper = require(`${src}/utils/helper/units`);

const testConvertArrayUnits = () => {
	describe.each([
		['invalid fromUnit', [1, 5], generateRandomString(), 'm'],
		['invalid toUnit', [1, 5], 'm', generateRandomString()],
		['array with non numbers', [generateRandomString(), 5], 'm', 'mm'],
		['m to dm', [1, 5], 'm', 'dm', [10, 50]],
		['m to cm', [1, 5], 'm', 'cm', [100, 500]],
		['m to mm', [1, 5], 'm', 'mm', [1000, 5000]],
		['m to ft', [1, 5], 'm', 'ft', [3.281, 16.404]],
		['dm to m', [1, 5], 'dm', 'm', [0.1, 0.5]],
		['dm to cm', [1, 5], 'dm', 'cm', [10, 50]],
		['dm to mm', [1, 5], 'dm', 'mm', [100, 500]],
		['dm to ft', [1, 5], 'dm', 'ft', [0.328, 1.640]],
		['mm to dm', [1, 5], 'mm', 'dm', [0.01, 0.05]],
		['mm to cm', [1, 5], 'mm', 'cm', [0.1, 0.5]],
		['mm to m', [1, 5], 'mm', 'm', [0.001, 0.005]],
		['mm to ft', [1, 5], 'mm', 'ft', [0.003, 0.016]],
		['ft to dm', [1, 5], 'ft', 'dm', [3.048, 15.24]],
		['ft to cm', [1, 5], 'ft', 'cm', [30.48, 152.4]],
		['ft to m', [1, 5], 'ft', 'm', [0.305, 1.524]],
		['ft to mm', [1, 5], 'ft', 'mm', [304.8, 1524]],
	])('Convert array units', (description, array, fromUnit, toUnit, result = null) => {
		test(`with ${description} should return ${result}`, () => {
			let res = UnitsHelper.convertArrayUnits(array, fromUnit, toUnit);

			if (res) {
				res = res.map((r) => Math.round(r * 1000) / 1000);
			}

			expect(res).toEqual(result);
		});
	});
};

describe('utils/helper/units', () => {
	testConvertArrayUnits();
});
