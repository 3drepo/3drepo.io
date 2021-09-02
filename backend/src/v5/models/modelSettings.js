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
const { templates } = require('../utils/responseCodes');

const findOneModel = (ts, query, projection) => db.findOne(ts, 'settings', query, projection);
const findModel = (ts, query, projection, sort) => db.find(ts, 'settings', query, projection, sort);

Models.getModelById = async (ts, model, projection) => {
	const res = await findOneModel(ts, { _id: model }, projection);
	if (!res) {
		throw templates.modelNotFound;
	}

	return res;
};

Models.getContainers = async (ts, ids, projection, sort) => {
	const query = { _id: { $in: ids }, federate: { $ne: true } };
	return findModel(ts, query, projection, sort);
};

Models.getFederations = async (ts, ids, projection, sort) => {
	const query = { _id: { $in: ids }, federate: true };
	return findModel(ts, query, projection, sort);
};

module.exports = Models;
