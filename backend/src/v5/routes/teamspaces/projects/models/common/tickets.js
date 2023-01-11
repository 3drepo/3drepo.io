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
	addComment: addConTicketComment,
	deleteComment: deleteConTicketComment,
	getTicketById: getConTicketById,
	getCommentById: getConTicketComment,
	getCommentsByTicket: getConTicketComments,
	getTicketList: getConTicketList,
	getTicketResourceAsStream: getConTicketResourceAsStream,
	updateTicket: updateConTicket,
	updateComment: updateConTicketComment,
} = require('../../../../../processors/teamspaces/projects/models/containers');
const {
	addTicket: addFedTicket,
	addComment: addFedTicketComment,
	deleteComment: deleteFedTicketComment,
	getTicketById: getFedTicketById,
	getCommentById: getFedTicketComment,
	getCommentsByTicket: getFedTicketComments,
	getTicketList: getFedTicketList,
	getTicketResourceAsStream: getFedTicketResourceAsStream,
	updateTicket: updateFedTicket,
	updateComment: updateFedTicketComment,
} = require('../../../../../processors/teamspaces/projects/models/federations');
const { canUpdateComment, validateNewComment, validateUpdateComment } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.comments');
const { checkTicketExists, templateExists, validateNewTicket, validateUpdateTicket } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets');
const {
	hasCommenterAccessToContainer,
	hasCommenterAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToFederation,
} = require('../../../../../middleware/permissions/permissions');

const { respond, writeStreamRespond } = require('../../../../../utils/responder');
const { serialiseComment, serialiseCommentList } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets.comments');
const { serialiseFullTicketTemplate, serialiseTicket, serialiseTicketList } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets');
const { Router } = require('express');
const { UUIDToString } = require('../../../../../utils/helper/uuids');
const { getAllTemplates: getAllTemplatesInProject } = require('../../../../../processors/teamspaces/projects');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { templates } = require('../../../../../utils/responseCodes');

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

