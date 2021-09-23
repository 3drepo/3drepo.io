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

const Revisions = {};

const excludeVoids = { void: { $ne: true } };
const excludeIncomplete = { incomplete: { $exists: false } };

const collectionName = (model) => `${model}.history`;

const findRevisionsByQuery = (teamspace, model, query, projection, sort) => db.find(teamspace, collectionName(model), query, projection, sort);

const findOneRevisionByQuery = async (teamspace, model, query, projection, sort) => {
	const rev = await db.findOne(teamspace, collectionName(model), query, projection, sort);
	if (!rev) {
		throw templates.revisionNotFound;
	}

	return rev;
};

Revisions.getLatestRevision = (teamspace, model, projection = {}) => {
	const query = { ...excludeVoids, ...excludeIncomplete };
	const sort = { timestamp: -1 };
	return findOneRevisionByQuery(teamspace, model, query, projection, sort);
};

Revisions.getRevisionCount = (teamspace, model) => {
	const query = { ...excludeVoids, ...excludeIncomplete };
	return db.count(teamspace, collectionName(model), query);
};

Revisions.getRevisions = async (teamspace, model, showVoid, projection = {}) => {
	const query = { ...excludeIncomplete };

	if (!showVoid) {
		query.void = excludeVoids.void;
	}

	return findRevisionsByQuery(teamspace, model, query, projection);
};

Revisions.updateRevisionStatus = async (teamspace, model, revision, status) => {
	const query = { $or: [{ _id: revision }, { tag: revision }] };
	const res = await db.updateOne(teamspace, collectionName(model), query, { $set: { void: status } });
	
	if(res && res.matchedCount === 0){
		throw templates.revisionNotFound;
	}
};

module.exports = Revisions;
