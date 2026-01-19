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

const { times } = require('lodash');
const { fieldOperators, valueOperators } = require('../../../../../src/v5/models/metadata.rules.constants');
const { templates } = require('../../../../../src/v5/utils/responseCodes');
const { src } = require('../../../helper/path');
const { determineTestGroup, generateRandomString, generateUUIDString, generateRandomNumber } = require('../../../helper/services');

const { CLASH_PLAN_TYPES, SELF_INTERSECTIONS_CHECK_OPTIONS, TRIGGER_OPTIONS } = require(`${src}/models/clashes.constants`);

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettingsModel = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/models/projectSettings');
const ProjectSettingsModel = require(`${src}/models/projectSettings`);

const ClashesSchema = require(`${src}/schemas/projects/clashes`);

const testValidatePlan = () => {
	describe('Validate plan data', () => {
		const teamspace = generateUUIDString();
		const project = generateUUIDString();
		const planId = generateUUIDString();
		const standardRule = {
			name: generateRandomString(),
			field: { operator: fieldOperators.IS.name, values: [generateRandomString()] },
			operator: valueOperators.IS.name,
			values: [generateRandomString()],
		};
		const planData = {
			name: generateRandomString(),
			type: CLASH_PLAN_TYPES[0],
			tolerance: generateRandomNumber(0),
			selfIntersectionsCheck: SELF_INTERSECTIONS_CHECK_OPTIONS[0],
			trigger: [TRIGGER_OPTIONS[0]],
			selectionA: { container: generateUUIDString(), rules: [standardRule] },
			selectionB: { container: generateUUIDString(), rules: [standardRule] },
		};

		describe.each([
			['with no object (undefined)', false, undefined],
			['with no object (null)', false, null],
			['with valid data', true, planData],
			['with empty name', false, { ...planData, name: '' }],
			['with too long name', false, { ...planData, name: generateRandomString(1201) }],
			['with undefined name', false, { ...planData, name: undefined }],
			['with invalid type', false, { ...planData, type: generateRandomString() }],
			['with undefined type', false, { ...planData, type: undefined }],
			['with invalid tolerance', false, { ...planData, tolerance: generateRandomString() }],
			['with negative tolerance', false, { ...planData, tolerance: generateRandomNumber(-10, -1) }],
			['with undefined tolerance', false, { ...planData, tolerance: undefined }],
			['with invalid selfIntersectionsCheck', false, { ...planData, selfIntersectionsCheck: generateRandomString() }],
			['with undefined selfIntersectionsCheck', true, { ...planData, selfIntersectionsCheck: undefined }],
			['with selfIntersectionsCheck set to true', true, { ...planData, selfIntersectionsCheck: true }],
			['with selfIntersectionsCheck set to false', true, { ...planData, selfIntersectionsCheck: false }],
			['with invalid trigger', false, { ...planData, trigger: generateRandomString() }],
			['with undefined trigger', false, { ...planData, trigger: undefined }],
			['with duplicate trigger', false, { ...planData, trigger: [TRIGGER_OPTIONS[0], TRIGGER_OPTIONS[0]] }],
			['with empty trigger', false, { ...planData, trigger: [] }],
			['with valid trigger', true, { ...planData, trigger: [TRIGGER_OPTIONS[0], TRIGGER_OPTIONS[1]] }],
			['with selections without container', false, { ...planData, selectionA: { rules: [standardRule] }, selectionB: { rules: [standardRule] } }],
		])('Validate plan data properties (without selection)', (desc, success, data) => {
			test(`should ${success ? 'succeed' : 'fail'} ${desc}`, async () => {
				if (data?.selectionA?.container) {
					times(2, () => {
						ModelSettingsModel.getContainerById.mockResolvedValueOnce({});
						ProjectSettingsModel.modelsExistInProject.mockResolvedValueOnce({});
					});
				}

				const test = expect(ClashesSchema.validatePlan(teamspace, project, data));
				if (success) {
					await test.resolves.not.toBeUndefined();
				} else {
					await test.rejects.not.toBeUndefined();
				}
			});
		});

		describe('Validate plan data selection', () => {
			test('should fail if model is not container', async () => {
				times(2, () => {
					ModelSettingsModel.getContainerById.mockRejectedValueOnce(templates.modelNotFound);
					ProjectSettingsModel.modelsExistInProject.mockResolvedValueOnce(true);
				});

				await expect(ClashesSchema.validatePlan(teamspace, project, planData))
					.rejects.not.toBeUndefined();
			});

			test('should fail if the model does not exist in project', async () => {
				times(2, () => {
					ModelSettingsModel.getContainerById.mockResolvedValueOnce({});
					ProjectSettingsModel.modelsExistInProject.mockRejectedValueOnce(templates.modelNotFound);
				});

				await expect(ClashesSchema.validatePlan(teamspace, project, planData))
					.rejects.not.toBeUndefined();
			});
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidatePlan();
});
