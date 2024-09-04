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

const { modelTypes, processStatuses } = require('./modelSettings.constants');
const db = require('../handler/db');
const { deleteIfUndefined } = require('../utils/helper/objects');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateUUID } = require('../utils/helper/uuids');
const { publish } = require('../services/eventsManager/eventsManager');
const { templates } = require('../utils/responseCodes');

const Revisions = {};

const excludeVoids = { void: { $ne: true } };
const excludeIncomplete = { incomplete: { $exists: false } };
const excludeFailed = { status: { $ne: processStatuses.FAILED } };

const collectionName = (modelType, model) => (modelType === modelTypes.DRAWING ? `${modelType}s.history` : `${model}.history`);

const findRevisionsByQuery = (teamspace, project, model, modelType, query, projection, sort) => db.find(teamspace,
	collectionName(modelType, model),
	{ ...query, ...(modelType === modelTypes.DRAWING ? { model, project } : {}) },
	projection, sort);

const findOneRevisionByQuery = async (teamspace, model, modelType, query, projection, sort) => {
	const rev = await db.findOne(teamspace, collectionName(modelType, model),
		{
			...query,
			...(modelType === modelTypes.DRAWING ? { model } : {}),
		},
		projection, sort);

	if (!rev) {
		throw templates.revisionNotFound;
	}

	return rev;
};

Revisions.getLatestRevision = (teamspace, model, modelType, projection = {}) => {
	const query = deleteIfUndefined({
		...excludeVoids,
		...excludeIncomplete,
		...excludeFailed,
		model: modelType === modelTypes.DRAWING ? model : undefined,
	});

	const sort = { timestamp: -1 };
	return findOneRevisionByQuery(teamspace, model, modelType, query, projection, sort);
};

Revisions.getRevisionCount = (teamspace, model, modelType) => {
	const query = deleteIfUndefined({
		...excludeVoids,
		...excludeIncomplete,
		...excludeFailed,
		model: modelType === modelTypes.DRAWING ? model : undefined,
	});

	return db.count(teamspace, collectionName(modelType, model), query);
};

Revisions.getRevisions = (teamspace, project, model, modelType, showVoid, projection = {}) => {
	const query = {
		...excludeIncomplete,
		...excludeFailed,
	};

	if (!showVoid) {
		query.void = excludeVoids.void;
	}

	return findRevisionsByQuery(teamspace, project, model, modelType, query, projection, { timestamp: -1 });
};

Revisions.getRevisionsByQuery = (teamspace, project, model, modelType, query, projection) => {
	const formattedQuery = deleteIfUndefined({
		...excludeVoids,
		...excludeIncomplete,
		...excludeFailed,
		...query,
	});

	return findRevisionsByQuery(teamspace, project, model, modelType, formattedQuery, projection, { timestamp: -1 });
};

Revisions.getRevisionByIdOrTag = (teamspace, model, modelType, revision, projection = {},
	{ includeVoid, includeFailed, includeIncomplete } = {},
) => {
	const query = {
		$or: [{ _id: revision }, { tag: revision }],
		...(includeVoid ? {} : { ...excludeVoids }),
		...(includeFailed ? {} : { ...excludeFailed }),
		...(includeIncomplete ? {} : { ...excludeIncomplete }),
	};

	return findOneRevisionByQuery(teamspace, model, modelType, query, projection);
};

Revisions.addRevision = async (teamspace, project, model, modelType, data) => {
	const newRevision = {
		_id: generateUUID(),
		project,
		model,
		timestamp: new Date(),
		...data,
	};

	await db.insertOne(teamspace, collectionName(modelType, model), newRevision);

	return newRevision._id;
};

Revisions.deleteModelRevisions = (teamspace, project, model, modelType) => db.deleteMany(
	teamspace, collectionName(modelType, model), { project, model });

const updateRevision = async (teamspace, model, modelType, revision, setUpdate,
	unsetUpdate = {}, projection = { _id: 1 }) => {
	const update = {};

	if (Object.keys(setUpdate).length) {
		update.$set = setUpdate;
	}

	if (Object.keys(unsetUpdate).length) {
		update.$unset = unsetUpdate;
	}

	const res = await db.findOneAndUpdate(teamspace, collectionName(modelType, model),
		{ $or: [{ _id: revision }, { tag: revision }] },
		update,
		{ projection });

	if (!res) {
		throw templates.revisionNotFound;
	}

	return res;
};

Revisions.onProcessingCompleted = async (teamspace, project, model, revId,
	{ success, message, retVal, userErr }, modelType, calibration) => {
	const set = {};
	const unset = { incomplete: 1 };

	if (success) {
		unset.status = 1;
	} else {
		set.status = processStatuses.FAILED;
		set.errorReason = { message, timestamp: new Date(), errorCode: retVal };
	}

	const { author: user } = await updateRevision(teamspace, model, modelType, revId, set, unset, { author: 1 });

	publish(events.MODEL_IMPORT_FINISHED,
		{
			teamspace,
			project,
			model,
			success,
			message,
			userErr,
			revId,
			errCode: retVal,
			user,
			modelType,
			calibration,
		});

	// We're not updating model settings here, but this is a temporary hack as front end is looking
	// for this event.
	publish(events.MODEL_SETTINGS_UPDATE, {
		teamspace,
		project,
		model,
		data: { ...set, status: set.status || processStatuses.OK, timestamp: new Date(), calibration },
		modelType,
	});
};

Revisions.addDrawingThumbnailRef = async (teamspace, project, model, revId, ref) => {
	await updateRevision(teamspace, model, modelTypes.DRAWING, revId, { thumbnail: ref });
};

Revisions.updateProcessingStatus = async (teamspace, project, model, modelType, revision, status) => {
	await updateRevision(teamspace, model, modelType, revision, { status });

	// to be inline with 3D, we need to trigger the model settings update
	publish(events.MODEL_SETTINGS_UPDATE, {
		teamspace,
		project,
		model,
		modelType,
		data: { status } });
};

Revisions.updateRevisionStatus = async (teamspace, project, model, modelType, revision, status) => {
	const res = await updateRevision(teamspace, model, modelType, revision, { void: status });

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
		await findOneRevisionByQuery(teamspace, model, modelTypes.DRAWING, { revCode, statusCode });
		return false;
	} catch {
		return true;
	}
};

Revisions.getRevisionFormat = (rFile) => (rFile ? '.'.concat(rFile[0].split('_').pop()) : undefined);

module.exports = Revisions;
