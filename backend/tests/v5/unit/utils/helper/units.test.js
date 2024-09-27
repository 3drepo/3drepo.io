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

const UNITS_CONVERSION_FACTORS_TO_METRES = {
	m: 1,
	dm: 10,
	cm: 100,
	mm: 1000,
	ft: 3.28084,
};

const getScaleFactor = (fromUnit, toUnit) => {
	const fromFactor = UNITS_CONVERSION_FACTORS_TO_METRES[fromUnit];
	const toFactor = UNITS_CONVERSION_FACTORS_TO_METRES[toUnit];
	return toFactor / fromFactor;
};

const testConvertArrayUnits = () => {
	describe.each([
		['invalid fromUnit', [1, 5], generateRandomString(), 'm', true],
		['invalid toUnit', [1, 5], 'm', generateRandomString(), true],
		['array with non numbers', [generateRandomString(), 5], 'm', 'mm', true],
		['m to dm', [1, 5], 'm', 'dm'],
		['m to cm', [1, 5], 'm', 'cm'],
		['m to mm', [1, 5], 'm', 'mm'],
		['m to ft', [1, 5], 'm', 'ft'],
		['dm to m', [1, 5], 'dm', 'm'],
		['dm to cm', [1, 5], 'dm', 'cm'],
		['dm to mm', [1, 5], 'dm', 'mm'],
		['dm to ft', [1, 5], 'dm', 'ft'],
		['mm to dm', [1, 5], 'mm', 'dm'],
		['mm to cm', [1, 5], 'mm', 'cm'],
		['mm to m', [1, 5], 'mm', 'm'],
		['mm to ft', [1, 5], 'mm', 'ft'],
		['ft to dm', [1, 5], 'ft', 'dm'],
		['ft to cm', [1, 5], 'ft', 'cm'],
		['ft to m', [1, 5], 'ft', 'm'],
		['ft to mm', [1, 5], 'ft', 'mm'],
	])('Convert array units', (description, array, fromUnit, toUnit, invalidInput) => {
		test(`with ${description} should return ${invalidInput ? 'the same array' : 'the converted array'}`, () => {
			const res = UnitsHelper.convertArrayUnits(array, fromUnit, toUnit);

			if (invalidInput) {
				expect(res).toEqual(array);
			} else {
				const scaleFactor = getScaleFactor(fromUnit, toUnit);
				expect(res).toEqual(array.map((n) => n * scaleFactor));
			}
		});
	});
};

describe('utils/helper/units', () => {
	testConvertArrayUnits();
});
