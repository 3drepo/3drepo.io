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
const Mailer = require('../mailer/mailer');
const db = require('../handler/db');
const { logger } = require('../utils/logger');
const { templates } = require('../utils/responseCodes');

const FileRefs = {};

const collectionName = (collection) => (collection.endsWith('.ref') ? collection : `${collection}.ref`);

const getRefEntry = async (account, collection, fileName) => {
	const entry = await db.findOne(account, collection, { _id: fileName });

	if (!entry) {
		throw templates.noFileFound;
	}

	return entry;
};

const fetchFileStream = async (account, model, collection, fileName) => {
	const entry = await getRefEntry(account, collection, fileName);
	try {
		const stream = await ExternalServices.getFileStream(account, collection, entry.type, entry.link);
		return { readStream: stream, size: entry.size };
	} catch {
		logger.logError(`Failed to fetch file from ${entry.type}. Trying GridFS....`);
		Mailer.sendFileMissingError({ account, model, collection, refId: entry._id, link: entry.link }).catch(() => {
			logger.logError('Failed to send file missing error.');
		});

		const stream = await ExternalServices.getFileStream(account, collection, 'gridfs', fileName);
		return { readStream: stream, size: entry.size };
	}
};

const getOriginalFile = (account, model, fileName) => fetchFileStream(account, model, `${model}.history.ref`, fileName);

const removeAllFiles = async (teamspace, collection) => {
	const pipeline = [
		{ $match: { noDelete: { $exists: false }, type: { $ne: 'http' } } },
		{ $group: { _id: '$type', links: { $addToSet: '$link' } } },
	];
	const results = await db.aggregate(teamspace, collection, pipeline);

	const deletePromises = results.map(
		({ _id, links }) => {
			if (_id && links?.length) {
				return ExternalServices.removeFiles(teamspace, collection, _id, links);
			}
			return Promise.resolve();
		},
	);

	return Promise.all(deletePromises);
};

FileRefs.getTotalSize = async (teamspace, collection) => {
	const pipelines = [
		{ $match: {} },
		{ $group: { _id: null, total: { $sum: '$size' } } },
	];

	const res = await db.aggregate(teamspace, collectionName(collection), pipelines);

	return res.length > 0 ? res[0].total : 0;
};

FileRefs.removeAllFilesFromModel = async (teamspace, model) => {
	const collList = await db.listCollections(teamspace);
	const refCols = collList.filter(({ name }) => {
		// eslint-disable-next-line security/detect-non-literal-regexp
		const res = name.match(new RegExp(`^${model}.*\\.ref$`));
		return !!res?.length;
	});
	return Promise.all(refCols.map(({ name }) => removeAllFiles(teamspace, name)));
};

FileRefs.downloadFiles = async (teamspace, model, revision) => {
	if (!revision || !revision.rFile || !revision.rFile.length) {
		throw templates.noFileFound;
	}

	// We currently only support single file fetches
	const fileName = revision.rFile[0];
	const fileNameArr = fileName.split('_');
	const ext = fileNameArr.length > 1 ? `.${fileNameArr.pop()}` : '';
	const fileNameFormatted = fileNameArr.join('_').substr(36) + ext;
	const file = await getOriginalFile(teamspace, model, fileName);
	return { ...file, filename: fileNameFormatted };
};

module.exports = FileRefs;
