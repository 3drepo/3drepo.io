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

const { getAllRemovableEntriesByType, getRefEntry, insertRef, removeRef } = require('../models/fileRefs');
const FSHandler = require('../handler/fs');
const GridFSHandler = require('../handler/gridfs');
const config = require('../utils/config');
const { listCollections } = require('../handler/db');
const { logger } = require('../utils/logger');
const { templates } = require('../utils/responseCodes');

const FilesManager = {};

FilesManager.fileExists = async (teamspace, collection, filename) => {
	try {
		await getRefEntry(teamspace, collection, filename);
		return true;
	} catch {
		return false;
	}
};

const removeFiles = (teamspace, collection, storageType, links) => {
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

const removeAllFilesInCol = async (teamspace, collection) => {
	const refsByType = await getAllRemovableEntriesByType(teamspace, collection);

	const deletePromises = refsByType.map(
		({ _id, links }) => {
			if (_id && links?.length) {
				return removeFiles(teamspace, collection, _id, links);
			}
			return Promise.resolve();
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

// eslint-disable-next-line security/detect-non-literal-regexp
FilesManager.removeAllFilesFromModel = (teamspace, model) => removeFilesFromTeamspace(teamspace, new RegExp(`^${model}.*\\.ref$`));
FilesManager.removeAllFilesFromTeamspace = (teamspace) => removeFilesFromTeamspace(teamspace, new RegExp('.*\\.ref$'));

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

FilesManager.getFileAsStream = async (teamspace, collection, fileName) => {
	const { type, link, size } = await getRefEntry(teamspace, collection, fileName);
	let readStream;

	switch (type) {
	case 'fs':
		readStream = await FSHandler.getFileStream(link);
		break;
	case 'gridfs':
		readStream = await GridFSHandler.getFileStream(teamspace, collection, link);
		break;
	default:
		logger.logError(`Unrecognised external service: ${type}`);
		throw templates.fileNotFound;
	}
	return { readStream, size };
};

FilesManager.removeFile = async (teamspace, collection, id) => {
	try {
		const existingRef = await getRefEntry(teamspace, collection, id);
		await removeRef(teamspace, collection, id);
		await removeFiles(teamspace, collection, existingRef.type, [existingRef.link]);
	} catch {
		// do nothing if file does not exist
	}
};

FilesManager.storeFile = async (teamspace, collection, id, data, meta = {}) => {
	await FilesManager.removeFile(teamspace, collection, id);
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

	await insertRef(teamspace, collection, { ...meta, ...refInfo, _id: id });
};

module.exports = FilesManager;
