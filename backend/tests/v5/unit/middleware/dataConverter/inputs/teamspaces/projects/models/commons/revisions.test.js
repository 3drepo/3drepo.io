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

const { src, modelFolder } = require('../../../../../../../../helper/path');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const MockExpressRequest = require('mock-express-request');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

jest.mock('../../../../../../../../../../src/v5/utils/quota');
const Quota = require(`${src}/utils/quota`);
const Revisions = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions`);
const { templates } = require(`${src}/utils/responseCodes`);

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
const createRequestWithFile = (teamspace, unsupportedFile = false) => {
	const form = new FormData();
	form.append('file',
		fs.createReadStream(path.join(modelFolder, unsupportedFile ? 'dummy.png' : 'dummy.obj')));

	const req = new MockExpressRequest({
		method: 'POST',
		host: 'localhost',
		url: `/${teamspace}/upload`,
		headers: form.getHeaders(),
	});

	form.pipe(req);
	req.params = { teamspace };
	return req;
};

Quota.sufficientQuota.mockImplementation((ts) => (ts === 'noQuota' ? Promise.reject(templates.quotaLimitExceeded) : Promise.resolve()));

const testValidateNewRevisionData = () => {
	describe.each([
		['Request with valid data', createRequestWithFile('ts')],
		['Request with unsupported model file', createRequestWithFile('ts', true), templates.unsupportedFileFormat],
		['Request with insufficient quota', createRequestWithFile('noQuota'), templates.quotaLimitExceeded],
	])('Check new revision data', (desc, req, error) => {
		test(`${desc} should ${error ? `fail with ${error.code}` : ' succeed and next() should be called'}`, async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateNewRevisionData(req, {}, mockCB);
			if (error) {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(error.code);
			} else {
				expect(mockCB.mock.calls.length).toBe(1);
			}
		});
	});
};

describe('middleware/dataConverter/revisions', () => {
	testValidateUpdateRevisionData();
	testValidateNewRevisionData();
});
