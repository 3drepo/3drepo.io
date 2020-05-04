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

const config = require("../config.js");
const fs = require("fs");
const path = require("path");
const ResponseCodes = require("../response_codes");
const systemLogger = require("../logger.js").systemLogger;
const nodeuuid = require("uuid/v1");
const farmhash = require("farmhash");
const AlluxioClient = require("../models/alluxioClient");
const slash = require("slash");

const generateFoldernames = (fileName, dirLevels) => {
	if (dirLevels < 1) {
		return "";
	}
	const folders = [];
	const minChunkLen = 4;
	const nameChunkLen = Math.max(fileName.length / dirLevels, minChunkLen);

	for(let i = 0 ; i < dirLevels; i++) {
		const chunkStart = (i * nameChunkLen) % fileName.length;
		const fileNameHash = farmhash.fingerprint32(fileName.substr(chunkStart,nameChunkLen) + Math.random());
		folders.push(fileNameHash & 255);
	}
	return folders.join("/");
};

class AlluxioHandler {
	constructor() {
		this.client = new AlluxioClient("localhost:39999");
		// if (config.fs) {
		// 	if (config.fs.hasOwnProperty("path") && config.fs.hasOwnProperty("levels")) {
		// 		this.testFilesystem();
		// 	} else {
		// 		const err = "fs entry found in config, but cannot find path/levels entry";
		// 		systemLogger.logError(err);
		// 		throw new Error(err);
		// 	}
		// }
	}

	async storeFile(data) {
		const _id = nodeuuid();
		const folderNames = generateFoldernames(_id, config.fs.levels);
		const link = path.join(folderNames, _id);
		await this.client.uploadFile(this.getAlluxioPathFormat(link), data);
		return ({_id, link, size:data.length, type: "alluxio"});
	}

	async getFileStream(key) {
		try {
			return await this.client.downloadFileStream(this.getAlluxioPathFormat(key));
		} catch {
			throw ResponseCodes.NO_FILE_FOUND;
		}
	}

	async getFile(key) {
		try {
			return await this.client.downloadFile(this.getAlluxioPathFormat(key));
		} catch {
			throw ResponseCodes.NO_FILE_FOUND;
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

	getAlluxioPathFormat(link) {
		return "/" + slash(link);
	}

	// testFilesystem() {
	// 	return fs.readdir(this.getFullPath(), (err) => {
	// 		if (err) {
	// 			const errMsg = "Failed to connect to filesystem at " + this.getFullPath();
	// 			systemLogger.logError(errMsg," : ", err);
	// 			throw new Error(errMsg);
	// 		}
	// 	});
	// }
}

module.exports = new AlluxioHandler();
