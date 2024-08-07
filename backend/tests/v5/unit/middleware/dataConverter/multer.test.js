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

const { src, modelFolder, imagesFolder, pdfModel, dwgModel } = require('../../../helper/path');
const config = require('../../../../../src/v5/utils/config');

const MulterHelper = require(`${src}/middleware/dataConverter/multer`);

jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { templates } = require(`${src}/utils/responseCodes`);

Responder.respond.mockImplementation((req, res, errCode) => errCode);

const createRequestWithFile = (filename = 'file', file = 'dummy.obj', folder = modelFolder) => {
	const form = new FormData();

	if (filename) {
		form.append(filename,
			fs.createReadStream(path.join(folder, file)));
	}

	const req = new MockExpressRequest({
		method: 'POST',
		host: 'localhost',
		url: '/upload',
		headers: form.getHeaders(),
	});

	form.pipe(req);

	return req;
};

const testSingleImageUpload = () => {
	describe.each([
		['request provides a valid image file', createRequestWithFile('file', 'valid.png', imagesFolder), undefined, true],
		['request provides non image file', createRequestWithFile('file'), undefined, false, templates.unsupportedFileFormat.code],
		['request provides corrupted image', createRequestWithFile('file', 'corrupted.png', imagesFolder), undefined, false, templates.unsupportedFileFormat.code],
		['request provides too large image', createRequestWithFile('file', 'tooBig.png', imagesFolder), undefined, false, templates.maxSizeExceeded.code],
	])('Single image upload', (desc, req, fileName, success, code = templates.invalidArguments.code) => {
		test(`${success ? 'next() should be called' : `should fail with ${code}`} if ${desc}`, async () => {
			const mockCB = jest.fn(() => { });
			const resCallLength = Responder.respond.mock.calls.length;
			await MulterHelper.singleImageUpload(fileName)(req, {}, mockCB);

			if (success) {
				expect(mockCB).toHaveBeenCalledTimes(1);
				expect(req.file).toBeTruthy();
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(resCallLength + 1);
				expect(Responder.respond.mock.calls[0][2].code).toEqual(code);
			}
		});
	});
};

const testSingleFileUpload = () => {
	describe.each([
		['request does not have a file', createRequestWithFile(null), undefined, (a, b, cb) => { cb(null, true); }, config.uploadSizeLimit, false, false, templates.invalidArguments.code],
		['request provides the correct parameters and no filter', createRequestWithFile(), undefined, (a, b, cb) => { cb(null, true); }, config.uploadSizeLimit, false, true],
		['request provides the correct parameters and no filter (2)', createRequestWithFile('a'), 'a', (a, b, cb) => { cb(null, true); }, config.uploadSizeLimit, false, true],
		['request provides the correct parameters and no filter and store file in memory', createRequestWithFile(), undefined, (a, b, cb) => { cb(null, true); }, config.uploadSizeLimit, true, true],
		['request provides the incorrect parameters', createRequestWithFile('a'), undefined, (a, b, cb) => { cb(null, true); }, config.uploadSizeLimit, false, false],
		['file filter rejected the file', createRequestWithFile('a'), 'a', (a, b, cb) => { cb(templates.invalidArguments, false); }, config.uploadSizeLimit, false, false],
		['file exceeded max file limit', createRequestWithFile('file', 'tooBig.ifc'), undefined, (a, b, cb) => { cb(null, true); }, config.uploadSizeLimit, false, false, templates.maxSizeExceeded.code],
	])('Single file upload', (desc, req, reqParam, fileFilter, maxSize, storeInMemory, success, code = templates.invalidArguments.code) => {
		test(`${success ? 'next() should be called' : `should fail with ${code}`} if ${desc}`, async () => {
			const mockCB = jest.fn(() => { });
			const resCallLength = Responder.respond.mock.calls.length;
			await MulterHelper.singleFileUpload(reqParam, fileFilter, maxSize, storeInMemory)(req, {}, mockCB);

			if (success) {
				expect(mockCB.mock.calls.length).toBe(1);
				expect(req.file).toBeTruthy();
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(resCallLength + 1);
				expect(Responder.respond.mock.calls[0][2].code).toEqual(code);
			}
		});
	});
};

const testEnsureFileIsValid = () => {
	describe.each([
		['request does not have a file', {}, false],
		['request has a pdf file', { file: { originalname: pdfModel, buffer: fs.readFileSync(pdfModel) } }, true],
		['request has a non pdf file', { file: { originalname: dwgModel, buffer: fs.readFileSync(dwgModel) } }, true],
	])('Ensure file is valid', (desc, req, success, code = templates.invalidArguments.code) => {
		test(`${success ? 'next() should be called' : `should fail with ${code}`} if ${desc}`, async () => {
			const mockCB = jest.fn(() => { });
			await MulterHelper.ensureFileIsValid(req, {}, mockCB);

			if (success) {
				expect(mockCB).toHaveBeenCalledTimes(1);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.calls[0][2].code).toEqual(templates.unsupportedFileFormat.code);
			}
		});
	});
};

describe('middleware/dataConverter/multer', () => {
	testSingleImageUpload();
	testSingleFileUpload();
	testEnsureFileIsValid();
});
