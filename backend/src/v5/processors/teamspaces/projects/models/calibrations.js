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

const { addCalibration, getCalibration } = require('../../../../models/calibrations');
const { deleteIfUndefined } = require('../../../../utils/helper/objects');
const { getPreviousRevisions } = require('../../../../models/revisions');
const { modelTypes } = require('../../../../models/modelSettings.constants');
const { templates } = require('../../../../utils/responseCodes');

const Calibrations = { };

Calibrations.addCalibration = addCalibration;

Calibrations.getLastAvailableCalibration = async (teamspace, project, drawing, revision, returnRevId) => {
	const projection = deleteIfUndefined({
		_id: 0,
		horizontal: 1,
		verticalRange: 1,
		units: 1,
		createdAt: 1,
		rev_id: returnRevId ? 1 : undefined });

	let latestCalibration = await getCalibration(teamspace, project, drawing, revision, projection);

	if (latestCalibration) {
		return latestCalibration;
	}

	const previousRevisions = await getPreviousRevisions(teamspace, drawing, modelTypes.DRAWING, revision);
	for (let i = 0; i < previousRevisions.length; i++) {
		// eslint-disable-next-line no-await-in-loop
		latestCalibration = await getCalibration(teamspace, project, drawing,
			previousRevisions[i]._id, projection);

		if (latestCalibration) {
			return latestCalibration;
		}
	}

	throw templates.calibrationNotFound;
};

module.exports = Calibrations;
