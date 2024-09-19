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
const {
	determineTestGroup,
	generateRandomString,
	generateRandomObject,
	generateRandomDate,
	generateUUID,
} = require('../../../../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { modelTypes } = require(`${src}/models/modelSettings.constants`);

jest.mock('../../../../../../../../src/v5/models/calibrations');
const CalibrationsModel = require(`${src}/models/calibrations`);
jest.mock('../../../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);
jest.mock('../../../../../../../../src/v5/models/modelSettings');
const ModelSettingsModel = require(`${src}/models/modelSettings`);

jest.mock('../../../../../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

const { calibrationStatuses } = require(`${src}/models/calibrations.constants`);

const Calibrations = require(`${src}/processors/teamspaces/projects/models/drawings/calibrations`);

const testGetCalibration = () => {
	describe('Get calibration', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const drawing = generateRandomString();
		const revisionId = generateRandomString();

		const calibration = generateRandomObject();
		const drawingData = {
			calibration: { verticalRange: [0, 10], units: 'm' },
		};

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
			_id: 0,
			horizontal: 1,
			createdAt: 1,
			createdBy: 1,
		};

		test('should return the latest revision calibration', async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(calibration);
			ModelSettingsModel.getDrawingById.mockResolvedValueOnce(drawingData);

			await expect(Calibrations.getCalibration(teamspace, project, drawing, revisionId))
				.resolves.toEqual({
					calibration: { ...calibration, ...drawingData.calibration },
					status: calibrationStatuses.CALIBRATED,
				});

			expect(ModelSettingsModel.getDrawingById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getDrawingById).toHaveBeenCalledWith(teamspace, drawing,
				{ _id: 0, calibration: 1 });
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledWith(teamspace, project, drawing,
				revisionId, projection);
		});

		test('should return error if the revision has no calibrations and there are no previous revisions', async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(undefined);
			ModelSettingsModel.getDrawingById.mockResolvedValueOnce(drawingData);
			RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce(revision);
			RevisionsModel.getRevisionsByQuery.mockResolvedValueOnce([]);

			await expect(Calibrations.getCalibration(teamspace, project, drawing, revisionId))
				.rejects.toEqual(templates.calibrationNotFound);

			expect(ModelSettingsModel.getDrawingById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getDrawingById).toHaveBeenCalledWith(teamspace, drawing,
				{ _id: 0, calibration: 1 });
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
			ModelSettingsModel.getDrawingById.mockResolvedValueOnce(drawingData);
			RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce(revision);
			RevisionsModel.getRevisionsByQuery.mockResolvedValueOnce(revisions);
			CalibrationsModel.getCalibrationForMultipleRevisions.mockResolvedValueOnce([]);

			await expect(Calibrations.getCalibration(teamspace, project, drawing, revisionId))
				.rejects.toEqual(templates.calibrationNotFound);

			expect(ModelSettingsModel.getDrawingById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getDrawingById).toHaveBeenCalledWith(teamspace, drawing,
				{ _id: 0, calibration: 1 });
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
			ModelSettingsModel.getDrawingById.mockResolvedValueOnce(drawingData);
			RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce(revision);
			RevisionsModel.getRevisionsByQuery.mockResolvedValueOnce(revisions);
			CalibrationsModel.getCalibrationForMultipleRevisions.mockResolvedValueOnce([{
				_id: revisions[1]._id, latestCalibration: calibration,
			}]);

			await expect(Calibrations.getCalibration(teamspace, project, drawing, revisionId))
				.resolves.toEqual({
					calibration: { ...calibration, ...drawingData.calibration },
					status: calibrationStatuses.UNCONFIRMED,
				});

			expect(ModelSettingsModel.getDrawingById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getDrawingById).toHaveBeenCalledWith(teamspace, drawing,
				{ _id: 0, calibration: 1 });
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

const testGetCalibrationStatus = () => {
	describe('Get calibration status', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const drawing = generateRandomString();
		const revisionId = generateRandomString();
		const drawingData = {
			calibration: { verticalRange: [0, 10], units: 'm' },
		};

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

		test(`should return ${calibrationStatuses.CALIBRATED} if the revision has a calibration`, async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(calibration);
			ModelSettingsModel.getDrawingById.mockResolvedValueOnce(drawingData);

			await expect(Calibrations.getCalibrationStatus(teamspace, project, drawing, revisionId))
				.resolves.toEqual(calibrationStatuses.CALIBRATED);
		});

		test(`should return ${calibrationStatuses.CALIBRATED} if the revision has no calibrations and there are no previous revisions`, async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(undefined);
			RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce(revision);
			RevisionsModel.getRevisionsByQuery.mockResolvedValueOnce([]);
			ModelSettingsModel.getDrawingById.mockResolvedValueOnce(drawingData);

			await expect(Calibrations.getCalibrationStatus(teamspace, project, drawing, revisionId))
				.resolves.toEqual(calibrationStatuses.UNCALIBRATED);
		});

		test(`should return ${calibrationStatuses.CALIBRATED} if there is no calibration in any revision`, async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(undefined);
			RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce(revision);
			RevisionsModel.getRevisionsByQuery.mockResolvedValueOnce(revisions);
			CalibrationsModel.getCalibrationForMultipleRevisions.mockResolvedValueOnce([]);
			ModelSettingsModel.getDrawingById.mockResolvedValueOnce(drawingData);

			await expect(Calibrations.getCalibrationStatus(teamspace, project, drawing, revisionId))
				.resolves.toEqual(calibrationStatuses.UNCALIBRATED);
		});

		test(`should return ${calibrationStatuses.UNCONFIRMED} if a previous revision has a calibration`, async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(undefined);
			RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce(revision);
			RevisionsModel.getRevisionsByQuery.mockResolvedValueOnce(revisions);
			CalibrationsModel.getCalibrationForMultipleRevisions.mockResolvedValueOnce([{
				_id: revisions[0]._id, latestCalibration: calibration,
			}]);
			ModelSettingsModel.getDrawingById.mockResolvedValueOnce(drawingData);

			await expect(Calibrations.getCalibrationStatus(teamspace, project, drawing, revisionId))
				.resolves.toEqual(calibrationStatuses.UNCONFIRMED);
		});
	});
};

