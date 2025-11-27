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
const {
	hasCommenterAccessToContainer,
	hasCommenterAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToFederation,
} = require('../../../../../middleware/permissions');

const { Router } = require('express');
const { checkTicketExists } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { respond } = require('../../../../../utils/responder');
const { serialiseGroup } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/tickets.groups');
const { stringToUUID } = require('../../../../../utils/helper/uuids');
const { templates } = require('../../../../../utils/responseCodes');
const { validateUpdateGroup } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.groups');

const getGroup = (isFed) => async (req, res, next) => {
	const { params, query } = req;
	const { teamspace, project, model, ticket, group } = params;

	try {
		const convertToMeshIds = query.convertIds !== 'false';
		const getGroupById = isFed ? getFedGroup : getConGroup;
		req.groupData = await getGroupById(teamspace, project, model, stringToUUID(query.revId), ticket, group,
			convertToMeshIds);
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateGroup = (isFed) => async (req, res) => {
	const { params, body: updateData } = req;
	const { teamspace, project, model, ticket, group } = params;
	const user = getUserFromSession(req.session);

	try {
		const updateFn = isFed ? updateFedGroup : updateConGroup;
		await updateFn(teamspace, project, model, ticket, group, updateData, user);

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
	 *     tags: [v:external, Tickets]
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
	 *       - name: revId
	 *         description: Revision ID to get objects. By default it will query base on the latest revision
	 *         in: query
	 *         schema:
	 *           type: string
	 *       - name: convertIds
	 *         description: Flag to define whether object Ids should be converted to mesh Ids or returned as external Ids
	 *         in: query
	 *         schema:
	 *           type: boolean
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
   	 *               $ref: "#/components/schemas/ticketGroup"
	 */
	router.get('/:group', hasReadAccess, checkTicketExists, getGroup(isFed), serialiseGroup);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/tickets/{ticket}/groups/{group}:
	 *   patch:
	 *     description: Update a group
	 *     tags: [v:external, Tickets]
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
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
   	 *             $ref: "#/components/schemas/ticketGroup"
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: group has been successfully updated
	 */
	router.patch('/:group', hasCommenterAccess, checkTicketExists, validateUpdateGroup, updateGroup(isFed));
	return router;
};

module.exports = establishRoutes;
