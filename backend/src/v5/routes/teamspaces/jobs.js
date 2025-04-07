/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const Jobs = require('../../processors/teamspaces/jobs');
const { Router } = require('express');

const { hasAccessToTeamspace } = require('../../middleware/permissions');

const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');

const getJobList = async (req, res) => {
	const { teamspace } = req.params;

	try {
		const jobs = await Jobs.getJobList(teamspace);

		respond(req, res, templates.ok, { jobs });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });
	/**
	* @openapi
	* /teamspaces/{teamspace}/jobs:
	*   get:
	*     description: Get the list of jobs within this teamspace
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: jobList
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Return the list of jobs within the teamspace
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 jobs:
	*                   type: array
	*                   items:
	*                     type: object
	*                     properties:
	*                       _id:
	*                         type: string
	*                         description: Job name
	*                         example: Architect
	*                       color:
	*                         type: string
	*                         description: Color that represents the job, in hex
	*                         example: "#AA00BB"
	*/
	router.get('/', hasAccessToTeamspace, getJobList);

	return router;
};

module.exports = establishRoutes();
