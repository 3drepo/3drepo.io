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

const { src } = require('../../../helper/path');

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../src/v5/utils/permissions/permissions');
const Revisions = require(`${src}/middleware/dataConverter/revisions`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testHasValidArgsForVoidUpdate = () => {
	describe('Check if req arguments for void status update are valid', () => {
		test('should respond with invalidArguments if there are no body arguments', () => {
			const mockCB = jest.fn(() => {});
			Revisions.hasValidArgsForVoidUpdate({ body: { } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidArguments);
		});

		test('should respond with invalidArguments if there are more than one body arguments', () => {
			const mockCB = jest.fn(() => {});
			Revisions.hasValidArgsForVoidUpdate({ body: { void: false, invalidArg: 123 } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidArguments);
		});

		test('should respond with invalidArguments if there is no body argument named void', () => {
			const mockCB = jest.fn(() => {});
			Revisions.hasValidArgsForVoidUpdate({ body: { invalidArg: false } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidArguments);
		});

		test('should respond with invalidArguments if there is one body argument named void but not boolean', () => {
			const mockCB = jest.fn(() => {});
			Revisions.hasValidArgsForVoidUpdate({ body: { void: 123 } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.invalidArguments);
		});

		test('next() should be called if there is only one body argument named void and it is boolean', () => {
			const mockCB = jest.fn(() => {});
			Revisions.hasValidArgsForVoidUpdate({ body: { void: false } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});
	});
};

describe('middleware/dataConverter/revisions', () => {
	testHasValidArgsForVoidUpdate();
});
