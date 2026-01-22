/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { CLASH_PLANS_COL } = require('./clashes.constants');
const db = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');
const { templates } = require('../utils/responseCodes');

const Clashes = {};

const getPlanByQuery = async (teamspace, query, projection) => {
	const res = await db.findOne(teamspace, CLASH_PLANS_COL, query, projection);

	if (!res) {
		throw templates.clashPlanNotFound;
	}

	return res;
};

Clashes.getPlanById = (teamspace, id, projection) => getPlanByQuery(teamspace, { _id: id }, projection);

Clashes.getPlanByName = (teamspace, name, projection) => getPlanByQuery(teamspace, { name }, projection);

Clashes.createPlan = async (teamspace, data, user) => {
	const _id = generateUUID();
	await db.insertOne(teamspace, CLASH_PLANS_COL, { ...data, _id, createdAt: new Date(), createdBy: user });
	return _id;
};

Clashes.updatePlan = async (teamspace, planId, data, user) => {
	await db.updateOne(teamspace, CLASH_PLANS_COL, { _id: planId },
		{ $set: { ...data, updatedAt: new Date(), updatedBy: user } });
};

Clashes.deletePlan = async (teamspace, planId) => {
	await db.deleteOne(teamspace, CLASH_PLANS_COL, { _id: planId });
};

module.exports = Clashes;
