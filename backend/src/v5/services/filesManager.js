/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const {
	getAllRemovableEntriesByType,
	getRefEntry,
	getRefEntryByQuery,
	getRefsByQuery,
	insertManyRefs,
	insertRef,
	removeRefsByQuery,
} = require('../models/fileRefs');
const FSHandler = require('../handler/fs');
const GridFSHandler = require('../handler/gridfs');
const config = require('../utils/config');
const { fileMimeFromBuffer } = require('../utils/helper/typeCheck');
const { listCollections } = require('../handler/db');
const { logger } = require('../utils/logger');
const { templates } = require('../utils/responseCodes');

const FilesManager = {};

const DEFAULT_MIME_TYPE = 'application/octet-stream';

FilesManager.fileExists = async (teamspace, collection, filename) => {
	try {
		await getRefEntry(teamspace, collection, filename);
		return true;
	} catch {
		return false;
	}
};

const removeFilesByStorageType = (teamspace, collection, storageType, links) => {
	switch (storageType) {
	case 'fs':
		return FSHandler.removeFiles(links);
	case 'gridfs':
		return GridFSHandler.removeFiles(teamspace, collection, links);
	default:
		logger.logError(`Unrecognised external service: ${storageType}`);
		return Promise.reject(templates.fileNotFound);
	}
};

const removeFiles = async (teamspace, collection, refs) => {
	const refByType = {};

	refs.forEach(({ type, link }) => {
		if (type === 'http') return;
		refByType[type] = refByType[type] ?? [];
		refByType[type].push(link);
	});

	const proms = Object.keys(refByType).map((type) => removeFilesByStorageType(
		teamspace, collection, type, refByType[type],
	));
	await Promise.all(proms);
};

const removeAllFilesInCol = async (teamspace, collection) => {
	const refsByType = await getAllRemovableEntriesByType(teamspace, collection);

	const deletePromises = refsByType.map(
		async ({ _id, links }) => {
			if (_id && links?.length) {
				await removeFilesByStorageType(teamspace, collection, _id, links);
			}
		},
	);

	return Promise.all(deletePromises);
};

const removeFilesFromTeamspace = async (teamspace, regex) => {
	const collList = await listCollections(teamspace);
	const removeProms = collList.map(async ({ name }) => {
		const isModelRefCol = !!name.match(regex)?.length;
		if (isModelRefCol) {
			await removeAllFilesInCol(teamspace, name);
		}
	});

	await Promise.all(removeProms);
};

const removeFilesWithQuery = async (teamspace, collection, query) => {
	const refs = await getRefsByQuery(teamspace, collection, query);
	if (refs.length) {
		await Promise.all([
			removeFiles(teamspace, collection, refs),
			removeRefsByQuery(teamspace, collection, query),
		]);
	}
};

// eslint-disable-next-line security/detect-non-literal-regexp
FilesManager.removeAllFilesFromModel = (teamspace, model) => removeFilesFromTeamspace(teamspace, new RegExp(`^${model}.*\\.ref$`));
FilesManager.removeAllFilesFromTeamspace = (teamspace) => removeFilesFromTeamspace(teamspace, new RegExp('.*\\.ref$'));

FilesManager.removeFilesWithMeta = removeFilesWithQuery;

FilesManager.getFile = async (teamspace, collection, fileName) => {
	const { type, link } = await getRefEntry(teamspace, collection, fileName);

	switch (type) {
	case 'fs':
		return FSHandler.getFile(link);
	case 'gridfs':
		return GridFSHandler.getFile(teamspace, collection, link);
	default:
		logger.logError(`Unrecognised external service: ${type}`);
		throw templates.fileNotFound;
	}
};

const getFileAsStream = async (teamspace, collection, refEntry, chunkInfo) => {
	const { type, link, size, mimeType, encoding } = refEntry;
	let readStream;

	switch (type) {
	case 'fs':
		readStream = await FSHandler.getFileStream(link, chunkInfo);
		break;
	case 'gridfs':
		readStream = await GridFSHandler.getFileStream(teamspace, collection, link, chunkInfo);
		break;
	default:
		logger.logError(`Unrecognised external service: ${type}`);
		throw templates.fileNotFound;
	}
	return { readStream, size, mimeType: mimeType ?? DEFAULT_MIME_TYPE, encoding };
};

FilesManager.getFileWithMetaAsStream = async (teamspace, collection, file, meta) => {
	const refEntry = await getRefEntryByQuery(teamspace, collection, { ...meta, _id: file });
	return getFileAsStream(teamspace, collection, refEntry);
};

FilesManager.getFileAsStream = async (teamspace, collection, fileName, chunkInfo) => {
	const refEntry = await getRefEntry(teamspace, collection, fileName);
	return getFileAsStream(teamspace, collection, refEntry, chunkInfo);
};

FilesManager.removeFiles = async (teamspace, collection, ids) => {
	try {
		await removeFilesWithQuery(teamspace, collection, { _id: { $in: ids } });
	} catch {
		// do nothing if files does not exist
	}
};

FilesManager.removeFile = (teamspace, collection, id) => FilesManager.removeFiles(teamspace, collection, [id]);

FilesManager.storeFiles = async (teamspace, collection, dataEntry) => {
	const refObjs = await Promise.all(dataEntry.map(async ({ id, data, meta = {} }) => {
		const [mimeType] = await Promise.all([
			fileMimeFromBuffer(data),
			FilesManager.removeFile(teamspace, collection, id),
		]);
		let refInfo;
		switch (config.defaultStorage) {
		case 'fs':
			refInfo = await FSHandler.storeFile(data);
			break;
		case 'gridfs':
			refInfo = await GridFSHandler.storeFile(teamspace, collection, data);
			break;
		default:
			logger.logError(`Unrecognised external service: ${config.defaultStorage}`);
			throw templates.unknown;
		}
		return { ...meta, ...refInfo, _id: id, mimeType: mimeType || DEFAULT_MIME_TYPE };
	}));

	await insertManyRefs(teamspace, collection, refObjs);
};

FilesManager.storeFile = (teamspace, collection, id, data, meta = {}) => FilesManager.storeFiles(
	teamspace, collection, [{ id, meta, data }]);

FilesManager.storeFileStream = async (teamspace, collection, id, dataStream, meta = {}) => {
	await FilesManager.removeFile(teamspace, collection, id);
	let refInfo;

	switch (config.defaultStorage) {
	case 'fs':
		refInfo = await FSHandler.storeFileStream(dataStream);
		break;
	case 'gridfs':
		logger.logError('storeFileStream is not supported on GridFS services');
		throw templates.unknown;
	default:
		logger.logError(`Unrecognised external service: ${config.defaultStorage}`);
		throw templates.unknown;
	}

	const mimeType = DEFAULT_MIME_TYPE;

	await insertRef(teamspace, collection, { ...meta, ...refInfo, _id: id, mimeType });
};

module.exports = FilesManager;
