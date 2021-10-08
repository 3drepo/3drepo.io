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

const { hasCommenterAccessToContainer, hasReadAccessToContainer } = require('../../../../middleware/permissions/permissions');
const { validateGroupsExportData, validateGroupsImportData } = require('../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/groups');
const Groups = require('../../../../processors/teamspaces/projects/models/containers');
const { Router } = require('express');
const { respond } = require('../../../../utils/responder');
const { serialiseGroupArray } = require('../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/groups');
const { templates } = require('../../../../utils/responseCodes');

const exportGroups = (req, res, next) => {
	const { teamspace, container } = req.params;
	const { groups: groupIds } = req.body;
	Groups.getGroups(teamspace, container, groupIds)
		.then((groups) => {
			req.outputData = groups;
			next();
		})
		.catch(
			// istanbul ignore next
			(err) => respond(req, res, err),
		);
};

const importGroups = (req, res) => {
	const { teamspace, container } = req.params;
	const { groups } = req.body;
	Groups.importGroups(teamspace, container, groups)
		.then(() => respond(req, res, templates.ok))
		.catch(
			// istanbul ignore next
			(err) => respond(req, res, err),
		);
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/groups/export:
	 *   post:
	 *     description: Export a list of groups from the container
	 *     tags: [Containers]
	 *     operationId: ExportContainerGroups
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
   	 *       - project:
	 *         name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
	 *       - container:
	 *         name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
	 *     requestBody:
	 *       description: List of group ids to export
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               groups:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                   format: uuid
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/containersNotFound"
	 *       200:
	 *         description: returns list of containers
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: "#/components/schemas/group"
	 *     links:
	 *       importGroups:
	 *         operationId: ImportContainerGroups
	 *         requestBody:
	 *           groups: "$response.body#/groups"
	 *
	 */
	router.post('/export', hasReadAccessToContainer, validateGroupsExportData, exportGroups, serialiseGroupArray);
	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/groups/import:
	 *   post:
	 *     description: Import a list of groups into the container
	 *     tags: [Containers]
	 *     operationId: ImportContainerGroups
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
	 *         description: Name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
   	 *       - project:
	 *         name: project
	 *         description: Project ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
	 *       - container:
	 *         name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
	 *     requestBody:
	 *       description: List of group ids to export
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: array
	 *             items:
	 *               type: object
	 *               properties:
	 *                 groups:
   	 *                   $ref: "#/components/schemas/group"
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/containerNotFound"
	 *       200:
	 *         description: Imported successfully
	 *
	 */
	router.post('/import', hasCommenterAccessToContainer, validateGroupsImportData, importGroups);

	return router;
};

module.exports = establishRoutes();
