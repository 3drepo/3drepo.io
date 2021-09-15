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

const config = require("../config.js");
const fs = require("fs");
const path = require("path");
const ResponseCodes = require("../response_codes");
const systemLogger = require("../logger").systemLogger;
const utils = require("../utils");

const createFoldersIfNecessary = (foldersPath) => {
	return new Promise((resolve, reject) => {
		fs.access(foldersPath, fs.constants.F_OK, (err) => {
			if (!err) {
				resolve();
			} else {
				fs.mkdir(foldersPath, { recursive: true},(creationErr)=>{
					if (creationErr) {
						reject(creationErr);
					} else {
						resolve();
					}
				});
			}
		});
	});
};

class FSHandler {
	constructor() {
		if (config.fs) {
			if (utils.hasField(config.fs, "path") && utils.hasField(config.fs, "levels")) {
				this.testFilesystem();
			} else {
				const err = "fs entry found in config, but cannot find path/levels entry";
				systemLogger.logError(err);
				throw new Error(err);
			}
		}
	}

	storeFile(data) {
		const _id = utils.generateUUID({string: true});
		const folderNames = utils.generateFoldernames(config.fs.levels);
		const link = path.posix.join(folderNames, _id);

		return new Promise((resolve, reject) => {
			createFoldersIfNecessary(this.getFullPath(folderNames)).then(() =>{
				fs.writeFile(this.getFullPath(link), data ,(err=> {
					if (err) {
						reject(err);
					} else {
						resolve({_id, link, size:data.length, type: "fs"});
					}
				}));
			});
		});
	}

	getFileStream(key) {
		try {
			return fs.existsSync(this.getFullPath(key)) ?
				Promise.resolve(fs.createReadStream(this.getFullPath(key))) :
				Promise.reject(ResponseCodes.NO_FILE_FOUND);
		} catch (err) {
			systemLogger.logError("Failed to get filestream: ", err);
			return Promise.reject(ResponseCodes.NO_FILE_FOUND);
		}
	}

	getFile(key) {
		try {
			return Promise.resolve(fs.readFileSync(this.getFullPath(key)));
		} catch (err) {
			systemLogger.logError("Failed to get file: ", err);
			return Promise.reject(ResponseCodes.NO_FILE_FOUND);
		}
	}

	removeFiles(keys) {
		keys.forEach((key) => {
			fs.unlink(this.getFullPath(key), (err) => {
				if (err) {
					systemLogger.logError("File not removed:", {err, key});
				} else {
					systemLogger.logInfo("File removed:", key);
				}
			});
		});
	}

	getFullPath(key = "") {
		if (config.fs && config.fs.path) {
			return path.resolve(config.fs.path, key);
		} else {
			throw new Error("Filesystem is not configured");
		}
	}

	testFilesystem() {
		return fs.readdir(this.getFullPath(), (err) => {
			if (err) {
				const errMsg = "Failed to connect to filesystem at " + this.getFullPath();
				systemLogger.logError(errMsg," : ", err);
				throw new Error(errMsg);
			}
		});
	}
}

module.exports = new FSHandler();
