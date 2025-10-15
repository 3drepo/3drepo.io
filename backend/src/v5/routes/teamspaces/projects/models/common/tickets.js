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

const {
	addTicket: addConTicket,
	getTicketById: getConTicketById,
	getTicketHistoryById: getConTicketHistoryById,
	getTicketList: getConTicketList,
	getTicketResourceAsStream: getConTicketResourceAsStream,
	importTickets: importConTickets,
	updateTicket: updateConTicket,
	updateManyTickets: updateManyConTickets,
} = require('../../../../../processors/teamspaces/projects/models/containers');
const {
	addTicket: addFedTicket,
	getTicketById: getFedTicketById,
	getTicketHistoryById: getFedTicketHistoryById,
	getTicketList: getFedTicketList,
	getTicketResourceAsStream: getFedTicketResourceAsStream,
	importTickets: importFedTickets,
	updateTicket: updateFedTicket,
	updateManyTickets: updateManyFedTickets,
} = require('../../../../../processors/teamspaces/projects/models/federations');
const {
	hasCommenterAccessToContainer,
	hasCommenterAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToFederation,
} = require('../../../../../middleware/permissions');
const { respond, writeStreamRespond } = require('../../../../../utils/responder');
const { serialiseFullTicketTemplate, serialiseTemplatesList, serialiseTicket, serialiseTicketHistory, serialiseTicketList } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets');
const { templateExists, validateImportTickets, validateNewTicket, validateUpdateMultipleTickets, validateUpdateTicket } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets');
const { Router } = require('express');
const { UUIDToString } = require('../../../../../utils/helper/uuids');
const { getAllTemplates: getAllTemplatesInProject } = require('../../../../../processors/teamspaces/projects');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { templates } = require('../../../../../utils/responseCodes');
const { validateListSortAndFilter } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/utils');
const { validateQueryString } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/ticketQueryFilters');

