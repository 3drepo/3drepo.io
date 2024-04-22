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
const { events } = require('../services/eventsManager/eventsManager.constants');
const { publish } = require('../services/eventsManager/eventsManager');
const { templates } = require('../utils/responseCodes');

const Revisions = {};

const excludeVoids = { void: { $ne: true } };
const excludeIncomplete = { incomplete: { $exists: false } };

const collectionName = (model) => `${model}.history`;

const findRevisionsByQuery = (teamspace, model, query, projection, sort) => db.find(teamspace,
	collectionName(model), query, projection, sort);

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

Revisions.getRevisions = (teamspace, model, showVoid, projection = {}) => {
	const query = { ...excludeIncomplete };

	if (!showVoid) {
		query.void = excludeVoids.void;
	}

	return findRevisionsByQuery(teamspace, model, query, projection, { timestamp: -1 });
};

Revisions.getRevisionByIdOrTag = (teamspace, model, revision, projection = {}) => findOneRevisionByQuery(teamspace,
	model, { $or: [{ _id: revision }, { tag: revision }] }, projection);

Revisions.updateRevisionStatus = async (teamspace, project, model, revision, status) => {
	const res = await db.findOneAndUpdate(teamspace, collectionName(model),
		{ $or: [{ _id: revision }, { tag: revision }] },
		{ $set: { void: status } },
		{ projection: { _id: 1 } });

	if (!res) {
		throw templates.revisionNotFound;
	}

	publish(events.REVISION_UPDATED, { teamspace, project, model, data: { _id: res._id, void: status } });
};

Revisions.isTagUnique = async (teamspace, model, tag) => {
	try {
		await findOneRevisionByQuery(teamspace, model, { tag });
		return false;
	} catch {
		return true;
	}
};

Revisions.getRevisionFormat = (rFile) => (rFile ? '.'.concat(rFile[0].split('_').pop()) : undefined);

module.exports = Revisions;
