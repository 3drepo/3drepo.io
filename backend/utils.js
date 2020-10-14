/**
 *
 *  Copyright (C) 2014 3D Repo Ltd
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
const _ = require("lodash");
const sharp = require("sharp");
const nodeuuid = require("uuid/v1");
const uuidparse = require("uuid-parse");
const mongo = require("mongodb");

function Utils() {

	const self = this;

	this.isDate = (value) => {
		return "[object Date]" === Object.prototype.toString.call(value);
	};

	this.isString = (value) => {
		return "[object String]" === Object.prototype.toString.call(value);
	};

	this.isNumber = (value) => {
		return "[object Number]" === Object.prototype.toString.call(value);
	};

	this.isObject = (value) => {
		return "[object Object]" === Object.prototype.toString.call(value);
	};

	this.typeMatch = (value, type) => {
		return type === Object.prototype.toString.call(value);
	};

	this.hasField = (obj, field) => {
		return Object.prototype.hasOwnProperty.call(obj, field);
	};

	this.isUUIDObject = (value) => {
		try {
			return this.isObject(value) && !!this.uuidToString(value);
		} catch(e) {
			return false;
		}
	};

	this.deserialiseFilters = (ids, numbers) => {
		return {
			ids: ids ? ids.split(",") : undefined,
			numbers: numbers ? numbers.split(",") : undefined
		};
	};

	/** *****************************************************************************
	* Convert a string to a UUID
	* @param {string} uuid - String representation of a UUID
	* @returns {Buffer} binuuid - Binary representation of a UUID
	*******************************************************************************/
	this.uuidToMongoBuf3 = function(buf) {
		return mongo.Binary(buf, 3);
	};

	/** *****************************************************************************
	* Convert a string to a UUID
	* @param {string | Buffer} uuid - String representation of a UUID, or the UUID
	* @returns {Buffer} binuuid - Binary representation of a UUID
	*******************************************************************************/
	this.stringToUUID = function(uuid) {
		if (!_.isString(uuid)) {
			return uuid;
		}

		const bytes = uuidparse.parse(uuid);
		const buf   = new Buffer.from(bytes);

		return mongo.Binary(buf, 3);
	};

	/** *****************************************************************************
	* Convert a binary representation of an UUID to a string
	* @param {Buffer} binuuid - Binary representation of a UUID
	* @returns {string} uuid - String representation of a UUID
	*******************************************************************************/
	this.uuidToString = function(binuuid) {
		return (!_.isString(binuuid)) ?
			uuidparse.unparse(binuuid.buffer) :
			binuuid;
	};

	/** *****************************************************************************
	* Convert a set of strings to binary representation
	* @param {Array} uuids - String representation of a UUID
	* @returns {Buffer} binuuids - Binary representation of a UUID
	*******************************************************************************/
	this.stringsToUUIDs = function(uuids) {
		return uuids.map(function(uuid) {
			return self.stringToUUID(uuid);
		});
	};

	/** *****************************************************************************
	* Convert a binary representation of an UUID to a string
	* @param {Buffer} binuuid - Binary representation of a UUID
	* @returns {string} uuid - String representation of a UUID
	*******************************************************************************/
	this.uuidsToStrings = function(binuuids) {
		return binuuids.map(function(binuuid) {
			return self.uuidToString(binuuid);
		});
	};

	/** *****************************************************************************
	* Sanitise regex patterns in string
	* @param {string} str - Input string
	* @returns {string} - Sanitised string
	*******************************************************************************/
	this.sanitizeString = function(str) {
		return str.replace(/(\W)/g, "\\$1");
	};

	/** *****************************************************************************
	* Generate a random UUID
	* @returns {Buffer} - Binary representation of a UUID
	*******************************************************************************/
	this.generateUUID = function(options) {

		if(options && options.string) {
			return nodeuuid();
		}

		return self.stringToUUID(nodeuuid());
	};

	/** *****************************************************************************
	* Test if a given string conforms a valid UUID format
	* @returns {Boolean}
	*******************************************************************************/
	this.isUUID = function(uuid) {
		return uuid && uuid.match && Boolean(uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i));
	};

	/** *****************************************************************************
	  * Coalesce function
	  * @param {Object} variable - variable to coalesce
	  * @param {Object} value - value to return if object is null or undefined
	  *******************************************************************************/
	this.coalesce = function(variable, value) {
		if (variable === null || variable === undefined) {
			return value;
		} else {
			return variable;
		}
	};

	/**
	 * Map http promise error to our defined error codes
	 *
	 * @param {Object} err object from mongoose
	 */
	this.mongoErrorToResCode = function(err) {
		const responseCodes = require("./response_codes");

		if(err.name === "ValidationError") {
			return responseCodes.MONGOOSE_VALIDATION_ERROR(err);
		} else if(err.name === "MongoError") {
			return responseCodes.DB_ERROR(err);
		} else {
			return err;
		}
	};

	/**
	 * Return API method and pathname, no more hardcoding for something like '/login POST' in logging. Happy days
	 *
	 * @param {Object} this request object given by express.js
	 * @return {String} string describing an API's method and pathname
	 */
	this.APIInfo = function(req) {
		return `${req.method} ${req.originalUrl}`;
	};

	/**
	 * Con
	 *
	 * @param {Double} value - Value to round to n d.p.
	 * @param {Double} n - Number of d.p. to round to
	 * @return {Double} value rounded to n d.p.
	 */
	this.roundToNDP = function(value, n) {
		const factor = Math.pow(10.0, n);
		return Math.round(value * factor) / factor;
	};

	this.ucFirst = function(s) {
		return s.charAt(0).toUpperCase() + s.slice(1);
	};

	/**
	* Make an error for mongoose middleware from our responseCode because mongoose middleware
	* only recognize obj instanceof Error to be an error
	*
	* @param {Object} responseCode
	* @return {Error} error object
	*/
	this.makeError = function(responseCode) {
		return Object.assign(Object.create(Error.prototype), responseCode);
	};

	this.getCroppedScreenshotFromBase64 = function(base64Screenshot, width, height) {
		const screenshot = base64Screenshot.replace("data:image/png;base64,", "");
		const screenshotBuf = Buffer.from(screenshot, "base64");
		return this.resizeAndCropScreenshot(screenshotBuf, width, height, true);
	};

	this.objectIdToString = function(obj) {
		if (!obj || Object.keys(obj).length === 0 || _.isString(obj)) {
			return obj;
		}

		if (obj instanceof mongo.Binary) {
			return self.uuidToString(obj);
		}

		if (Array.isArray(obj)) {
			return obj.map(o=> self.objectIdToString(o));
		}

		return  _.mapValues(obj, self.objectIdToString);
	};

	/**
	* Create a screenshot entry from base64.
	* @param {Object} pngBuffer
	* @return {Object} JSON containing the screenshot entry
	*/
	this.createScreenshotEntry = function(pngBuffer) {
		return {
			content: new Buffer.from(pngBuffer, "base64"),
			flag: 1
		};
	};

	/**
	* Create a cropped version of a screen shot.
	* @param {Object} pngBuffer
	* @param {Number} destWidth
	* @param {Number} destHeight
	* @param {Boolean} crop
	* @return {Promise} Promise containing the updated image PNG Buffer
	*/
	this.resizeAndCropScreenshot = function(pngBuffer, destWidth, destHeight, crop) {

		const image = sharp(pngBuffer);

		return image.metadata().then(imageData => {

			destHeight = destHeight || Math.floor(destWidth / imageData.width * imageData.height);

			if(imageData.width <= destWidth) {

				return pngBuffer;

			} else if (!crop) {

				return image
					.resize(destWidth, destHeight)
					.png()
					.toBuffer();

			}

			return image
				.crop(sharp.gravity.centre)
				.resize(destWidth, destHeight)
				.png()
				.toBuffer();

		});

	};

	/**
	 * Convert a WebGL coordinates to Direct X
	 * @param {Number[]} [x y z] array containing webGL coordinates
	 * @return {Number[]} a converted array in directX convention
	 */
	this.webGLtoDirectX = function(point) {
		return point.length === 3 ? [point[0], -point[2], point[1]] : [];

	};
}

module.exports = new Utils();
