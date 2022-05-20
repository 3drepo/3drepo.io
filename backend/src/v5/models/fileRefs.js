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

const db = require('../handler/db');
const { templates } = require('../utils/responseCodes');

const FileRefs = {};

const collectionName = (collection) => (collection.endsWith('.ref') ? collection : `${collection}.ref`);

FileRefs.getRefEntry = async (teamspace, collection, id) => {
	const entry = await db.findOne(teamspace, collectionName(collection), { _id: id });

	if (!entry) {
		throw templates.fileNotFound;
	}

	return entry;
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
