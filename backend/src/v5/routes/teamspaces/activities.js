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

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/settings/activities/archive:
	 *   get:
	 *     description: Get an encrypted zip file containing the requested activity logs. The password to unlock the file will be sent to the user via email
	 *     tags: [Activities]
	 *     operationId: archive
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: from
	 *         description: Only return logs that have been created after a certain time (in epoch timestamp)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: number
	 *       - name: to
	 *         description: Only return logs that have been created after before certain time (in epoch timestamp)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: number
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: downloads the encrypted zip file
	 *         content:
	 *           application/octet-stream:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/archive', isTeamspaceAdmin, validateGetActivitiesParams, getActivities);

	return router;
};

module.exports = establishRoutes();