const testGetCalibrationStatusForAllRevs = () => {
	const teamspace = generateRandomString();
	const project = generateRandomString();
	const drawing = generateRandomString();
	const drawingData = {
		calibration: { verticalRange: [0, 10], units: 'm' },
	};

	const nRevs = 3;
	const revs = times(nRevs, () => generateUUID());
	const revStrs = times(nRevs, (i) => UUIDToString(revs[i]));
	describe.each([
		['No calibrations', [{ _id: revs[0] }, { _id: revs[1] }], [],
			{ [revStrs[0]]: calibrationStatuses.UNCALIBRATED, [revStrs[1]]: calibrationStatuses.UNCALIBRATED }],
		['All have calibrations', [{ _id: revs[0] }, { _id: revs[1] }], [{ _id: revs[0] }, { _id: revs[1] }],
			{ [revStrs[0]]: calibrationStatuses.CALIBRATED, [revStrs[1]]: calibrationStatuses.CALIBRATED }],
		['Unconfirm logic', [{ _id: revs[0] }, { _id: revs[1] }, { _id: revs[2] }], [{ _id: revs[1] }],
			{ [revStrs[2]]: calibrationStatuses.UNCONFIRMED,
				[revStrs[1]]: calibrationStatuses.CALIBRATED,
				[revStrs[0]]: calibrationStatuses.UNCALIBRATED }],
		['Void logic (1)', [{ _id: revs[0] }, { _id: revs[1], void: true }, { _id: revs[2] }], [{ _id: revs[1] }],
			{ [revStrs[2]]: calibrationStatuses.UNCALIBRATED,
				[revStrs[1]]: calibrationStatuses.CALIBRATED,
				[revStrs[0]]: calibrationStatuses.UNCALIBRATED }],
		['Void logic (2)', [{ _id: revs[0] }, { _id: revs[1], void: true }, { _id: revs[2] }], [{ _id: revs[1] }, { _id: revs[0] }],
			{ [revStrs[2]]: calibrationStatuses.UNCONFIRMED,
				[revStrs[1]]: calibrationStatuses.CALIBRATED,
				[revStrs[0]]: calibrationStatuses.CALIBRATED }],
	])('Get calibration status for all revs', (desc, revData, calibration, expectedResults) => {
		test(desc, async () => {
			RevisionsModel.getRevisions.mockResolvedValueOnce(revData);
			ModelSettingsModel.getDrawingById.mockResolvedValueOnce(drawingData);
			CalibrationsModel.getCalibrationForMultipleRevisions.mockResolvedValueOnce(calibration);

			await expect(Calibrations.getCalibrationStatusForAllRevs(teamspace, project, drawing))
				.resolves.toEqual(expectedResults);
		});
	});
};

const testAddCalibration = () => {
	describe('Add Calibration', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const drawing = generateRandomString();
		const revision = generateRandomString();
		const createdBy = generateRandomString();
		const calibration = generateRandomObject();
		const drawingData = generateRandomObject();

		test('should add a new calibration', async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(calibration);

			await Calibrations.addCalibration(teamspace, project, drawing, revision, createdBy,
				calibration, drawingData);

			expect(CalibrationsModel.addCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.addCalibration).toHaveBeenCalledWith(teamspace, project, drawing, revision,
				createdBy, calibration);
			expect(ModelSettingsModel.updateModelSettings).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.updateModelSettings).toHaveBeenCalledWith(teamspace, project, drawing,
				{ calibration: drawingData });
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledWith(teamspace, project, drawing,
				revision, { _id: 1 });
			expect(EventsManager.publish).not.toHaveBeenCalled();
		});

		test('should add a new calibration and fire REVISION_UPDATED', async () => {
			CalibrationsModel.getCalibration.mockResolvedValueOnce(null);

			await Calibrations.addCalibration(teamspace, project, drawing, revision, createdBy,
				calibration, drawingData);

			expect(CalibrationsModel.addCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.addCalibration).toHaveBeenCalledWith(teamspace, project, drawing, revision,
				createdBy, calibration);
			expect(ModelSettingsModel.updateModelSettings).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.updateModelSettings).toHaveBeenCalledWith(teamspace, project, drawing,
				{ calibration: drawingData });
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledTimes(1);
			expect(CalibrationsModel.getCalibration).toHaveBeenCalledWith(teamspace, project, drawing,
				revision, { _id: 1 });
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.REVISION_UPDATED, { teamspace,
				project,
				model: drawing,
				modelType: modelTypes.DRAWING,
				data: { _id: revision, calibration: calibrationStatuses.CALIBRATED } });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetCalibration();
	testGetCalibrationStatus();
	testGetCalibrationStatusForAllRevs();
	testAddCalibration();
});
