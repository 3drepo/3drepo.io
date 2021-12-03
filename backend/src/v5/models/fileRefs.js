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

const FileRefs = {};
const ExternalServices = require('../handler/externalServices');
const db = require('../handler/db');

const collectionName = (collection) => (collection.endsWith('.ref') ? collection : `${collection}.ref`);

const removeAllFiles = async (teamspace, collection) => {
	const pipeline = [
		{ $match: { noDelete: { $exists: false } } },
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

module.exports = FileRefs;
