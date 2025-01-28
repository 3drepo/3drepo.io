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
const { Transform } = require('stream');

const binToFacesString = (buffer, isLittleEndian) => {
	const bufferLength = buffer.length;
	const getUint32 = (!isLittleEndian ? buffer.readUInt32BE : buffer.readUInt32LE).bind(buffer);

	const INT_BYTE_SIZE = 4;

	// The first element is the number of vertices in the face (e.g. two for lines, three for triangles, etc.)
	// The vertex count is present for each face, but as a rule faces of different counts are not mixed in the same array
	// so we only need to define this once.
	const FACE_SIZE = getUint32(0);
	const ITEM_LEAP = INT_BYTE_SIZE * (FACE_SIZE + 1);

	let result = '';

	for (let i = 0; i < bufferLength; i += ITEM_LEAP) {
		if (i !== 0) {
			result += ',';
		}
		for (let j = 1; j <= FACE_SIZE; j++) {
			result += getUint32(i + j * INT_BYTE_SIZE);
			if (j < FACE_SIZE) {
				result += ',';
			}
		}
	}

	return result;
};

class BinToFaceStringStream extends Transform {
	constructor(opts = { isLittleEndian: false }) {
		super(opts);
		this.started = false;
		this.isLittleEndian = opts.isLittleEndian;
	}

	_transform(chunk, encoding, callback) {
		if (this.started) {
			this.push(',');
		}

		this.started = true;
		this.push(binToFacesString(chunk, this.isLittleEndian));
		callback();
	}
}

module.exports = {
	BinToFaceStringStream,
};
