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

import { Vector2D, Vector3D, Coord2D, Transformation2D } from './calibration.types';

// TODO figure out actual location/name for this file

export const flipYAxis = (vector: Coord2D) => [vector[0], -vector[1]] as Coord2D;

export const getXYPlane = (vector: Vector3D) => vector.map((val) => [val[0], val[2]]) as Vector2D;

export const addVectors = (vectorA: number[], vectorB: number[]) => {
	const sumVector = [];
	for (let i = 0; i < vectorA.length; i++) {
		sumVector[i] = vectorB[i] + vectorA[i];
	}
	return sumVector;
};

export const subtractVectors = (vectorA: number[], vectorB: number[]) => {
	const diffVector = [];
	for (let i = 0; i < vectorA.length; i++) {
		diffVector[i] = vectorB[i] - vectorA[i];
	}
	return diffVector;
};

const crossProduct = (matrixA: number[][], matrixB: number[][]) => {
	const aNumRows = matrixA.length, aNumCols = matrixA[0].length,
		bNumCols = matrixB[0].length,
		result = new Array(aNumRows);
	for (var r = 0; r < aNumRows; ++r) {
		result[r] = new Array(bNumCols);
		for (var c = 0; c < bNumCols; ++c) {
			result[r][c] = 0;
			for (var i = 0; i < aNumCols; ++i) {
				result[r][c] += matrixA[r][i] * matrixB[i][c];
			}
		}
	}
	return result;
};

const dotProduct = (vectorA: number[], vectorB: number[]) => vectorA.reduce((acc, _, i) => acc + vectorA[i] * vectorB[i], 0);

const getVectorMagnitude = (vector: number[]) => Math.sqrt(dotProduct(vector, vector));

export const getTransformationMatrix = (vectorA, vectorB) => {
	const diffA = subtractVectors(vectorA[1], vectorA[0]);
	const diffB = subtractVectors(vectorB[1], vectorB[0]);
	const magnitudeA = getVectorMagnitude(diffA);
	const magnitudeB = getVectorMagnitude(diffB);
	const scaleFactor = magnitudeB / magnitudeA;

	// in order to know if angle is clockwise or anti-clockwise we find the cross product of both vectors and take the sign of the z-component
	const crossProductZ = (diffA[0] * diffB[1]) - (diffA[1] * diffB[0]);
	const directionFactor = crossProductZ > 0 ? 1 : -1;
	const angle = Math.acos(dotProduct(diffA, diffB) / (magnitudeA * magnitudeB)) * directionFactor; // angle between vectors in radians

	const scaleMatrix = [[ scaleFactor, 0], [0, scaleFactor]];
	const rotationMatrix = [ // rotates 2D vector clockwise around origin by 'angle'
		[Math.cos(angle), Math.sin(angle)],
		[-Math.sin(angle), Math.cos(angle)],
	];
	const transformationMatrix = crossProduct(rotationMatrix, scaleMatrix) as Transformation2D; 
	return transformationMatrix;
};

const transformVector = (v: number[], t: number[][]) => {
	const newVector = [];
	for (let row = 0; row < t.length; row++) {
		let sum = 0;
		for (let col = 0; col < t.length; col++) {
			sum = sum + t[row][col] * v[col];
		}
		newVector.push(sum);
	}
	return newVector;
};

export const transformAndTranslate = (v: Coord2D, t: Transformation2D, offset: Coord2D) => {
	const transformed = transformVector(v, t);
	return addVectors(flipYAxis(offset), transformed);
};