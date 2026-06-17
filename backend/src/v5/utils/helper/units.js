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

const { isNumber } = require('./typeCheck');

const UnitsHelper = {};

const units = {
	M: 'm',
	DM: 'dm',
	CM: 'cm',
	MM: 'mm',
	FT: 'ft',
};

const unitsConversionFactorsToMetres = {
	[units.M]: 1,
	[units.DM]: 10,
	[units.CM]: 100,
	[units.MM]: 1000,
	[units.FT]: 3.28084,
};

UnitsHelper.units = units;

UnitsHelper.convertArrayUnits = (array, fromUnit, toUnit) => {
	const fromFactor = unitsConversionFactorsToMetres[fromUnit];
	const toFactor = unitsConversionFactorsToMetres[toUnit];
	const scale = toFactor / fromFactor;

	if (!array.every(isNumber) || !fromFactor || !toFactor) {
		return array;
	}

	return array.map((n) => n * scale);
};

module.exports = UnitsHelper;
