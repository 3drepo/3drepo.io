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
const { hasAccessToTeamspace, isTeamspaceAdmin } = require('../../middleware/permissions/permissions');
const Audit = require('../../processors/teamspaces/audits');
const { Router } = require('express');
const TeamspaceSettings = require('../../processors/teamspaces/settings');
const { UUIDToString } = require('../../utils/helper/uuids');
const { castTicketSchemaOutput } = require('../../middleware/dataConverter/outputs/teamspaces/settings');
const { getUserFromSession } = require('../../utils/sessions');
const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');
const { validateGetAuditLogParams } = require('../../middleware/dataConverter/inputs/teamspaces/settings');

const addTicketTemplate = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const template = req.body;

		const _id = UUIDToString(await TeamspaceSettings.addTicketTemplate(teamspace, template));
		respond(req, res, templates.ok, { _id });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getRiskCategories = async (req, res) => {
	try {
		const { teamspace } = req.params;
		const riskCategories = await TeamspaceSettings.getRiskCategories(teamspace);
		respond(req, res, templates.ok, { riskCategories });
	} catch (err) {
		// istanbul ignore next
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
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getTemplateList = async (req, res) => {
	const { teamspace } = req.params;

	try {
		const data = await TeamspaceSettings.getTemplateList(teamspace);

		respond(req, res, templates.ok,
			{ templates: data.map(({ _id, ...rest }) => ({ _id: UUIDToString(_id), ...rest })) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getAuditLogArchive = async (req, res) => {
	const { teamspace } = req.params;
	const { from, to } = req.query;
	const user = getUserFromSession(req.session);

	try {
		const file = await Audit.getAuditLogArchive(teamspace, user, from, to);

		const headers = {
			'Content-Disposition': 'attachment;filename=audit.zip',
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
	* /teamspaces/{teamspace}/settings/tickets/templates:
	*   get:
	*     description: Get the list of templates within this teamspace
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: ticketTemplateList
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Return the list of templates within the teamspace
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 templates:
	*                   type: array
	*                   items:
	*                     type: object
	*                     properties:
	*                       _id:
	*                         type: string
	*                         description: id of the template
	*                         format: uuid
	*                       name:
	*                         type: string
	*                         description: name of the template
	*                       code:
	*                         type: string
	*                         description: a 3 letter code representing the template
	*                       deprecated:
	*                         description: indicates the template is deprecated and no longer in use
	*                         type: boolean
	*
	*/
	router.get('/tickets/templates', isTeamspaceAdmin, getTemplateList);

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
	*         description: returns the details of a template
	*         content:
	*           application/json:
	*             schema:
	*               $ref: "#/components/schemas/ticketTemplate"
	*/
	router.get('/tickets/templates/:template', isTeamspaceAdmin, checkTicketTemplateExists, castTicketSchemaOutput);

	/**
	* @openapi
	* /teamspaces/{teamspace}/settings/tickets/riskCategories:
	*   get:
	*     description: Get the list of risk categories
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: getRiskCategories
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: returns the array of risk categories
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 riskCategories:
	*                   type: array
	*                   items:
	*                     type: string
	*                   example: ["Commerical Issue", "Environmental Issue", "Safety Issue - Struck"]
	*/
	router.get('/tickets/riskCategories', hasAccessToTeamspace, getRiskCategories);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/settings/activities/archive:
	 *   get:
	 *     description: Get an encrypted zip file containing the requested activity logs. The password to unlock the file will be sent to the user via email
	 *     tags: [Teamspaces]
	 *     operationId: getAuditLogArchive
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
	router.get('/activities/archive', isTeamspaceAdmin, validateGetAuditLogParams, getAuditLogArchive);

	return router;
};

module.exports = establishRoutes();
