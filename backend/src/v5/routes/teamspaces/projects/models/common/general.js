/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { formatModelSettings, formatModelStats } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/modelSettings');
const {
	hasAccessToTeamspace,
	hasAdminAccessToContainer,
	hasAdminAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToFederation,
	isAdminToProject,
} = require('../../../../../middleware/permissions/permissions');
const { validateAddModelData, validateUpdateSettingsData } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings');
const Containers = require('../../../../../processors/teamspaces/projects/models/containers');
const Federations = require('../../../../../processors/teamspaces/projects/models/federations');
const { Router } = require('express');
const { canDeleteContainer } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/containers');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { respond } = require('../../../../../utils/responder');

const addModel = (isFed) => async (req, res) => {
	const { teamspace, project } = req.params;
	try {
		const fn = isFed ? Federations.addFederation : Containers.addContainer;
		const modelId = await fn(teamspace, project, req.body);
		respond(req, res, templates.ok, { _id: modelId });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const deleteModel = (isFed) => async (req, res) => {
	const { teamspace, project, model } = req.params;
	try {
		const fn = isFed ? Federations.deleteFederation : Containers.deleteContainer;
		await fn(teamspace, project, model);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getModelList = (isFed) => async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;

	try {
		const fn = isFed ? Federations.getFederationList : Containers.getContainerList;
		const models = await fn(teamspace, project, user);
		respond(req, res, templates.ok, { [`${isFed ? 'federations' : 'containers'}`]: models });
	} catch (err) {
		respond(req, res, err);
	}
};

const appendFavourites = (isFed) => async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	const favouritesToAdd = req.body[isFed ? 'federations' : 'containers'];

	try {
		const { appendFavourites: fn } = isFed ? Federations : Containers;
		await fn(user, teamspace, project, favouritesToAdd);
		respond(req, res, templates.ok);
	} catch (err) {
		respond(req, res, err);
	}
};

const deleteFavourites = (isFed) => async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	try {
		const { deleteFavourites: fn } = isFed ? Federations : Containers;
		if (req.query.ids?.length) {
			const favouritesToRemove = req.query.ids.split(',');

			await fn(user, teamspace, project, favouritesToRemove);
			respond(req, res, templates.ok);
		} else {
			respond(req, res, createResponseCode(templates.invalidArguments, 'ids must be provided as part fo the query string'));
		}
	} catch (err) {
		respond(req, res, err);
	}
};

const getModelStats = (isFed) => async (req, res, next) => {
	const { teamspace, project, model } = req.params;
	try {
		const fn = isFed
			? () => Federations.getFederationStats(teamspace, project, model)
			: () => Containers.getContainerStats(teamspace, model);

		const stats = await fn();
		req.outputData = stats;
		await next();
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const updateModelSettings = (isFed) => async (req, res) => {
	const { teamspace, project, model } = req.params;
	try {
		const { updateSettings: fn } = isFed ? Federations : Containers;
		await fn(teamspace, project, model, req.body);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getModelSettings = (isFed) => async (req, res, next) => {
	const { teamspace, model } = req.params;
	try {
		const { getSettings: fn } = isFed ? Federations : Containers;
		const settings = await fn(teamspace, model);
		req.outputData = settings;
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (isFed) => {
	const router = Router({ mergeParams: true });
	const hasAdminAccessToModel = isFed ? hasAdminAccessToFederation : hasAdminAccessToContainer;
	const hasReadAccessToModel = isFed ? hasReadAccessToFederation : hasReadAccessToContainer;
	const canDeleteModel = isFed ? async (req, res, next) => { await next(); } : canDeleteContainer;
	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}:
	 *   post:
	 *     description: Add a new model to the specified project the user is admin of
	 *     tags: [Models]
	 *     operationId: addModel
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
	 *     requestBody:
	 *       content:
   	 *         application/json:
   	 *           schema:
	 *             type: object
	 *             required:
	 *               - name
	 *               - unit
	 *               - type
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 example: Lego House Architecture
	 *                 description: Name of the model - this has to be unique within the project
	 *                 maxLength: 120
	 *               unit:
	 *                 type: string
	 *                 enum: [mm, cm, dm, m, ft]
	 *                 example: mm
	 *                 description: Unit of measurement
	 *               desc:
	 *                 type: string
	 *                 example: The Architecture model of the Lego House
	 *                 description: Model description
	 *                 maxLength: 50
	 *               code:
	 *                 type: string
	 *                 example: LEGO_ARCHIT_001
	 *                 description: Model reference code
	 *               type:
	 *                 type: string
	 *                 example: Architecture
	 *                 description: Model type
	 *               surveyPoints:
	 *                 type: array
	 *                 description: Survey points for model location
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     position:
	 *                       description: The point coordinate that maps to the latLong value (should be in OpenGL axis conventions)
	 *                       type: array
	 *                       items:
	 *                         type: number
	 *                         example: 23.45
	 *                         minItems: 3
	 *                         maxItems: 3
	 *                     latLong:
	 *                       type: array
	 *                       description: 'The latitude and longitude of the survey point'
	 *                       items:
	 *                         type: number
	 *                         example: 23.45
	 *                         minItems: 2
	 *                         maxItems: 2
	 *               angleFromNorth:
	 *                 type: integer
	 *                 example: 100
	 *                 description: Angle from North in degrees
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/projectNotFound"
	 *       200:
	 *         description: Model ID
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   format: uuid
	 *                   description: Model ID
	 *                   example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 */
	router.post('/', isAdminToProject, validateAddModelData(isFed), addModel(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}:
	 *   get:
	 *     description: Get a list of models within the specified project the user has access to
	 *     tags: [Models]
	 *     operationId: getModelList
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
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/containerNotFound"
	 *       200:
	 *         description: returns list of models
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
	 *                       id:
	 *                         type: string
	 *                         description: Model ID
	 *                         example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
	 *                       name:
	 *                         type: string
	 *                         description: name of the model
	 *                         example: Complete structure
	 *                       role:
	 *                         $ref: "#/components/schemas/roles"
	 *                       isFavourite:
	 *                         type: boolean
	 *                         description: whether the model is a favourited item for the user
	 *
	 *
	 */
	router.get('/', hasAccessToTeamspace, getModelList(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/favourites:
	 *   patch:
	 *     description: Add models to the user's favourites list
	 *     tags: [Models]
	 *     operationId: appendModels
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: ID of project
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
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               models:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                   format: uuid
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: adds the models found in the request body to the user's favourites list
	 */
	router.patch('/favourites', hasAccessToTeamspace, appendFavourites(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/favourites:
	 *   delete:
	 *     description: Remove models from the user's favourites list
	 *     tags: [Models]
	 *     operationId: deleteModels
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: ID of project
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
	 *       - name: ids
	 *         description: list of model ids to remove (comma separated)
	 *         in: query
	 *         schema:
	 *           type: string
	 *         example: a54e8776-da7c-11ec-9d64-0242ac120002,aaa1ffaa-da7c-11ec-9d64-0242ac120002
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: removes the models found in the request body from the user's favourites list
	 */
	router.delete('/favourites', hasAccessToTeamspace, deleteFavourites(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/stats:
	 *   get:
	 *     description: Get the statistics and general information about a model
	 *     tags: [Models]
	 *     operationId: getModelStats
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
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns the statistics of a model
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 code:
	 *                   type: string
	 *                   description: Model code
	 *                   example: STR-01
     *                 status:
	 *                   type: string
	 *                   description: Current status of the model
	 *                   example: ok
   	 *                 containers:
	 *                   type: array
	 *                   description: The IDs of the models the model consists of
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       _id:
	 *                         description: container id
	 *                         type: string
	 *                         format: uuid
	 *                       group:
	 *                         description: federation group the container is under (optional)
	 *                         type: string
	 *                         example: Architectural
	 *                 tickets:
	 *                   type: object
	 *                   properties:
	 *                     issues:
	 *                       type: integer
	 *                       description: The number of non closed issues of the model
	 *                     risks:
	 *                       type: integer
	 *                       description: The number of unmitigated risks of the model
     *                 desc:
	 *                   type: string
	 *                   description: Model description
	 *                   example: Floor 1 MEP with Facade
     *                 lastUpdated:
	 *                   type: integer
	 *                   description: Timestamp(ms) of when any of the submodels was updated
	 *                   example: 1630598072000
	 */
	router.get('/:model/stats', hasReadAccessToModel, getModelStats(isFed), formatModelStats(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}:
	 *   delete:
	 *     description: Delete model from project the user is admin of
	 *     tags: [Models]
	 *     operationId: deleteModel
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
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/containerNotFound"
	 *       200:
	 *         description: Model removed.
	 */
	router.delete('/:model', hasAdminAccessToModel, canDeleteModel, deleteModel(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}:
	 *   patch:
	 *     description: Updates the settings of a model
	 *     tags: [Models]
	 *     operationId: updateModelSettings
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: ID of project
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
	 *         description: ID of model
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 example: model1
	 *               desc:
	 *                 type: string
	 *                 example: description1
	 *               surveyPoints:
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     position:
	 *                       type: array
	 *                       items:
	 *                         type: number
	 *                         example: 23.45
	 *                     latLong:
	 *                       type: array
	 *                       items:
	 *                         type: number
	 *                         example: 23.45
	 *               angleFromNorth:
	 *                 type: integer
	 *                 example: 100
	 *               unit:
	 *                 type: string
	 *                 enum: [mm, cm, dm, m, ft]
	 *                 example: mm
	 *               defaultView:
	 *                 type: string
	 *                 format: uuid
	 *                 example: '374bb150-065f-11ec-8edf-ab0f7cc84da8'
	 *               defaultLegend:
	 *                 type: string
	 *                 format: uuid
	 *                 example: '374bb150-065f-11ec-8edf-ab0f7cc84da8'
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: updates the settings of the model
	 */
	router.patch('/:model', hasAdminAccessToModel, validateUpdateSettingsData(isFed), updateModelSettings(isFed));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}:
	 *   get:
	 *     description: Get the model settings of model
	 *     tags: [Models]
	 *     operationId: getModelSettings
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
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns the model settings of a model
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: "#/components/schemas/modelSettings"
	 */
	router.get('/:model', hasReadAccessToModel, getModelSettings(isFed), formatModelSettings);
	return router;
};

module.exports = establishRoutes;
