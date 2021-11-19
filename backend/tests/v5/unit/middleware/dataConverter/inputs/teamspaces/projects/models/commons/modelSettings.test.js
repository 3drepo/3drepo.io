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

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../../../../../../src/v5/models/views');
const Views = require(`${src}/models/views`);
jest.mock('../../../../../../../../../../src/v5/models/legends');
const Legends = require(`${src}/models/legends`);
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

const testValidateUpdateSettingsData = () => {
	describe.each([
		[{ body: { name: 1 } }, false, 'with invalid name'],
		[{ body: { name: null } }, false, 'with null name'],
		[{ body: { name: 'valid' } }, true, 'with valid name'],
		[{ body: { desc: 1 } }, false, 'with invalid desc'],
		[{ body: { desc: null } }, false, 'with null desc'],
		[{ body: { desc: 'valid' } }, true, 'with valid desc'],
		[{ body: { surveyPoints: 'invalid' } }, false, 'with invalid surveyPoints'],
		[{ body: { surveyPoints: null } }, false, 'with null surveyPoints'],
		[{ body: { surveyPoints: [{ position: [1, 2, 3] }] } }, false, 'with surveyPoints with no latLong'],
		[{ body: { surveyPoints: [{ latLong: [1, 2] }] } }, false, 'with surveyPoints with no position'],
		[{ body: { surveyPoints: [{ position: [1, 2, 3, 4], latLong: [1, 2] }] } }, false, 'with surveyPoints with invalid position'],
		[{ body: { surveyPoints: [{ position: [1, 2, 3], latLong: [1, 2, 3] }] } }, false, 'with surveyPoints with invalid latLong'],
		[{ body: { surveyPoints: [{ position: [1, 2, 3], latLong: [1, 2] }] } }, true, 'with valid surveyPoints'],
		[{ body: { angleFromNorth: 'invalid' } }, false, 'with invalid angleFromNorth'],
		[{ body: { angleFromNorth: null } }, false, 'with null angleFromNorth'],
		[{ body: { angleFromNorth: 123 } }, true, 'with valid angleFromNorth'],
		[{ body: { type: 123 } }, false, 'with invalid type'],
		[{ body: { type: null } }, false, 'with null type'],
		[{ body: { type: 'valid' } }, true, 'with valid type'],
		[{ body: { unit: 'invalid' } }, false, 'with invalid unit'],
		[{ body: { unit: null } }, false, 'with null unit'],
		[{ body: { unit: 'mm' } }, true, 'with valid unit'],
		[{ body: { code: 1 } }, false, 'with invalid code'],
		[{ body: { code: 'CODE1!' } }, false, 'with code that has symbols'],
		[{ body: { code: null } }, false, 'with null code'],
		[{ body: { code: 'CODE1' } }, true, 'with valid code'],
		[{ body: { defaultView: 123 } }, false, 'with invalid defaultView'],
		[{ body: { defaultView: null } }, true, 'with null defaultView'],
		[{ body: { defaultView: '9c7a6c50-ee85-11e8-af42-09344c707317' }, params: { container: '1' } }, false, 'with defaultView that does not exist'],
		[{ body: { defaultView: '9c7a6c50-ee85-11e8-af42-09344c707317' }, params: { federation: '1' } }, false, 'with defaultView that does not exist'],
		[{ body: { defaultView: existingViewID }, params: { container: '1' } }, true, 'with defaultView that exists'],
		[{ body: { defaultView: existingViewID }, params: { federation: '1' } }, true, 'with defaultView that exists'],
		[{ body: { defaultLegend: 123 } }, false, 'with invalid defaultLegend'],
		[{ body: { defaultLegend: null } }, true, 'with null defaultLegend'],
		[{ body: { defaultLegend: '9c7a6c50-ee85-11e8-af42-09344c707317' }, params: { container: '1' } }, false, 'with defaultLegend that does not exist'],
		[{ body: { defaultLegend: '9c7a6c50-ee85-11e8-af42-09344c707317' }, params: { federation: '1' } }, false, 'with defaultLegend that does not exist'],
		[{ body: { defaultLegend: existingLegendID }, params: { container: '1' } }, true, 'with defaultLegend that exists'],
		[{ body: { defaultLegend: existingLegendID }, params: { federation: '1' } }, true, 'with defaultLegend that exists'],
		[{ body: {} }, false, 'with empty body'],
		[{ body: undefined }, false, 'with undefined body'],
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
		[{ body: {
			name: 'container name',
			code: 'code1000',
			unit: 'mm',
			desc: 'this is a container',
			type: 'Structure',
			surveyPoints: [],
			angleFromNorth: 10,
			elevation: 10,
		} }, true, 'with a valid request body'],
		[{ body: {} }, false, 'if request body is empty'],
		[{ body: {
			name: 'container name',
			unit: 'mm',
			desc: 'this is a container',
			type: 'Structure',
			extraField: 'abc',
			badEntry: 123,
			unexpectedKey: [],
		} }, false, 'if some unexpected fields in request body'],
		[{ body: {
			badField: 'abc',
			unexpectedEntry: 123,
		} }, false, 'if fields unexpected'],
		[{ body: {
			name: 123,
			unit: 'mm',
			type: 'Structure',
		} }, false, 'if name not a string'],
		[{ body: {
			name: '"£$%^&*()_+',
			unit: 'mm',
			type: 'Structure',
		} }, false, 'if name bad'],
		[{ body: {
			name: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890a',
			unit: 'mm',
			type: 'Structure',
		} }, false, 'if name too long'],
		[{ body: {
			unit: 'mm',
			type: 'Structure',
		} }, false, 'if name missing'],
		[{ body: {
			name: 'container name',
			unit: 'mm',
			type: 'Structure',
		} }, true, 'if no model code given'],
		[{ body: {
			code: '"£$%^&*()_+',
			name: 'container name',
			unit: 'mm',
			type: 'Structure',
		} }, false, 'if code bad'],
		[{ body: {
			code: '12345678901234567890123456789012345678901234567890a',
			name: 'container name',
			unit: 'mm',
			type: 'Structure',
		} }, false, 'if code too long'],
		[{ body: {
			unit: 'FT',
			name: 'container name',
			type: 'Structure',
		} }, false, 'if model unit is uppercase'],
		[{ body: {
			unit: 123,
			name: 'container name',
			type: 'Structure',
		} }, false, 'if unit not a string'],
		[{ body: {
			unit: 'x',
			name: 'container name',
			type: 'Structure',
		} }, false, 'if not a recognised unit'],
		[{ body: {
			name: 'container name',
			type: 'Structure',
		} }, false, 'if unit missing'],
		[{ body: {
			type: 123,
			name: 'container name',
			unit: 'mm',
		} }, false, 'if type not a string'],
		[{ body: {
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
