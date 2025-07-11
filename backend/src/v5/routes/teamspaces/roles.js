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

const { hasAccessToTeamspace, isTeamspaceAdmin } = require('../../middleware/permissions');
const { roleExists, validateNewRole, validateUpdateRole } = require('../../middleware/dataConverter/inputs/teamspaces/roles');

const Roles = require('../../processors/teamspaces/roles');
const { Router } = require('express');
const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');
const { notUserProvisioned } = require('../../middleware/permissions/components/teamspaces');

const getRoles = async (req, res) => {
	const { teamspace } = req.params;

	try {
		const roles = await Roles.getRoles(teamspace);
		respond(req, res, templates.ok, { roles });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const createRole = async (req, res) => {
	const { teamspace } = req.params;
	const role = req.body;

	try {
		const roleId = await Roles.createRole(teamspace, role);
		respond(req, res, templates.ok, { _id: roleId });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateRole = async (req, res) => {
	const { teamspace, role } = req.params;
	const updatedRole = req.body;

	try {
		await Roles.updateRole(teamspace, role, updatedRole);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const deleteRole = async (req, res) => {
	const { teamspace, role } = req.params;

	try {
		await Roles.deleteRole(teamspace, role);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });
	/**
	* @openapi
	* /teamspaces/{teamspace}/roles:
	*   get:
	*     description: Get the list of roles within this teamspace
	*     tags: [Roles]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: roleList
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Return the list of roles within the teamspace
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 roles:
	*                   type: array
	*                   items:
	*                     type: object
	*                     properties:
	*                       _id:
	*                         type: string
	*                         format: uuid
	*                         description: Role id
	*                         example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	*                       name:
	*                         type: string
	*                         description: Role name
	*                         example: Architect
	*                       color:
	*                         type: string
	*                         description: Color that represents the role, in hex
	*                         example: "#AA00BB"
	*                       users:
	*                         type: array
	*                         items:
	*                           type: string
	*                           description: A user the role is assigned to
	*                           example: user1
	*/
	router.get('/', hasAccessToTeamspace, getRoles);

	/**
	* @openapi
	* /teamspaces/{teamspace}/roles:
	*   post:
	*     description: Creates a new role
	*     tags: [Roles]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             type: object
	*             properties:
	*               name:
	*                 type: string
	*                 description: The name of the new role
	*                 example: Master Engineer
	*               color:
	*                 type: string
	*                 description: The color of the new role in RGB hex
	*                 example: #808080
	*               users:
	*                 type: array
	*                 items:
	*                   type: string
	*                   description: A user the role is assigned to
	*                   example: user1
	*             required:
	*               - name
	*     operationId: createRole
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Create a new role
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 _id:
	*                   type: string
	*                   format: uuid
	*                   description: The id of the new role
	*                   example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	*/
	router.post('/', isTeamspaceAdmin, notUserProvisioned, validateNewRole, createRole);

	/**
	* @openapi
	* /teamspaces/{teamspace}/roles/{role}:
	*   patch:
	*     description: Updates a role
	*     tags: [Roles]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*       - name: role
	*         description: id of the role
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             type: object
	*             properties:
	*               name:
	*                 type: string
	*                 description: The updated name of the role
	*                 example: Master Engineer
	*               color:
	*                 type: string
	*                 description: The updated color of the role
	*                 example: #808080
	*               users:
	*                 type: array
	*                 description: The updated user list of the role
	*                 items:
	*                   type: string
	*                   example: user1
	*     operationId: updateRole
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Updates a role
	*/
	router.patch('/:role', isTeamspaceAdmin, notUserProvisioned, validateUpdateRole, updateRole);

	/**
	* @openapi
	* /teamspaces/{teamspace}/roles/{role}:
	*   delete:
	*     description: Deletes a role
	*     tags: [Roles]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*       - name: role
	*         description: id of the role
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: deleteRole
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Deletes a role
	*/
	router.delete('/:role', isTeamspaceAdmin, notUserProvisioned, roleExists, deleteRole);

	return router;
};

module.exports = establishRoutes();
