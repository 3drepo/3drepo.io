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

const { src, imagesFolder, modelFolder } = require('../../../../../../../helper/path');
const MockExpressRequest = require('mock-express-request');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { generateRandomString } = require('../../../../../../../helper/services');

jest.mock('../../../../../../../../../src/v5/utils/quota');
const Quota = require(`${src}/utils/quota`);

jest.mock('../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);

const Drawings = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/drawings`);
const { templates } = require(`${src}/utils/responseCodes`);
const { statusCodes } = require(`${src}/models/modelSettings.constants`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const createRequestWithFile = (teamspace, drawing, { statusCode, revCode },
	unsupportedFile = false, noFile = false, emptyFile = false) => {
	const form = new FormData();
	if (!noFile) {
		const filePath = unsupportedFile ? path.join(imagesFolder, 'valid.png') : path.join(modelFolder, emptyFile ? 'empty.dwg' : 'dummy.dwg');

		form.append('file',
			fs.createReadStream(filePath));
	}
	if (statusCode) form.append('statusCode', statusCode);
	if (revCode) form.append('revCode', revCode);

	const req = new MockExpressRequest({
		method: 'POST',
		host: 'localhost',
		url: `/${teamspace}/upload`,
		headers: form.getHeaders(),
	});

	form.pipe(req);
	req.params = { teamspace, drawing };
	return req;
};

const testValidateNewRevisionData = () => {
	const teamspace = generateRandomString();
	const drawing = generateRandomString();
	const noQuotaTs = 'noQuota';
	const duplicateStatusCode = statusCodes[1].code;
	const duplicateRevCode = statusCodes[1].code;
	const standardBody = {
		revCode: generateRandomString(10),
		statusCode: statusCodes[0].code,
	};

	describe.each([
		['Request with valid data', teamspace, drawing, standardBody],
		['Request with unsupported model file', teamspace, drawing, standardBody, true, false, false, templates.unsupportedFileFormat],
		['Request with insufficient quota', noQuotaTs, drawing, standardBody, false, false, false, templates.quotaLimitExceeded],
		['Request with no body should fail', teamspace, drawing, {}, false, false, false, templates.invalidArguments],
		['Request without statusCode should fail', teamspace, drawing, { revCode: generateRandomString(10) }, false, false, false, templates.invalidArguments],
		['Request with unknown statusCode should fail', teamspace, drawing, { ...standardBody, statusCode: generateRandomString() }, false, false, false, templates.invalidArguments],
		['Request without revCode should fail', teamspace, drawing, { statusCode: statusCodes[0].code }, false, false, false, templates.invalidArguments],
		['Request with too large revCode', teamspace, drawing, { ...standardBody, revCode: generateRandomString(11) }, false, false, false, templates.invalidArguments],
		['Request with no file should fail', teamspace, drawing, standardBody, false, true, false, templates.invalidArguments],
		['Request with an empty file should fail', teamspace, drawing, standardBody, false, false, true, templates.invalidArguments],
		['Request with duplicate status and rev codes should fail', teamspace, drawing, { statusCode: duplicateStatusCode, revCode: duplicateRevCode }, false, false, false, templates.invalidArguments],
	])('Check new revision data', (desc, ts, draw, bodyContent, badFile, noFile, emptyFile, error) => {
		test(`${desc} should ${error ? `fail with ${error.code}` : ' succeed and next() should be called'}`, async () => {
			const req = createRequestWithFile(ts, draw, bodyContent, badFile, noFile, emptyFile);
			const mockCB = jest.fn(() => {});

			if (!(badFile || emptyFile || noFile)) {
				Quota.sufficientQuota.mockImplementationOnce((teamSpace) => (teamSpace === noQuotaTs
					? Promise.reject(templates.quotaLimitExceeded) : Promise.resolve()));

				RevisionsModel.isRevAndStatusCodeUnique.mockImplementationOnce((teamSpace, dr,
					revCode, statusCode) => !(revCode === duplicateRevCode && statusCode === duplicateStatusCode));
			}

			await Drawings.validateNewRevisionData(req, {}, mockCB);
			if (error) {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(error.code);
			} else {
				expect(mockCB.mock.calls.length).toBe(1);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/drawings', () => {
	testValidateNewRevisionData();
});
