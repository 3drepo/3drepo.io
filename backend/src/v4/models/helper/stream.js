/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { Readable } = require("stream");

class StreamBuffer extends Readable {
	constructor(options) {
		super({...options, highWaterMark: options.buffer.length});
		this._offset = 0;
		this._buffer = options.buffer;
		this._chunkSize = Math.min(options.chunkSize || 256000, this._buffer.length);
	}

	_read() {
		if (this._offset >= this._buffer.length) {
			return this.push(null);
		}

		let length = Math.min(this._chunkSize, this._buffer.length - this._offset);

		while(this.push(Buffer.from(this._buffer, this._offset, length)) && length > 0) {
			length = Math.min(this._chunkSize, this._buffer.length - this._offset);
			this._offset += length;
		}

		if(this._offset + length >= this._buffer.length) {
			this.push(null);
		}
	}
}

module.exports = {
	StreamBuffer
};
