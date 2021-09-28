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

const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { templates } = require(`${src}/utils/responseCodes`);

const Containers = require(`${src}/middleware/teamspaces/projects/containers/containers`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testFilterContainerData = () => {
	describe('Filter container data', () => {
		test('next() should be called if request body is empty', () => {
			const mockCB = jest.fn(() => {});
			Containers.filterContainerData({}, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called with whitelist fields retained', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				name: 'container name',
				unit: 'mm',
				desc: 'this is a container',
				type: 'Structure',
				defaultView: '7591fbdb-52b9-490a-8a77-fdb57c57dbc8',
				defaultLegend: '120965d4-dd6e-4505-a2d2-e9a5cdcaad81',
				subModels: [],
				surveyPoints: [],
				angleFromNorth: [],
				elevation: 10,
			};
			const expectedResult = { ...body };
			Containers.filterContainerData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
			expect(body).toEqual(expectedResult);
		});

		test('next() should be called with un-whitelisted fields removed', async () => {
			const mockCB = jest.fn(() => {});
			const expectedResult = {
				name: 'container name',
				unit: 'mm',
				desc: 'this is a container',
				type: 'Structure',
			};
			const body = {
				...expectedResult,
				extraField: 'abc',
				badEntry: 123,
				unexpectedKey: [],
			};
			Containers.filterContainerData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
			expect(body).toEqual(expectedResult);
		});

		test('next() should be called even when all fields not whitelisted', async () => {
			const mockCB = jest.fn(() => {});
			const body = {
				badField: 'abc',
				unexpectedEntry: 123,
			};
			Containers.filterContainerData({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
			expect(body).toEqual({});
		});
	});
};

const testValidContainerName = () => {
	describe('Valid container name', () => {
		test('next() should be called if model name is valid', () => {
			const mockCB = jest.fn(() => {});
			const body = { name: 'container name' };
			Containers.validContainerName({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with invalid container name if name bad', async () => {
			const mockCB = jest.fn(() => {});
			const body = { name: '"£$%^&*()_+' };
			Containers.validContainerName({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidContainerName);
		});

		test('should respond with invalid container name if name too long', async () => {
			const mockCB = jest.fn(() => {});
			const body = { name: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890a' };
			Containers.validContainerName({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidContainerName);
		});

		test('should respond with missing container name if name missing', async () => {
			const mockCB = jest.fn(() => {});
			Containers.validContainerName({ body: {} }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.missingContainerName);
		});
	});
};

const testValidContainerCode = () => {
	describe('Valid container code', () => {
		test('next() should be called if no model code given', () => {
			const mockCB = jest.fn(() => {});
			Containers.validContainerCode({ body: {} }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if model code is valid', () => {
			const mockCB = jest.fn(() => {});
			const body = { code: 'code1000' };
			Containers.validContainerCode({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if properties exists', () => {
			const mockCB = jest.fn(() => {});
			const body = { code: 'code1000', properties: {} };
			Containers.validContainerCode({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with invalid container code if code bad', async () => {
			const mockCB = jest.fn(() => {});
			const body = { code: '"£$%^&*()_+' };
			Containers.validContainerCode({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidContainerCode);
		});

		test('should respond with invalid container code if code too long', async () => {
			const mockCB = jest.fn(() => {});
			const body = { code: '12345678901234567890123456789012345678901234567890a' };
			Containers.validContainerCode({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidContainerCode);
		});
	});
};

const testValidContainerUnit = () => {
	describe('Valid container unit', () => {
		test('next() should be called if model unit is valid', () => {
			const mockCB = jest.fn(() => {});
			const body = { unit: 'ft' };
			Containers.validContainerUnit({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if model unit is uppercase', () => {
			const mockCB = jest.fn(() => {});
			const body = { unit: 'FT' };
			Containers.validContainerUnit({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if properties exists', () => {
			const mockCB = jest.fn(() => {});
			const body = { unit: 'ft', properties: {} };
			Containers.validContainerUnit({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with invalid container unit if unit not a string', async () => {
			const mockCB = jest.fn(() => {});
			const body = { unit: 123 };
			Containers.validContainerUnit({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidContainerUnit);
		});

		test('should respond with invalid container unit if not a recognised unit', async () => {
			const mockCB = jest.fn(() => {});
			const body = { unit: 'x' };
			Containers.validContainerUnit({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidContainerUnit);
		});

		test('should respond with missing container unit if unit missing', async () => {
			const mockCB = jest.fn(() => {});
			Containers.validContainerUnit({ body: {} }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.missingContainerUnit);
		});
	});
};

const testValidContainerType = () => {
	describe('Valid container type', () => {
		test('next() should be called if model type is valid', () => {
			const mockCB = jest.fn(() => {});
			const body = { type: 'A' };
			Containers.validContainerType({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with invalid container type if type not a string', async () => {
			const mockCB = jest.fn(() => {});
			const body = { type: 123 };
			Containers.validContainerType({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidContainerType);
		});

		test('should respond with missing container type if type missing', async () => {
			const mockCB = jest.fn(() => {});
			Containers.validContainerType({ body: {} }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.missingContainerType);
		});
	});
};

const testValidContainerDefaultView = () => {
	describe('Valid container default view', () => {
		test('next() should be called if no model default view given', () => {
			const mockCB = jest.fn(() => {});
			Containers.validContainerDefaultView({ body: {} }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if model default view is valid', () => {
			const mockCB = jest.fn(() => {});
			const body = { defaultView: '7591fbdb-52b9-490a-8a77-fdb57c57dbc8' };
			Containers.validContainerDefaultView({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with invalid container default view if not a UUID string', async () => {
			const mockCB = jest.fn(() => {});
			const body = { defaultView: '123' };
			Containers.validContainerDefaultView({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidContainerDefaultView);
		});
	});
};

const testValidContainerDefaultLegend = () => {
	describe('Valid container default legend', () => {
		test('next() should be called if no model default legend given', () => {
			const mockCB = jest.fn(() => {});
			Containers.validContainerDefaultLegend({ body: {} }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if model default legend is valid', () => {
			const mockCB = jest.fn(() => {});
			const body = { defaultLegend: '7591fbdb-52b9-490a-8a77-fdb57c57dbc8' };
			const expectedResult = { defaultLegend: stringToUUID(body.defaultLegend) };
			Containers.validContainerDefaultLegend({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
			expect(body).toEqual(expectedResult);
		});

		test('should respond with invalid container default legend if not a UUID string', async () => {
			const mockCB = jest.fn(() => {});
			const body = { defaultLegend: 'abc' };
			Containers.validContainerDefaultLegend({ body }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidContainerDefaultLegend);
		});
	});
};

describe('middleware/common', () => {
	testFilterContainerData();
	testValidContainerName();
	testValidContainerCode();
	testValidContainerUnit();
	testValidContainerType();
	testValidContainerDefaultView();
	testValidContainerDefaultLegend();
});
