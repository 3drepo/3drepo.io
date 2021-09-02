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

const Containers = require('../../../../processors/teamspaces/projects/containers/containers');
const { Router } = require('express');
const { hasReadAccessToContainer } = require('../../../../middleware/permissions/permissions');
const { respond } = require('../../../../utils/responder');
const { templates } = require('../../../../utils/responseCodes');

const getContainerStats = async (req, res) => {
	const { teamspace, project, container } = req.params;
	Containers.getContainerStats(teamspace, project, container).then((stats) => {
		respond(req, res, templates.ok, stats);
	}).catch((err) => respond(req, res, err));
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/stats:
	 *   get:
	 *     description: Get the statistics and general information about a container
	 *     tags: [Containers]
	 *     operationId: getContainerStats
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
   	 *       - project:
	 *         name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
   	 *       - container:
	 *         name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns the statistics of a container
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   description: Container ID
	 *                   example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 type:
	 *                   type: string
	 *                   description: Name of the container
	 *                   example: Structure
   	 *                 code:
	 *                   type: string
	 *                   description: Container code
	 *                   example: STR-01
     *                 status:
	 *                   type: string
	 *                   description: Current status of the container
	 *                   example: ok
     *                 units:
	 *                   type: string
	 *                   description: Container units
	 *                   example: mm
	 *                 revisions:
	 *                   type: object
	 *                   properties:
	 *                     total:
	 *                       type: integer
	 *                       description: Number of revisions (non voided) in the container
	 *                       example: 10
     *                     lastUpdated:
	 *                       type: integer
	 *                       description: Timestamp(ms) of when the container was last updated
	 *                       example: 1630598072000
	 *                     latestRevision:
	 *                       type: string
	 *                       description: Revision name of the latest version
	 *                       example: rev1
	 */
	router.get('/:container/stats', hasReadAccessToContainer, getContainerStats);

	return router;
};

module.exports = establishRoutes();
