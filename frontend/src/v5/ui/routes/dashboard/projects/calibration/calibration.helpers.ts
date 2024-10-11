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

import { Matrix3, Vector2 } from 'three';
import { Coord2D, Coord3D, Vector1D, Vector2D, Vector3D } from './calibration.types';
import { isNumber } from 'lodash';

export const DEFAULT_SETTINGS_CALIBRATION = {
	units: 'm',
	verticalRange: [0, 2.4] as Vector1D,
};

export const UNITS_CONVERSION_FACTORS_TO_METRES = {
	'm': 1,
	'dm': 10,
	'cm': 100,
	'mm': 1000,
	'ft': 3.28084,
} as const;

export const getUnitsConversionFactor = (to, from) => {
	if (!to) return 1;
	return UNITS_CONVERSION_FACTORS_TO_METRES[to] / UNITS_CONVERSION_FACTORS_TO_METRES[from];
};

export const convertUnits = (coords: number[], conversionFactor: number) => coords?.map((coord) => isNumber(coord) ? coord * conversionFactor : null) || null;
export const convertVectorUnits = (vector, conversionFactor: number) => vector.map((coord) => convertUnits(coord, conversionFactor));

export const removeZ = ([x,, y]: Coord3D): Coord2D => [x, y];
export const addZ = ([x, y]: Coord2D, z: number): Coord3D => [x, z, y];

export const getTransformationMatrix = (vector2D: Vector2D, vector3D: Vector3D) => {
	const drawVecStart = new Vector2(...vector2D[0]);
	const drawVecEnd = new Vector2(...vector2D[1]);
	const modelVecStart = new Vector2(...removeZ(vector3D[0]));
	const modelVecEnd = new Vector2(...removeZ(vector3D[1]));
	const diff2D = new Vector2().subVectors(drawVecEnd, drawVecStart);
	const diff3D = new Vector2().subVectors(modelVecEnd, modelVecStart);

	const magnitudeA = diff2D.length();
	const magnitudeB = diff3D.length();
	const scaleFactor = magnitudeB / magnitudeA;

	// in order to know if angle is clockwise or anti-clockwise we find the cross product of both vectors and take the sign of the z-component
	const crossProductZ = diff2D.cross(diff3D);
	const directionFactor = crossProductZ > 0 ? 1 : -1;
	const angle = diff3D.angleTo(diff2D);

	const scaleMatrix = new Matrix3().makeScale(scaleFactor, scaleFactor);
	const rotationMatrix = new Matrix3().makeRotation(directionFactor * angle);
	drawVecStart.applyMatrix3(scaleMatrix.clone().multiply(rotationMatrix));
	
	const translationMatrix = new Matrix3().makeTranslation(new Vector2().subVectors(modelVecStart, drawVecStart));
	const transformationMatrix = translationMatrix.multiply(scaleMatrix).multiply(rotationMatrix); 
	return transformationMatrix;
};
