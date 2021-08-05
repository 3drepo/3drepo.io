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
const nodeuuid = require("uuid").v1;
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
		if (config.alluxio) {
			const {hostname, port, levels } = config.alluxio;
			this.client = new AlluxioClient(`${hostname}:${port}`);
			this.levels = levels;
		}
	}

	async storeFile(data) {
		const _id = nodeuuid();
		const folderNames = generateFoldernames(_id, this.levels);
		const link = path.join(folderNames, _id);
		// debug info
		const info = await this.client.getInfo();
		console.log(info.uptimeMS);
		// debug info
		await this.client.uploadFile(this.getAlluxioPathFormat(link), data);
		return ({_id, link, size:data.length, type: "alluxio"});
	}

	async getFileStream(key) {
		try {
			// debug info
			const info = await this.client.getInfo();
			console.log(info.uptimeMS);
			// debug info
			return await this.client.downloadFileStream(this.getAlluxioPathFormat(key));
		} catch {
			throw ResponseCodes.NO_FILE_FOUND;
		}
	}

	async getFile(key) {
		try {
			// debug info
			const info = await this.client.getInfo();
			console.log(info.uptimeMS);
			// debug info
			return await this.client.downloadFile(this.getAlluxioPathFormat(key));
		} catch {
			throw ResponseCodes.NO_FILE_FOUND;
		}
	}

	async removeFile(key) {
		// debug info
		const info = await this.client.getInfo();
		console.log(info.uptimeMS);
		// debug info
		return await this.client.delete(this.getAlluxioPathFormat(key));
	}

	async removeFiles(keys) {
		// debug info
		const info = await this.client.getInfo();
		console.log(info.uptimeMS);
		// debug info
		return await Promise.all(keys.map(this.removeFile, this));
	}

	getAlluxioPathFormat(link) {
		return "/" + slash(link);
	}
}

module.exports = new AlluxioHandler();
