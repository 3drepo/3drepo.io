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

const UNITS_CONVERTION_FACTORS_TO_METRES = {
	'm': 1,
	'dm': 10,
	'cm': 100,
	'mm': 1000,
	'ft': 3.28084,
} as const;

export const getUnitsConvertionFactor = (drawingUnits, modelUnits) => {
	if (!drawingUnits) return 1;
	return UNITS_CONVERTION_FACTORS_TO_METRES[drawingUnits] / UNITS_CONVERTION_FACTORS_TO_METRES[modelUnits];
};

export const convertCoordUnits = (coord, convertionFactor: number) => coord?.map((point) => point * convertionFactor) || null;
export const convertVectorUnits = (vector, convertionFactor: number) => vector.map((coord) => convertCoordUnits(coord, convertionFactor));
