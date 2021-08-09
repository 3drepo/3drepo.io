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

const { createResponseCode, template } = require('../../utils/responseCodes');
const { Router } = require('express');
const Teamspaces = require('../../processors/teamspaces/teamspaces');
const { respond } = require('../../utils/responder');
const { validSession } = require('../../middleware/auth');

const getTeamspaceList = (req, res) => {
	const user = req.session.user.username;
	Teamspaces.getTeamspaceListByUser(user).then((teamspaces) => {
		respond(req, res, createResponseCode(template.ok), { teamspaces });
	}).catch((err) => respond(req, res, err));
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces:
	 *   get:
	 *     description: Get a list of teamspaces the user has access to
	 *     tags: [Teamspaces]
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
	 *                       isAdmin:
	 *                         type: boolean
	 *                         description: whether the user is an admin
	 *
	 *
	 */
	router.get('/', validSession, getTeamspaceList);

	return router;
};

module.exports = establishRoutes();
