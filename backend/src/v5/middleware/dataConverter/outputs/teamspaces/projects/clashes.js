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

const { deleteIfUndefined } = require('../../../../../utils/helper/objects');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');
const { types } = require('../../../../../utils/helper/yup');
const yup = require('yup');

const Clashes = {};

const selectionSchema = yup.array().of(yup.object({
	container: types.id,
	revision: types.id,
})).default(undefined);

const serialisableValueSchema = yup.mixed().transform((value, originalValue) => (
	originalValue instanceof Date ? originalValue.getTime() : value
));

const planSchema = yup.object({
	_id: types.id,
	selectionA: selectionSchema,
	selectionB: selectionSchema,
	tickets: yup.object({
		federation: types.id,
		template: types.id,
		valuesAtCreation: yup.array().of(yup.object({
			value: serialisableValueSchema,
		})).default(undefined),
	}).default(undefined),
	createdAt: types.timestamp,
	updatedAt: types.timestamp,
});

const runSchema = yup.object({
	_id: types.id,
	plan: planSchema,
	triggeredAt: types.timestamp,
	updatedAt: types.timestamp,
});

const serialisePlan = (plan) => deleteIfUndefined(planSchema.cast(plan));
const serialiseRun = (run) => deleteIfUndefined(runSchema.cast(run));

Clashes.serialiseClashPlans = (req, res) => {
	respond(req, res, templates.ok, { plans: req.outputData.map(serialisePlan) });
};

Clashes.serialiseClashPlan = (req, res) => {
	respond(req, res, templates.ok, serialisePlan(req.outputData));
};

Clashes.serialiseClashRuns = (req, res) => {
	respond(req, res, templates.ok, { runs: req.outputData.map(serialiseRun) });
};

module.exports = Clashes;
