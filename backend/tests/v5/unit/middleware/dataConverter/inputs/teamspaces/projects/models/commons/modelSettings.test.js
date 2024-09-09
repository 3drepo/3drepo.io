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

const { src } = require('../../../../../../../../helper/path');
const _ = require('lodash');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../../../../../../src/v5/models/views');
const Views = require(`${src}/models/views`);
jest.mock('../../../../../../../../../../src/v5/models/legends');
const Legends = require(`${src}/models/legends`);
jest.mock('../../../../../../../../../../src/v5/models/modelSettings');
const ModelSettingsModel = require(`${src}/models/modelSettings`);
jest.mock('../../../../../../../../../../src/v5/models/projectSettings');
const Projects = require(`${src}/models/projectSettings`);
jest.mock('../../../../../../../../../../src/v5/utils/permissions/permissions');
const ModelSettings = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { generateRandomString } = require('../../../../../../../../helper/services');

const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const existingViewID = '3752b630-065f-11ec-8edf-ab0f7cc84da8';
Views.getViewById.mockImplementation((teamspace, model, view) => {
	if (UUIDToString(view) === existingViewID) {
		return true;
	}
	throw templates.viewNotFound;
});

const existingLegendID = '3752b630-065f-11ec-8edf-ab0f7cc84da8';
Legends.checkLegendExists.mockImplementation((teamspace, model, legend) => {
	if (UUIDToString(legend) === existingLegendID) {
		return true;
	}
	throw templates.legendNotFound;
});

const existingModelName = generateRandomString();
const existingModelNumber = generateRandomString();

ModelSettingsModel.getModelByQuery.mockImplementation((teamspace,
	{ _id, name = null, number = null, modelType } = {}) => {
	if ((modelType === modelTypes.DRAWING && existingModelNumber.match(number)) && _id?.$in?.length) return {};
	if (existingModelName.match(name) && _id?.$in?.length) return {};

	throw templates.modelNotFound;
});

Projects.getProjectById.mockResolvedValue({ models: ['234'] });
const params = { teamspace: 'ts', project: '123', model: '123' };

