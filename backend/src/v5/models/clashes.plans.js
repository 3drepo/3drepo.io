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

const ClashPlans = {};

const getPlanByQuery = async (teamspace, project, query, projection) => {
	const res = await db.findOne(teamspace, CLASH_PLANS_COL, { ...query, project }, projection);

	if (!res) {
		throw templates.clashPlanNotFound;
	}

	return res;
};

ClashPlans.getPlanById = (teamspace, project, id, projection) => (
	getPlanByQuery(teamspace, project, { _id: id }, projection)
);

ClashPlans.getPlanByName = (teamspace, project, name, projection) => (
	getPlanByQuery(teamspace, project, { name }, projection)
);

ClashPlans.createPlan = async (teamspace, project, data, user) => {
	const _id = generateUUID();
	await db.insertOne(teamspace, CLASH_PLANS_COL, { ...data, project, _id, createdAt: new Date(), createdBy: user });
	return _id;
};

ClashPlans.updatePlan = async (teamspace, project, planId, data, user) => {
	await db.updateOne(teamspace, CLASH_PLANS_COL, { _id: planId, project },
		{ $set: { ...data, updatedAt: new Date(), updatedBy: user } });
};

ClashPlans.deletePlan = async (teamspace, project, planId) => {
	await db.deleteOne(teamspace, CLASH_PLANS_COL, { _id: planId, project });
};

module.exports = ClashPlans;
