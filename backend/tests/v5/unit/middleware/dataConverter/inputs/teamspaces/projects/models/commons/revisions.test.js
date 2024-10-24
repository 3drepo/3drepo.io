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

jest.mock('../../../../../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);

const Revisions = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions`);
const { templates } = require(`${src}/utils/responseCodes`);

const { generateRandomString } = require('../../../../../../../../helper/services');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateUpdateRevisionData = () => {
	describe('Check if req arguments for void status update are valid', () => {
		test('should respond with invalidArguments if there are no body arguments', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: { } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalidArguments if there are more than one body arguments', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: { void: false, invalidArg: 123 } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalidArguments if there is no body argument named void', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: { invalidArg: false } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalidArguments if there is one body argument named void but not boolean', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: { void: 123 } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalidArguments if body is not an object', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: 1 }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('next() should be called if there is only one body argument named void and it is boolean', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: { void: false } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});
	});
};

const testRevisionExists = () => {
	describe('Check if a revision exists', () => {
		const req = {
			params: {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				revision: generateRandomString(),
			},
		};

		test('should respond with revisionNotFound if the revision doesnt exist', async () => {
			const mockCB = jest.fn(() => {});
			RevisionsModel.getRevisionByIdOrTag.mockRejectedValueOnce(templates.revisionNotFound);

			await Revisions.revisionExists(modelTypes.DRAWING)(req, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.revisionNotFound.code);
		});

		test('next() should be called if the revision exists', async () => {
			const mockCB = jest.fn(() => {});
			RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce({});

			await Revisions.revisionExists(modelTypes.CONTAINER)(req, {}, mockCB);

			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(Responder.respond).not.toHaveBeenCalled();
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions', () => {
	testValidateUpdateRevisionData();
	testRevisionExists();
});
