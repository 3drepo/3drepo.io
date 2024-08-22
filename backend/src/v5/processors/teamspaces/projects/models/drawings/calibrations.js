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
const { getRevisionByIdOrTag, getRevisionsByQuery } = require('../../../../../models/revisions');
const { UUIDToString } = require('../../../../../utils/helper/uuids');
const { deleteIfUndefined } = require('../../../../../utils/helper/objects');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { templates } = require('../../../../../utils/responseCodes');

const Calibrations = { };

Calibrations.addCalibration = addCalibration;

Calibrations.getCalibration = async (teamspace, project, drawing, revision, returnRevId) => {
	const projection = deleteIfUndefined({
		horizontal: 1,
		verticalRange: 1,
		units: 1,
		createdAt: 1,
		createdBy: 1,
		rev_id: returnRevId ? 1 : undefined });

	const latestCalibration = await getCalibration(teamspace, project, drawing, revision, { ...projection, _id: 0 });

	if (latestCalibration) {
		return latestCalibration;
	}

	const { timestamp } = await getRevisionByIdOrTag(teamspace, drawing,
		modelTypes.DRAWING, revision, { _id: 0, timestamp: 1 });

	const previousRevisions = await getRevisionsByQuery(teamspace, project, drawing, modelTypes.DRAWING,
		{ timestamp: { $lt: timestamp } }, { _id: 1, timestamp: 1 });

	const revCalibrations = await getCalibrationForMultipleRevisions(teamspace,
		previousRevisions.map(({ _id }) => _id), projection);

	for (let i = 0; i < previousRevisions.length; i++) {
		const { _id: revId } = previousRevisions[i];
		const latestCal = revCalibrations.find(({ _id }) => UUIDToString(_id) === UUIDToString(revId));

		if (latestCal) {
			return latestCal.latestCalibration;
		}
	}

	throw templates.calibrationNotFound;
};

module.exports = Calibrations;
