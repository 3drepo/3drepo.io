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
const UnityAssets = require('../../../../../models/unityAssets');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');

const getRepoAssets = (modelType) => async (req, res) => {
	const { teamspace, project, model } = req.params;
	const { username } = req.session.user;

	try {
		if (modelType === modelTypes.CONTAINER) {
			const { revision } = req.query;
			const branch = revision ? undefined : DbConstants.MASTER_BRANCH_NAME;

			const obj = await UnityAssets.getAssetListForCont(teamspace, model, branch, revision);
			respond(req, res, templates.ok, obj);
		} else {
			const branch = DbConstants.MASTER_BRANCH_NAME;

			const obj = await UnityAssets.getAssetListForFed(teamspace, project, model, branch, undefined, username);
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

	if (modelType === modelTypes.CONTAINER || modelType === modelTypes.FEDERATION) {
		/**
		 * @openapi
		 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/assets/properties:
		 *   get:
		 *     description: Get list of repo assets for the specified model for the head revision or a specific revision
		 *     tags: [Models]
		 *     operationId: getRepoAssets
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
		 *         description: Revision ID
		 *         in: query
		 *         required: false
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
		 *         description: Returns json file containing the list of assets associated with this container and revision
		 *         content:
		 *           application/json:
		 *             schema:
		 *               type: object
		 *               properties:
		 *                 models:
		 *                   type: array
		 *                   description: Array of submodels and their assets
		 *                   items:
		 *                     type: object
		 *                     properties:
		 *                       _id:
		 *                         type: string
		 *                         description: the ID of the revision
		 *                       assets:
		 *                         type: array
		 *                         description: Array of asset bundles associated with this revision
		 *                         items:
		 *                           type: string
		 *                           description: the path of the asset bundle
		 *                       database:
		 *                         type: string
		 *                         description: teamspace name
		 *                       model:
		 *                         type: string
		 *                         description: model ID
		 *                       offset:
		 *                         type: array
		 *                         description: offset of the asset bundle
		 *                         items:
		 *                           type: number
		 *                       jsonFiles:
		 *                         type: array
		 *                         description: Array of json files containing the asset bundles.
		 *                         items:
		 *                           type: string
		 *                           description: the path of the json file.
		 */
		router.get('/', hasReadAccessToModel[modelType], getRepoAssets(modelType));
	}

	return router;
};

module.exports = establishRoutes;
