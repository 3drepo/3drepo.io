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

const Models = {};
const db = require('../handler/db');
const { events } = require('../services/eventsManager/eventsManager.constants');
const { generateUUIDString } = require('../utils/helper/uuids');
const { getInfoFromCode } = require('./modelSettings.constants');
const { publish } = require('../services/eventsManager/eventsManager');
const { templates } = require('../utils/responseCodes');

const deleteOneModel = (ts, query) => db.deleteOne(ts, 'settings', query);
const findOneModel = (ts, query, projection) => db.findOne(ts, 'settings', query, projection);
const findModels = (ts, query, projection, sort) => db.find(ts, 'settings', query, projection, sort);
const insertOneModel = (ts, data) => db.insertOne(ts, 'settings', data);
const updateOneModel = (ts, query, action) => db.updateOne(ts, 'settings', query, action);

const noFederations = { federate: { $ne: true } };
const onlyFederations = { federate: true };

Models.addModel = async (ts, data) => {
	const _id = generateUUIDString();
	await insertOneModel(ts, { ...data, _id });

	publish(events.NEW_MODEL, { teamspace: ts, model: _id });

	return _id;
};

Models.deleteModel = async (ts, model) => {
	const { deletedCount } = await deleteOneModel(ts, { _id: model });

	if (deletedCount === 0) {
		throw templates.modelNotFound;
	}

	publish(events.DELETE_MODEL, { teamspace: ts, model });
};

Models.getModelByQuery = async (ts, query, projection) => {
	const res = await findOneModel(ts, query, projection);
	if (!res) {
		throw templates.modelNotFound;
	}

	return res;
};

Models.getModelById = (ts, model, projection) => Models.getModelByQuery(ts, { _id: model }, projection);

Models.getContainerById = async (ts, container, projection) => {
	try {
		return await Models.getModelByQuery(ts, { _id: container, ...noFederations }, projection);
	} catch (err) {
		if (err?.code === templates.modelNotFound.code) {
			throw templates.containerNotFound;
		}

		throw err;
	}
};

Models.getFederationById = async (ts, federation, projection) => {
	try {
		return await Models.getModelByQuery(ts, { _id: federation, ...onlyFederations }, projection);
	} catch (err) {
		if (err?.code === templates.modelNotFound.code) {
			throw templates.federationNotFound;
		}
		throw err;
	}
};

Models.getContainers = (ts, ids, projection, sort) => {
	const query = { _id: { $in: ids }, ...noFederations };
	return findModels(ts, query, projection, sort);
};

Models.getFederations = (ts, ids, projection, sort) => {
	const query = { _id: { $in: ids }, ...onlyFederations };
	return findModels(ts, query, projection, sort);
};

Models.updateModelStatus = async (teamspace, model, status, corId, user) => {
	const query = { _id: model };
	const updateObj = { status };
	if (corId) {
		updateObj.corID = corId;
	}

	const { matchedCount } = await updateOneModel(teamspace, query, { $set: updateObj });
	if (matchedCount > 0) {
	// It's possible that the model was deleted whilst there's a process in the queue. In that case we don't want to
	// trigger notifications.
		publish(events.MODEL_IMPORT_UPDATE, { teamspace, model, corId, status, user });
	}
};

Models.newRevisionProcessed = async (teamspace, model, corId, retVal, user) => {
	const { success, message, userErr } = getInfoFromCode(retVal);
	const query = { _id: model };
	const set = {};

	if (success) {
		set.status = 'ok';
		set.timestamp = new Date();
	} else {
		set.status = 'failed';
		set.errorReason = { message, timestamp: new Date(), errorCode: retVal };
	}

	const unset = { corID: 1 };
	const { matchedCount } = await updateOneModel(teamspace, query, { $set: set, $unset: unset });
	if (matchedCount !== 0) {
	// It's possible that the model was deleted whilst there's a process in the queue. In that case we don't want to
	// trigger notifications.

		publish(events.MODEL_IMPORT_FINISHED,
			{ teamspace, model, success, message, userErr, corId, errCode: retVal, user });
	}
};

Models.updateModelSettings = async (ts, model, data) => {
	const toUpdate = {};
	const toUnset = {};

	Object.keys(data).forEach((key) => {
		const value = data[key];
		if (value) {
			if (key === 'unit' || key === 'code') {
				if (!toUpdate.properties) {
					toUpdate.properties = {};
				}
				toUpdate.properties[key] = value;
			} else {
				toUpdate[key] = value;
			}
		} else if (key === 'defaultView') {
			toUnset[key] = 1;
		}
	});

	const updateJson = {};
	if (Object.keys(toUpdate).length > 0) {
		updateJson.$set = toUpdate;
	}
	if (Object.keys(toUnset).length > 0) {
		updateJson.$unset = toUnset;
	}

	const result = await db.updateOne(ts, 'settings', { _id: model }, updateJson);

	if (!result || result.matchedCount === 0) {
		throw templates.modelNotFound;
	}
};

module.exports = Models;
