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
/* istanbul ignore file */
const multiply = (matrixA, matrixB) => {
	const res = new Array(matrixA.length);

	for (let i = 0; i < matrixA.length; i++) {
		const row = matrixA[i];
		const newRow = new Array(matrixA.length);
		res[i] = newRow;
		for (let j = 0; j < matrixA.length; j++) {
			newRow[j] = 0;
			for (let h = 0; h < matrixA.length; h++) {
				newRow[j] += row[h] * matrixB[h][j];
			}
		}
	}

	return res;
};

const getIdentity = (size) => {
	const matrix = new Array(size);
	for (let i = 0; i < size; i++) {
		matrix[i] = new Array(size);
		for (let j = 0; j < size; j++) {
			matrix[i][j] = i !== j ? 0 : 1;
		}
	}

	return matrix;
};

const multiplyVectors = (v1, v2) => {
	let res = 0;

	for (let i = 0; i < v1.length; i++) {
		res += v1[i] * v2[i];
	}

	return res;
};

const addVectors = (v1, v2) => {
	const res = new Array(v1.length);

	for (let i = 0; i < v1.length; i++) {
		res[i] = v1[i] + v2[i];
	}

	return res;
};

const subtractVectors = (v1, v2) => {
	const res = new Array(v1.length);

	for (let i = 0; i < v1.length; i++) {
		res[i] = v1[i] - v2[i];
	}

	return res;
};

const transformVector = (matrix, vector) => {
	const res = new Array(matrix.length);

	for (let i = 0; i < matrix.length; i++) {
		res[i] = multiplyVectors(matrix[i], vector.concat([1]));
	}

	res.length = vector.length;

	return res;
};

module.exports = {
	multiply,
	getIdentity,
	multiplyVectors,
	transformVector,
	addVectors,
	subtractVectors,
};
