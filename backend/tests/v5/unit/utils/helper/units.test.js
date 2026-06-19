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

const { determineTestGroup } = require('../../../helper/utils');
const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

const UnitsHelper = require(`${src}/utils/helper/units`);
const { units } = UnitsHelper;

const unitsConversionFactorsToMetres = {
	[units.M]: 1,
	[units.DM]: 10,
	[units.CM]: 100,
	[units.MM]: 1000,
	[units.FT]: 3.28084,
};

const getScaleFactor = (fromUnit, toUnit) => {
	const fromFactor = unitsConversionFactorsToMetres[fromUnit];
	const toFactor = unitsConversionFactorsToMetres[toUnit];
	return toFactor / fromFactor;
};

const testConvertArrayUnits = () => {
	describe.each([
		['invalid fromUnit', [1, 5], generateRandomString(), units.M, true],
		['invalid toUnit', [1, 5], units.M, generateRandomString(), true],
		['array with non numbers', [generateRandomString(), 5], units.M, units.MM, true],
		['m to dm', [1, 5], units.M, units.DM],
		['m to cm', [1, 5], units.M, units.CM],
		['m to mm', [1, 5], units.M, units.MM],
		['m to ft', [1, 5], units.M, units.FT],
		['dm to m', [1, 5], units.DM, units.M],
		['dm to cm', [1, 5], units.DM, units.CM],
		['dm to mm', [1, 5], units.DM, units.MM],
		['dm to ft', [1, 5], units.DM, units.FT],
		['mm to dm', [1, 5], units.MM, units.DM],
		['mm to cm', [1, 5], units.MM, units.CM],
		['mm to m', [1, 5], units.MM, units.M],
		['mm to ft', [1, 5], units.MM, units.FT],
		['ft to dm', [1, 5], units.FT, units.DM],
		['ft to cm', [1, 5], units.FT, units.CM],
		['ft to m', [1, 5], units.FT, units.M],
		['ft to mm', [1, 5], units.FT, units.MM],
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

describe(determineTestGroup(__filename), () => {
	testConvertArrayUnits();
});
