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
jest.mock('../../../../../../../../../../src/v5/models/projects');
const Projects = require(`${src}/models/projects`);
jest.mock('../../../../../../../../../../src/v5/utils/permissions/permissions');
const ModelSettings = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const existingViewID = '3752b630-065f-11ec-8edf-ab0f7cc84da8';
Views.checkViewExists.mockImplementation((teamspace, model, view) => {
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

const existingModelName = 'Another model name';
ModelSettingsModel.getModelByQuery.mockImplementation((teamspace, { _id, name } = {}) => {
	if (existingModelName === name && _id?.$in?.length) return {};
	throw templates.modelNotFound;
});

Projects.getProjectById.mockResolvedValue({ models: ['234'] });

const params = { teamspace: 'ts', federation: '123', project: '123', container: '123' };
const testValidateUpdateSettingsData = () => {
	describe.each([
		[{ params, body: { name: null } }, false, 'with null name'],
		[{ params, body: { name: existingModelName } }, false, 'with model name of some other model within the project'],
		[{ params: { ...params, container: '234' }, body: { name: existingModelName } }, true, 'with current model name of the model'],
		[{ params, body: { name: 'valid' } }, true, 'with valid name'],
		[{ params: _.omit(params, ['container']), body: { name: 'valid' } }, true, 'with valid name (federation test)'],
		[{ params, body: { desc: null } }, false, 'with null desc'],
		[{ params, body: { desc: 'valid' } }, true, 'with valid desc'],
		[{ params, body: { surveyPoints: 'invalid' } }, false, 'with invalid surveyPoints'],
		[{ params, body: { surveyPoints: null } }, false, 'with null surveyPoints'],
		[{ params, body: { surveyPoints: [{ position: [1, 2, 3] }] } }, false, 'with surveyPoints with no latLong'],
		[{ params, body: { surveyPoints: [{ latLong: [1, 2] }] } }, false, 'with surveyPoints with no position'],
		[{ params, body: { surveyPoints: [{ position: [1, 2, 3, 4], latLong: [1, 2] }] } }, false, 'with surveyPoints with invalid position'],
		[{ params, body: { surveyPoints: [{ position: [1, 2, 3], latLong: [1, 2, 3] }] } }, false, 'with surveyPoints with invalid latLong'],
		[{ params, body: { surveyPoints: [{ position: [1, 2, 3], latLong: [1, 2] }] } }, true, 'with valid surveyPoints'],
		[{ params, body: { angleFromNorth: 'invalid' } }, false, 'with invalid angleFromNorth'],
		[{ params, body: { angleFromNorth: null } }, false, 'with null angleFromNorth'],
		[{ params, body: { angleFromNorth: 123 } }, true, 'with valid angleFromNorth'],
		[{ params, body: { type: null } }, false, 'with null type'],
		[{ params, body: { type: 'valid' } }, true, 'with valid type'],
		[{ params, body: { unit: 'invalid' } }, false, 'with invalid unit'],
		[{ params, body: { unit: null } }, false, 'with null unit'],
		[{ params, body: { unit: 'mm' } }, true, 'with valid unit'],
		[{ params, body: { code: 'CODE1!' } }, false, 'with code that has symbols'],
		[{ params, body: { code: null } }, false, 'with null code'],
		[{ params, body: { code: 'CODE1' } }, true, 'with valid code'],
		[{ params, body: { defaultView: 123 } }, false, 'with invalid defaultView'],
		[{ params, body: { defaultView: null } }, true, 'with null defaultView'],
		[{ params, body: { defaultView: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, false, 'with defaultView that does not exist'],
		[{ params, body: { defaultView: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, false, 'with defaultView that does not exist'],
		[{ params, body: { defaultView: existingViewID } }, true, 'with defaultView that exists'],
		[{ params, body: { defaultView: existingViewID } }, true, 'with defaultView that exists'],
		[{ params, body: { defaultLegend: 123 } }, false, 'with invalid defaultLegend'],
		[{ params, body: { defaultLegend: null } }, true, 'with null defaultLegend'],
		[{ params, body: { defaultLegend: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, false, 'with defaultLegend that does not exist'],
		[{ params, body: { defaultLegend: '9c7a6c50-ee85-11e8-af42-09344c707317' } }, false, 'with defaultLegend that does not exist'],
		[{ params, body: { defaultLegend: existingLegendID } }, true, 'with defaultLegend that exists'],
		[{ params, body: { defaultLegend: existingLegendID } }, true, 'with defaultLegend that exists'],
		[{ body: {} }, false, 'with empty params, body'],
		[{}, false, 'with undefined params, body'],
	])('Check if req arguments for settings update are valid', (data, shouldPass, desc) => {
		test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data) };
			await ModelSettings.validateUpdateSettingsData(req, {}, mockCB);
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
			} }, true, 'with a valid request params, body'],
		[{ params, body: {} }, false, 'if request params, body is empty'],
		[{ params,
			body: {
				name: 'container name',
				unit: 'mm',
				desc: 'this is a container',
				type: 'Structure',
				extraField: 'abc',
				badEntry: 123,
				unexpectedKey: [],
			} }, false, 'if some unexpected fields in request params, body'],
		[{ params,
			body: {
				badField: 'abc',
				unexpectedEntry: 123,
			} }, false, 'if fields unexpected'],
		[{ params,
			body: {
				name: existingModelName,
			} }, false, 'if model name is already used by another model'],
		[{ params,
			body: {
				name: 123,
				unit: 'mm',
				type: 'Structure',
			} }, false, 'if name not a string'],
		[{ params,
			body: {
				name: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890a',
				unit: 'mm',
				type: 'Structure',
			} }, false, 'if name too long'],
		[{ params,
			body: {
				unit: 'mm',
				type: 'Structure',
			} }, false, 'if name missing'],
		[{ params,
			body: {
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			} }, true, 'if no model code given'],
		[{ params,
			body: {
				code: '"£$%^&*()_+',
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			} }, false, 'if code bad'],
		[{ params,
			body: {
				code: '12345678901234567890123456789012345678901234567890a',
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			} }, false, 'if code too long'],
		[{ params,
			body: {
				unit: 'FT',
				name: 'container name',
				type: 'Structure',
			} }, false, 'if model unit is uppercase'],
		[{ params,
			body: {
				unit: 123,
				name: 'container name',
				type: 'Structure',
			} }, false, 'if unit not a string'],
		[{ params,
			body: {
				unit: 'x',
				name: 'container name',
				type: 'Structure',
			} }, false, 'if not a recognised unit'],
		[{ params,
			body: {
				name: 'container name',
				type: 'Structure',
			} }, false, 'if unit missing'],
		[{ params,
			body: {
				type: 123,
				name: 'container name',
				unit: 'mm',
			} }, false, 'if type not a string'],
		[{ params,
			body: {
				name: 'container name',
				unit: 'mm',
			} }, false, 'if type missing'],
	])('Check if req arguments for add model are valid', (data, shouldPass, desc) => {
		test(`${desc} ${shouldPass ? 'should call next()' : 'should respond with invalidArguments'}`, async () => {
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data) };
			await ModelSettings.validateAddModelData(req, {}, mockCB);
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
