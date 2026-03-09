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

const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const { getLatestRevision } = require('../../../../../models/revisions');
const { getPlanById } = require('../../../../../models/clashes.plans');
const { isEqual } = require('../../../../../utils/helper/objects');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../utils/responder');
const { validateMany } = require('../../../../common');
const { validatePlan } = require('../../../../../schemas/projects/clashes');

const Clashes = {};

const validatePlanData = async (req, res, next) => {
	try {
		const { teamspace, project } = req.params;
		req.body = await validatePlan(teamspace, project, req.body);

		if (req.planData) {
			if (isEqual(req.planData, req.body)) {
				throw createResponseCode(templates.invalidArguments, 'No valid properties to update');
			}
		}

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Clashes.planExists = async (req, res, next) => {
	const { teamspace, planId } = req.params;

	try {
		req.planData = await getPlanById(teamspace, planId, { _id: 0 });
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

Clashes.planContainersHaveRevs = async (req, res, next) => {
	try {
		const { teamspace } = req.params;
		const containerIds = [
			req.planData.selectionA.container,
			req.planData.selectionB.container,
		];

		const { _id: rev1Id } = await getLatestRevision(teamspace, containerIds[0], modelTypes.CONTAINER, { _id: 1 });
		req.planData.selectionA.revision = rev1Id;
		const { _id: rev2Id } = await getLatestRevision(teamspace, containerIds[1], modelTypes.CONTAINER, { _id: 1 });
		req.planData.selectionB.revision = rev2Id;

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, 'Plan containers must have at least one revision'));
	}
};

Clashes.validateNewPlanData = validatePlanData;
Clashes.validateUpdatePlanData = validateMany([Clashes.planExists, validatePlanData]);

module.exports = Clashes;
