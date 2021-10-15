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

const { Router } = require('express');
const Teamspaces = require('../../processors/teamspaces/teamspaces');
const { hasAccessToTeamspace } = require('../../middleware/permissions/permissions');
const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');
const { validSession } = require('../../middleware/auth');

const getTeamspaceList = (req, res) => {
	const user = req.session.user.username;
	Teamspaces.getTeamspaceListByUser(user).then((teamspaces) => {
		respond(req, res, templates.ok, { teamspaces });
	}).catch((err) => respond(req, res, err));
};

const getTeamspaceMembers = (req, res) => {
	const { teamspace } = req.params;
	Teamspaces.getTeamspaceMembersInfo(teamspace).then((members) => {
		respond(req, res, templates.ok, { members });
	}).catch(
		/* istanbul ignore next */
		(err) => respond(req, res, err),
	);
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces:
	 *   get:
	 *     description: Get a list of teamspaces the user has access to
	 *     tags: [Teamspaces]
	 *     operationId: getTeamspaceList
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: returns list of teamspace
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 teamspaces:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       name:
	 *                         type: string
	 *                         description: name of the teamspace
	 *                         example: teamspace1
	 *                       isAdmin:
	 *                         type: boolean
	 *                         description: whether the user is an admin
	 *
	 *
	 */
	router.get('/', validSession, getTeamspaceList);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/members:
	 *   get:
	 *     description: Get the list of members within the teamspace
	 *     tags: [Teamspaces]
	 *     operationId: getTeamspaceMembers
	 *     parameters:
   	 *       - teamspace:
	 *         name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: returns list of teamspace members with their basic information
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 members:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       user:
	 *                         type: string
	 *                         description: User name
	 *                         example: johnPaul01
	 *                       firstName:
	 *                         type: string
	 *                         description: First name
	 *                         example: John
	 *                       lastName:
	 *                         type: string
	 *                         description: Last name
	 *                         example: Paul
	 *                       company:
	 *                         type: string
	 *                         description: Name of the company
	 *                         example: 3D Repo Ltd
	 *                       job:
	 *                         type: string
	 *                         description: Job within the teamspace
	 *                         example: Project Manager
	 *
	 */
	router.get('/:teamspace/members', hasAccessToTeamspace, getTeamspaceMembers);

	return router;
};

module.exports = establishRoutes();
