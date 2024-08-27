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

const { times } = require('lodash');
const { src } = require('../../../../../../helper/path');
const { determineTestGroup, generateRandomString, generateRandomObject, generateRandomDate } = require('../../../../../../helper/services');
const { calibrationStatuses } = require('../../../../../../../../src/v5/models/calibrations.constants');

const { templates } = require(`${src}/utils/responseCodes`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);

jest.mock('../../../../../../../../src/v5/models/calibrations');
const CalibrationsModel = require(`${src}/models/calibrations`);
jest.mock('../../../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);

const Calibrations = require(`${src}/processors/teamspaces/projects/models/drawings/calibrations`);

const testGetCalibration = () => {
	describe('Get calibration', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const drawing = generateRandomString();
		const revisionId = generateRandomString();

		const calibration = generateRandomObject();
		const revision = {
			_id: generateRandomString(),
			timestamp: generateRandomDate(),
			...generateRandomObject(),
		};

		const revisions = times(5, () => ({
			_id: generateRandomString(),
			timestamp: generateRandomDate(),
			...generateRandomObject(),
		}));

		const projection = {
			horizontal: 1,
			verticalRange: 1,
			units: 1,
			createdAt: 1,
			createdBy: 1,
		};

		test('should return the latest revision calibration', async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(calibration);

			await expect(Calibrations.getCalibration(teamspace, project, drawing, revisionId))
				.resolves.toEqual({ calibration, status: calibrationStatuses.CALIBRATED });

			expect(CalibrationsModel.getCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledWith(teamspace, project, drawing,
				revisionId, projection);
		});

		test('should return error if the revision has no calibrations and there are no previous revisions', async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(undefined);
			RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce(revision);
			RevisionsModel.getRevisionsByQuery.mockResolvedValueOnce([]);

			await expect(Calibrations.getCalibration(teamspace, project, drawing, revisionId))
				.rejects.toEqual(templates.calibrationNotFound);

			expect(CalibrationsModel.getCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledWith(teamspace, project, drawing,
				revisionId, projection);
			expect(RevisionsModel.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(RevisionsModel.getRevisionByIdOrTag).toHaveBeenCalledWith(teamspace, drawing,
				modelTypes.DRAWING, revisionId, { _id: 0, timestamp: 1 });
			expect(RevisionsModel.getRevisionsByQuery).toHaveBeenCalledTimes(1);
			expect(RevisionsModel.getRevisionsByQuery).toHaveBeenCalledWith(teamspace, project, drawing,
				modelTypes.DRAWING, { timestamp: { $lt: revision.timestamp } }, { _id: 1 });
			expect(CalibrationsModel.getCalibrationForMultipleRevisions).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibrationForMultipleRevisions).toHaveBeenCalledWith(teamspace, [],
				projection);
		});

		test('should return error if there is no calibration in any revision', async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(undefined);
			RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce(revision);
			RevisionsModel.getRevisionsByQuery.mockResolvedValueOnce(revisions);
			CalibrationsModel.getCalibrationForMultipleRevisions.mockResolvedValueOnce([]);

			await expect(Calibrations.getCalibration(teamspace, project, drawing, revisionId))
				.rejects.toEqual(templates.calibrationNotFound);

			expect(CalibrationsModel.getCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledWith(teamspace, project, drawing,
				revisionId, projection);
			expect(RevisionsModel.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(RevisionsModel.getRevisionByIdOrTag).toHaveBeenCalledWith(teamspace, drawing,
				modelTypes.DRAWING, revisionId, { _id: 0, timestamp: 1 });
			expect(RevisionsModel.getRevisionsByQuery).toHaveBeenCalledTimes(1);
			expect(RevisionsModel.getRevisionsByQuery).toHaveBeenCalledWith(teamspace, project, drawing,
				modelTypes.DRAWING, { timestamp: { $lt: revision.timestamp } }, { _id: 1 });
			expect(CalibrationsModel.getCalibrationForMultipleRevisions).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibrationForMultipleRevisions).toHaveBeenCalledWith(teamspace,
				revisions.map(({ _id }) => _id), projection);
		});

		test('should return calibration if a previous revision has one', async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(undefined);
			RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce(revision);
			RevisionsModel.getRevisionsByQuery.mockResolvedValueOnce(revisions);
			CalibrationsModel.getCalibrationForMultipleRevisions.mockResolvedValueOnce([{
				_id: revisions[0]._id, latestCalibration: calibration,
			}]);

			await expect(Calibrations.getCalibration(teamspace, project, drawing, revisionId))
				.resolves.toEqual({ calibration, status: calibrationStatuses.UNCONFIRMED });

			expect(CalibrationsModel.getCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledWith(teamspace, project, drawing,
				revisionId, projection);
			expect(RevisionsModel.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(RevisionsModel.getRevisionByIdOrTag).toHaveBeenCalledWith(teamspace, drawing,
				modelTypes.DRAWING, revisionId, { _id: 0, timestamp: 1 });
			expect(RevisionsModel.getRevisionsByQuery).toHaveBeenCalledTimes(1);
			expect(RevisionsModel.getRevisionsByQuery).toHaveBeenCalledWith(teamspace, project, drawing,
				modelTypes.DRAWING, { timestamp: { $lt: revision.timestamp } }, { _id: 1 });
			expect(CalibrationsModel.getCalibrationForMultipleRevisions).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibrationForMultipleRevisions).toHaveBeenCalledWith(teamspace,
				revisions.map(({ _id }) => _id), projection);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetCalibration();
});
