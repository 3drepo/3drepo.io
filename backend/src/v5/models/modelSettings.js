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
const { generateUUIDString } = require('../utils/helper/uuids');
const { templates } = require('../utils/responseCodes');

const deleteOneModel = (ts, query) => db.deleteOne(ts, 'settings', query);
const findOneModel = (ts, query, projection) => db.findOne(ts, 'settings', query, projection);
const findModels = (ts, query, projection, sort) => db.find(ts, 'settings', query, projection, sort);
const insertOneModel = (ts, data) => db.insertOne(ts, 'settings', data);

const noFederations = { federate: { $ne: true } };
const onlyFederations = { federate: true };

const getModelByQuery = async (ts, query, projection) => {
	const res = await findOneModel(ts, query, projection);
	if (!res) {
		throw templates.modelNotFound;
	}

	return res;
};

Models.addModel = async (ts, data) => {
	const res = await insertOneModel(ts, { _id: generateUUIDString(), ...data });
	return res.insertedId;
};

Models.deleteModel = async (ts, model) => {
	const res = await deleteOneModel(ts, { _id: model });

	if (res.deletedCount === 0) {
		throw templates.modelNotFound;
	}
};

Models.getModelById = (ts, model, projection) => getModelByQuery(ts, { _id: model }, projection);

Models.getContainerById = async (ts, container, projection) => {
	try {
		const res = await getModelByQuery(ts, { _id: container, ...noFederations }, projection);
		return res;
	} catch (err) {
		if (err?.code === templates.modelNotFound.code) {
			throw templates.containerNotFound;
		}

		throw err;
	}
};

Models.getFederationById = async (ts, federation, projection) => {
	try {
		const res = await getModelByQuery(ts, { _id: federation, ...onlyFederations }, projection);
		return res;
	} catch (err) {
		if (err?.code === templates.modelNotFound.code) {
			throw templates.federationNotFound;
		}

		throw err;
	}
};

Models.getModelByName = async (ts, ids, name, projection) => {
	const query = { _id: { $in: ids }, name };
	return findOneModel(ts, query, projection);
};

Models.getContainers = (ts, ids, projection, sort) => {
	const query = { _id: { $in: ids }, ...noFederations };
	return findModels(ts, query, projection, sort);
};

Models.getFederations = (ts, ids, projection, sort) => {
	const query = { _id: { $in: ids }, ...onlyFederations };
	return findModels(ts, query, projection, sort);
};

module.exports = Models;
