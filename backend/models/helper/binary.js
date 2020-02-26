/**
 *	Copyright (C) 2020 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const toFloat32Array = (binaryObject, isLittleEndian) => {
	const result = new Float32Array(binaryObject.position / Float32Array.BYTES_PER_ELEMENT);
	// array of floats [x,y,z ...], return variable
	const byteBuffer = toDataView(binaryObject);
	let count = 0;

	for (let i = 0; i < binaryObject.position; i += Float32Array.BYTES_PER_ELEMENT) {
		const floatValue = byteBuffer.getFloat32(i, isLittleEndian);
		result[count++] = floatValue;
	}
	return result;
};

function toDataView(binaryObject) {
	return new DataView(toArrayBuffer(binaryObject.buffer));
}

function toArrayBuffer(binaryBuffer) {
	const arrayBuffer = new ArrayBuffer(binaryBuffer.length);
	const view = new Uint8Array(arrayBuffer);
	for (let i = 0; i < binaryBuffer.length; ++i) {
		view[i] = binaryBuffer[i];
	}
	return arrayBuffer;
}

const binToArrayVector3d = (binaryObject, isLittleEndian = false) => {
	const FLOAT_BYTE_SIZE = 4;
	const ITEM_LEAP =  FLOAT_BYTE_SIZE * 3; // 12 = 4 * 3 means four bytes (a float) and 3 floats per item

	const bufferLength = binaryObject.position;
	const result = new Array(bufferLength / ITEM_LEAP);
	const buffer = binaryObject.buffer;
	const getFloat32 =  (!isLittleEndian ? buffer.readFloatBE : buffer.readFloatLE).bind(buffer);

	for (let i = 0; i < bufferLength ; i = i + ITEM_LEAP) {
		const vect3 = new Array(3);
		vect3[0] = getFloat32(i);
		vect3[1] = getFloat32(i + 4);
		vect3[2] = getFloat32(i + 8);
		result[i / ITEM_LEAP] = vect3;
	}

	return result;
};

// It asssumes that the data is formatted this way:
// [3,v0index, v1index, v2index,3,v3index, v4index, v5index,..., 3, vnindex, v(n+1)index, v(n+2)index]
// were viindex is the index in the vertices array
const binToTrianglesArray = (binaryObject, isLittleEndian = false) => {
	const INT_BYTE_SIZE = 4;
	const ITEM_LEAP =  INT_BYTE_SIZE * 4; // 16 = 4 * 4 means four bytes (a uint32) and 4 means 4 components per triangle.
	// The first uint is the number of vertices, in the case of triangles this number will always be three so gets ignored

	const bufferLength = binaryObject.position;
	const result = new Array(bufferLength * 3 / ITEM_LEAP);
	const buffer = binaryObject.buffer;
	const getUint32 =  (!isLittleEndian ? buffer.readUInt32BE : buffer.readUInt32LE).bind(buffer);

	for (let i = 0; i < bufferLength ; i = i + ITEM_LEAP) {
		result[(i * 3 / ITEM_LEAP) ] = getUint32(i + INT_BYTE_SIZE);
		result[(i * 3 / ITEM_LEAP) + 1] = getUint32(i + 2 * INT_BYTE_SIZE);
		result[(i * 3 / ITEM_LEAP) + 2] = getUint32(i + 3 * INT_BYTE_SIZE);
	}

	return result;
};

module.exports = {
	binToArrayVector3d,
	toFloat32Array,
	binToTrianglesArray
};
