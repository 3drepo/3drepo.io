/**
 *  Copyright (C) 2025 3D Repo Ltd
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
	hasReadAccessToContainer,
	hasReadAccessToFederation,
} = require('../../../../../../middleware/permissions');

const { Router } = require('express');
const { getAccessibleContainers } = require('../../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/federations');
const {
	getRepoBundleInfo: getContainerBundleInfo,
} = require('../../../../../../processors/teamspaces/projects/models/containers');
const {
	getRepoBundleInfo: getFederationBundleInfo,
} = require('../../../../../../processors/teamspaces/projects/models/federations');

const { modelTypes } = require('../../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../../utils/responder');
const { templates } = require('../../../../../../utils/responseCodes');
const { verifyRevQueryParam } = require('../../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions');

const getRepoBundleInfo = (modelType) => async (req, res) => {
	const { teamspace, revision } = req.params;
	try {
		const fn = modelType === modelTypes.CONTAINER ? getContainerBundleInfo
			: getFederationBundleInfo;
		const assetList = await fn(teamspace, req.params[modelType], revision, req.containers);
		respond(req, res, templates.ok, assetList);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (modelType) => {
	const router = Router({ mergeParams: true });

	const hasReadAccessToModel = {
		[modelTypes.CONTAINER]: hasReadAccessToContainer,
		[modelTypes.FEDERATION]: hasReadAccessToFederation,
	};

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{modelTypes}/{modelId}/assets/bundles:
	 *   get:
	 *     description: Retrieves repobundle information for a given model or model federation. Optionally accepts a revision ID (`revId`). If `revId` is not provided, the latest revision is returned.
	 *     tags: [v:external, v:internal, Models]
	 *     operationId: getRepoAssets
	 *     parameters:
	 *       - name: teamspace
	 *         description: Teamspace identifier (e.g., "design-team-alpha")
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Project identifier (e.g., "office-tower-2025")
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: modelTypes
	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [federation, container]
	 *       - name: modelId
	 *         description: UUID of the model (e.g., "8f1c1a9e-52ab-4c8e-9f87-3b75e8c0b4de")
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: revId
	 *         description: Optional revision ID (e.g., "rev-42f81c")
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: string
	 *     responses:
	 *       200:
	 *         description: Returns the asset information
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 models:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       assets:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                           example: "b6a4e820-1dfb-4ef4-9b73-1f3b7f8c12a4"
	 *                       database:
	 *                         type: string
	 *                         example: "ProdEnvWorkspace"
	 *                       model:
	 *                         type: string
	 *                         example: "f41d91c3-7ad1-40ca-9e1c-a83b29fd3e11"
	 *                       jsonFiles:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                           example: "bb779fe3-146e-4809-8c71-8a1d7f3af11b"
	 *                       offset:
	 *                         type: array
	 *                         items:
	 *                           type: number
	 *                         example: [1250.44, -934.11, 8765.92]
	 *                       metadata:
	 *                         type: array
	 *                         items:
	 *                           type: object
	 *                           properties:
	 *                             numVertices:
	 *                               type: integer
	 *                               example: 48235
	 *                             numFaces:
	 *                               type: integer
	 *                               example: 60214
	 *                             numUVChannels:
	 *                               type: integer
	 *                               example: 2
	 *                             primitive:
	 *                               type: integer
	 *                               example: 3
	 *                             min:
	 *                               type: object
	 *                               properties:
	 *                                 x: { type: number, example: -1225.88 }
	 *                                 y: { type: number, example: 44.2 }
	 *                                 z: { type: number, example: -7750.33 }
	 *                             max:
	 *                               type: object
	 *                               properties:
	 *                                 x: { type: number, example: 8122.5 }
	 *                                 y: { type: number, example: 9544.1 }
	 *                                 z: { type: number, example: 1240.66 }
	 */
	router.get('/', hasReadAccessToModel[modelType], verifyRevQueryParam(modelType), getAccessibleContainers(modelType), getRepoBundleInfo(modelType));

	return router;
};

module.exports = establishRoutes;
