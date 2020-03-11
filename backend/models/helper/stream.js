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
