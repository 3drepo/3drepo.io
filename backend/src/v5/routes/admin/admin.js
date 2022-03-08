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
const { hasReadAccessToSystemRoles, hasWriteAccessToSystemRoles } = require('../../middleware/permissions/permissions');
const { validatePayload, validateQueries, validateUsersAndRoles } = require('../../middleware/dataConverter/inputs/admin');
const Admin = require('../../processors/admin');
const { Router } = require('express');
const { getUserFromSession } = require('../../utils/sessions');
const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');

const getUsersWithRoles = (req, res) => {
	const { user, role } = req.query;
	Admin.getUsersWithRole(user, role).then((users) => {
		respond(req, res, templates.ok, { users });
	}).catch((err) => respond(req, res, err));
};

const patchUsersRoles = (req, res) => {
	const user = getUserFromSession(req.session);
	const { users } = req.body;
	Admin.patchUsersRoles(user, users).then((u) => {
		respond(req, res, templates.ok, { users: u });
	}).catch(
		/* istanbul ignore next */
		(err) => respond(req, res, err),
	);
};

const putUsersRoles = (req, res) => {
	const user = getUserFromSession(req.session);
	const { users } = req.body;
	Admin.putUsersRoles(user, users).then((u) => {
		respond(req, res, templates.ok, { users: u });
	}).catch(
		/* istanbul ignore next */
		(err) => respond(req, res, err),
	);
};

const revokeUsersRoles = (req, res) => {
	const user = getUserFromSession(req.session);
	const { users } = req.body;
	Admin.revokeUsersRoles(user, users).then((u) => {
		respond(req, res, templates.ok, { users: u });
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
	 *     description: Get User and Role Information
	 *     tags: [Admin]
	 *     operationId: getAllUsersWithRole
	 *     parameters:
	 *       - name: role
	 *         in: query
	 *         description: name of role
	 *         required: false
	 *         schema:
	 *           type: array
	 *           items:
	 *             type: string
	 *       - name: user
	 *         description: name of user
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: array
	 *           items:
	 *             type: string
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       403:
	 *         $ref: "#/components/responses/notAuthorizedForbidden"
	 *       200:
	 *         description: returns a list of users and roles assigned that meet the search terms, returns everything assigned with no parameters given.
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
	 *                       roles:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                           description: Name of additional role
	 *                           enum: [system_admin, support_admin, license_admin]
	 *                           example: support_admin
	 *
	 */
	router.get('/roles', hasReadAccessToSystemRoles, validateQueries, getUsersWithRoles);

	/**
	 * @openapi
	 * /admin/roles:
	 *   put:
	 *     description: Grant roles to users
	 *     tags: [Admin]
	 *     operationId: putUsersRoles
	 *     requestBody:
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
	 *                       roles:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                           description: Name of additional role
	 *                           enum: [system_admin, support_admin, license_admin]
	 *                           example: support_admin
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       403:
	 *         $ref: "#/components/responses/notAuthorizedForbidden"
	 *       200:
	 *         description: confirms objects modified, returns current state of users submitted
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
	 *                       roles:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                           description: Name of additional role
	 *                           enum: [system_admin, support_admin, license_admin]
	 *                           example: support_admin
	 *
	 * */
	router.put('/roles', hasWriteAccessToSystemRoles, validatePayload, validateUsersAndRoles, putUsersRoles);

	/**
	 * @openapi
	 * /admin/roles:
	 *   patch:
	 *     description: Modify existing roles
	 *     tags: [Admin]
	 *     operationId: patchUsersRoles
	 *     requestBody:
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
	 *                       roles:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                           description: Name of additional role
	 *                           enum: [system_admin, support_admin, license_admin]
	 *                           example: support_admin
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       403:
	 *         $ref: "#/components/responses/notAuthorizedForbidden"
     *       200:
	 *         description: confirms objects modified, returns current state of users submitted
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
	 *                       roles:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                           description: Name of additional role
	 *                           enum: [system_admin, support_admin, license_admin]
	 *                           example: support_admin
	 *
	 * */
	router.patch('/roles', hasWriteAccessToSystemRoles, validatePayload, validateUsersAndRoles, patchUsersRoles);

	/**
	 * @openapi
	 * /admin/roles:
	 *   delete:
	 *     description: delete existing roles
	 *     tags: [Admin]
	 *     operationId: deleteUserRoles
	 *     requestBody:
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
	 *                       roles:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                           description: Name of additional role
	 *                           enum: [system_admin, support_admin, license_admin]
	 *                           example: support_admin
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       403:
	 *         $ref: "#/components/responses/notAuthorizedForbidden"
     *       200:
	 *         description: confirms objects modified, returns current state of users submitted
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
	 *                       roles:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                           description: Name of additional role
	 *                           enum: [system_admin, support_admin, license_admin]
	 *                           example: support_admin
	 *
	 * */

	router.delete('/roles', hasWriteAccessToSystemRoles, validatePayload, validateUsersAndRoles, revokeUsersRoles);

	return router;
};

module.exports = establishRoutes();
