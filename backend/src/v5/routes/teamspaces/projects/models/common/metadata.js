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

const { hasReadAccessToContainer, hasReadAccessToFederation } = require('../../../../../middleware/permissions/permissions');
const DbConstants = require('../../../../../handler/db.constants');
const { Router } = require('express');
const Scene = require('../../../../../models/scenes');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');

const getAssetsMeta = (modelType) => async (req, res) => {
	const { teamspace, project, model, rev } = req.params;
	const username = req.session.user;
	const branch = rev ? undefined : DbConstants.MASTER_BRANCH_NAME;

	try {
		if (modelType === modelTypes.CONTAINER) {
			const obj = await Scene.getContainerMeshInfo(teamspace, model, branch, rev);
			respond(req, res, templates.ok, obj);
		} else {
			const obj = await Scene.getFederationMeshInfo(teamspace, project, model, branch, rev, username);
			respond(req, res, templates.ok, obj);
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
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/assetsMeta/revision/{revision}:
	 *   get:
	 *     description: Get asset metadata on the specified model and revision.
	 *     tags: [Metadata]
	 *     operationId: getAssetsMeta
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
	 *                 - $ref: "#/components/responses/containerNotFound"
	 *                 - $ref: "#/components/responses/revisionNotFound"
	 *       200:
	 *         description: Returns list of submodels
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 subModels:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       teamspace:
	 *                         type: string
	 *                         description: teamspace
	 *                         example: teamspace1
	 *                       model:
	 *                         type: string
	 *                         description: Model ID
	 *                         example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
	 *                       superMeshes:
	 *                         type: object
	 *                         properties:
	 *                           superMeshes:
	 *                             type: array
	 *                             items:
	 *                               type: object
	 *                               properties:
	 *                                 _id:
	 *                                   type: string
	 *                                   description: superMesh ID
	 *                                   example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
	 *                                 nVertices:
	 *                                   type: number
	 *                                   description: number of vertices in the superMesh
	 *                                   example: 811871
	 *                                 nFaces:
	 *                                   type: number
	 *                                   description: number of faces in the superMesh
	 *                                   example: 1085576
	 *                                 nUVChannels:
	 *                                   type: number
	 *                                   description: number of UV Channels in the superMesh
	 *                                   example: 1
	 *                                 primitive:
	 *                                   type: number
	 *                                   description: the primitive type of the superMesh
	 *                                   example: 3
	 *                                 min:
	 *                                   type: array
	 *                                   items:
	 *                                     type: number
	 *                                     example: 23.45
	 *                                   description: The minimum coordinates of the superMesh (x,y,z)
	 *                                 max:
	 *                                   type: array
	 *                                   items:
	 *                                     type: number
	 *                                     example: 23.45
	 *                                   description: The maximum coordinates of the superMesh (x,y,z)
	 *
	 */
		router.get('/revision/:rev', hasReadAccessToModel[modelType], getAssetsMeta(modelType));
	}

	if (modelType === modelTypes.CONTAINER || modelType === modelTypes.FEDERATION) {
	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/assetsMeta/revision/master/head:
	 *   get:
	 *     description: Get asset metadata on the specified model for the most current revision.
	 *     tags: [Metadata]
	 *     operationId: getAssetsMeta
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
	 *         description: Model Type
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
	 *                 - $ref: "#/components/responses/containerNotFound"
	 *                 - $ref: "#/components/responses/federationNotFound"
	 *       200:
	 *         description: Returns list of submodels
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 subModels:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       teamspace:
	 *                         type: string
	 *                         description: teamspace
	 *                         example: teamspace1
	 *                       model:
	 *                         type: string
	 *                         description: Model ID
	 *                         example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
	 *                       superMeshes:
	 *                         type: object
	 *                         properties:
	 *                           superMeshes:
	 *                             type: array
	 *                             items:
	 *                               type: object
	 *                               properties:
	 *                                 _id:
	 *                                   type: string
	 *                                   description: superMesh ID
	 *                                   example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
	 *                                 nVertices:
	 *                                   type: number
	 *                                   description: number of vertices in the superMesh
	 *                                   example: 811871
	 *                                 nFaces:
	 *                                   type: number
	 *                                   description: number of faces in the superMesh
	 *                                   example: 1085576
	 *                                 nUVChannels:
	 *                                   type: number
	 *                                   description: number of UV Channels in the superMesh
	 *                                   example: 1
	 *                                 primitive:
	 *                                   type: number
	 *                                   description: the primitive type of the superMesh
	 *                                   example: 3
	 *                                 min:
	 *                                   type: array
	 *                                   items:
	 *                                     type: number
	 *                                     example: 23.45
	 *                                   description: The minimum coordinates of the superMesh (x,y,z)
	 *                                 max:
	 *                                   type: array
	 *                                   items:
	 *                                     type: number
	 *                                     example: 23.45
	 *                                   description: The maximum coordinates of the superMesh (x,y,z)
	 */
		router.get('/revision/master/head', hasReadAccessToModel[modelType], getAssetsMeta(modelType));
	}

	return router;
};

module.exports = establishRoutes;
