/**
 *  Copyright (C) 2025 3D Repo Ltd
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

// NOTE: this file is ignored for code coverage as it's a direct rip from v4 and it's been working
// as expected, with the logic unlikely to change. Should this file be edited tests SHOULD be added.

/* istanbul ignore file */

const { FaceBinaryToStringStream, Vector3DBinaryToStringStream } = require('./geoMaths.helper');

const GeoMaths = { vectors: {}, matrices: {}, faces: {} };

GeoMaths.matrices.multiply = (matrixA, matrixB) => {
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

GeoMaths.matrices.identity = (size = 4) => {
	const matrix = new Array(size);
	for (let i = 0; i < size; i++) {
		matrix[i] = new Array(size);
		for (let j = 0; j < size; j++) {
			matrix[i][j] = i !== j ? 0 : 1;
		}
	}

	return matrix;
};

GeoMaths.vectors.multiply = (v1, v2) => {
	let res = 0;

	for (let i = 0; i < v1.length; i++) {
		res += v1[i] * v2[i];
	}

	return res;
};

GeoMaths.vectors.add = (v1, v2) => {
	const res = new Array(v1.length);

	for (let i = 0; i < v1.length; i++) {
		res[i] = v1[i] + v2[i];
	}

	return res;
};

GeoMaths.vectors.subtract = (v1, v2) => {
	const res = new Array(v1.length);

	for (let i = 0; i < v1.length; i++) {
		res[i] = v1[i] - v2[i];
	}

	return res;
};

GeoMaths.vectors.transform = (matrix, vector) => {
	const res = new Array(matrix.length);

	for (let i = 0; i < matrix.length; i++) {
		res[i] = GeoMaths.vectors.multiply(matrix[i], vector.concat([1]));
	}

	res.length = vector.length;

	return res;
};

GeoMaths.vectors.toJSONStream = (buffer, isLittleEndian = true) => {
	const transform = new Vector3DBinaryToStringStream({ isLittleEndian });
	buffer.pipe(transform);
	return transform;
};

GeoMaths.faces.toJSONStream = (buffer, isLittleEndian = true) => {
	const transform = new FaceBinaryToStringStream({ isLittleEndian });
	buffer.pipe(transform);
	return transform;
};

module.exports = GeoMaths;
