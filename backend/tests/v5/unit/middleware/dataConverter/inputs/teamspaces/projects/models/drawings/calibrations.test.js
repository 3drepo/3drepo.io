/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { deleteIfUndefined } = require('../../../../../../../../../../src/v5/utils/helper/objects');
const { src } = require('../../../../../../../../helper/path');

const { determineTestGroup, generateRandomString } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../../src/v5/processors/teamspaces/projects/models/calibrations');
const CalibrationProc = require(`${src}/processors/teamspaces/projects/models/calibrations`);

const Calibrations = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/drawings/calibrations`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateNewCalibration = () => {
	const standardBody = {
		horizontal: {
			model: [[1, 2, 3], [4, 5, 6]],
			drawing: [[1, 2], [3, 4]],
		},
		verticalRange: [1, 10],
		units: 'm',
	};

	describe.each([
		['Request without horizontal', { ...standardBody, horizontal: undefined }],
		['Request without horizontal model', { ...standardBody, horizontal: { ...standardBody.horizontal, model: undefined } }],
		['Request with longer horizontal model array', { ...standardBody, horizontal: { ...standardBody.horizontal, model: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] } }],
		['Request with horizontal model that has a 2d position', { ...standardBody, horizontal: { ...standardBody.horizontal, model: [[1, 2], [3, 4, 5]] } }],
		['Request with shorter horizontal model array', { ...standardBody, horizontal: { ...standardBody.horizontal, model: [[3, 4, 5]] } }],
		['Request without horizontal drawing', { ...standardBody, horizontal: { ...standardBody.horizontal, drawing: undefined } }],
		['Request with longer horizontal drawing array', { ...standardBody, horizontal: { ...standardBody.horizontal, model: [[1, 2], [4, 5], [7, 8]] } }],
		['Request with horizontal drawing that has a 3d position', { ...standardBody, horizontal: { ...standardBody.horizontal, model: [[1, 2], [3, 4, 5]] } }],
		['Request with shorter horizontal drawing array', { ...standardBody, horizontal: { ...standardBody.horizontal, model: [[3, 4]] } }],
		['Request without verticalRange', { ...standardBody, verticalRange: undefined }],
		['Request with longer verticalRange array', { ...standardBody, verticalRange: [1, 2, 3] }],
		['Request with shorter verticalRange array', { ...standardBody, verticalRange: [1] }],
		['Request with verticalRange where the first item is larger than the second', { ...standardBody, verticalRange: [2, 1] }],
		['Request with verticalRange where the first item is equal to the second', { ...standardBody, verticalRange: [1, 1] }],
		['Request without units', { ...standardBody, units: undefined }],
		['Request with invalid units', { ...standardBody, units: generateRandomString() }],
		['Request with valid data', standardBody, true],
	])('Check new calibration data', (desc, body, sucess) => {
		test(`${desc} should ${!sucess ? `fail with ${templates.invalidArguments.code}` : ' succeed and next() should be called'}`, async () => {
			const req = { body: deleteIfUndefined(body), query: {} };
			const mockCB = jest.fn(() => {});

			await Calibrations.validateNewCalibration(req, {}, mockCB);

			if (sucess) {
				expect(mockCB).toHaveBeenCalledTimes(1);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});

	describe.each([
		['Request with unconfimed revision', false, false, true],
		['Request with calibrated revision', false, true],
		['Request with uncalibrated revision', true, false],
	])('Check confirm calibration', (desc, uncalibratedRev, calibratedRev, sucess) => {
		test(`${desc} should ${!sucess ? `fail with ${templates.calibrationNotFound.code}` : ' succeed and next() should be called'}`, async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const drawing = generateRandomString();
			const revision = generateRandomString();
			const req = {
				body: {},
				query: { usePrevious: 'true' },
				params: { teamspace, project, drawing, revision },
			};

			const latestCalibration = {
				rev_id: calibratedRev ? req.params.revision : generateRandomString(),
				[generateRandomString()]: generateRandomString(),
			};

			const mockCB = jest.fn(() => {});

			CalibrationProc.getLastAvailableCalibration.mockImplementationOnce(() => {
				if (uncalibratedRev) {
					throw new Error();
				}

				return latestCalibration;
			});

			await Calibrations.validateNewCalibration(req, {}, mockCB);

			expect(CalibrationProc.getLastAvailableCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationProc.getLastAvailableCalibration).toHaveBeenCalledWith(teamspace, project, drawing,
				revision, true);

			if (sucess) {
				expect(mockCB).toHaveBeenCalledTimes(1);
				delete latestCalibration.rev_id;
				expect(req.body).toEqual(latestCalibration);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.results[0].value.code)
					.toEqual(templates.calibrationNotFound.code);
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateNewCalibration();
});
