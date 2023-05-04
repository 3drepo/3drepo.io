/**
 *  Copyright (C) 2023 3D Repo Ltd
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
	getTicketGroupById: getConGroup,
	updateTicketGroup: updateConGroup,
} = require('../../../../../processors/teamspaces/projects/models/containers');
const {
	getTicketGroupById: getFedGroup,
	updateTicketGroup: updateFedGroup,
} = require('../../../../../processors/teamspaces/projects/models/federations');
// const { canUpdateGroup, validateNewGroup, validateUpdateGroup } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.groups');
const {
	hasCommenterAccessToContainer,
	hasCommenterAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToFederation,
} = require('../../../../../middleware/permissions/permissions');

const { Router } = require('express');
const { checkTicketExists } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets');
const { respond } = require('../../../../../utils/responder');
const { serialiseGroup } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets.groups');
const { templates } = require('../../../../../utils/responseCodes');

const getGroup = (isFed) => async (req, res, next) => {
	const { params, query } = req;
	const { teamspace, project, model, ticket, group } = params;

	try {
		const getGroupById = isFed ? getFedGroup : getConGroup;
		req.groupData = await getGroupById(teamspace, project, model, query.revId, ticket, group);
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateGroup = (isFed) => async (req, res) => {
	const { params, body: updateData, groupData } = req;
	const { teamspace, project, model, ticket } = params;

	try {
		const updateComm = isFed ? updateFedGroup : updateConGroup;
		await updateComm(teamspace, project, model, ticket, groupData, updateData);

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
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/groups/{group}:
	 *   get:
	 *     description: Get the details of a group associated to a ticket
	 *     tags: [Tickets]
	 *     operationId: getGroup
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
	 *       - name: group
	 *         description: Group ID
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
	 *         description: Details of a group
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   groups:
   	 *                     $ref: "#/components/schemas/ticketGroup"
	 */
	router.get('/:group', hasReadAccess, checkTicketExists, getGroup(isFed), serialiseGroup);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/groups/{group}:
	 *   put:
	 *     description: Update a ticket group. The current images or group are inserted into the history array of the group
	 *     tags: [Tickets]
	 *     operationId: updateGroup
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
	 *       - name: group
	 *         description: Group ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: revId
	 *         description: Revision ID to get objects. By default it will query base on the latest revision
	 *         in: query
	 *         schema:
	 *           type: string
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                 message:
	 *                   type: string
	 *                   description: Content of the group
	 *                   example: Example message
	 *                 images:
	 *                   description: Images of the group
	 *                   type: array
	 *                   items:
	 *                     type: string
	 *                     description: Image in a Base64 format or an ID of an image currently used in the group
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: group has been successfully updated
	 */
	//	router.put('/:group', hasCommenterAccess, validateUpdateGroup, updateGroup(isFed));
	return router;
};

module.exports = establishRoutes;
