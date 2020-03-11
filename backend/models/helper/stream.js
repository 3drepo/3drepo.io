"use strict";

const { Readable } = require("stream");

class StreamBuffer extends Readable {
	constructor(options) {
		super({...options, highWaterMark: options.buffer.length});
		this._offset = 0;
		this._buffer = options.buffer;
		this._chunkSize = Math.min(256000, this._buffer.length);
	}

	_read() {
		if (this._offset >= this._buffer.length) {
			return this.push(null);
		}

		const length = Math.min(this._chunkSize, this._buffer.length - this._offset);

		this.push(Buffer.from(this._buffer, this._offset, length));
		this._offset += this._chunkSize;
	}
}

module.exports = {
	StreamBuffer
};
