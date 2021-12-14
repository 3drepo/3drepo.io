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
jest.mock('../../../../../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);
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
const createRequestWithFile = (teamspace, { tag, desc, importAnim },
	unsupportedFile = false, noFile = false, emptyFile = false) => {
	const form = new FormData();
	if (!noFile) {
		let filePath = unsupportedFile ? 'dummy.png' : 'dummy.obj';
		filePath = emptyFile ? 'empty.ifc' : filePath;

		form.append('file',
			fs.createReadStream(path.join(modelFolder, filePath)));
	}
	if (tag) form.append('tag', tag);
	if (desc) form.append('desc', desc);
	if (importAnim) form.append('importAnim', importAnim);

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
RevisionsModel.isValidTag.mockImplementation(() => true);

const testValidateNewRevisionData = () => {
	const standardBody = { tag: '123', description: 'this is a model', importAnim: false };
	describe.each([
		['Request with valid data', 'ts', standardBody],
		['Request with unsupported model file', 'ts', standardBody, true, false, false, templates.unsupportedFileFormat],
		['Request with insufficient quota', 'noQuota', standardBody, false, false, false, templates.quotaLimitExceeded],
		['Request with no body should fail', 'ts', {}, false, false, false, templates.invalidArguments],
		['Request with just tag should pass', 'ts', { tag: 'dkf_j-d' }, false, false, false],
		['Request with wrong tag type should fail', 'ts', { tag: false }, false, false, false, templates.invalidArguments],
		['Request with tag that is not alphanumeric should fail', 'ts', { tag: '1%2%3' }, false, false, false, templates.invalidArguments],
		['Request with no file should fail', 'ts', { tag: 'drflgdf' }, false, true, false, templates.invalidArguments],
		['Request with an empty file should fail', 'ts', { tag: 'drflgdf' }, false, false, true, templates.invalidArguments],
	])('Check new revision data', (desc, ts, bodyContent, badFile, noFile, emptyFile, error) => {
		test(`${desc} should ${error ? `fail with ${error.code}` : ' succeed and next() should be called'}`, async () => {
			const req = createRequestWithFile(ts, bodyContent, badFile, noFile, emptyFile);
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

		test('Request with duplicate tag should fail', async () => {
			const req = createRequestWithFile('ts', standardBody);
			RevisionsModel.isValidTag.mockImplementationOnce(() => false);
			const mockCB = jest.fn(() => {});
			await Revisions.validateNewRevisionData(req, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			expect(Responder.respond.mock.results[0].value.message).toEqual('Revision name already exists');
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions', () => {
	testValidateUpdateRevisionData();
	testValidateNewRevisionData();
});
