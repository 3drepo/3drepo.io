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

const { clashRunStatus } = require('../../../../../models/clashes.constants');
const { deleteIfUndefined } = require('../../../../../utils/helper/objects');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');
const { types } = require('../../../../../utils/helper/yup');
const yup = require('yup');

const Clashes = {};

const planSchema = yup.object({
	_id: types.id,
	selectionA: yup.object({
		container: types.id,
	}).default(undefined),
	selectionB: yup.object({
		container: types.id,
	}).default(undefined),
	tickets: yup.object({
		federation: types.id,
		template: types.id,
	}).default(undefined),
	createdAt: types.timestamp,
	updatedAt: types.timestamp,
});

const runSchema = yup.object({
	_id: types.id,
	triggeredAt: types.timestamp,
	completedAt: types.timestamp,
});

const formatRun = ({ _id, status, triggeredAt, triggeredBy, completedAt, result, errorCode, message }) => {
	const base = { _id, status, triggeredAt, triggeredBy };

	if (status === clashRunStatus.COMPLETED) {
		return runSchema.cast({ ...base, completedAt, result });
	}

	if (status === clashRunStatus.FAILED) {
		return runSchema.cast({ ...base, result: { error: { code: errorCode, reason: message } } });
	}

	return runSchema.cast(base);
};

const serialisePlan = (plan) => deleteIfUndefined(planSchema.cast(plan));

Clashes.serialiseClashPlans = (req, res) => {
	respond(req, res, templates.ok, { plans: req.outputData.map(serialisePlan) });
};

Clashes.serialiseClashPlan = (req, res) => {
	respond(req, res, templates.ok, serialisePlan(req.outputData));
};

Clashes.serialiseClashRuns = (req, res) => {
	respond(req, res, templates.ok, { runs: req.outputData.map(formatRun) });
};

module.exports = Clashes;
