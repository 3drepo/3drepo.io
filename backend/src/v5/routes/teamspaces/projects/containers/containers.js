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
const { getUserFromSession } = require('../../../../utils/sessions');
const { hasAccessToTeamspace } = require('../../../../middleware/permissions/permissions');
const { respond } = require('../../../../utils/responder');
const { templates } = require('../../../../utils/responseCodes');

const getContainerList = (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	Containers.getContainerList(teamspace, project, user).then((containers) => {
		respond(req, res, templates.ok, { containers });
	}).catch((err) => respond(req, res, err));
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers:
	 *   get:
	 *     description: Get a list of containers within the specified project the user has access to
	 *     tags: [Containers]
	 *     operationId: getContainerList
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
   	 *       - project:
	 *         name: project
	 *         description: ID of project
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
	 *         description: returns list of containers
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 containers:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       id:
	 *                         type: string
	 *                         description: Container ID
	 *                         example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       name:
	 *                         type: string
	 *                         description: name of the container
	 *                         example: Structure
	 *                       role:
	 *                         $ref: "#/components/roles"
	 *                       isFavourite:
	 *                         type: boolean
	 *                         description: whether the container is a favourited item for the user
	 *
	 *
	 */
	router.get('/', hasAccessToTeamspace, getContainerList);

	return router;
};

module.exports = establishRoutes();
