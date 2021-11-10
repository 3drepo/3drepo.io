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
const { templates } = require(`${src}/utils/responseCodes`);

const Models = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/models`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

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
		test(`${desc} ${shouldPass ? ' should call next()' : 'should respond with invalidArguments'}`, async () => {
			const mockCB = jest.fn();
			const req = { ...cloneDeep(data) };
			await Models.validateAddModelData(req, {}, mockCB);
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

describe('middleware/dataConverter/models', () => {
	testValidateAddModelData();
});
