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
const { respond, writeCustomStreamRespond } = require('../../../../../utils/responder');
const DbConstants = require('../../../../../handler/db.constants');
const JSONAssets = require('../../../../../models/jsonAssets');
const { Router } = require('express');
const config = require('../../../../../utils/config');
const { modelTypes } = require('../../../../../models/modelSettings.constants');

const getHeaders = (cache = false) => {
	const headers = {};
	if (cache) {
		headers['Cache-Control'] = `private, max-age=${config.cachePolicy.maxAge}`;
	}
	return headers;
};

const getAssetMaps = (modelType) => async (req, res) => {
	const { teamspace, model, revision } = req.params;
	const branch = revision ? undefined : DbConstants.MASTER_BRANCH_NAME;

	try {
		switch (modelType) {
		case modelTypes.CONTAINER: {
			const { readStream } = await JSONAssets.getAllSuperMeshMappingForContainer(
				teamspace, model, branch, revision);
			const headers = getHeaders(revision);
			const mimeType = 'application/json';
			writeCustomStreamRespond(req, res, templates.ok, readStream, undefined, { mimeType }, headers);
			break;
		}
		case modelTypes.FEDERATION: {
			const { readStream } = await JSONAssets.getAllSuperMeshMappingForFederation(
				teamspace, model, branch, revision);
			const mimeType = 'application/json';
			writeCustomStreamRespond(req, res, templates.ok, readStream, undefined, { mimeType });
			break;
		}
		default: {
			respond(req, res, createResponseCode(templates.invalidArguments, 'Model type is not Container or Federation'));
			break;
		}
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
		 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/assetMaps/revision/{revision}:
		 *   get:
		 *     description: Get asset maps for the specified model and revision.
		 *     tags: [Models]
		 *     operationId: getAssetMaps
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
		 *         oneOf:
		 *           - $ref: "#/components/responses/notLoggedIn"
		 *           - $ref: "#/components/responses/notAuthorized"
		 *       404:
	 	 *         oneOf:
	 	 *           - $ref: "#/components/responses/teamspaceNotFound"
	 	 *           - $ref: "#/components/responses/projectNotFound"
	 	 *           - $ref: "#components/responses/containerNotFound"
	 	 *           - $ref: "#components/responses/revisionNotFound"
		 *       200:
		 *         description: Returns list of supermeshes and their attributes
		 *         content:
		 *           application/json
		 *             schema:
		 *               type: object
		 *               properties:
		 *                 model:
		 *                   type: string
		 *                   description: Model ID
		 *                   example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
		 *                 supermeshes:
		 *                   type: array
		 *                   items:
		 *                     type: object
		 *                     properties:
		 *                       id:
		 *                         type: string
		 *                         description: ID of the supermesh
		 *                         example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
		 *                       data:
		 *                         type: object
		 *                         description: data describing this supermesh
		 *                         properties:
		 *                           numberOfIDs:
		 *                             type: number
		 *                             description: number of IDs in this mapping
		 *                             example: 5000
		 *                           maxGeoCount:
		 *                             type: number
		 *                             description: number of maximum geometry
		 *                             example: 5000
		 *                           mapping:
		 *                             type: array
		 *                             description: Array containing the mapping of geometry to supermesh
		 *                             items:
		 *                               type: object
		 *                               properties:
		 *                                 name:
		 *                                   type: string
		 *                                   description: geometry ID
		 *                                   example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
		 *                                 sharedID:
		 *                                   type: string
		 *                                   description: shared ID
		 *                                   example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
		 *                                 min:
		 *                                  type: array
		 *                                  description: The minimum coordinates of the geometry (x,y,z)
		 *                                  items:
		 *                                    type: number
		 *                                    example: 23.45
		 *                                 max:
		 *                                  type: array
		 *                                  description: The maximum coordinates of the geometry (x,y,z)
		 *                                  items:
		 *                                    type: number
		 *                                    example: 23.45
		 *                                 usage:
		 *                                   type: string
		 *                                   description: ID of the supermesh using this geometry object.
		 *                                   example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
		 */
		router.get('/revision/:revision', hasReadAccessToModel[modelType], getAssetMaps(modelType));
	}

	if (modelType === modelTypes.CONTAINER || modelType === modelTypes.FEDERATION) {
		/**
		 * @openapi
		 * /teamspaces/{teamspace}/projects/{project}/{type}/{federation}/assetMaps/:
		 *   get:
		 *     description: Get asset maps for the specified model and revision.
		 *     tags: [Models]
		 *     operationId: getAssetMaps
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
		 *       - name: type:
		 *         description: Model type
		 *         in: path
		 *         required: true
		 *         type: string
		 *         enum: [containers, federations]
		 *       - name: model
		 *         description: Model ID
		 *         in: path
		 *         required: true
		 *         schema:
		 *           type: string
		 *     responses:
		 *       401:
		 *         oneOf:
		 *           - $ref: "#/components/responses/notLoggedIn"
		 *           - $ref: "#/components/responses/notAuthorized"
		 *       404:
	 	 *         oneOf:
	 	 *           - $ref: "#/components/responses/teamspaceNotFound"
	 	 *           - $ref: "#/components/responses/projectNotFound"
	 	 *           - $ref: "#components/responses/containerNotFound"
	 	 *           - $ref: "#components/responses/federationNotFound"
		 *       200:
		 *         description: Returns list of submodels with their supermeshes and attributes
		 *         content:
		 *           application/json
		 *             schema:
		 *               type: object:
		 *               properties:
		 *                 submodels:
		 *                   type: array
		 *                   description: Array of submodels in the federation
		 *                   items:
		 *                     type: object
		 *                     properties:
		 *                       model:
		 *                         type: string
		 *                         description: Model ID
		 *                         example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
		 *                       supermeshes:
		 *                         type: array
		 *                         items:
		 *                           type: object
		 *                           properties:
		 *                             id:
		 *                               type: string
		 *                               description: ID of the supermesh
		 *                               example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
		 *                             data:
		 *                               type: object
		 *                               description: data describing this supermesh
		 *                               properties:
		 *                                 numberOfIDs:
		 *                                   type: number
		 *                                   description: number of IDs in this mapping
		 *                                   example: 5000
		 *                                 maxGeoCount:
		 *                                   type: number
		 *                                   description: number of maximum geometry
		 *                                   example: 5000
		 *                                 mapping:
		 *                                   type: array
		 *                                   description: Array containing the mapping of geometry to supermesh
		 *                                   items:
		 *                                     type: object
		 *                                     properties:
		 *                                       name:
		 *                                         type: string
		 *                                         description: geometry ID
		 *                                         example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
		 *                                       sharedID:
		 *                                         type: string
		 *                                         description: shared ID
		 *                                         example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
		 *                                       min:
		 *                                        type: array
		 *                                        description: The minimum coordinates of the geometry (x,y,z)
		 *                                        items:
		 *                                          type: number
		 *                                          example: 23.45
		 *                                       max:
		 *                                        type: array
		 *                                        description: The maximum coordinates of the geometry (x,y,z)
		 *                                        items:
		 *                                          type: number
		 *                                          example: 23.45
		 *                                       usage:
		 *                                         type: string
		 *                                         description: ID of the supermesh using this geometry object.
		 *                                         example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
		 */
		router.get('/revision/master/head', hasReadAccessToModel[modelType], getAssetMaps(modelType));
	}

	return router;
};

module.exports = establishRoutes;
