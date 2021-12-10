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

const { src, modelFolder } = require('../../../../../../../helper/path');
const MockExpressRequest = require('mock-express-request');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

jest.mock('../../../../../../../../../src/v5/utils/quota');
const Quota = require(`${src}/utils/quota`);

jest.mock('../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

const Containers = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/containers`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const subModelContainer = 'ImSub';

ModelSettings.getModelByQuery.mockImplementation((teamspace, query) => (query['subModels.model'] !== subModelContainer
	? Promise.reject(templates.modelNotFound)
	: Promise.resolve({ _id: 1, name: 'abc' })));

const testCanDeleteContainer = () => {
	describe.each([
		['Container that is not a submodel', { params: { teamspace: '123', project: '234', container: '123' } }, true],
		['Container that is a submodel', { params: { teamspace: '123', project: '234', container: subModelContainer } }, false, false],
		['Invalid params', { }, false, true],
	])('Can delete container', (desc, req, success, invalidArguments) => {
		test(`${desc} ${success ? 'should call next()' : `should respond with ${invalidArguments ? 'invalidArguments' : 'containerIsSubModel'}`}`, async () => {
			const mockCB = jest.fn();
			await Containers.canDeleteContainer(req, {}, mockCB);

			if (success) {
				expect(mockCB.mock.calls.length).toBe(1);
			} else {
				const expectedError = invalidArguments ? templates.invalidArguments : templates.containerIsSubModel;
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedError.code);
			}
		});
	});
};

const createRequestWithFile = (teamspace, { tag, desc, importAnim }, unsupportedFile = false, noFile = false) => {
	const form = new FormData();
	if (!noFile) {
		form.append('file',
			fs.createReadStream(path.join(modelFolder, unsupportedFile ? 'dummy.png' : 'dummy.obj')));
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

const testValidateNewRevisionData = () => {
	const standardBody = { tag: '123', description: 'this is a model', importAnim: false };
	describe.each([
		['Request with valid data', 'ts', standardBody],
		['Request with unsupported model file', 'ts', standardBody, true, false, templates.unsupportedFileFormat],
		['Request with insufficient quota', 'noQuota', standardBody, false, false, templates.quotaLimitExceeded],
		['Request with no body should fail', 'ts', {}, false, false, templates.invalidArguments],
		['Request with just tag should pass', 'ts', { tag: 'dkf_j-d' }, false, false],
		['Request with wrong tag type should fail', 'ts', { tag: false }, false, false, templates.invalidArguments],
		['Request with tag that is not alphanumeric should fail', 'ts', { tag: '1%2%3' }, false, false, templates.invalidArguments],
		['Request with no file should fail', 'ts', { tag: 'drflgdf' }, false, true, templates.invalidArguments],
	])('Check new revision data', (desc, ts, bodyContent, badFile, noFile, error) => {
		test(`${desc} should ${error ? `fail with ${error.code}` : ' succeed and next() should be called'}`, async () => {
			const req = createRequestWithFile(ts, bodyContent, badFile, noFile);
			const mockCB = jest.fn(() => {});
			await Containers.validateNewRevisionData(req, {}, mockCB);
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

describe('middleware/dataConverter/inputs/teamspaces/projects/models/containers', () => {
	testCanDeleteContainer();
	testValidateNewRevisionData();
});
