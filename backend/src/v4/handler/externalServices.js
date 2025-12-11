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
const {v5Path } = require("../../interop");
const FSHandler = require(`${v5Path}/handler/fs`);

const ResponseCodes = require("../response_codes");
const SystemLogger = require("../logger.js").systemLogger;
const { FileStorageTypes } = require(`${v5Path}/utils/config.constants`);

const ExternalServices = {};

const getDefaultStorageType = () => FileStorageTypes.FS;

const fsHandler = FSHandler.getHandler(FileStorageTypes.FS);

ExternalServices.getFileStream = async (account, collection, type, key) => {
	switch(type) {
		case FileStorageTypes.FS :
			return fsHandler.getFileStream(key);
		default:
			SystemLogger.logError(`Unrecognised external service: ${type}`);
			return Promise.reject(ResponseCodes.UNRECOGNISED_STORAGE_TYPE);
	}
};

ExternalServices.getFile = (account, collection, type, key) => {
	switch(type) {
		case FileStorageTypes.FS :
			return Promise.resolve(fsHandler.getFile(key));
		default:
			SystemLogger.logError(`Unrecognised external service: ${type}`);
			return Promise.reject(ResponseCodes.UNRECOGNISED_STORAGE_TYPE);
	}
};

ExternalServices.storeFile = (account, collection, data) => {
	const type = getDefaultStorageType();

	switch(type) {
		case FileStorageTypes.FS:
			return fsHandler.storeFile(data);
		default:
			SystemLogger.logError(`Unrecognised external service: ${type}`);
			return Promise.reject(ResponseCodes.UNRECOGNISED_STORAGE_TYPE);
	}
};

ExternalServices.storeFileStream = (account, collection, fileStream) => {
	const type = getDefaultStorageType();
	switch(type) {
		case FileStorageTypes.FS:
			return fsHandler.storeFileStream(fileStream);
		default:
			SystemLogger.logError(`Unrecognised external service: ${type}`);
			return Promise.reject(ResponseCodes.UNRECOGNISED_STORAGE_TYPE);
	}
};

ExternalServices.removeFiles = (account, collection, type, keys) => {
	switch(type) {
		case FileStorageTypes.FS:
			return fsHandler.removeFiles(keys);

		default:
			SystemLogger.logError(`Unrecognised external service: ${type}`);
			return Promise.reject(ResponseCodes.UNRECOGNISED_STORAGE_TYPE);
	}
};

module.exports = ExternalServices;
