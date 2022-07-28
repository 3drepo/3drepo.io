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
const { UUIDToString } = require('../../../../utils/helper/uuids');
const { checkTicketTemplateExists } = require('../../../../middleware/dataConverter/inputs/teamspaces/settings');
const { getAllTemplates: getAllTemplatesInProject } = require('../../../../processors/teamspaces/projects');
const { hasReadAccessToContainer } = require('../../../../middleware/permissions/permissions');
const { respond } = require('../../../../utils/responder');
const { templates } = require('../../../../utils/responseCodes');

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

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/tickets/templates:
	 *   get:
	 *     description: Get the the available ticket templates for this container
	 *     tags: [Containers]
	 *     operationId: getContainerTicketTemplates
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
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
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
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   _id:
	 *                     type: string
	 *                     format: uuid
	 *                   name:
	 *                     type: string
	 *                     example: Risk
	 */
	router.get('/templates', hasReadAccessToContainer, getAllTemplates);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/tickets/templates/{template}:
	 *   get:
	 *     description: Get the full definition of a template
	 *     tags: [Containers]
	 *     operationId: getTicketTemplateDetails
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
	 *       - name: container
	 *         description: Container ID
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
	router.get('/templates/:template', hasReadAccessToContainer, checkTicketTemplateExists);

	return router;
};

module.exports = establishRoutes();
