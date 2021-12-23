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
const Admin = require('../../processors/admin');
const { hasReadAccessToSystemRoles, hasWriteAccessToSystemRoles } = require('../../middleware/permissions/permissions');
const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');
const { validSession } = require('../../middleware/auth');

const getUsersWithRoles = (req, res) => {
	Admin.getUsersWithRole().then((users) => {
		respond(req, res, templates.ok, { users });
	}).catch((err) => respond(req, res, err));
};

const updateUsersWithRoles = (req, res) => {
	const { teamspace } = req.params;
	Admin.getTeamspaceMembersInfo(teamspace).then((members) => {
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
	 * /admin/roles:
	 *   get:
	 *     description: Return a list of all users with additional roles
	 *     tags: [Admin]
	 *     operationId: getAllUsersWithRole
	 *     parameters:
   	 *       - role:
	 *         name: role
	 *         description: name of role
	 *         in: path
	 *         required: false
	 *         schema:
	 *           type: array
   	 *       - user:
	 *         name: user
	 *         description: name of user
	 *         in: path
	 *         required: false
	 *         schema:
	 *           type: array
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: returns list of users with additional roles
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 users:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       user:
	 *                         type: string
	 *                         description: name of the user
	 *                         example: abc
	 *                       role:
	 *                         type: string
	 *                         description: Name of additional role
	 *                         example: system_admin | license_admin | support_admin
	 *
	 */
	router.get('/roles', hasReadAccessToSystemRoles, getUsersWithRoles);

	/**
	 * @openapi
	 * /admin/roles:
	 *   post:
	 *     description: add roles to users
	 *     tags: [Admin]
	 *     operationId: getTeamspaceMembers
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               user:
	 *                 type: string
	 *                 description: The username or email of the user
	 *                 example: username1
	 *               role:
	 *                 type: string
	 *                 description: The role of the user
	 *                 example: support_admin
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: confirms objects modified
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
	router.post('/roles', hasWriteAccessToSystemRoles, updateUsersWithRoles);

	return router;
};

module.exports = establishRoutes();
