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

const { access, constants, mkdir, readFile, stat, unlink, writeFile } = require('fs/promises');
const { createReadStream, createWriteStream } = require('fs');
const { createResponseCode, templates } = require('../utils/responseCodes');
const { FileStorageTypes } = require('../utils/config.constants');
const Yup = require('yup');
const config = require('../utils/config');
const { generateUUIDString } = require('../utils/helper/uuids');
const { logger } = require('../utils/logger');
const path = require('path');
const { pipeline } = require('stream/promises');
const { splitArrayIntoChunks } = require('../utils/helper/arrays');

const checkAccess = async (filePath, readWrite) => {
	// eslint-disable-next-line no-bitwise
	await access(filePath, readWrite ? constants.R_OK | constants.W_OK : constants.R_OK);
};

const createFoldersIfNecessary = async (folderPath) => {
	try {
		await checkAccess(folderPath, true);
	} catch {
		await mkdir(folderPath, { recursive: true });
	}
};

const generateFolderNames = (dirLevels) => {
	if (dirLevels < 1) {
		return '';
	}
	const folders = [];

	for (let i = 0; i < dirLevels; i++) {
		const folderName = Math.round(Math.random() * 255);
		folders.push(folderName.toString());
	}
	return folders.join('/');
};

const configSchema = Yup.object().shape({
	path: Yup.string().required(),
	name: Yup.string().required(),
	readOnly: Yup.boolean().default(false),
	levels: Yup.number().integer().min(0).default(0),
});

class FSHandler {
	constructor(fsConfig) {
		try {
			configSchema.validateSync(fsConfig);
			this.config = fsConfig;
		} catch (err) {
			logger.logError(err.message);
			throw err;
		}
	}

	async storeFile(data) {
		if (this.config.readOnly) throw createResponseCode(templates.unknown, 'Trying to write to a read-only filesystem');

		const { _id, link, filePath } = await this.#generateFilePath();
		await writeFile(filePath, data);
		return { _id, link, size: data.length, type: this.config.name };
	}

	async storeFileStream(stream) {
		if (this.config.readOnly) throw createResponseCode(templates.unknown, 'Trying to write to a read-only filesystem');

		const { _id, link, filePath } = await this.#generateFilePath();
		const writeStream = createWriteStream(filePath);
		await pipeline(stream, writeStream);

		const { size } = await stat(filePath);
		return { _id, link, size, type: this.config.name };
	}

	async getFile(key) {
		try {
			const data = await readFile(this.#getFullPath(key));
			return data;
		} catch (err) {
			throw templates.fileNotFound;
		}
	}

	async getFileStream(key, partialInfo) {
		try {
			const filePath = this.#getFullPath(key);
			await checkAccess(filePath, false);
			return createReadStream(this.#getFullPath(key), partialInfo);
		} catch (err) {
			logger.logError('Failed to get filestream: ', err);
			throw templates.fileNotFound;
		}
	}

	async removeFiles(files) {
		if (this.config.readOnly) throw createResponseCode(templates.unknown, 'Trying to remove a file in a read-only filesystem');
		// only remove 10000 files at a time or we may crash the box
		const removalGroups = splitArrayIntoChunks(files, 10000);
		for (const keys of removalGroups) {
			// eslint-disable-next-line no-await-in-loop
			await Promise.all(keys.map(async (key) => {
				try {
					await unlink(this.#getFullPath(key));
				} catch (err) {
					/* istanbul ignore next */
					if (err?.code !== 'ENOENT') {
						// Doesn't matter if we fail to delete a file, scheduler will clean it up.
						// We will log the reason and move on.
						logger.logError('File not removed:', { err, key });
					}
				}
			}));
		}
	}

	async getFileInfo(key) {
		try {
			const fullPath = this.#getFullPath(key);
			const stats = await stat(fullPath);

			return { path: fullPath, size: stats.size };
		} catch (err) {
			throw templates.fileNotFound;
		}
	}

	async testFilesystem() {
		const testPath = this.#getFullPath();
		try {
			await checkAccess(testPath, !this.config.readOnly);
		} catch (err) {
			const errMsg = `Failed to detect filesystem at ${testPath}, or insufficient permissions`;
			throw new Error(errMsg);
		}
	}

	// Private methods
	async #generateFilePath() {
		const _id = generateUUIDString();
		const folderNames = generateFolderNames(this.config.levels);
		const link = path.posix.join(folderNames, _id);
		const filePath = this.#getFullPath(link);
		await createFoldersIfNecessary(path.dirname(filePath));
		return { _id, link, filePath };
	}

	#getFullPath(subPath = '') {
		const fullPath = path.resolve(this.config.path, subPath);
		if (!fullPath.startsWith(path.resolve(this.config.path))) {
			logger.logError(`Attempt to access file outside of configured path: ${subPath}`);
			throw templates.fileNotFound;
		}
		return fullPath;
	}
}

const FSHandlerInterface = {};

FSHandlerInterface.getHandler = (storageType) => {
	switch (storageType) {
	case FileStorageTypes.FS:
		return new FSHandler({ ...config[FileStorageTypes.FS], name: FileStorageTypes.FS });
	case FileStorageTypes.EXTERNAL_FS:
		return new FSHandler({ ...config[FileStorageTypes.EXTERNAL_FS],
			name: FileStorageTypes.EXTERNAL_FS,
			readOnly: true });
	default:
		throw new Error(`Filesystem handler for type ${storageType} not found`);
	}
};
module.exports = FSHandlerInterface;
