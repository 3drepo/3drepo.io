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

const ORIGINAL_FILE_REF_EXT = '.history.ref';
const UNITY_BUNDLE_REF_EXT = '.stash.unity3d.ref';
const STATE_FILE_REF_EXT = '.sequences.ref';
const JSON_FILE_REF_EXT = '.stash.json_mpc.ref';
const RESOURCES_FILE_REF_EXT = '.resources.ref';

const ISSUES_FILE_REF_EXT = '.issues.ref';
const RISKS_FILE_REF_EXT = '.risks.ref';

const removeAllFiles = async (teamspace, collection) => {
	const coll = await db.getCollection(teamspace, collection);

	const query = [
		{ $match: { noDelete: { $exists: false } } },
		{ $group: { _id: '$type', links: { $addToSet: '$link' } } },
	];

	const results = coll ? await db.aggregate(teamspace, collection, query) : [];
	const deletePromises = [];

	results.forEach((entry) => {
		deletePromises.push(ExternalServices.removeFiles(teamspace, collection, entry._id, entry.links));
	});

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

FileRefs.removeAllFilesFromModel = (teamspace, model) => Promise.all([
	removeAllFiles(teamspace, model + ORIGINAL_FILE_REF_EXT),
	removeAllFiles(teamspace, model + JSON_FILE_REF_EXT),
	removeAllFiles(teamspace, model + UNITY_BUNDLE_REF_EXT),
	removeAllFiles(teamspace, model + RESOURCES_FILE_REF_EXT),
	removeAllFiles(teamspace, model + STATE_FILE_REF_EXT),
	removeAllFiles(teamspace, model + ISSUES_FILE_REF_EXT),
	removeAllFiles(teamspace, model + RISKS_FILE_REF_EXT),
]);

module.exports = FileRefs;
