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
const { MODEL_TYPES } = require(`${src}/models/modelSettings.constants`);
const { generateRandomString } = require('../../../../../../../../helper/services');

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
	if ((modelType === MODEL_TYPES.drawing && existingModelNumber.match(number)) && _id?.$in?.length) return {};
	if (existingModelName.match(name) && _id?.$in?.length) return {};

	throw templates.modelNotFound;
});

Projects.getProjectById.mockResolvedValue({ models: ['234'] });

const params = { teamspace: 'ts', federation: '123', project: '123', container: '123' };
const testValidateUpdateSettingsData = () => {
	describe.each([
		[{ params, body: { name: null } }, MODEL_TYPES.container, false, 'with null name'],
		[{ params, body: { name: existingModelName } }, MODEL_TYPES.container, false, 'with model name of some other model within the project'],
		[{ params, body: { name: existingModelName.toUpperCase() } }, MODEL_TYPES.container, false, 'with model name of some other model within the project (different case)'],
		[{ params: { ...params, container: '234' }, body: { name: existingModelName } }, MODEL_TYPES.container, true, 'with current model name of the model'],
		[{ params, body: { name: 'valid' } }, MODEL_TYPES.container, true, 'with valid name'],
		[{ params: _.omit(params, ['container']), body: { name: 'valid' } }, MODEL_TYPES.container, true, 'with valid name (federation test)'],
		[{ params, body: { desc: null } }, MODEL_TYPES.container, false, 'with null desc'],
		[{ params, body: { desc: 'valid' } }, MODEL_TYPES.container, true, 'with valid desc'],
		[{ params, body: { surveyPoints: 'invalid' } }, MODEL_TYPES.container, false, 'with invalid surveyPoints'],
		[{ params, body: { surveyPoints: null } }, MODEL_TYPES.container, false, 'with null surveyPoints'],
		[{ params, body: { surveyPoints: [{ position: [1, 2, 3] }] } }, MODEL_TYPES.container, false, 'with surveyPoints with no latLong'],
		[{ params, body: { surveyPoints: [{ latLong: [1, 2] }] } }, MODEL_TYPES.container, false, 'with surveyPoints with no position'],
		[{ params, body: { surveyPoints: [{ position: [1, 2, 3, 4], latLong: [1, 2] }] } }, MODEL_TYPES.container, false, 'with surveyPoints with invalid position'],
		[{ params, body: { surveyPoints: [{ position: [1, 2, 3], latLong: [1, 2, 3] }] } }, MODEL_TYPES.container, false, 'with surveyPoints with invalid latLong'],
		[{ params, body: { surveyPoints: [{ position: [1, 2, 3], latLong: [1, 2] }] } }, MODEL_TYPES.container, true, 'with valid surveyPoints'],
		[{ params, body: { angleFromNorth: 'invalid' } }, MODEL_TYPES.container, false, 'with invalid angleFromNorth'],
		[{ params, body: { angleFromNorth: null } }, MODEL_TYPES.container, false, 'with null angleFromNorth'],
		[{ params, body: { angleFromNorth: 123 } }, MODEL_TYPES.container, true, 'with valid angleFromNorth'],
		[{ params, body: { type: null } }, MODEL_TYPES.container, false, 'with null type'],
		[{ params, body: { type: 'valid' } }, MODEL_TYPES.container, true, 'with valid type'],
		[{ params, body: { unit: 'invalid' } }, MODEL_TYPES.container, false, 'with invalid unit'],
		[{ params, body: { unit: null } }, MODEL_TYPES.container, false, 'with null unit'],
		[{ params, body: { unit: 'mm' } }, MODEL_TYPES.container, true, 'with valid unit'],
		[{ params, body: { code: 'CODE1!' } }, MODEL_TYPES.container, false, 'with code that has symbols'],
		[{ params, body: { code: null } }, MODEL_TYPES.container, false, 'with null code'],
		[{ params, body: { code: 'CODE1' } }, MODEL_TYPES.container, true, 'with valid code'],
		[{ params, body: { defaultView: 123 } }, MODEL_TYPES.container, false, 'with invalid defaultView'],
		[{ params, body: { defaultView: null } }, MODEL_TYPES.container, true, 'with null defaultView'],
		[{ params, body: { defaultView: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, MODEL_TYPES.container, false, 'with defaultView that does not exist'],
		[{ params, body: { defaultView: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, MODEL_TYPES.container, false, 'with defaultView that does not exist'],
		[{ params, body: { defaultView: existingViewID } }, MODEL_TYPES.container, true, 'with defaultView that exists'],
		[{ params, body: { defaultView: existingViewID } }, MODEL_TYPES.container, true, 'with defaultView that exists'],
		[{ params, body: { defaultLegend: 123 } }, MODEL_TYPES.container, false, 'with invalid defaultLegend'],
		[{ params, body: { defaultLegend: null } }, MODEL_TYPES.container, true, 'with null defaultLegend'],
		[{ params, body: { defaultLegend: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, MODEL_TYPES.container, false, 'with defaultLegend that does not exist'],
		[{ params, body: { defaultLegend: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, MODEL_TYPES.container, false, 'with defaultLegend that does not exist'],
		[{ params, body: { defaultLegend: existingLegendID } }, MODEL_TYPES.container, true, 'with defaultLegend that exists'],
		[{ params, body: { defaultLegend: existingLegendID } }, MODEL_TYPES.container, true, 'with defaultLegend that exists'],
		[{ body: {} }, MODEL_TYPES.container, false, 'with empty params, body'],
		[{ params, body: { name: generateRandomString() } }, MODEL_TYPES.drawing, true, 'with drawing type and valid payload'],
		[{ params, body: { number: existingModelNumber } }, MODEL_TYPES.drawing, false, 'with drawing type and duplicate number'],
		[{ params, body: { unit: generateRandomString() } }, MODEL_TYPES.drawing, false, 'with drawing model and invalid payload'],
		[{}, MODEL_TYPES.container, false, 'with undefined params, body'],
	])('Check if req arguments for settings update are valid', (data, modelType, shouldPass, desc) => {
		test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data) };
			await ModelSettings.validateUpdateSettingsData(modelType)(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB).toHaveBeenCalledTimes(1);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});
};

const testValidateAddModelData = () => {
	describe.each([
		[{ params,
			body: {
				name: 'container name',
				code: 'code1000',
				unit: 'mm',
				desc: 'this is a container',
				type: 'Structure',
				surveyPoints: [],
				angleFromNorth: 10,
			} }, MODEL_TYPES.container, true, 'with a valid request params, body'],
		[{ params, body: {} }, MODEL_TYPES.container, false, 'if request params, body is empty'],
		[{ params,
			body: {
				name: 'container name',
				unit: 'mm',
				desc: 'this is a container',
				type: 'Structure',
				extraField: 'abc',
				badEntry: 123,
				unexpectedKey: [],
			} }, MODEL_TYPES.container, false, 'if some unexpected fields in request params, body'],
		[{ params,
			body: {
				badField: 'abc',
				unexpectedEntry: 123,
			} }, MODEL_TYPES.container, false, 'if fields unexpected'],
		[{ params,
			body: {
				name: existingModelName,
			} }, MODEL_TYPES.container, false, 'if model name is already used by another model'],
		[{ params,
			body: {
				name: 123,
				unit: 'mm',
				type: 'Structure',
			} }, MODEL_TYPES.container, false, 'if name not a string'],
		[{ params,
			body: {
				name: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890a',
				unit: 'mm',
				type: 'Structure',
			} }, MODEL_TYPES.container, false, 'if name too long'],
		[{ params,
			body: {
				unit: 'mm',
				type: 'Structure',
			} }, MODEL_TYPES.container, false, 'if name missing'],
		[{ params,
			body: {
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			} }, MODEL_TYPES.container, true, 'if no model code given'],
		[{ params,
			body: {
				code: '"£$%^&*()_+',
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			} }, MODEL_TYPES.container, false, 'if code bad'],
		[{ params,
			body: {
				code: '12345678901234567890123456789012345678901234567890a',
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			} }, MODEL_TYPES.container, false, 'if code too long'],
		[{ params,
			body: {
				unit: 'FT',
				name: 'container name',
				type: 'Structure',
			} }, MODEL_TYPES.container, false, 'if model unit is uppercase'],
		[{ params,
			body: {
				unit: 123,
				name: 'container name',
				type: 'Structure',
			} }, MODEL_TYPES.container, false, 'if unit not a string'],
		[{ params,
			body: {
				unit: 'x',
				name: 'container name',
				type: 'Structure',
			} }, MODEL_TYPES.container, false, 'if not a recognised unit'],
		[{ params,
			body: {
				name: 'container name',
				type: 'Structure',
			} }, MODEL_TYPES.container, false, 'if unit missing'],
		[{ params,
			body: {
				type: 123,
				name: 'container name',
				unit: 'mm',
			} }, MODEL_TYPES.container, false, 'if type not a string'],
		[{ params,
			body: {
				name: 'container name',
				unit: 'mm',
			} }, MODEL_TYPES.container, false, 'if type missing'],
		[{ params,
			body: {
				name: generateRandomString(),
				number: generateRandomString(),
				type: 'Structure',
			} }, MODEL_TYPES.drawing, true, 'if model type is drawing and data is valid'],
		[{ params,
			body: {
				name: generateRandomString(),
				number: existingModelNumber,
			} }, MODEL_TYPES.drawing, false, 'if model type is drawing and number already exists in project'],
		[{ params,
			body: {
				name: generateRandomString(),
				number: generateRandomString(),
			} }, MODEL_TYPES.drawing, false, 'if model type is drawing and type is missing'],
		[{ params,
			body: {
				name: generateRandomString(),
				type: 'Structure',
			} }, MODEL_TYPES.drawing, false, 'if model type is drawing and number is missing'],
		[{ params,
			body: {
				name: generateRandomString(),
				number: generateRandomString(),
				type: 'Structure',
				unit: 'mm',
			} }, MODEL_TYPES.drawing, false, 'if model type is drawing and data have extra props'],
	])('Check if req arguments for add model are valid', (data, modelType, shouldPass, desc) => {
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
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings', () => {
	testValidateUpdateSettingsData();
	testValidateAddModelData();
});
