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

FileRefs.getRefEntryByQuery = async (teamspace, collection, query, projection) => {
	const entry = await db.findOne(teamspace, collectionName(collection), query, projection);

	if (!entry) {
		throw templates.fileNotFound;
	}

	return entry;
};

FileRefs.getRefEntry = (teamspace, collection, _id) => FileRefs.getRefEntryByQuery(
	teamspace, collection, { _id },
);

FileRefs.getTotalSize = async (teamspace, collection) => {
	const pipelines = [
		{ $match: {} },
		{ $group: { _id: null, total: { $sum: '$size' } } },
	];

	const res = await db.aggregate(teamspace, collectionName(collection), pipelines);

	return res.length > 0 ? res[0].total : 0;
};

FileRefs.getAllRemovableEntriesByType = async (teamspace, collection) => {
	const query = { noDelete: { $exists: false }, type: { $ne: 'http' } };
	const projection = { type: 1, link: 1 };
	const refs = await db.find(teamspace, collectionName(collection), query, projection);

	const res = {};

	refs.forEach(({ type, link }) => {
		res[type] = res[type] ?? { _id: type, links: [] };
		res[type].links.push(link);
	});

	return Object.values(res);
};

FileRefs.insertManyRefs = async (teamspace, collection, entries) => {
	await db.insertMany(teamspace, collectionName(collection), entries);
};

FileRefs.insertRef = async (teamspace, collection, refInfo) => {
	await db.insertOne(teamspace, collectionName(collection), refInfo);
};

FileRefs.removeRef = async (teamspace, collection, id) => {
	await db.deleteOne(teamspace, collectionName(collection), { _id: id });
};

FileRefs.getRefsByQuery = (teamspace, collection, query, projection) => db.find(
	teamspace, collectionName(collection), query, projection,
);

FileRefs.removeRefsByQuery = (teamspace, collection, query) => db.deleteMany(
	teamspace, collectionName(collection), query,
);

FileRefs.updateRef = async (teamspace, collection, query, action) => {
	await db.updateOne(
		teamspace, collectionName(collection), query, action,
	);
};

module.exports = FileRefs;
