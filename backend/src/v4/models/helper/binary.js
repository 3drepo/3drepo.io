/**
 *  Copyright (C) 2020 3D Repo Ltd
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

class BinToVector3dStringStream extends Transform {
	constructor(opts = {}) {
		super(opts);
		this.started = false;
		this.isLittleEndian = opts.isLittleEndian;
	}

	binToJSONArrayVector3d (buffer, isLittleEndian = false) {
		const vertexLength = 3; // (x, y, z)
		this.currentVertex = this.currentVertex ?? [];

		const getFloat32 =  (!isLittleEndian ? buffer.readFloatBE : buffer.readFloatLE).bind(buffer);

		let result = "";

		for (let i = 0; i < buffer.length; i += 4) {
			if(i !== 0 && this.currentVertex.length === 0) {
				result += ",";
			}

			this.currentVertex.push(getFloat32(i));
			if(this.currentVertex.length === vertexLength) {
				result += JSON.stringify(this.currentVertex);
				this.currentVertex = [];
			}
		}

		return result;
	}

	_transform(chunk, encoding, callback) {
		if (this.started && this.currentVertex.length === 0) {
			this.push(",");
		}

		this.started = true;

		this.push(this.binToJSONArrayVector3d(chunk, this.isLittleEndian));
		callback();
	}
}

const binToFacesString = (buffer, isLittleEndian = false) => {
	const bufferLength = buffer.length;
	const getUint32 =  (!isLittleEndian ? buffer.readUInt32BE : buffer.readUInt32LE).bind(buffer);

	const INT_BYTE_SIZE = 4;

	// The first element is the number of vertices in the face (e.g. two for lines, three for triangles, etc.)
	// The vertex count is present for each face, but as a rule faces of different counts are not mixed in the same array
	// so we only need to define this once.
	const FACE_SIZE = getUint32(0);
	const ITEM_LEAP = INT_BYTE_SIZE * (FACE_SIZE + 1);

	let result = "";

	for (let i = 0; i < bufferLength ; i = i + ITEM_LEAP) {
		if (i !== 0) {
			result += ",";
		}
		for (let j = 1; j <= FACE_SIZE; j++) {
			result += getUint32(i + j * INT_BYTE_SIZE);
			if (j < FACE_SIZE) {
				result += ",";
			}
		}
	}

	return result;
};

class BinToFaceStringStream extends Transform {
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
		this.push(binToFacesString(chunk, this.isLittleEndian));
		callback();
	}
}

module.exports = {
	toFloat32Array,
	BinToFaceStringStream,
	BinToVector3dStringStream,
	VECTOR3D_SIZE
};
