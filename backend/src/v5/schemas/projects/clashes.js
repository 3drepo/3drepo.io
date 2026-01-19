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

/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { CLASH_PLAN_TYPES, SELF_INTERSECTIONS_CHECK_OPTIONS, TRIGGER_OPTIONS } = require('../../models/clashes.constants');
const { UUIDToString } = require('../../utils/helper/uuids');
const Yup = require('yup');
const { getContainerById } = require('../../models/modelSettings');
const { getPlanByName } = require('../../models/clashes');
const { modelsExistInProject } = require('../../models/projectSettings');
const { schema: rulesSchema } = require('../rules');
const { types } = require('../../utils/helper/yup');

const ClashSchema = {};

const generatePlanSchema = (teamspace, project, planId) => {
	const selectionSchema = Yup.object().shape({
		container: types.id.required().test('container-validation', 'Container must exist within the project', async (value) => {
			if (!value) {
				return true;
			}

			const isContainer = await getContainerById(teamspace, value, { _id: 1 }).catch(() => false);
			const existsInProject = await modelsExistInProject(teamspace, project, [value]).catch(() => false);

			return isContainer && existsInProject;
		}),
		rules: rulesSchema.optional(),
	}).required();

	return Yup.object().shape({
		name: types.strings.title.test('check-name-is-unique', 'Clash plan with the same name already exists', async (value) => {
			try {
				const plan = await getPlanByName(teamspace, value, { _id: 1 });
				return UUIDToString(plan._id) === UUIDToString(planId);
			} catch {
				return true;
			}
		}).required(),
		type: Yup.string().oneOf(CLASH_PLAN_TYPES).required(),
		tolerance: Yup.number().min(0).required(),
		selfIntersectionsCheck: Yup.mixed().oneOf(SELF_INTERSECTIONS_CHECK_OPTIONS).optional().default(false),
		trigger: Yup.array().of(Yup.string().oneOf(TRIGGER_OPTIONS)).min(1).test(
			'No duplicate values', 'Trigger array cannot contain duplicate values',
			(values) => {
				if (!values) {
					return true;
				}

				const idSet = new Set();
				return !values.some((val) => idSet.size === idSet.add(val).size);
			})
			.required(),
		selectionA: selectionSchema,
		selectionB: selectionSchema,
	}).strict(true).noUnknown()
		.required();
};

ClashSchema.validatePlan = (teamspace, project, planId, data) => generatePlanSchema(teamspace,
	project, planId).validate(data);

module.exports = ClashSchema;
