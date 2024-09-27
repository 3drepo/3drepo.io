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

const { addCalibration, getCalibration, getCalibrationForMultipleRevisions } = require('../../../../../models/calibrations');
const { getDrawingById, updateModelSettings } = require('../../../../../models/modelSettings');
const { getRevisionByIdOrTag, getRevisions, getRevisionsByQuery } = require('../../../../../models/revisions');
const { UUIDToString } = require('../../../../../utils/helper/uuids');
const { calibrationStatuses } = require('../../../../../models/calibrations.constants');
const { convertArrayUnits } = require('../../../../../utils/helper/units');
const { events } = require('../../../../../services/eventsManager/eventsManager.constants');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { publish } = require('../../../../../services/eventsManager/eventsManager');
const { templates } = require('../../../../../utils/responseCodes');

const Calibrations = {};

const getRevIdToCalibMap = (revCalibrations) => {
	const revIdToCalib = {};

	revCalibrations.forEach(({ _id, ...others }) => {
		revIdToCalib[UUIDToString(_id)] = others;
	});

	return revIdToCalib;
};

Calibrations.getCalibration = async (teamspace, project, drawing, revision) => {
	const projection = {
		_id: 0,
		horizontal: 1,
		createdAt: 1,
		createdBy: 1,
		units: 1,
	};

	const [latestCalibration, { calibration: drawingData }] = await Promise.all([
		getCalibration(teamspace, project, drawing, revision, projection),
		getDrawingById(teamspace, drawing, { _id: 0, calibration: 1 }),
	]);

	if (latestCalibration) {
		return {
			calibration: {
				...latestCalibration,
				verticalRange: convertArrayUnits(drawingData.verticalRange, drawingData.units, latestCalibration.units),
			},
			status: calibrationStatuses.CALIBRATED };
	}

	const { timestamp } = await getRevisionByIdOrTag(teamspace, drawing,
		modelTypes.DRAWING, revision, { _id: 0, timestamp: 1 });

	const previousRevisions = await getRevisionsByQuery(teamspace, project, drawing, modelTypes.DRAWING,
		{ timestamp: { $lt: timestamp } }, { _id: 1 });

	const revCalibrations = await getCalibrationForMultipleRevisions(teamspace,
		previousRevisions.map(({ _id }) => _id), projection);

	if (revCalibrations?.length) {
		const revIdToCalib = getRevIdToCalibMap(revCalibrations);

		for (let i = 0; i < previousRevisions.length; ++i) {
			const data = revIdToCalib[UUIDToString(previousRevisions[i]._id)];
			if (data) {
				return {
					calibration: {
						...data.latestCalibration,
						verticalRange: convertArrayUnits(drawingData.verticalRange, drawingData.units,
							data.latestCalibration.units),
					},
					status: calibrationStatuses.UNCONFIRMED,
				};
			}
		}
	}

	throw templates.calibrationNotFound;
};

Calibrations.getCalibrationStatus = async (teamspace, project, drawing, revision) => {
	try {
		const { status } = await Calibrations.getCalibration(teamspace, project, drawing, revision);
		return status;
	} catch {
		return calibrationStatuses.UNCALIBRATED;
	}
};

Calibrations.getCalibrationStatusForAllRevs = async (teamspace, project, drawing) => {
	const allRevisions = await getRevisions(teamspace, project, drawing, modelTypes.DRAWING, true,
		{ _id: 1, void: 1 }, { timestamp: 1 });
	const revCalibrations = await getCalibrationForMultipleRevisions(teamspace,
		allRevisions.map(({ _id }) => _id), { _id: 1 });

	const revIdToHasCalib = getRevIdToCalibMap(revCalibrations);
	const results = {};

	let defaultCalibStatus = calibrationStatuses.UNCALIBRATED;
	allRevisions.forEach(({ _id, void: isVoidRev }) => {
		const revId = UUIDToString(_id);
		if (revIdToHasCalib[revId]) {
			results[revId] = calibrationStatuses.CALIBRATED;
			if (!isVoidRev) {
				defaultCalibStatus = calibrationStatuses.UNCONFIRMED;
			}
		} else {
			results[revId] = defaultCalibStatus;
		}
	});

	return results;
};

Calibrations.addCalibration = async (teamspace, project, drawing, revision, createdBy, calibration) => {
	const existingCalibration = await getCalibration(teamspace, project, drawing, revision, { _id: 1 });

	const { verticalRange, units, ...calibrationData } = calibration;

	await Promise.all([
		addCalibration(teamspace, project, drawing, revision, createdBy, { ...calibrationData, units }),
		updateModelSettings(teamspace, project, drawing, { calibration: { verticalRange, units } }),
	]);

	if (!existingCalibration) {
		publish(events.REVISION_UPDATED, {
			teamspace,
			project,
			model: drawing,
			modelType: modelTypes.DRAWING,
			data: { _id: revision, calibration: calibrationStatuses.CALIBRATED },
		});
	}
};

module.exports = Calibrations;
