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

const { src } = require('../../helper/path');

const { determineTestGroup, generateRandomString, generateRandomObject } = require('../../helper/services');

const Calibrations = require(`${src}/models/calibrations`);
const db = require(`${src}/handler/db`);
const CALIBRATIONS_COL = 'drawings.calibrations';

const testAddCalibration = () => {
	describe('Add calibration', () => {
		test('should add a new calibration', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const drawing = generateRandomString();
			const revision = generateRandomString();
			const createdBy = generateRandomString();
			const calibration = generateRandomObject();

			const insertFn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);

			await expect(Calibrations.addCalibration(teamspace, project, drawing, revision, createdBy, calibration));
			const { createdAt, _id } = insertFn.mock.calls[0][2];
			expect(insertFn).toHaveBeenCalledTimes(1);
			expect(insertFn).toHaveBeenCalledWith(teamspace, CALIBRATIONS_COL, {
				_id,
				project,
				drawing,
				rev_id: revision,
				createdAt,
				createdBy,
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

const testDeleteDrawingCalibrations = () => {
	describe('Delete calibrations of a drawing', () => {
		test('should delete all calibrations of a drawing', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const drawing = generateRandomString();
			const deleteFn = jest.spyOn(db, 'deleteMany').mockResolvedValueOnce(undefined);

			await Calibrations.deleteDrawingCalibrations(teamspace, project, drawing);

			expect(deleteFn).toHaveBeenCalledTimes(1);
			expect(deleteFn).toHaveBeenCalledWith(teamspace, CALIBRATIONS_COL, { project, drawing });
		});
	});
};

const testGetCalibrationForMultipleRevisions = () => {
	describe('Get latest calibration for multiple revisions', () => {
		test('should return the latest calibrations for multiple revisions', async () => {
			const teamspace = generateRandomString();
			const revIds = [generateRandomString(), generateRandomString()];
			const projection = {
				[generateRandomString()]: 1,
				[generateRandomString()]: 1,
				[generateRandomString()]: 0,
			};
			const result = generateRandomString();
			const aggregateFn = jest.spyOn(db, 'aggregate').mockResolvedValueOnce(result);

			const getFormattedProjecion = () => {
				const formattedProjection = {};
				for (const key in projection) {
					if (projection[key] === 1) {
						formattedProjection[`latestCalibration.${key}`] = 1;
					}
				}
				return formattedProjection;
			};

			const res = await Calibrations.getCalibrationForMultipleRevisions(teamspace, revIds, projection);
			expect(res).toEqual(result);

			expect(aggregateFn).toHaveBeenCalledTimes(1);
			expect(aggregateFn).toHaveBeenCalledWith(teamspace, CALIBRATIONS_COL, [
				{ $match: { rev_id: { $in: revIds } } },
				{ $sort: { createdAt: -1 } },
				{ $group: { _id: '$rev_id', latestCalibration: { $first: '$$ROOT' } } },
				{ $project: { _id: 1, ...getFormattedProjecion() } },
			]);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testAddCalibration();
	testGetCalibration();
	testDeleteDrawingCalibrations();
	testGetCalibrationForMultipleRevisions();
});
