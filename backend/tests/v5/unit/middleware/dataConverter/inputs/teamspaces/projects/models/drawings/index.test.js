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

const { src, image, dwgModel, pdfModel, emptyPdf } = require('../../../../../../../../helper/path');
const MockExpressRequest = require('mock-express-request');
const FormData = require('form-data');
const fs = require('fs');
const { generateRandomString } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/quota');
const Quota = require(`${src}/utils/quota`);

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);

const Drawings = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/drawings`);
const { templates } = require(`${src}/utils/responseCodes`);
const { statusCodes } = require(`${src}/models/modelSettings.constants`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const createRequestWithFile = (teamspace, drawing, { statusCode, revCode }, fileName) => {
	const form = new FormData();

	if (fileName) {
		form.append('file',
			fs.createReadStream(fileName));
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
		['Request with valid data (dwg)', teamspace, drawing, standardBody, dwgModel],
		['Request with valid data (pdf)', teamspace, drawing, standardBody, pdfModel],
		['Request with unsupported model file', teamspace, drawing, standardBody, image, templates.unsupportedFileFormat],
		['Request with insufficient quota', noQuotaTs, drawing, standardBody, dwgModel, templates.quotaLimitExceeded],
		['Request with no body', teamspace, drawing, {}, dwgModel, templates.invalidArguments],
		['Request without statusCode', teamspace, drawing, { revCode: generateRandomString(10) }, dwgModel, templates.invalidArguments],
		['Request with unknown statusCode', teamspace, drawing, { ...standardBody, statusCode: generateRandomString() }, dwgModel, templates.invalidArguments],
		['Request without revCode', teamspace, drawing, { statusCode: statusCodes[0].code }, dwgModel, templates.invalidArguments],
		['Request with too large revCode', teamspace, drawing, { ...standardBody, revCode: generateRandomString(11) }, dwgModel, templates.invalidArguments],
		['Request with no file', teamspace, drawing, standardBody, null, templates.invalidArguments],
		['Request with an empty pdf file', teamspace, drawing, standardBody, emptyPdf, templates.unsupportedFileFormat],
		['Request with duplicate status and rev codes', teamspace, drawing, { statusCode: duplicateStatusCode, revCode: duplicateRevCode }, dwgModel, templates.invalidArguments],
	])('Check new revision data', (desc, ts, draw, bodyContent, fileName, error) => {
		test(`${desc} should ${error ? `fail with ${error.code}` : ' succeed and next() should be called'}`, async () => {
			const req = createRequestWithFile(ts, draw, bodyContent, fileName);
			const mockCB = jest.fn(() => {});

			if (fileName) {
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
