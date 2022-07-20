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

const {
	checkTicketTemplateExists,
	validateNewTicketSchema,
	validateUpdateTicketSchema,
} = require('../../middleware/dataConverter/inputs/teamspaces/settings');
const { Router } = require('express');
const TeamspaceSettings = require('../../processors/teamspaces/settings');

const { UUIDToString } = require('../../utils/helper/uuids');

const { castTicketSchemaOutput } = require('../../middleware/dataConverter/outputs/teamspaces/settings');

const { isTeamspaceAdmin } = require('../../middleware/permissions/permissions');

const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');

const addTicketTemplate = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const template = req.body;

		const _id = UUIDToString(await TeamspaceSettings.addTicketTemplate(teamspace, template));
		respond(req, res, templates.ok, { _id });
	} catch (err) {
		respond(req, res, err);
	}
};

const updateTicketTemplate = async (req, res) => {
	try {
		const { teamspace, template } = req.params;
		const newData = req.body;

		await TeamspaceSettings.updateTicketTemplate(teamspace, template, newData);
		respond(req, res, templates.ok);
	} catch (err) {
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });
	/**
	* @openapi
	* /teamspaces/{teamspace}/settings/tickets/templates:
	*   post:
	*     description: Add a new ticket tempate to the teamspace
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: addTicketTemplate
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             $ref: "#/components/schemas/ticketTemplate"
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: template has been successfully added, returns the id of the newly created template
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 _id:
	*                   type: string
	*                   format: uuid
	*/
	router.post('/tickets/templates', isTeamspaceAdmin, validateNewTicketSchema, addTicketTemplate);

	/**
	* @openapi
	* /teamspaces/{teamspace}/settings/tickets/templates/{template}:
	*   put:
	*     description: Updates an existing ticket template
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*       - name: template
	*         description: id of the template
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*           format: uuid
	*     operationId: updateTicketTemplate
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             $ref: "#/components/schemas/ticketTemplate"
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: template has been successfully updated
	*
	*/
	router.put('/tickets/templates/:template', isTeamspaceAdmin, validateUpdateTicketSchema, updateTicketTemplate);

	/**
	* @openapi
	* /teamspaces/{teamspace}/settings/tickets/templates/{template}:
	*   get:
	*     description: Get a ticket template
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*       - name: template
	*         description: id of the template
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*           format: uuid
	*     operationId: getTicketTemplate
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: template has been successfully updated
	*         content:
	*           application/json:
	*             schema:
	*               $ref: "#/components/schemas/ticketTemplate"
	*/
	router.get('/tickets/templates/:template', isTeamspaceAdmin, checkTicketTemplateExists, castTicketSchemaOutput);

	return router;
};

module.exports = establishRoutes();
