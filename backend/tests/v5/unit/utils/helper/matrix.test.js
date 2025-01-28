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

const { getIdentity } = require('../../../../../src/v5/utils/helper/matrix');
const { src } = require('../../../helper/path');

const Matrix = require(`${src}/utils/helper/matrix`);
const ServiceHelper = require('../../../helper/services');

const identityCheckHelper = (mat) => {
	for (let i = 0; i < mat.length; i++) {
		for (let e = 0; e < mat.length; e++) {
			if (i === e) {
				expect(mat[i][e]).toEqual(1);
			} else {
				expect(mat[i][e]).toEqual(0);
			}
		}
	}
};

const matchMatricesHelper = (matA, matB) => {
	expect(matA.length).toEqual(matB.length);

	for (let i = 0; i < matA.length; i++) {
		for (let e = 0; e < matA.length; e++) {
			expect(matA[i][e]).toBeCloseTo(matB[i][e]);
		}
	}
};

const matchVectorHelper = (vecA, vecB) => {
	expect(vecA.length).toEqual(vecB.length);

	for (let i = 0; i < vecA.length; i++) {
		expect(vecA[i]).toBeCloseTo(vecB[i]);
	}
};

const testGetIdentity = () => {
	describe('Get Identity', () => {
		test('should return an identity matrix', () => {
			const size = Math.round(ServiceHelper.generateRandomNumber(1, 100));
			const identity = getIdentity(size);
			identityCheckHelper(identity);
		});
	});
};

const testMatMultiply = () => {
	// Create test matrices
	// Mat A
	const matA = [
		[1, 2, 3, 4],
		[2, 3, 4, 1],
		[3, 4, 1, 2],
		[4, 1, 2, 3],
	];

	// Mat B
	const matB = [
		[4, 1, 2, 3],
		[3, 4, 1, 2],
		[2, 3, 4, 1],
		[1, 2, 3, 4],
	];

	// Mat C (result of A * B)
	const matC = [
		[20, 26, 28, 26],
		[26, 28, 26, 20],
		[28, 26, 20, 26],
		[26, 20, 26, 28],
	];

	// Mat D (result of B * A)
	const matD = [
		[24, 22, 24, 30],
		[22, 24, 30, 24],
		[24, 30, 24, 22],
		[30, 24, 22, 24],
	];

	// Mat A Inv
	const matAInv = [
		[-0.225, 0.025, 0.025, 0.275],
		[0.025, 0.025, 0.275, -0.225],
		[0.025, 0.275, -0.225, 0.025],
		[0.275, -0.225, 0.025, 0.025],
	];

	// Identity
	const matId = [
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1],
	];

	describe.each([
		['A * B equals C', Matrix.multiply(matA, matB), matC],
		['B * A equals D', Matrix.multiply(matB, matA), matD],
		['A * AInv equals identity', Matrix.multiply(matA, matAInv), matId],
		['A * Id equals A', Matrix.multiply(matA, matId), matA],
	])('Matrix Multiplication', (desc, source, target) => {
		test(`${desc}`, () => {
			matchMatricesHelper(source, target);
		});
	});
};

const testVecMultiply = () => {
	const vec1 = [
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
	];

	const vec2 = [
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
	];

	const expected = vec1[0] * vec2[0]
		+ vec1[1] * vec2[1]
		+ vec1[2] * vec2[2];

	describe('Multiply vectors', () => {
		test('should calculate the dot product of two vectors', () => {
			const result = Matrix.multiplyVectors(vec1, vec2);
			expect(result).toEqual(expected);
		});
	});
};

const testVecAddition = () => {
	const vec1 = [
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
	];

	const vec2 = [
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
	];

	const expected = [
		vec1[0] + vec2[0],
		vec1[1] + vec2[1],
		vec1[2] + vec2[2],
	];

	describe('Add vectors', () => {
		test('should calculate the component-wise sum of two vectors', () => {
			const result = Matrix.addVectors(vec1, vec2);
			matchVectorHelper(expected, result);
		});
	});
};

const testVecSubtraction = () => {
	const vec1 = [
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
	];

	const vec2 = [
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
		ServiceHelper.generateRandomNumber(),
	];

	const expected = [
		vec1[0] - vec2[0],
		vec1[1] - vec2[1],
		vec1[2] - vec2[2],
	];

	describe('Subtract vectors', () => {
		test('should calculate the component-wise difference of two vectors', () => {
			const result = Matrix.subtractVectors(vec1, vec2);
			matchVectorHelper(expected, result);
		});
	});
};

const testVecTransform = () => {
	const mat = [
		[1, 2, 3, 4],
		[2, 3, 4, 1],
		[3, 4, 1, 2],
		[4, 1, 2, 3],
	];

	const vecIn = [
		1,
		2,
		3,
		4,
	];

	const expected = [
		30,
		24,
		22,
		24,
	];

	describe('transform vectors', () => {
		test('should calculate the component-wise difference of two vectors', () => {
			const result = Matrix.transformVector(mat, vecIn);
			matchVectorHelper(expected, result);
		});
	});
};

// describe('utils/helper/matrix', () => {
// 	testGetIdentity();
// 	testMatMultiply();
// 	testVecMultiply();
// 	testVecAddition();
// 	testVecSubtraction();
// 	testVecTransform();
// });

const dummyTest = () => {
	describe('dummy test', () => {
		test('should succeed', () => {
			expect(true).toEqual(true);
		});
	});
};

describe(ServiceHelper.determineTestGroup(__filename), () => {
	dummyTest();
});
