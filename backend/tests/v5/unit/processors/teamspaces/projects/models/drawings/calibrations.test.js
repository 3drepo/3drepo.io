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
const { determineTestGroup, generateRandomString, generateRandomObject } = require('../../../../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);

jest.mock('../../../../../../../../src/v5/models/calibrations');
const CalibrationsModel = require(`${src}/models/calibrations`);
jest.mock('../../../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);

const Calibrations = require(`${src}/processors/teamspaces/projects/models/drawings/calibrations`);

const testGetLastAvailableCalibration = () => {
	describe('Get last available calibration', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const drawing = generateRandomString();
		const revision = generateRandomString();
		const revisions = times(5, () => ({ _id: generateRandomString(), ...generateRandomObject() }));

		test('should return error if there are no calibrations', async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(undefined);
			RevisionsModel.getPreviousRevisions.mockResolvedValueOnce(revisions);

			await expect(Calibrations.getLastAvailableCalibration(teamspace, project, drawing, revision))
				.rejects.toEqual(templates.calibrationNotFound);

			expect(RevisionsModel.getPreviousRevisions).toHaveBeenCalledTimes(1);
			expect(RevisionsModel.getPreviousRevisions).toHaveBeenCalledWith(teamspace, project, drawing,
				modelTypes.DRAWING, revision);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledTimes(6);
		});

		test('should return the last available calibration if the provided revision has calibrations', async () => {
			const calibration = generateRandomObject();
			CalibrationsModel.getCalibration.mockResolvedValueOnce(calibration);

			const lastCalibration = await Calibrations.getLastAvailableCalibration(teamspace, project,
				drawing, revision);

			expect(lastCalibration).toEqual(calibration);
			expect(RevisionsModel.getPreviousRevisions).not.toHaveBeenCalled();
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledWith(teamspace, project, drawing, revision,
				{ _id: 0, horizontal: 1, verticalRange: 1, units: 1, createdAt: 1 },
			);
		});

		test('should return the last available calibration if a previous revision has calibrations', async () => {
			const calibration = generateRandomObject();
			CalibrationsModel.getCalibration.mockResolvedValueOnce(undefined);
			CalibrationsModel.getCalibration.mockResolvedValueOnce(calibration);
			RevisionsModel.getPreviousRevisions.mockResolvedValueOnce(revisions);

			const lastCalibration = await Calibrations.getLastAvailableCalibration(teamspace, project,
				drawing, revision, true);

			expect(lastCalibration).toEqual(calibration);
			expect(RevisionsModel.getPreviousRevisions).toHaveBeenCalledTimes(1);
			expect(RevisionsModel.getPreviousRevisions).toHaveBeenCalledWith(teamspace, project, drawing,
				modelTypes.DRAWING, revision);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledTimes(2);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledWith(teamspace, project, drawing, revision,
				{ _id: 0, horizontal: 1, verticalRange: 1, units: 1, createdAt: 1, rev_id: 1 },
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetLastAvailableCalibration();
});
