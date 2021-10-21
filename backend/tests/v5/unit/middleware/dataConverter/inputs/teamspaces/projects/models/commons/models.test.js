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
const { createResponseCode, templates } = require(`${src}/utils/responseCodes`);

const Models = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/models`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateAddModelData = () => {
	describe('Validate model data', () => {
		test('next() should be with a valid request body', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				name: 'container name',
				code: 'code1000',
				unit: 'mm',
				desc: 'this is a container',
				type: 'Structure',
				defaultView: '7591fbdb-52b9-490a-8a77-fdb57c57dbc8',
				defaultLegend: '120965d4-dd6e-4505-a2d2-e9a5cdcaad81',
				surveyPoints: [],
				angleFromNorth: 10,
				elevation: 10,
			};
			const expectedResult = { ...body,
				properties: {
					unit: body.unit,
					code: body.code,
				} };
			delete expectedResult.unit;
			delete expectedResult.code;

			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
			expect(body).toEqual(expectedResult);
		});

		test('should respond with invalid arguments if request body is empty', async () => {
			const mockCB = jest.fn(() => {});
			await Models.validateAddModelData({ body: {} }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalid arguments if some unexpected fields in request body', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				name: 'container name',
				unit: 'mm',
				desc: 'this is a container',
				type: 'Structure',
				extraField: 'abc',
				badEntry: 123,
				unexpectedKey: [],
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalid arguments if fields unexpected', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				badField: 'abc',
				unexpectedEntry: 123,
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalid arguments if name not a string', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				name: 123,
				unit: 'mm',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalid arguments if name bad', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				name: '"£$%^&*()_+',
				unit: 'mm',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(createResponseCode(templates.invalidArguments,
				'name cannot be longer than 120 characters and must only contain alphanumeric characters and underscores'));
		});

		test('should respond with invalid arguments if name too long', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				name: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890a',
				unit: 'mm',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(createResponseCode(templates.invalidArguments,
				'name cannot be longer than 120 characters and must only contain alphanumeric characters and underscores'));
		});

		test('should respond with invalid arguments if name missing', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				unit: 'mm',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(createResponseCode(templates.invalidArguments,
				'name is a required field'));
		});

		test('next() should be called if no model code given', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with invalid arguments if code bad', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				code: '"£$%^&*()_+',
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(createResponseCode(templates.invalidArguments,
				'code cannot be longer than 50 characters and must only contain alphanumeric characters'));
		});

		test('should respond with invalid arguments if code too long', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				code: '12345678901234567890123456789012345678901234567890a',
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(createResponseCode(templates.invalidArguments,
				'code cannot be longer than 50 characters and must only contain alphanumeric characters'));
		});

		test('next() should be called if model unit is uppercase', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				unit: 'FT',
				name: 'container name',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with invalid arguments if unit not a string', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				unit: 123,
				name: 'container name',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalid arguments if not a recognised unit', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				unit: 'x',
				name: 'container name',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(createResponseCode(templates.invalidArguments,
				'unit must be ft, mm, cm, dm, or m'));
		});

		test('should respond with invalid arguments if unit missing', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				name: 'container name',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(createResponseCode(templates.invalidArguments,
				'unit is a required field'));
		});

		test('should respond with invalid arguments if type not a string', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				type: 123,
				name: 'container name',
				unit: 'mm',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalid arguments if type missing', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				name: 'container name',
				unit: 'mm',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(createResponseCode(templates.invalidArguments,
				'type is a required field'));
		});

		/*
		test('should respond with invalid arguments if not a UUID string', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				defaultView: '123',
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidArguments);
		});

		test('should respond with invalid arguments if not a UUID string', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				defaultLegend: 'abc',
				name: 'container name',
				unit: 'mm',
				type: 'Structure',
			};
			await Models.validateAddModelData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidArguments);
		});
		*/
	});
};

describe('middleware/dataConverter/models', () => {
	testValidateAddModelData();
});
