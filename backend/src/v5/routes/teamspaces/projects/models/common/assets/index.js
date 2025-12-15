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
	getAssetProperties: getContainerAssetProperties,
	getTree: getContainerTree,
} = require('../../../../../../processors/teamspaces/projects/models/containers');
const {
	hasReadAccessToContainer,
	hasReadAccessToFederation,
} = require('../../../../../../middleware/permissions');
const { respond, writeStreamRespond } = require('../../../../../../utils/responder');
const MimeTypes = require('../../../../../../utils/helper/mimeTypes');
const { Router } = require('express');
const { getAccessibleContainers } = require('../../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/federations');
const {
	getAssetProperties: getFederationAssetProperties,
} = require('../../../../../../processors/teamspaces/projects/models/federations');
const { modelTypes } = require('../../../../../../models/modelSettings.constants');
const { templates } = require('../../../../../../utils/responseCodes');
const { verifyRevQueryParam } = require('../../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions');

const getTree = async (req, res) => {
	const { teamspace, container, revision } = req.params;

	try {
		const readStream = await getContainerTree(teamspace, container, revision);
		writeStreamRespond(req, res, templates.ok, readStream, undefined, undefined, { mimeType: MimeTypes.JSON });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getProperties = (modelType) => async (req, res) => {
	const { teamspace, revision } = req.params;
	try {
		const fn = modelType === modelTypes.CONTAINER ? getContainerAssetProperties
			: getFederationAssetProperties;
		const propStream = await fn(teamspace, req.params[modelType], revision, req.containers);
		writeStreamRespond(req, res, templates.ok, propStream, undefined, undefined, { mimeType: MimeTypes.JSON });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (modelType, isInternal) => {
	const router = Router({ mergeParams: true });

	const hasReadAccessToModel = {
		[modelTypes.CONTAINER]: hasReadAccessToContainer,
		[modelTypes.FEDERATION]: hasReadAccessToFederation,
	};

	if (isInternal) {
		// istanbul ignore next
		if (modelType === modelTypes.CONTAINER) {
			/**
            * @openapi
            * /teamspaces/{teamspace}/projects/{project}/containers/{container}/assets/tree:
            *   get:
            *     description: Returns the full tree for the container
            *     tags: [v:internal, Models]
            *     operationId: getTree
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
            *           format: uuid
            *       - name: container
            *         description: Container ID
            *         in: path
            *         required: true
            *         schema:
            *           type: string
            *           format: uuid
            *       - name: revId
            *         description: Revision ID
            *         in: query
            *         required: false
            *         schema:
            *           type: string
            *           format: uuid
            *     responses:
            *       401:
            *         $ref: "#/components/responses/notLoggedIn"
            *       200:
            *         description: returns the full tree for the container
            *         content:
            *           application/json:
            *             example:
            *               mainTree:
            *                 nodes:
            *                   account: "teamSpace1"
            *                   project: "3549ddf6-885d-4977-87f1-eeac43a0e818"
            *                   type: "transformation"
            *                   name: "RootNode"
            *                   path: "73a41cea-4c6b-47ed-936b-3f5641aecb52"
            *                   _id: "73a41cea-4c6b-47ed-936b-3f5641aecb52"
            *                   shared_id: "4dd46b6f-099e-42cd-b045-6460200e7995"
            *                   children:
            *                     - account: "teamSpace1"
            *                       project: "3549ddf6-885d-4977-87f1-eeac43a0e818"
            *                       type: "transformation"
            *                       name: "Foliiferous Tree H64_2"
            *                       path: "73a41cea-4c6b-47ed-936b-3f5641aecb52__33fe7c13-17a4-43d6-af03-ceae6880322f"
            *                       _id: "33fe7c13-17a4-43d6-af03-ceae6880322f"
            *                       shared_id: "b69a8384-c29d-4954-9efa-4c7bc14f1d3d"
            *                       children:
            *                         - account: "teamSpace1"
            *                           project: "3549ddf6-885d-4977-87f1-eeac43a0e818"
            *                           type: "mesh"
            *                           name: "Foliiferous Tree H64"
            *                           path: "73a41cea-4c6b-47ed-936b-3f5641aecb52__33fe7c13-17a4-43d6-af03-ceae6880322f__ce413e99-8469-4ed0-86e3-ff50bf4fed89"
            *                           _id: "ce413e99-8469-4ed0-86e3-ff50bf4fed89"
            *                           shared_id: "a876e59a-8cda-4d61-b438-c74ce7b8855d"
            *                           toggleState: "visible"
            *                       toggleState: "visible"
            *                   toggleState: "visible"
            *                 idToName:
            *                   ce413e99-8469-4ed0-86e3-ff50bf4fed89: "Foliiferous Tree H64"
            *                   33fe7c13-17a4-43d6-af03-ceae6880322f: "Foliiferous Tree H64_2"
            *                   73a41cea-4c6b-47ed-936b-3f5641aecb52: "RootNode"
            *               subTrees: []
            */
			router.get('/tree', hasReadAccessToModel[modelType], verifyRevQueryParam(modelType), getTree);
		}
	}

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{modelTypes}/{modelId}/assets/properties:
	 *   get:
	 *     description: Retrieves model properties for a given model or model federation. Optionally accepts a revision ID (`revId`). If `revId` is not provided, the latest revision is returned.
	 *     tags: [v:external, v:internal, Models]
	 *     operationId: getModelProperties
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
	 *         description: Model properties successfully retrieved
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 properties:
	 *                   type: object
	 *                   description: Top-level model properties
	 *                   properties:
	 *                     hiddenNodes:
	 *                       type: array
	 *                       items:
	 *                         type: string
	 *                       description: UUIDs of hidden nodes
	 *                 subModels:
	 *                   type: array
	 *                   description: Submodels included in the federation
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       account:
	 *                         type: string
	 *                         description: Teamspace name owning the submodel
	 *                       model:
	 *                         type: string
	 *                         description: UUID of the submodel
	 *                       hiddenNodes:
	 *                         type: array
	 *                         items:
	 *                           type: string
	 *                         description: Hidden node UUIDs for this submodel
	 *             examples:
	 *               example:
	 *                 summary: Example response
	 *                 value:
	 *                   properties:
	 *                     hiddenNodes:
	 *                       - "5a91e2e4-1d92-4e09-8d89-bf2c44d3db57"
	 *                   subModels:
	 *                     - account: "design-team-alpha"
	 *                       model: "d3b2c4a9-719b-49fe-a613-94decbbdb123"
	 *                       hiddenNodes:
	 *                         - "9f4b12aa-83c7-4e3c-b7ca-114faf78b912"
	 */
	router.get('/properties', hasReadAccessToModel[modelType], verifyRevQueryParam(modelType), getAccessibleContainers(modelType), getProperties(modelType));

	return router;
};

module.exports = establishRoutes;
