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
	getGroups: getContainerGroups,
	importGroups: importContainerGroups,
} = require('../../../../../processors/teamspaces/projects/models/containers');

const {
	getGroups: getFedGroups,
	importGroups: importFedGroups,
} = require('../../../../../processors/teamspaces/projects/models/federations');

const {
	hasCommenterAccessToContainer,
	hasCommenterAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToFederation,
} = require('../../../../../middleware/permissions');

const { validateGroupsExportData, validateGroupsImportData } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/groups');
const { Router } = require('express');
const { respond } = require('../../../../../utils/responder');
const { serialiseGroupArray } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/groups');
const { templates } = require('../../../../../utils/responseCodes');

const hasReadAccessToModel = (isFed) => (isFed ? hasReadAccessToFederation : hasReadAccessToContainer);
const hasCommenterAccessToModel = (isFed) => (isFed ? hasCommenterAccessToFederation : hasCommenterAccessToContainer);

const exportGroups = (isFed) => async (req, res, next) => {
	const { teamspace, model } = req.params;
	const { groups: groupIds } = req.body;
	const fn = isFed ? getFedGroups : getContainerGroups;

	const groups = await fn(teamspace, model, groupIds);

	try {
		req.outputData = groups;
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const importGroups = (isFed) => async (req, res) => {
	const { teamspace, model } = req.params;
	const { groups } = req.body;

	const fn = isFed ? importFedGroups : importContainerGroups;

	try {
		await fn(teamspace, model, groups);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (isFed) => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/groups/export:
	 *   post:
	 *     description: Export a list of groups from the container/federation
	 *     tags: [v:external, Groups]
	 *     operationId: ExportModelGroups
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
	 *       200:
	 *         description: returns list of groups
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: "#/components/schemas/group"
	 *
	 */
	router.post('/export', hasReadAccessToModel(isFed), validateGroupsExportData, exportGroups(isFed), serialiseGroupArray);
	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/groups/import:
	 *   post:
	 *     description: Import a list of groups
	 *     tags: [v:external, Groups]
	 *     operationId: ImportModelGroups
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
	 *       200:
	 *         description: Imported successfully
	 *
	 */
	router.post('/import', hasCommenterAccessToModel(isFed), validateGroupsImportData, importGroups(isFed));

	return router;
};

module.exports = establishRoutes;
