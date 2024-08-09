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

const { UUIDToString, generateUUID } = require('../utils/helper/uuids');
const { calibrationStatuses } = require('./calibrations.constants');
const db = require('../handler/db');

const CALIBRATIONS_COL = 'drawings.revisions.calibrations';

const Calibrations = {};

Calibrations.addCalibration = async (teamspace, project, drawing, revision, calibration) => {
	const formattedData = {
		_id: generateUUID(),
		project,
		drawing,
		rev_id: revision,
		createdAt: new Date(),
		...calibration,
	};

	await db.insertOne(teamspace, CALIBRATIONS_COL, formattedData);
};

Calibrations.getLatestRevCalibration = (teamspace, project, drawing, revision, projection) => db.findOne(
	teamspace, CALIBRATIONS_COL, { drawing, rev_id: revision, project },
	projection, { createdAt: -1 });

Calibrations.getDrawingCalibrationStatus = async (teamspace, drawing, latestRevId) => {
	const calibrations = await db.find(teamspace, CALIBRATIONS_COL, { drawing }, { rev_id: 1 });

	if (!calibrations.length) {
		return calibrationStatuses.UNCALIBRATED;
	} if (calibrations.some(({ rev_id }) => UUIDToString(rev_id) === UUIDToString(latestRevId))) {
		return calibrationStatuses.CALIBRATED;
	}

	return calibrationStatuses.UNCONFIRMED;
};

module.exports = Calibrations;
