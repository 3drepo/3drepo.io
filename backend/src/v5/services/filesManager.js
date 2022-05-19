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

const FSHandler = require('../handler/fs');
const GridFSHandler = require('../handler/gridfs');
const { getAllRemovableEntriesByType } = require('../models/fileRefs');
const { listCollections } = require('../handler/db');
const { logger } = require('../utils/logger');
const { templates } = require('../utils/responseCodes');

const FilesManager = {};

const removeFiles = (storageType, links, extras = {}) => {
	switch (storageType) {
	case 'fs':
		return FSHandler.removeFiles(links);
	case 'gridfs':
	{
		const { teamspace, collection } = extras;
		return GridFSHandler.removeFiles(teamspace, collection, links);
	}
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
				return removeFiles(_id, links, { teamspace, collection });
			}
			return Promise.resolve();
		},
	);

	return Promise.all(deletePromises);
};

FilesManager.removeAllFilesFromModel = async (teamspace, model) => {
	const collList = await listCollections(teamspace);
	const refCols = collList.filter(({ name }) => {
		// eslint-disable-next-line security/detect-non-literal-regexp
		const res = name.match(new RegExp(`^${model}.*\\.ref$`));
		return !!res?.length;
	});
	return Promise.all(refCols.map(({ name }) => removeAllFilesInCol(teamspace, name)));
};

module.exports = FilesManager;
