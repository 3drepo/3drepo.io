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
import { Coord2D } from './calibration.types';

export const UNITS_CONVERSION_FACTORS_TO_METRES = {
	'm': 1,
	'dm': 10,
	'cm': 100,
	'mm': 1000,
	'ft': 3.28084,
} as const;

export const getUnitsConversionFactor = (drawingUnits, modelUnits) => {
	if (!drawingUnits) return 1;
	return UNITS_CONVERSION_FACTORS_TO_METRES[drawingUnits] / UNITS_CONVERSION_FACTORS_TO_METRES[modelUnits];
};

export const convertCoordUnits = (coord, conversionFactor: number) => coord?.map((point) => point * conversionFactor) || null;
export const convertVectorUnits = (vector, conversionFactor: number) => vector.map((coord) => convertCoordUnits(coord, conversionFactor));

export const removeZ = (vector) => [vector[0], vector[2]] as Coord2D;

export const getTransformationMatrix = (vectorA: Vector2, vectorB: Vector2) => {
	const magnitudeA = vectorA.length();
	const magnitudeB = vectorB.length();
	const scaleFactor = magnitudeB / magnitudeA;

	// in order to know if angle is clockwise or anti-clockwise we find the cross product of both vectors and take the sign of the z-component
	const crossProductZ = vectorA.cross(vectorB);
	const directionFactor = crossProductZ > 0 ? 1 : -1;
	const angle = vectorB.angleTo(vectorA);

	const scaleMatrix = new Matrix3().makeScale(scaleFactor, scaleFactor);
	const rotationMatrix = new Matrix3().makeRotation(directionFactor * angle);
	const transformationMatrix = rotationMatrix.multiply(scaleMatrix); 
	return transformationMatrix;
};
