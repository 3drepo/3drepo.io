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

const { calibrationStatuses } = require('../../../../src/v5/models/calibrations.constants');
const { src } = require('../../helper/path');

const { determineTestGroup, generateRandomString, generateRandomObject } = require('../../helper/services');

const Calibrations = require(`${src}/models/calibrations`);
const db = require(`${src}/handler/db`);
const CALIBRATIONS_COL = 'drawings.revisions.calibrations';

const testAddCalibration = () => {
	describe('Add calibration', () => {
		test('should add a new calibration', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const drawing = generateRandomString();
			const revision = generateRandomString();
			const calibration = generateRandomObject();

			const insertFn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);

			await expect(Calibrations.addCalibration(teamspace, project, drawing, revision, calibration));
			const { createdAt, _id } = insertFn.mock.calls[0][2];
			expect(insertFn).toHaveBeenCalledTimes(1);
			expect(insertFn).toHaveBeenCalledWith(teamspace, CALIBRATIONS_COL, {
				_id,
				project,
				drawing,
				rev_id: revision,
				createdAt,
				...calibration,
			});
		});
	});
};

const testGetCalibration = () => {
	describe('Get latest calibration of a revision', () => {
		test('should return the latest calibration of a revision', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const drawing = generateRandomString();
			const revision = generateRandomString();
			const projection = generateRandomObject();
			const result = generateRandomObject();

			const findFn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(result);

			await expect(Calibrations.getCalibration(teamspace, project, drawing, revision, projection));

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CALIBRATIONS_COL,
				{ drawing, rev_id: revision, project }, projection, { createdAt: -1 });
		});
	});
};

const testGetCalibrationStatus = () => {
	describe('Get drawing calibration status', () => {
		test('should return calibration status of a drawing if it is uncalibrated', async () => {
			const teamspace = generateRandomString();
			const drawing = generateRandomString();
			const revision = generateRandomString();

			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce([]);

			const status = await Calibrations.getCalibrationStatus(teamspace, drawing, revision);

			expect(status).toEqual(calibrationStatuses.UNCALIBRATED);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CALIBRATIONS_COL, { drawing }, { rev_id: 1 });
		});

		test('should return calibration status of a drawing if it is calibrated', async () => {
			const teamspace = generateRandomString();
			const drawing = generateRandomString();
			const revision = generateRandomString();

			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce([{ rev_id: revision }]);

			const status = await Calibrations.getCalibrationStatus(teamspace, drawing, revision);

			expect(status).toEqual(calibrationStatuses.CALIBRATED);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CALIBRATIONS_COL, { drawing }, { rev_id: 1 });
		});

		test('should return calibration status of a drawing if it is unconfirmed', async () => {
			const teamspace = generateRandomString();
			const drawing = generateRandomString();
			const revision = generateRandomString();

			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce([{ rev_id: generateRandomString() }]);

			const status = await Calibrations.getCalibrationStatus(teamspace, drawing, revision);

			expect(status).toEqual(calibrationStatuses.UNCONFIRMED);
			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, CALIBRATIONS_COL, { drawing }, { rev_id: 1 });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testAddCalibration();
	testGetCalibration();
	testGetCalibrationStatus();
});
