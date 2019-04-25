/**
 *	Copyright (C) 2019 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const config = require("../config.js");
const fs = require("fs");
const path = require("path");
const systemLogger = require("../logger.js").systemLogger;

class FSHandler {
	constructor() {
		if (config.fs && config.fs.path) {
			this.testFilesystem();
		} else {
			systemLogger.logError("Filesystem is not configured.");
			throw new Error("Filesystem is not configured");
		}
	}

	getFileStream(key) {
		return fs.createReadStream(this.getFullPath(key));
	}

	getFile(key) {
		return fs.readFileSync(this.getFullPath(key));
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

	getFullPath(key) {
		if (config.fs && config.fs.path) {
			return path.resolve(config.fs.path, key);
		} else {
			throw new Error("Filesystem is not configured");
		}
	}

	testFilesystem() {
		return fs.readdir(this.getFullPath(""), (err) => {
			if (err) {
				systemLogger.logError("failed to connect to filesystem: ", err);
				throw new Error("Filesystem connection failed");
			}
		});
	}
}

module.exports = new FSHandler();
