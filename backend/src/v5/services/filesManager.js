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

const { getAllRemovableEntriesByType, getRefEntry } = require('../models/fileRefs');
const FSHandler = require('../handler/fs');
const GridFSHandler = require('../handler/gridfs');
const { listCollections } = require('../handler/db');
const { logger } = require('../utils/logger');
const { templates } = require('../utils/responseCodes');

const FilesManager = {};

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

FilesManager.removeAllFilesFromModel = async (teamspace, model) => {
	const collList = await listCollections(teamspace);
	// eslint-disable-next-line security/detect-non-literal-regexp
	const regex = new RegExp(`^${model}.*\\.ref$`);
	const removeProms = collList.map(async ({ name }) => {
		const isModelRefCol = !!name.match(regex)?.length;
		if (isModelRefCol) {
			await removeAllFilesInCol(teamspace, name);
		}
	});

	await Promise.all(removeProms);
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
module.exports = FilesManager;