const getAllTemplates = async (req, res) => {
	const { teamspace, project } = req.params;
	const showDeprecated = req.query.showDeprecated === 'true';

	try {
		const data = await getAllTemplatesInProject(teamspace, project, showDeprecated);

		respond(req, res, templates.ok,
			{ templates: data.map(({ _id, ...rest }) => ({ _id: UUIDToString(_id), ...rest })) });
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
		req.tickets = await getTicketList(teamspace, project, model);
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

const getComment = (isFed) => async (req, res, next) => {
	const { params } = req;
	const { teamspace, project, model, ticket, comment } = params;

	try {
		const getCommentById = isFed ? getFedTicketComment : getConTicketComment;
		req.commentData = await getCommentById(teamspace, project, model, ticket, comment);
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getAllComments = (isFed) => async (req, res, next) => {
	const { params } = req;
	const { teamspace, project, model, ticket } = params;

	try {
		const getCommentsByTicket = isFed ? getFedTicketComments : getConTicketComments;
		const comments = await getCommentsByTicket(teamspace, project, model, ticket);
		req.comments = comments;
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const createComment = (isFed) => async (req, res) => {
	const { params, body: commentData } = req;
	const { teamspace, project, model, ticket } = params;
	const user = getUserFromSession(req.session);

	try {
		const createComm = isFed ? addFedTicketComment : addConTicketComment;
		const _id = await createComm(teamspace, project, model, ticket, commentData, user);
		respond(req, res, templates.ok, { _id: UUIDToString(_id) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateComment = (isFed) => async (req, res) => {
	const { params, body: updateData, commentData } = req;
	const { teamspace, project, model, ticket } = params;

	try {
		const updateComm = isFed ? updateFedTicketComment : updateConTicketComment;
		await updateComm(teamspace, project, model, ticket, commentData, updateData);

		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const deleteComment = (isFed) => async (req, res) => {
	const { params, commentData } = req;

	try {
		const deleteComm = isFed ? deleteFedTicketComment : deleteConTicketComment;
		await deleteComm(params.teamspace, commentData);

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
	router.get('/templates', hasReadAccess, getAllTemplates);

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
	router.get('/', hasReadAccess, getTicketsInModel(isFed), serialiseTicketList);

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

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/comments/{comment}:
	 *   get:
	 *     description: Get the details of a comment
	 *     tags: [Tickets]
	 *     operationId: getComment
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
	 *       - name: comment
	 *         description: Comment ID
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
	 *         description: comment have been successfully retrieved
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   format: uuid
	 *                   description: The ID of the comment
	 *                   example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 comment:
	 *                   type: string
	 *                   example: Example comment
	 *                   description: Content of the comment
	 *                 images:
	 *                   type: array
	 *                   description: The images of the comment
	 *                   items:
	 *                     type: string
	 *                     format: uuid
	 *                     description: The Id of the comment image
	 *                     example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 history:
	 *                   type: array
	 *                   description: The update history of the comment
	 *                   properties:
	 *                     timestamp:
	 *                       type: number
	 *                       example: 1632821119000
	 *                       description: Timestamp of the update
	 *                     comment:
	 *                       type: string
	 *                       example: Example comment
	 *                       description: The content of the comment
	 *                     images:
	 *                       type: array
	 *                       description: The images of the comment
	 *                       items:
	 *                         type: string
	 *                         format: uuid
	 *                         description: The Id of the comment image
	 *                         example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 deleted:
	 *                   type: boolean
	 *                   example: true
	 *                   description: Whether or not the comment is deleted
	 *                 author:
	 *                   type: string
	 *                   example: username1
	 *                   description: The username of the comment's author
	 *                 createdAt:
	 *                   type: number
	 *                   example: 1632821119000
	 *                   description: Timestamp of when the comment was created
	 *                 updatedAt:
	 *                   type: number
	 *                   example: 1632821119000
	 *                   description: Timestamp of when the comment was last updated
	 */
	router.get('/:ticket/comments/:comment', hasReadAccess, checkTicketExists, getComment(isFed), serialiseComment);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/comments:
	 *   get:
	 *     description: Get the comments of a ticket
	 *     tags: [Tickets]
	 *     operationId: getComments
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
	 *         description: comments have been successfully retrieved
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   _id:
	 *                     type: string
	 *                     format: uuid
	 *                     description: The ID of the comment
	 *                     example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                   deleted:
	 *                     type: boolean
	 *                     example: true
	 *                     description: Whether or not the comment is deleted
	 *                   author:
	 *                     type: string
	 *                     example: username1
	 *                     description: The username of the comment's author
	 *                   createdAt:
	 *                     type: number
	 *                     example: 1632821119000
	 *                     description: Timestamp of when the comment was created
	 *                   updatedAt:
	 *                     type: number
	 *                     example: 1632821119000
	 *                     description: Timestamp of when the comment was last updated
	 */
	router.get('/:ticket/comments', hasReadAccess, checkTicketExists, getAllComments(isFed), serialiseCommentList);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/comments:
	 *   post:
	 *     description: Create a ticket comment
	 *     tags: [Tickets]
	 *     operationId: createComment
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
	 *               comment:
	 *                 type: string
	 *                 description: Content of the comment
	 *                 example: Example comment
	 *               images:
	 *                 description: Images of the comment
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                   description: Image in a Base64 format
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: comment has been successfully created
	 */
	router.post('/:ticket/comments', hasCommenterAccess, checkTicketExists, validateNewComment, createComment(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/comments/{comment}:
	 *   put:
	 *     description: Update a ticket comment. The current images or comment are inserted into the history array of the comment
	 *     tags: [Tickets]
	 *     operationId: updateComment
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
	 *       - name: comment
	 *         description: Comment ID
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
	 *                 comment:
	 *                   type: string
	 *                   description: Content of the comment
	 *                   example: Example comment
	 *                 images:
	 *                   description: Images of the comment
	 *                   type: array
	 *                   items:
	 *                     type: string
	 *                     description: Image in a Base64 format or an ID of an image currently used in the comment
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: comment has been successfully updated
	 */
	router.put('/:ticket/comments/:comment', hasCommenterAccess, validateUpdateComment, updateComment(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/comments/{comment}:
	 *   delete:
	 *     description: Delete a ticket comment
	 *     tags: [Tickets]
	 *     operationId: deleteComment
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
	 *       - name: comment
	 *         description: Comment ID
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
	 *         description: comment has been successfully deleted
	 */
	router.delete('/:ticket/comments/:comment', hasCommenterAccess, canUpdateComment, deleteComment(isFed));

	return router;
};

module.exports = establishRoutes;
