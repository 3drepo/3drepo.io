/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const S3Handler = require("./s3");
const ResponseCodes = require("../response_codes");
const SystemLogger = require("../logger.js").systemLogger;

const ExternalServices = {};

ExternalServices.getFileStream = (type, key) => {
	switch(type) {
		case "s3" :
			return S3Handler.getFileStream(key);
		default:
			SystemLogger.logError(`Unrecognised external service: ${type}`);
			return Promise.reject(ResponseCodes.NO_FILE_FOUND);
	}
};

ExternalServices.getFile = (type, key) => {
	switch(type) {
		case "s3" :
			return S3Handler.getFile(key);
		default:
			SystemLogger.logError(`Unrecognised external service: ${type}`);
			return Promise.reject(ResponseCodes.NO_FILE_FOUND);
	}
};

ExternalServices.removeFiles = (type, keys) => {
	switch(type) {
		case "s3" :
			return S3Handler.removeFiles(keys);
		default:
			SystemLogger.logError(`Unrecognised external service: ${type}`);
			return Promise.reject(ResponseCodes.NO_FILE_FOUND);
	}
};

module.exports = ExternalServices;
