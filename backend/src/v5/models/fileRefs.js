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

const ExternalServices = require('../handler/externalServices');
const db = require('../handler/db');
const { logger } = require('../utils/logger');
const { templates } = require('../utils/responseCodes');

const FileRefs = {};

const collectionName = (collection) => (collection.endsWith('.ref') ? collection : `${collection}.ref`);

const getRefEntry = async (account, collection, id) => {
	const entry = await db.findOne(account, collection, { _id: id });

	if (!entry) {
		throw templates.fileNotFound;
	}

	return entry;
};

FileRefs.fetchFileStream = async (teamspace, model, extension, fileName) => {
	const collection = `${model}.${extension}`;
	const entry = await getRefEntry(teamspace, collection, fileName);
	try {
		const stream = await ExternalServices.getFileStream(teamspace, collection, entry.type, entry.link);
		return { readStream: stream, size: entry.size };
	} catch {
		logger.logError(`Failed to fetch file from ${entry.type}. Trying GridFS....`);
		const stream = await ExternalServices.getFileStream(teamspace, `${model}.${extension}`, 'gridfs', fileName);
		return { readStream: stream, size: entry.size };
	}
};

FileRefs.getTotalSize = async (teamspace, collection) => {
	const pipelines = [
		{ $match: {} },
		{ $group: { _id: null, total: { $sum: '$size' } } },
	];

	const res = await db.aggregate(teamspace, collectionName(collection), pipelines);

	return res.length > 0 ? res[0].total : 0;
};

FileRefs.getAllRemovableEntriesByType = (teamspace, collection) => {
	const pipeline = [
		{ $match: { noDelete: { $exists: false }, type: { $ne: 'http' } } },
		{ $group: { _id: '$type', links: { $addToSet: '$link' } } },
	];

	return db.aggregate(teamspace, collection, pipeline);
};

module.exports = FileRefs;
