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

class BinToFaceStringStream extends Transform {
	constructor(opts = {}) {
		super(opts);
		this.started = false;
		this.i = 0; // The offset into the whole stream, in indices; used to determine where we are relative to a face boundary
		this.isLittleEndian = opts.isLittleEndian;
	}

	_transform(chunk, encoding, callback) {
		const getUint32 =  (!this.isLittleEndian ? chunk.readUInt32BE : chunk.readUInt32LE).bind(chunk);
		const INT_BYTE_SIZE = 4;
		const numIndices = chunk.length / INT_BYTE_SIZE;

		// When we begin for the first time, infer the primitive. This will be
		// constant for a given face array, so we only need to do it once.

		if (this.i === 0) {
			this.primitive = getUint32(0);
			this.stride = this.primitive + 1;
		}

		// Faces are returned in a flat array, so all we need to do is iterate
		// over the chunk, skipping the first "index" of each face (which is not
		// really an index but the index count). This can be done by keeping
		// track of where we are relative to the very first chunk.

		// This method assumes the chunks are always multiples of 4 (i.e. 32 bit
		// integers).
		// A face may straddle the boundary of a chunk, but an index within
		// a face will not.

		let result = "";
		for (let j = 0; j < numIndices; j++) {
			if ((this.i % this.stride) !== 0) { // The face always starts with the index count, which should be skipped
				if (this.started) {
					result += ",";
				} else {
					this.started = true;
				}
				result += getUint32(j * INT_BYTE_SIZE); // byte stride is the size of a uint32
			}
			this.i++;
		}

		this.push(result);
		callback();
	}
}

module.exports = {
	toFloat32Array,
	BinToFaceStringStream,
	BinToVector3dStringStream,
	VECTOR3D_SIZE
};
