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

const Calibrations = require('../../../../../processors/teamspaces/projects/models/calibrations');
const { Router } = require('express');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { hasWriteAccessToDrawing } = require('../../../../../middleware/permissions/permissions');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');
const { validateNewCalibrationData } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/calibrations');

const addCalibration = async (req, res) => {
	const { teamspace, project, drawing, revision } = req.params;
	const createdBy = getUserFromSession(req.session);

	try {
		await Calibrations.addCalibration(teamspace, project, drawing, revision, { ...req.body, createdBy });
		respond(req, res, templates.ok);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	router.post('', hasWriteAccessToDrawing, validateNewCalibrationData, addCalibration);
	return router;
};

module.exports = establishRoutes();
