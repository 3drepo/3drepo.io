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

const { addCalibration, getLatestCalibration } = require('../../../../models/calibrations');
const { modelTypes } = require('../../../../models/modelSettings.constants');
const { getPreviousRevisions, getRevisionByIdOrTag, getRevisions } = require('../../../../models/revisions');
const { templates } = require('../../../../utils/responseCodes');

const Calibrations = { };

Calibrations.addCalibration = addCalibration;

Calibrations.getLatestCalibration = async (teamspace, project, drawing, revision) => {
	let latestCalibration = await getLatestCalibration(teamspace, project, drawing, revision);

	if (latestCalibration) {
		return latestCalibration;
	}

	const previousRevisions = await getPreviousRevisions(teamspace, drawing, modelTypes.DRAWING, revision);
	for (let i = 0; i < previousRevisions.length; i++) {
		// eslint-disable-next-line no-await-in-loop
		latestCalibration = await getLatestCalibration(teamspace, project, drawing, previousRevisions[i]._id);

		if (latestCalibration) {
			return latestCalibration;
		}
	}

	return templates.calibrationNotFound;
};

module.exports = Calibrations;
