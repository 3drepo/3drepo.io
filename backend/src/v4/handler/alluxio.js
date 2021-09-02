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
const path = require("path");
const ResponseCodes = require("../response_codes");
const utils = require("../utils");
const AlluxioClient = require("./alluxioClient");
const slash = require("slash");

class AlluxioHandler {
	constructor() {
		if (config.alluxio) {
			const {hostname, port, levels } = config.alluxio;
			this.client = new AlluxioClient(`${hostname}:${port}`);
			this.levels = levels;
		}
	}

	async storeFile(data) {
		const _id = utils.generateUUID({string: true});
		const folderNames = utils.generateFoldernames(_id, this.levels);
		const link = path.join(folderNames, _id);
		await this.client.uploadFile(this.getAlluxioPathFormat(link), data);
		return ({_id, link, size:data.length, type: "alluxio"});
	}

	async getFileStream(key) {
		try {
			await this.client.downloadFileStream(this.getAlluxioPathFormat(key));
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

	async removeFile(key) {
		return await this.client.delete(this.getAlluxioPathFormat(key));
	}

	async removeFiles(keys) {
		return await Promise.all(keys.map(this.removeFile, this));
	}

	getAlluxioPathFormat(link) {
		return `/${slash(link)}`;
	}
}

module.exports = new AlluxioHandler();
