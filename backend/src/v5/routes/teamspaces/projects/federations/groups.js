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

const { hasCommenterAccessToFederation, hasReadAccessToFederation } = require('../../../../middleware/permissions/permissions');
const { validateGroupsExportData, validateGroupsImportData } = require('../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/groups');
const Groups = require('../../../../processors/teamspaces/projects/models/federations');
const { Router } = require('express');
const { respond } = require('../../../../utils/responder');
const { serialiseGroupArray } = require('../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/groups');
const { templates } = require('../../../../utils/responseCodes');

const exportGroups = (req, res, next) => {
	const { teamspace, federation } = req.params;
	const { groups: groupIds } = req.body;
	Groups.getGroups(teamspace, federation, groupIds)
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
	const { teamspace, federation } = req.params;
	const { groups } = req.body;
	Groups.importGroups(teamspace, federation, groups)
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
	 * /teamspaces/{teamspace}/projects/{project}/federations/{federation}/groups/export:
	 *   post:
	 *     description: Export a list of groups from the federation
	 *     tags: [Federations]
	 *     operationId: ExportFederationGroups
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
	 *       - federation:
	 *         name: federation
	 *         description: Federation ID
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
	 *         $ref: "#/components/responses/federationsNotFound"
	 *       200:
	 *         description: returns list of federations
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: "#/components/schemas/group"
	 *     links:
	 *       importGroups:
	 *         operationId: ImportFederationGroups
	 *         requestBody:
	 *           groups: "$response.body#/groups"
	 *
	 */
	router.post('/export', hasReadAccessToFederation, validateGroupsExportData, exportGroups, serialiseGroupArray);
	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations/{federation}/groups/import:
	 *   post:
	 *     description: Import a list of groups into the federation
	 *     tags: [Federations]
	 *     operationId: ImportFederationGroups
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
	 *       - federation:
	 *         name: federation
	 *         description: Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
	 *     requestBody:
	 *       description: List of group ids to import
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
	 *         $ref: "#/components/responses/federationNotFound"
	 *       200:
	 *         description: Imported successfully
	 *
	 */
	router.post('/import', hasCommenterAccessToFederation, validateGroupsImportData, importGroups);

	return router;
};

module.exports = establishRoutes();
