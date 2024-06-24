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
const { generateUUID } = require('../utils/helper/uuids');
const { modelTypes } = require('./modelSettings.constants');

const Revisions = {};

const excludeVoids = { void: { $ne: true } };
const excludeIncomplete = { incomplete: { $exists: false } };

const collectionName = (modelType, model) => (modelType === modelTypes.DRAWING ? `${modelType}s.history` : `${model}.history`);

const findRevisionsByQuery = (teamspace, model, modelType, query, projection, sort) => db.find(teamspace,
	collectionName(modelType, model), query, projection, sort);

const findOneRevisionByQuery = async (teamspace, model, modelType, query, projection, sort) => {
	const rev = await db.findOne(teamspace, collectionName(modelType, model), query, projection, sort);
	if (!rev) {
		throw templates.revisionNotFound;
	}

	return rev;
};

Revisions.getLatestRevision = (teamspace, model, projection = {}) => {
	const query = { ...excludeVoids, ...excludeIncomplete };
	const sort = { timestamp: -1 };
	return findOneRevisionByQuery(teamspace, model, undefined, query, projection, sort);
};

Revisions.getRevisionCount = (teamspace, model) => {
	const query = { ...excludeVoids, ...excludeIncomplete };
	return db.count(teamspace, collectionName(undefined, model), query);
};

Revisions.getRevisions = (teamspace, model, modelType, showVoid, projection = {}) => {
	const query = { ...excludeIncomplete };

	if (!showVoid) {
		query.void = excludeVoids.void;
	}

	return findRevisionsByQuery(teamspace, model, modelType, query, projection, { timestamp: -1 });
};

Revisions.getRevisionByIdOrTag = (teamspace, model, modelType, revision, projection = {}) => findOneRevisionByQuery(
	teamspace, model, modelType, { $or: [{ _id: revision }, { tag: revision }] }, projection);

Revisions.addRevision = async (teamspace, project, model, modelType, data) => {
	const newRevision = {
		_id: generateUUID(),
		project,
		model,
		timestamp: new Date(),
		...data,
	};

	await db.insertOne(teamspace, collectionName(modelType, model), newRevision);

	publish(events.NEW_REVISION, { teamspace, project, model, modelType, revision: newRevision._id });

	return newRevision._id;
};

Revisions.deleteModelRevisions = (teamspace, project, model, modelType) => db.deleteMany(
	teamspace, collectionName(modelType, model), { project, model });

Revisions.updateRevisionStatus = async (teamspace, project, model, modelType, revision, status) => {
	const res = await db.findOneAndUpdate(teamspace, collectionName(modelType, model),
		{ $or: [{ _id: revision }, { tag: revision }] },
		{ $set: { void: status } },
		{ projection: { _id: 1 } });

	if (!res) {
		throw templates.revisionNotFound;
	}

	publish(events.REVISION_UPDATED, { teamspace,
		project,
		model,
		modelType,
		data: { _id: res._id, void: status } });
};

Revisions.isTagUnique = async (teamspace, model, tag) => {
	try {
		await findOneRevisionByQuery(teamspace, model, undefined, { tag });
		return false;
	} catch {
		return true;
	}
};

Revisions.isRevAndStatusCodeUnique = async (teamspace, model, revCode, statusCode) => {
	try {
		await findOneRevisionByQuery(teamspace, undefined, modelTypes.DRAWING, { revCode, statusCode });
		return false;
	} catch {
		return true;
	}
};

Revisions.getRevisionFormat = (rFile) => (rFile ? '.'.concat(rFile[0].split('_').pop()) : undefined);

module.exports = Revisions;
