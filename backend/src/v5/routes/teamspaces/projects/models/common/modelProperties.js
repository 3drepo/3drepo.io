/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const { hasReadAccessToContainer, hasReadAccessToFederation } = require('../../../../../middleware/permissions/permissions');
const { respond, writeStreamRespond } = require('../../../../../utils/responder');
const DbConstants = require('../../../../../handler/db.constants');
const JSONAssets = require('../../../../../models/jsonAssets');
const { Router } = require('express');
const { modelTypes } = require('../../../../../models/modelSettings.constants');

const getModelProperties = (modelType) => async (req, res) => {
	const { teamspace, project, model, revision } = req.params;
	const { username } = req.session.user;
	const branch = revision ? undefined : DbConstants.MASTER_BRANCH_NAME;

	try {
		if (modelType === modelTypes.CONTAINER) {
			const { readStream, filename, size, mimeType } = await JSONAssets.getModelProperties(
				teamspace, project, model, branch, revision, username, false);
			writeStreamRespond(req, res, templates.ok, readStream, filename, size, { mimeType });
		} else {
			const { readStream, filename, size, mimeType } = await JSONAssets.getModelProperties(
				teamspace, project, model, branch, revision, username, true);
			writeStreamRespond(req, res, templates.ok, readStream, filename, size, { mimeType });
		}
	} catch (err) {
		respond(req, res, err);
	}
};

const establishRoutes = (modelType) => {
	const router = Router({ mergeParams: true });

	const hasReadAccessToModel = {
		[modelTypes.CONTAINER]: hasReadAccessToContainer,
		[modelTypes.FEDERATION]: hasReadAccessToFederation,
	};

	if (modelType === modelTypes.CONTAINER) {
		/**
		 * @openapi
		 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/modelProperties/revision/{revision}:
		 *   get:
		 *     description: Get model properties for the specified model and revision.
		 *     tags: [Models]
		 *     operationId: getModelProperties
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
		 *       - name: revision
		 *         description: Revision ID
		 *         in: path
		 *         required: true
		 *         schema:
		 *           type: string
		 *     responses:
		 *       401:
		 *         description: 401 Unauthorized
		 *         content:
         *           application/json:
         *             schema:
         *               oneOf:
         *                 - $ref: "#/components/responses/notLoggedIn"
         *                 - $ref: "#/components/responses/notAuthorized"
		 *       404:
		 *         description: 404 Not Found
		 *         content:
		 *           application/json:
		 *             schema:
	 	 *               oneOf:
	 	 *                 - $ref: "#/components/responses/teamspaceNotFound"
	 	 *                 - $ref: "#/components/responses/projectNotFound"
	 	 *                 - $ref: "#components/responses/containerNotFound"
	 	 *                 - $ref: "#/components/responses/revisionNotFound"
	 	 *                 - $ref: "#/components/responses/fileNotFound"
		 *       200:
		 *         description: Returns json file containing the properties of the specified container
		 *         content:
		 *           application/json:
		 *             schema:
		 *               type: object
		 *               properties:
		 *                 properties:
		 *                   type: object
		 *                   description: The json object containing the model properties
		 *                   example: { "hiddenNodes": [] }
		 */
		router.get('/revision/:revision', hasReadAccessToModel[modelType], getModelProperties(modelType));
	}

	if (modelType === modelTypes.CONTAINER || modelType === modelTypes.FEDERATION) {
		/**
		 * @openapi
		 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/modelProperties/revision/master/head:
		 *   get:
		 *     description: Get model properties for the specified model for the head revision
		 *     tags: [Models]
		 *     operationId: getModelProperties
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
		 *         description: Model ID
		 *         in: path
		 *         required: true
		 *         schema:
		 *           type: string
		 *     responses:
		 *       401:
		 *         description: 401 Unauthorized
		 *         content:
         *           application/json:
         *             schema:
         *               oneOf:
         *                 - $ref: "#/components/responses/notLoggedIn"
         *                 - $ref: "#/components/responses/notAuthorized"
		 *       404:
		 *         description: 404 Not Found
		 *         content:
		 *           application/json:
		 *             schema:
	 	 *               oneOf:
	 	 *                 - $ref: "#/components/responses/teamspaceNotFound"
	 	 *                 - $ref: "#/components/responses/projectNotFound"
	 	 *                 - $ref: "#components/responses/containerNotFound"
	 	 *                 - $ref: "#/components/responses/revisionNotFound"
	 	 *                 - $ref: "#/components/responses/fileNotFound"
		 *       200:
		 *         description: Returns json file containing the properties of the specified model.
		 */
		router.get('/revision/master/head', hasReadAccessToModel[modelType], getModelProperties(modelType));
	}

	return router;
};

module.exports = establishRoutes;
