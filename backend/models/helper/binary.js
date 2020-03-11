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

const { Transform } = require("stream");

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

const VECTOR3D_SIZE = 4 * 3;  // 12 = 4 * 3 means four bytes (a float) and 3 floats per item

const binToArrayVector3d = (buffer, isLittleEndian = false) => {
	const bufferLength = buffer.length;
	const result = new Array(bufferLength / VECTOR3D_SIZE);
	const getFloat32 =  (!isLittleEndian ? buffer.readFloatBE : buffer.readFloatLE).bind(buffer);

	for (let i = 0; i < bufferLength ; i = i + VECTOR3D_SIZE) {
		const vect3 = new Array(3);
		vect3[0] = getFloat32(i);
		vect3[1] = getFloat32(i + 4);
		vect3[2] = getFloat32(i + 8);
		result[i / VECTOR3D_SIZE] = vect3;
	}

	return result;
};

const binToJSONArrayVector3d = (buffer, isLittleEndian = false) => {
	const bufferLength = buffer.length;
	let result = "";
	const getFloat32 =  (!isLittleEndian ? buffer.readFloatBE : buffer.readFloatLE).bind(buffer);
	const vect3 = new Array(3);

	for (let i = 0; i < bufferLength ; i = i + VECTOR3D_SIZE) {
		if(i !== 0) {
			result += ",";
		}

		vect3[0] = getFloat32(i);
		vect3[1] = getFloat32(i + 4);
		vect3[2] = getFloat32(i + 8);
		result += JSON.stringify(vect3);
	}

	return result;
};

class BinToVector3dStringStream extends Transform {
	constructor(opts = {}) {
		super(opts);
		this.started = false;
		this.isLittleEndian = opts.isLittleEndian;
	}

	_transform(chunk, encoding, callback) {
		if (this.started) {
			this.push(",");
		}

		this.started = true;

		this.push(binToJSONArrayVector3d(chunk, this.isLittleEndian));
		callback();
	}
}

// It asssumes that the data is formatted this way:
// [3,v0index, v1index, v2index,3,v3index, v4index, v5index,..., 3, vnindex, v(n+1)index, v(n+2)index]
// were viindex is the index (int32) in the vertices array
const binToTrianglesArray = (buffer, isLittleEndian = false) => {
	const INT_BYTE_SIZE = 4;
	const ITEM_LEAP =  INT_BYTE_SIZE * 4; // 16 = 4 * 4 means four bytes (a uint32) and 4 means 4 components per triangle.
	// The first uint is the number of vertices, in the case of triangles this number will always be three so gets ignored

	const bufferLength = buffer.length;
	const result = new Array(bufferLength * 3 / ITEM_LEAP);
	const getUint32 =  (!isLittleEndian ? buffer.readUInt32BE : buffer.readUInt32LE).bind(buffer);

	for (let i = 0; i < bufferLength ; i = i + ITEM_LEAP) {
		result[(i * 3 / ITEM_LEAP) ] = getUint32(i + INT_BYTE_SIZE);
		result[(i * 3 / ITEM_LEAP) + 1] = getUint32(i + 2 * INT_BYTE_SIZE);
		result[(i * 3 / ITEM_LEAP) + 2] = getUint32(i + 3 * INT_BYTE_SIZE);
	}

	return result;
};

const binToTrianglesString = (buffer, isLittleEndian = false) => {
	const INT_BYTE_SIZE = 4;
	const ITEM_LEAP =  INT_BYTE_SIZE * 4; // 16 = 4 * 4 means four bytes (a uint32) and 4 means 4 components per triangle.
	// The first uint is the number of vertices, in the case of triangles this number will always be three so gets ignored

	const bufferLength = buffer.length;
	let result = "";
	const getUint32 =  (!isLittleEndian ? buffer.readUInt32BE : buffer.readUInt32LE).bind(buffer);

	for (let i = 0; i < bufferLength ; i = i + ITEM_LEAP) {
		if (i !== 0) {
			result += ",";
		}

		result += getUint32(i + INT_BYTE_SIZE) + "," + getUint32(i + 2 * INT_BYTE_SIZE) + "," + getUint32(i + 3 * INT_BYTE_SIZE);
	}

	return result;
};

class BinToTriangleStringStream extends Transform {
	constructor(opts = {}) {
		super(opts);
		this.started = false;
		this.isLittleEndian = opts.isLittleEndian;
	}

	_transform(chunk, encoding, callback) {
		if (this.started) {
			this.push(",");
		}

		this.started = true;
		this.push(binToTrianglesString(chunk, this.isLittleEndian));
		callback();
	}
}

module.exports = {
	binToArrayVector3d,
	toFloat32Array,
	binToTrianglesArray,
	binToTrianglesString,
	BinToTriangleStringStream,
	BinToVector3dStringStream,
	VECTOR3D_SIZE
};
