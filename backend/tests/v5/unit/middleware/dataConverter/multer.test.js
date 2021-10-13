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

const MockExpressRequest = require('mock-express-request');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const { src, modelFolder } = require('../../../helper/path');

const MulterHelper = require(`${src}/middleware/dataConverter/multer`);

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

Responder.respond.mockImplementation((req, res, errCode) => errCode);

const createRequestWithFile = (filename = 'file') => {
	const form = new FormData();
	form.append(filename,
		fs.createReadStream(path.join(modelFolder, 'dummy.obj')));

	const req = new MockExpressRequest({
		method: 'POST',
		host: 'localhost',
		url: '/upload',
		headers: form.getHeaders(),
	});

	form.pipe(req);

	return req;
};

const testSingleFileUpload = () => {
	describe.each([
		['request provides the correct parameters and no filter', createRequestWithFile(), undefined, (a, b, cb) => { cb(null, true); }, true],
		['request provides the correct parameters and no filter (2)', createRequestWithFile('a'), 'a', (a, b, cb) => { cb(null, true); }, true],
		['request provides the incorrect parameters', createRequestWithFile('a'), undefined, (a, b, cb) => { cb(null, true); }, false],
		['file filter rejected the file', 'a', (a, b, cb) => { cb('1', false); }, false],
	])('Single file upload', (desc, req, reqParam, fileFilter, success) => {
		test(`${success ? 'next() should be called' : 'should fail'} if ${desc}`, async () => {
			const mockCB = jest.fn(() => {});
			const resCallLength = Responder.respond.mock.calls.length;
			await MulterHelper.singleFileUpload(reqParam, fileFilter)(req, {}, mockCB);

			if (success) {
				expect(mockCB.mock.calls.length).toBe(1);
				expect(req.file).toBeTruthy();
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(resCallLength + 1);
			}
		});
	});
};

describe('middleware/dataConverter/multer', () => {
	testSingleFileUpload();
});
