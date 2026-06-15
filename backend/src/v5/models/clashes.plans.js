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
const { isObject, isUUID } = require('../utils/helper/typeCheck');
const { CLASH_PLANS_COL } = require('./clashes.constants');
const db = require('../handler/db');
const { generateUUID } = require('../utils/helper/uuids');
const { isEmpty } = require('../utils/helper/objects');
const { templates } = require('../utils/responseCodes');

const ClashPlans = {};

const getPlanByQuery = async (teamspace, project, query, projection) => {
	const res = await db.findOne(teamspace, CLASH_PLANS_COL, { ...query, project }, projection);

	if (!res) {
		throw templates.clashPlanNotFound;
	}

	return res;
};

ClashPlans.getPlanById = (teamspace, project, id, projection = { project: 0 }) => getPlanByQuery(
	teamspace, project, { _id: id }, projection);

ClashPlans.getPlanByName = (teamspace, project, name, projection = { project: 0 }) => getPlanByQuery(
	teamspace, project, { name }, projection);

ClashPlans.createPlan = async (teamspace, project, data, user) => {
	const _id = generateUUID();
	await db.insertOne(teamspace, CLASH_PLANS_COL, { ...data, project, _id, createdAt: new Date(), createdBy: user });
	return _id;
};

ClashPlans.updatePlan = async (teamspace, project, planId, data, user) => {
	const toSet = { updatedAt: new Date(), updatedBy: user };
	const toUnset = {};
	const collectUpdates = (searchObj, prefix = '') => {
		Object.entries(searchObj).forEach(([key, value]) => {
			if (isObject(value) && !isUUID(value)) {
				collectUpdates(value, `${prefix}${key}.`);
			} else if (value === null) {
				toUnset[`${prefix}${key}`] = 1;
			} else {
				toSet[`${prefix}${key}`] = value;
			}
		});
	};
	collectUpdates(data);

	const updateQuery = { $set: toSet };

	if (!isEmpty(toUnset)) {
		updateQuery.$unset = toUnset;
	}

	await db.updateOne(teamspace, CLASH_PLANS_COL, { _id: planId, project }, updateQuery);
};

ClashPlans.deletePlan = async (teamspace, project, planId) => {
	await db.deleteOne(teamspace, CLASH_PLANS_COL, { _id: planId, project });
};

ClashPlans.deletePlansByProject = async (teamspace, project) => {
	await db.deleteMany(teamspace, CLASH_PLANS_COL, { project });
};

module.exports = ClashPlans;
