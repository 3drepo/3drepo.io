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

class BinToVector3dStringStream extends Transform {
	constructor(opts = {}) {
		super(opts);
		this.started = false;
		this.isLittleEndian = opts.isLittleEndian;
	}

	binToJSONArrayVector3d(buffer, isLittleEndian = false) {
		const vertexLength = 3; // (x, y, z)
		this.currentVertex = this.currentVertex ?? [];

		const getFloat32 = (!isLittleEndian ? buffer.readFloatBE : buffer.readFloatLE).bind(buffer);

		let result = '';

		for (let i = 0; i < buffer.length; i += 4) {
			if (i !== 0 && this.currentVertex.length === 0) {
				result += ',';
			}

			this.currentVertex.push(getFloat32(i));
			if (this.currentVertex.length === vertexLength) {
				result += JSON.stringify(this.currentVertex);
				this.currentVertex = [];
			}
		}

		return result;
	}

	_transform(chunk, encoding, callback) {
		if (this.started && this.currentVertex.length === 0) {
			this.push(',');
		}

		this.started = true;

		this.push(this.binToJSONArrayVector3d(chunk, this.isLittleEndian));
		callback();
	}
}

module.exports = {
	BinToVector3dStringStream,
};