const createTicket = (isFed) => async (req, res) => {
	const { teamspace, project, model } = req.params;
	try {
		const addTicket = isFed ? addFedTicket : addConTicket;
		const _id = await addTicket(teamspace, project, model, req.templateData, req.body);

		respond(req, res, templates.ok, { _id: UUIDToString(_id) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const importTickets = (isFed) => async (req, res) => {
	const { teamspace, project, model } = req.params;
	try {
		const user = getUserFromSession(req.session);
		const importTicketsToModel = isFed ? importFedTickets : importConTickets;
		const ids = await importTicketsToModel(teamspace, project, model, req.templateData, req.body.tickets, user);

		respond(req, res, templates.ok, { tickets: ids.map(UUIDToString) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getAllTemplates = async (req, res, next) => {
	const { teamspace, project } = req.params;
	const showDeprecated = req.query.showDeprecated === 'true';
	const getDetails = req.query.getDetails === 'true';

	try {
		const data = await getAllTemplatesInProject(teamspace, project, getDetails, showDeprecated);
		req.templates = data;
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getTicket = (isFed) => async (req, res, next) => {
	const { teamspace, project, model, ticket } = req.params;

	try {
		const getTicketById = isFed ? getFedTicketById : getConTicketById;
		req.ticket = await getTicketById(teamspace, project, model, ticket);
		req.showDeprecated = req.query.showDeprecated === 'true';

		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getTicketsInModel = (isFed) => async (req, res, next) => {
	const { teamspace, project, model } = req.params;

	try {
		const getTicketList = isFed ? getFedTicketList : getConTicketList;

		req.tickets = await getTicketList(teamspace, project, model, req.listOptions);

		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getTicketHistory = (isFed) => async (req, res, next) => {
	const { teamspace, project, model, ticket } = req.params;

	try {
		const getTicketHistoryById = isFed ? getFedTicketHistoryById : getConTicketHistoryById;
		req.history = await getTicketHistoryById(teamspace, project, model, ticket);

		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getTicketResource = (isFed) => async (req, res) => {
	const { teamspace, project, model, ticket, resource } = req.params;

	try {
		const getTicketResourceAsStream = isFed ? getFedTicketResourceAsStream : getConTicketResourceAsStream;

		const { readStream, size, mimeType } = await getTicketResourceAsStream(
			teamspace,
			project,
			model,
			ticket,
			resource,
		);

		writeStreamRespond(req, res, templates.ok, readStream, UUIDToString(resource), size, { mimeType });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateTicket = (isFed) => async (req, res) => {
	const {
		templateData: template,
		ticketData: oldTicket,
		params,
		body: updatedTicket,
	} = req;
	const { teamspace, project, model } = params;
	const user = getUserFromSession(req.session);

	try {
		const update = isFed ? updateFedTicket : updateConTicket;
		await update(teamspace, project, model, template, oldTicket, updatedTicket, user);

		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateManyTickets = (isFed) => async (req, res) => {
	const {
		templateData: template,
		ticketsData: oldTickets,
		params,
		body,
	} = req;
	const { teamspace, project, model } = params;
	const user = getUserFromSession(req.session);

	try {
		const update = isFed ? updateManyFedTickets : updateManyConTickets;
		await update(teamspace, project, model, template, oldTickets, body.tickets, user);

		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (isFed) => {
	const router = Router({ mergeParams: true });
	const hasReadAccess = isFed ? hasReadAccessToFederation : hasReadAccessToContainer;
	const hasCommenterAccess = isFed ? hasCommenterAccessToFederation : hasCommenterAccessToContainer;

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/templates:
	 *   get:
	 *     description: Get the the available ticket templates for this model
	 *     tags: [Tickets]
	 *     operationId: getModelTicketTemplates
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: showDeprecated
	 *         description: Indicate if the response should return deprecated schemas (default is false)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: boolean
	 *       - name: getDetails
	 *         description: Indicate if the response should return the templates in full details
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: boolean
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns an array of template names and ids
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
	 *                         format: uuid
	 *                         description: The ID of the template
	 *                         example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       name:
	 *                         type: string
	 *                         example: Risk
	 */
	router.get('/templates', hasReadAccess, getAllTemplates, serialiseTemplatesList);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/templates/{template}:
	 *   get:
	 *     description: Get the full definition of a template
	 *     tags: [Tickets]
	 *     operationId: getModelTicketTemplateDetails
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: template
	 *         description: Template ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: showDeprecated
	 *         description: Indicate if the response should return deprecated properties/modules (default is false)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: boolean
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns the definition of a template
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: "#/components/schemas/ticketTemplate"
	 */
	router.get('/templates/:template', hasReadAccess, templateExists, serialiseFullTicketTemplate);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/import:
	 *   post:
	 *     description: Import multiple existing tickets into the model
	 *     tags: [Tickets]
	 *     operationId: importTickets
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/ Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: template
	 *         description: Template ID
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: string
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                 tickets:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       title:
	 *                         type: string
	 *                         description: Title of the ticket
	 *                         example: Doorway too narrow
	 *                       properties:
	 *                         type: object
	 *                         description: properties within the ticket
	 *                         properties:
	 *                           Created at:
	 *                             type: number
	 *                             description: Timestamp of when this ticket was created
	 *                             example: 1712569456400
	 *                           Description:
	 *                             type: string
	 *                             description: A detailed description of the ticket
	 *                             example: The door way is too narrow for disable access
	 *                           CustomProperty1:
	 *                             type: string
	 *                             description: Any custom properties in the ticket should be filled in this way
	 *                             example: Data1
	 *                       modules:
	 *                         type: object
	 *                         description: modules within the ticket
	 *                         properties:
	 *                           Module1:
	 *                             type: object
	 *                             description: properties within Module1
	 *                             properties:
	 *                               Property1:
	 *                                 type: string
	 *                                 description: Any properties in the module should be filled in this way
	 *                                 example: Data1
	 *                       comments:
	 *                         type: array
	 *                         description: array of comments to import as part of the ticket
	 *                         items:
	 *                           type: object
	 *                           properties:
	 *                             message:
	 *                               type: string
	 *                               description: Content of the comment
	 *                               example: Example message
	 *                             originalAuthor:
	 *                               type: string
	 *                               description: Original author of the message
	 *                             createdAt:
	 *                               type: number
	 *                               description: When the original comment was created (in epoch timestamp)
	 *                             images:
	 *                               description: Images of the comment
	 *                               type: array
	 *                               items:
	 *                                 type: string
	 *                                 description: Image in a Base64 format or an ID of an image currently used in the comment
	 *                             view:
	 *                               $ref: "#components/schemas/ticketCommentView"
	 *
	 *
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: ticket has been successfully added, returns the ids of the newly created tickets
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 tickets:
	 *                   type: array
	 *                   items:
	 *                     type: string
	 *                     format: uuid
	 *                     example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 */
	router.post('/import', hasCommenterAccess, validateImportTickets, importTickets(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets:
	 *   post:
	 *     description: Create a ticket. The Schema of the payload depends on the ticket template being used
	 *     tags: [Tickets]
	 *     operationId: createTicket
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/ Federation ID
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
	 *                 type:
	 *                   type: string
	 *                   format: uuid
	 *                   description: Template id this ticket is based on
	 *                 title:
	 *                   type: string
	 *                   description: Title of the ticket
	 *                   example: Doorway too narrow
	 *                 properties:
	 *                   type: object
	 *                   description: properties within the ticket
	 *                   properties:
	 *                     Description:
	 *                       type: string
	 *                       description: A detailed description of the ticket
	 *                       example: The door way is too narrow for disable access
	 *                     CustomProperty1:
	 *                       type: string
	 *                       description: Any custom properties in the ticket should be filled in this way
	 *                       example: Data1
	 *                 modules:
	 *                   type: object
	 *                   description: modules within the ticket
	 *                   properties:
	 *                     Module1:
	 *                       type: object
	 *                       description: properties within Module1
	 *                       properties:
	 *                         Property1:
	 *                           type: string
	 *                           description: Any properties in the module should be filled in this way
	 *                           example: Data1
	 *
	 *
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: ticket has been successfully added, returns the id of the newly created ticket
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   format: uuid
	 *                   example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 */
	router.post('/', hasCommenterAccess, validateNewTicket, createTicket(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets:
	 *   get:
	 *     description: Get all tickets within the model
	 *     tags: [Tickets]
	 *     operationId: GetTicketList
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: updatedSince
	 *         description: Only return tickets that have been updated since a certain time (in epoch timestamp)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: number
	 *       - name: sortBy
	 *         description: Specify what property the tickets should be sorted by (default is created at)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: string
	 *       - name: sortDesc
	 *         description: Specify whether the tickets should be sorted in descending order (default is true)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: boolean
	 *       - name: filters
	 *         description: Comma separated string that defines extra properties to be included in the response
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: string
	 *       - name: query
	 *         description: Query string that defies tickets to be included in the response. More information here https://github.com/3drepo/3drepo.io/wiki/Custom-Ticket-Query-Filters
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: string
	 *       - name: skip
	 *         description: Skip the first x tickets to be returned
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: number
	 *       - name: limit
	 *         description: Limit the amount of tickets to be returned
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
	 *         description: returns an array of tickets
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 tickets:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     description: schema is subject to the template the ticket follows
	 *                     properties:
	 *                       _id:
	 *                         type: string
	 *                         format: uuid
	 *                         description: id of the ticket
	 *                         example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       type:
	 *                         type: string
	 *                         format: uuid
	 *                         description: template id
	 *                         example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       title:
	 *                         type: string
	 *                         description: ticket title
	 *                         example: "Missing door"
	 *                       number:
	 *                         type: number
	 *                         description: ticket number
	 *                         example: 1
	 *                       properties:
	 *                         type: object
	 *                         description: ticket properties
	 *                       modules:
	 *                         type: object
	 *                         description: ticket modules and their properties
	 *
	 */
	router.get('/', hasReadAccess, validateListSortAndFilter, validateQueryString, getTicketsInModel(isFed), serialiseTicketList);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets:
	 *   patch:
	 *     description: Update multiple tickets
	 *     tags: [Tickets]
	 *     operationId: updateManyTickets
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/ Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: template
	 *         description: Template ID
	 *         in: query
	 *         required: true
	 *         schema:
	 *           type: string
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                 tickets:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       _id:
	 *                         type: string
	 *                         description: id of the ticket
	 *                         format: uuid
	 *                         example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       title:
	 *                         type: string
	 *                         description: Title of the ticket
	 *                         example: Doorway too narrow
	 *                       properties:
	 *                         type: object
	 *                         description: properties within the ticket
	 *                         properties:
	 *                           Description:
	 *                             type: string
	 *                             description: A detailed description of the ticket
	 *                             example: The door way is too narrow for disable access
	 *                           CustomProperty1:
	 *                             type: string
	 *                             description: Any custom properties in the ticket should be filled in this way
	 *                             example: Data1
	 *                       modules:
	 *                         type: object
	 *                         description: modules within the ticket
	 *                         properties:
	 *                           Module1:
	 *                             type: object
	 *                             description: properties within Module1
	 *                             properties:
	 *                               Property1:
	 *                                 type: string
	 *                                 description: Any properties in the module should be filled in this way
	 *                                 example: Data1
	 *                       comments:
	 *                         type: array
	 *                         description: array of comments to import as part of the ticket
	 *                         items:
	 *                           type: object
	 *                           properties:
	 *                             message:
	 *                               type: string
	 *                               description: Content of the comment
	 *                               example: Example message
	 *                             originalAuthor:
	 *                               type: string
	 *                               description: Original author of the message
	 *                             createdAt:
	 *                               type: number
	 *                               description: When the original comment was created (in epoch timestamp)
	 *                             images:
	 *                               description: Images of the comment
	 *                               type: array
	 *                               items:
	 *                                 type: string
	 *                                 description: Image in a Base64 format or an ID of an image currently used in the comment
	 *                             view:
	 *                               $ref: "#components/schemas/ticketCommentView"
	 *
	 *
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: ticket has been successfully updated
	 */
	router.patch('/', hasCommenterAccess, validateUpdateMultipleTickets, updateManyTickets(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}:
	 *   get:
	 *     description: Get ticket by ID
	 *     tags: [Tickets]
	 *     operationId: GetTicket
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: ticket
	 *         description: Ticket ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: showDeprecated
	 *         description: Indicate if the response should return deprecated properties/modules (default is false)
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: boolean
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns the ticket as a json object
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               description: schema is subject to the template the ticket follows
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   format: uuid
	 *                   description: id of the ticket
	 *                   example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 type:
	 *                   type: string
	 *                   format: uuid
	 *                   description: template id
	 *                   example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 title:
	 *                   type: string
	 *                   description: ticket title
	 *                   example: Missing door
	 *                 number:
	 *                   type: number
	 *                   description: ticket number
	 *                   example: 1
	 *                 properties:
	 *                   type: object
	 *                   description: ticket properties
	 *                 modules:
	 *                   type: object
	 *                   description: ticket modules and their properties
	 *
	 */
	router.get('/:ticket', hasReadAccess, getTicket(isFed), serialiseTicket);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/history:
	 *   get:
	 *     description: Get ticket history by ID
	 *     tags: [Tickets]
	 *     operationId: GetTicketHistory
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: ticket
	 *         description: Ticket ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns the ticket as a json object
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 history:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       author:
	 *                         type: string
	 *                         description: user that made the change
	 *                         example: UserName1
	 *                       timestamp:
	 *                         type: number
	 *                         description: serialized date and time of when the change was made
	 *                         example: 1617187200000
	 *                       changes:
	 *                         type: object
	 *                         description: object that describes what was changed schema depends on the type of change and template of the ticket
	 *                         properties:
	 *                           properties:
	 *                             type: object
	 *                             description: properties that were changed
	 *
	 */
	router.get('/:ticket/history', hasReadAccess, getTicketHistory(isFed), serialiseTicketHistory);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/resources/{resource}:
	 *   get:
	 *     description: Get the binary resource associated with the given ticket
	 *     tags: [Tickets]
	 *     operationId: getTicketResource
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: ticket
	 *         description: Ticket ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: resource
	 *         description: Resource ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: downloads the binary file
	 *         content:
	 *           application/octet-stream:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/:ticket/resources/:resource', hasReadAccess, getTicketResource(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}:
	 *   patch:
	 *     description: Update a ticket. The Schema of the payload depends on the ticket template being used
	 *     tags: [Tickets]
	 *     operationId: updateTicket
	 *     parameters:
	 *       - name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: type
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: ticket
	 *         description: Ticket ID
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
	 *                 title:
	 *                   type: string
	 *                   description: Title of the ticket
	 *                   example: Doorway too narrow
	 *                 properties:
	 *                   type: object
	 *                   description: properties within the ticket
	 *                   properties:
	 *                     Description:
	 *                       type: string
	 *                       description: A detailed description of the ticket
	 *                       example: The door way is too narrow for disable access
	 *                     CustomProperty1:
	 *                       type: string
	 *                       description: Any custom properties in the ticket should be filled in this way
	 *                       example: Data1
	 *                 modules:
	 *                   type: object
	 *                   description: modules within the ticket
	 *                   properties:
	 *                     Module1:
	 *                       type: object
	 *                       description: properties within Module1
	 *                       properties:
	 *                         Property1:
	 *                           type: string
	 *                           description: Any properties in the module should be filled in this way
	 *                           example: Data1
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: ticket has been successfully updated
	 */
	router.patch('/:ticket', hasCommenterAccess, validateUpdateTicket, updateTicket(isFed));

	return router;
};

module.exports = establishRoutes;