const testValidateUpdateSettingsData = () => {
	describe('Check if req arguments for update model are valid', () => {
		const runTest = (modelType, data, shouldPass, desc) => {
			test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
				const mockCB = jest.fn();
				const req = { ...cloneDeep(data) };
				await ModelSettings.validateUpdateSettingsData(modelType)(req, {}, mockCB);
				if (shouldPass) {
					expect(mockCB).toHaveBeenCalledTimes(1);
				} else {
					expect(mockCB).not.toHaveBeenCalled();
					expect(Responder.respond.mock.calls.length).toBe(1);
					expect(Responder.respond.mock.results[0].value.code)
						.toEqual(templates.invalidArguments.code);
				}
			});
		};

		const generateTestData = (modelType) => {
			const commonTestCases = [
				[modelType, { params, body: { name: null } }, false, 'with null name'],
				[modelType, { params, body: { name: existingModelName } }, false, 'with model name of some other model within the project'],
				[modelType, { params, body: { name: existingModelName.toUpperCase() } }, false, 'with model name of some other model within the project (different case)'],
				[modelType, { params: { ...params, model: '234' }, body: { name: existingModelName } }, true, 'with current model name of the model'],
				[modelType, { params, body: { name: 'valid' } }, true, 'with valid name'],
				[modelType, { params, body: { desc: null } }, false, 'with null desc'],
				[modelType, { params, body: { desc: 'valid' } }, true, 'with valid desc'],
				[modelType, { body: {} }, false, 'with empty params, body'],
				[modelType, {}, false, 'with undefined params, body'],
			];

			const conFedTestCases = [
				[modelType, { params, body: { surveyPoints: 'invalid' } }, false, 'with invalid surveyPoints'],
				[modelType, { params, body: { surveyPoints: null } }, false, 'with null surveyPoints'],
				[modelType, { params, body: { surveyPoints: [{ position: [1, 2, 3] }] } }, false, 'with surveyPoints with no latLong'],
				[modelType, { params, body: { surveyPoints: [{ latLong: [1, 2] }] } }, false, 'with surveyPoints with no position'],
				[modelType, { params, body: { surveyPoints: [{ position: [1, 2, 3, 4], latLong: [1, 2] }] } }, false, 'with surveyPoints with invalid position'],
				[modelType, { params, body: { surveyPoints: [{ position: [1, 2, 3], latLong: [1, 2, 3] }] } }, false, 'with surveyPoints with invalid latLong'],
				[modelType, { params, body: { surveyPoints: [{ position: [1, 2, 3], latLong: [1, 2] }] } }, true, 'with valid surveyPoints'],
				[modelType, { params, body: { angleFromNorth: 'invalid' } }, false, 'with invalid angleFromNorth'],
				[modelType, { params, body: { angleFromNorth: null } }, false, 'with null angleFromNorth'],
				[modelType, { params, body: { angleFromNorth: 123 } }, true, 'with valid angleFromNorth'],
				[modelType, { params, body: { unit: 'invalid' } }, false, 'with invalid unit'],
				[modelType, { params, body: { unit: null } }, false, 'with null unit'],
				[modelType, { params, body: { unit: 'mm' } }, true, 'with valid unit'],
				[modelType, { params, body: { code: 'CODE1!' } }, false, 'with code that has symbols'],
				[modelType, { params, body: { code: null } }, false, 'with null code'],
				[modelType, { params, body: { code: 'CODE1' } }, true, 'with valid code'],
				[modelType, { params, body: { defaultView: 123 } }, false, 'with invalid defaultView'],
				[modelType, { params, body: { defaultView: null } }, true, 'with null defaultView'],
				[modelType, { params, body: { defaultView: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, false, 'with defaultView that does not exist'],
				[modelType, { params, body: { defaultView: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, false, 'with defaultView that does not exist'],
				[modelType, { params, body: { defaultView: existingViewID } }, true, 'with defaultView that exists'],
				[modelType, { params, body: { defaultView: existingViewID } }, true, 'with defaultView that exists'],
				[modelType, { params, body: { defaultLegend: 123 } }, false, 'with invalid defaultLegend'],
				[modelType, { params, body: { defaultLegend: null } }, true, 'with null defaultLegend'],
				[modelType, { params, body: { defaultLegend: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, false, 'with defaultLegend that does not exist'],
				[modelType, { params, body: { defaultLegend: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, false, 'with defaultLegend that does not exist'],
				[modelType, { params, body: { defaultLegend: existingLegendID } }, true, 'with defaultLegend that exists'],
				[modelType, { params, body: { defaultLegend: existingLegendID } }, true, 'with defaultLegend that exists'],
			];

			const conTestCases = [
				...conFedTestCases,
				[modelType, { params, body: { type: null } }, false, 'with null type'],
				[modelType, { params, body: { type: 'valid' } }, true, 'with valid type'],
			];

			const fedTestCases = [
				...conFedTestCases,
				[modelType, { params: _.omit(params, ['container']), body: { name: 'valid' } }, true, 'with valid name'],
				[modelType, { params, body: { type: 'valid' } }, false, 'with valid type'],
			];

			const drawTestCases = [
				[modelType, { params, body: { type: null } }, false, 'with null type'],
				[modelType, { params, body: { type: 'valid' } }, true, 'with valid type'],
				[modelType, { params, body: { number: null } }, false, 'with null number'],
				[modelType, { params, body: { number: existingModelNumber } }, false, 'with drawing type and duplicate number'],
				[modelType, { params, body: { unit: generateRandomString() } }, false, 'with valid units'],
			];

			if (modelType === modelTypes.DRAWING) {
				return [...commonTestCases, ...drawTestCases];
			} if (modelType === modelTypes.CONTAINER) {
				return [...commonTestCases, ...conTestCases];
			}

			return [...commonTestCases, ...fedTestCases];
		};

		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

const testValidateAddModelData = () => {
	describe('Check if req arguments for add model are valid', () => {
		const runTest = (data, modelType, shouldPass, desc) => {
			test(`${desc} ${shouldPass ? 'should call next()' : 'should respond with invalidArguments'}`, async () => {
				const mockCB = jest.fn();
				const req = { ...cloneDeep(data) };
				await ModelSettings.validateAddModelData(modelType)(req, {}, mockCB);
				if (shouldPass) {
					expect(mockCB.mock.calls.length).toBe(1);
				} else {
					expect(mockCB.mock.calls.length).toBe(0);
					expect(Responder.respond.mock.calls.length).toBe(1);
					expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
				}
			});
		};

		const generatePayload = (modelType) => (deleteIfUndefined({
			name: generateRandomString(),
			desc: generateRandomString(),
			type: modelType === modelTypes.FEDERATION ? undefined : 'Structure',
			code: modelType === modelTypes.DRAWING ? undefined : generateRandomString(),
			unit: modelType === modelTypes.DRAWING ? undefined : 'mm',
			number: modelType === modelTypes.DRAWING ? generateRandomString() : undefined,
		}));

		const generateTestData = (modelType) => {
			const commonTestCases = [
				[{ params, body: {} }, modelType, false, 'if request body is empty'],
				[{
					params,
					body: {
						...generatePayload(modelType),
						extraField: 'abc',
						badEntry: 123,
						unexpectedKey: [],
					},
				}, modelType, false, 'if some unexpected fields in request params, body'],
				[{
					params,
					body: {
						badField: 'abc',
						unexpectedEntry: 123,
					},
				}, modelType, false, 'if fields unexpected'],
				[{
					params,
					body: {
						...generatePayload(modelType),
						name: existingModelName,
					},
				}, modelType, false, 'if model name is already used by another model'],
				[{
					params,
					body: {
						...generatePayload(modelType),
						name: 123,
					},
				}, modelType, false, 'if name not a string'],
				[{
					params,
					body: {
						...generatePayload(modelType),
						name: generateRandomString(121),
					},
				}, modelType, false, 'if name too long'],
				[{
					params,
					body: {
						unit: 'mm',
						type: 'Structure',
					},
				}, modelType, false, 'if name missing'],
			];

			const conFedTestCases = [
				[{
					params,
					body: {
						...generatePayload(modelType),
						surveyPoints: [],
						angleFromNorth: 10,
					},
				}, modelType, true, 'with a valid request body'],
				[{
					params,
					body: deleteIfUndefined({
						...generatePayload(modelType),
						code: undefined,
					}),
				}, modelType, true, 'if no model code given'],
				[{
					params,
					body: {
						...generatePayload(modelType),
						code: '"£$%^&*()_+',
					},
				}, modelType, false, 'if code bad'],
				[{
					params,
					body: {
						...generatePayload(modelType),
						code: generateRandomString(51),
					},
				}, modelType, false, 'if code too long'],
				[{
					params,
					body: {
						...generatePayload(modelType),
						unit: 'FT',
					},
				}, modelType, false, 'if model unit is uppercase'],
				[{
					params,
					body: {
						...generatePayload(modelType),
						unit: 123,
					},
				}, modelType, false, 'if unit not a string'],
				[{
					params,
					body: {
						...generatePayload(modelType),
						unit: 'x',
					},
				}, modelType, false, 'if not a recognised unit'],
				[{
					params,
					body: {
						name: 'container name',
						type: 'Structure',
					},
				}, modelType, false, 'if unit missing'],
			];

			const conTestCases = [
				...commonTestCases,
				...conFedTestCases,
				[{
					params,
					body: {
						...generatePayload(modelTypes.CONTAINER),
						type: 123,
					},
				}, modelTypes.CONTAINER, false, 'if type is not a string'],
				[{
					params,
					body: {
						name: 'container name',
						unit: 'mm',
					},
				}, modelTypes.CONTAINER, false, 'if type is missing'],
			];

			const fedTestCases = [...commonTestCases, ...conFedTestCases];

			const drawTestCases = [
				...commonTestCases,
				[{
					params,
					body: generatePayload(modelType),
				}, modelTypes.DRAWING, true, 'with a valid request body'],
				[{
					params,
					body: {
						name: generateRandomString(),
						type: 'Structure',
					},
				}, modelTypes.DRAWING, false, 'if number is missing'],
				[{
					params,
					body: {
						...generatePayload(modelTypes.DRAWING),
						number: existingModelNumber,
					},
				}, modelTypes.DRAWING, false, 'if number already exists in project'],
				[{
					params,
					body: {
						...generatePayload(modelTypes.DRAWING),
						type: 123,
					},
				}, modelTypes.DRAWING, false, 'if type is not a string'],
				[{
					params,
					body: {
						name: generateRandomString(),
						number: generateRandomString(),
					},
				}, modelTypes.DRAWING, false, 'if type is missing'],
			];

			if (modelType === modelTypes.DRAWING) {
				return drawTestCases;
			} if (modelType === modelTypes.CONTAINER) {
				return conTestCases;
			}

			return fedTestCases;
		};

		describe.each(generateTestData(modelTypes.FEDERATION))('Federations', runTest);
		describe.each(generateTestData(modelTypes.CONTAINER))('Containers', runTest);
		describe.each(generateTestData(modelTypes.DRAWING))('Drawings', runTest);
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings', () => {
	testValidateUpdateSettingsData();
	testValidateAddModelData();
});
