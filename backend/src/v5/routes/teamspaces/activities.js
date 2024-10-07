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

const Activities = require('../../processors/teamspaces/activities');
const { Router } = require('express');
const { getUserFromSession } = require('../../utils/sessions');
const { isTeamspaceAdmin } = require('../../middleware/permissions/permissions');
const { respond } = require('../../utils/responder');
const { validateGetActivitiesParams } = require('../../middleware/dataConverter/inputs/teamspaces/activities');

const getActivities = async (req, res) => {
	const { teamspace } = req.params;
	const { from, to } = req.query;
	const user = getUserFromSession(req.session);

	try {
		const file = await Activities.getActivitiesFile(teamspace, user, from, to);

		const headers = {
			'Content-Disposition': 'attachment;filename=activities.zip',
			'Content-Type': 'application/zip',
		};

		res.writeHead(200, headers);
		file.pipe(res);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	router.get('/archive', isTeamspaceAdmin, validateGetActivitiesParams, getActivities);

	return router;
};

module.exports = establishRoutes();
