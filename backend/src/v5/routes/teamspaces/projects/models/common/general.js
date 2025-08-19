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
	hasAdminAccessToDrawing,
	hasAdminAccessToFederation,
	hasReadAccessToContainer,
	hasReadAccessToDrawing,
	hasReadAccessToFederation,
	isAdminToProject,
} = require('../../../../../middleware/permissions');
const { respond, writeStreamRespond } = require('../../../../../utils/responder');
const { validateAddModelData, validateUpdateSettingsData } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings');
const Containers = require('../../../../../processors/teamspaces/projects/models/containers');
const Drawings = require('../../../../../processors/teamspaces/projects/models/drawings');
const Federations = require('../../../../../processors/teamspaces/projects/models/federations');
const ModelSettings = require('../../../../../processors/teamspaces/projects/models/commons/settings');
const { Router } = require('express');
const { canDeleteContainer } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/containers');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { isArray } = require('../../../../../utils/helper/typeCheck');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { routeDecommissioned } = require('../../../../../middleware/common');

const getThumbnail = async (req, res) => {
	const { teamspace, project, drawing } = req.params;

	try {
		const { readStream, filename, size, mimeType } = await Drawings.getLatestThumbnail(teamspace, project, drawing);
		writeStreamRespond(req, res, templates.ok, readStream, filename, size, { mimeType });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const addModel = (modelType) => async (req, res) => {
	const { teamspace, project } = req.params;
	try {
		const fn = {
			[modelTypes.CONTAINER]: Containers.addContainer,
			[modelTypes.FEDERATION]: Federations.addFederation,
			[modelTypes.DRAWING]: Drawings.addDrawing,
		};

		const modelId = await fn[modelType](teamspace, project, req.body);
		respond(req, res, templates.ok, { _id: modelId });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const deleteModel = (modelType) => async (req, res) => {
	const { teamspace, project, model } = req.params;
	try {
		const fn = {
			[modelTypes.CONTAINER]: Containers.deleteContainer,
			[modelTypes.FEDERATION]: Federations.deleteFederation,
			[modelTypes.DRAWING]: Drawings.deleteDrawing,
		};

		await fn[modelType](teamspace, project, model);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getModelList = (modelType) => async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;

	const fn = {
		[modelTypes.CONTAINER]: Containers.getContainerList,
		[modelTypes.FEDERATION]: Federations.getFederationList,
		[modelTypes.DRAWING]: Drawings.getDrawingList,
	};

	try {
		const models = await fn[modelType](teamspace, project, user);
		respond(req, res, templates.ok, { [`${modelType}s`]: models });
	} catch (err) {
		respond(req, res, err);
	}
};

const appendFavourites = (modelType) => async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	try {
		const favouritesToAdd = req.body[`${modelType}s`];

		if (!isArray(favouritesToAdd)) {
			throw createResponseCode(templates.invalidArguments, `${modelType}s must be an array`);
		}

		const fn = {
			[modelTypes.CONTAINER]: Containers.appendFavourites,
			[modelTypes.FEDERATION]: Federations.appendFavourites,
			[modelTypes.DRAWING]: Drawings.appendFavourites,
		};

		await fn[modelType](user, teamspace, project, favouritesToAdd);
		respond(req, res, templates.ok);
	} catch (err) {
		respond(req, res, err);
	}
};

const deleteFavourites = (modelType) => async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	const fn = {
		[modelTypes.CONTAINER]: Containers.deleteFavourites,
		[modelTypes.FEDERATION]: Federations.deleteFavourites,
		[modelTypes.DRAWING]: Drawings.deleteFavourites,
	};

	try {
		if (req.query.ids?.length) {
			const favouritesToRemove = req.query.ids.split(',');

			await fn[modelType](user, teamspace, project, favouritesToRemove);
			respond(req, res, templates.ok);
		} else {
			respond(req, res, createResponseCode(templates.invalidArguments, 'ids must be provided as part fo the query string'));
		}
	} catch (err) {
		respond(req, res, err);
	}
};

const getModelStats = (modelType) => async (req, res, next) => {
	const { teamspace, model, project } = req.params;
	const fn = {
		[modelTypes.CONTAINER]: Containers.getContainerStats,
		[modelTypes.DRAWING]: Drawings.getDrawingStats,
		[modelTypes.FEDERATION]: Federations.getFederationStats,
	};

	try {
		const stats = await fn[modelType](teamspace, project, model);
		req.outputData = stats;
		await next();
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const updateModelSettings = (modelType) => async (req, res) => {
	const { teamspace, project, model } = req.params;
	const fn = {
		[modelTypes.CONTAINER]: Containers.updateSettings,
		[modelTypes.FEDERATION]: Federations.updateSettings,
		[modelTypes.DRAWING]: Drawings.updateSettings,
	};
	try {
		await fn[modelType](teamspace, project, model, req.body);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getModelSettings = (modelType) => async (req, res, next) => {
	const { teamspace, model } = req.params;
	const fn = {
		[modelTypes.CONTAINER]: Containers.getSettings,
		[modelTypes.FEDERATION]: Federations.getSettings,
		[modelTypes.DRAWING]: Drawings.getSettings,
	};
	try {
		const settings = await fn[modelType](teamspace, model);

		req.outputData = settings;
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getUsersWithPermissions = async (req, res) => {
	const { teamspace, project, model } = req.params;
	const excludeViewers = req.query.excludeViewers === 'true';

	try {
		const users = await ModelSettings.getUsersWithPermissions(teamspace, project, model, excludeViewers);
		respond(req, res, templates.ok, { users });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getRolesWithAccess = async (req, res) => {
	const { teamspace, project, model } = req.params;
	const excludeViewers = req.query.excludeViewers === 'true';

	try {
		const roles = await ModelSettings.getRolesWithAccess(teamspace, project, model, excludeViewers);
		respond(req, res, templates.ok, { roles });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (modelType) => {
	const router = Router({ mergeParams: true });

	const hasAdminAccessToModel = {
		[modelTypes.CONTAINER]: hasAdminAccessToContainer,
		[modelTypes.FEDERATION]: hasAdminAccessToFederation,
		[modelTypes.DRAWING]: hasAdminAccessToDrawing,
	};

	const hasReadAccessToModel = {
		[modelTypes.CONTAINER]: hasReadAccessToContainer,
		[modelTypes.FEDERATION]: hasReadAccessToFederation,
		[modelTypes.DRAWING]: hasReadAccessToDrawing,
	};

	const canDeleteModel = {
		[modelTypes.CONTAINER]: canDeleteContainer,
		[modelTypes.FEDERATION]: async (req, res, next) => { await next(); },
		[modelTypes.DRAWING]: async (req, res, next) => { await next(); },
	};

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
	 *           enum: [containers, federations, drawings]
	 *     requestBody:
	 *       content:
   	 *         application/json:
   	 *           schema:
	 *             type: object
	 *             required:
	 *               - name
	 *               - unit
	 *               - type
	 *               - number
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
	 *               number:
	 *                 type: string
	 *                 example: SC1-SFT-V1-01-M3-ST-30_10_30-0001
	 *                 description: Unique identifier of a drawing (Drawings only)
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
	 *           examples:
     *             container:
	 *               summary: container
     *               value:
     *                 name: Lego House Architecture
     *                 unit: mm
	 *                 desc: The Architecture model of the Lego House
	 *                 code: LEGO_ARCHIT_001
	 *                 type: Architecture
	 *                 angleFromNorth: 100
	 *                 surveyPoints: [{ position: [23.45, 1.23, 4.32], latLong: [4.45, 7,76] }]
     *             federation:
	 *               summary: federation
     *               value:
     *                 name: Lego House Federation
     *                 unit: m
	 *                 desc: The Structural model of the Lego House
	 *                 code: LEGO_ARCHIT_002
	 *                 angleFromNorth: 150
 	 *                 surveyPoints: [{ position: [23.45, 1.23, 4.32], latLong: [4.45, 7,76] }]
	 *             drawing:
	 *               summary: drawing
     *               value:
     *                 name: Lego House Drawing
     *                 number: SC1-SFT-V1-01-M3-ST-30_10_30-0001
	 *                 desc: The Drawing of the Lego House
	 *                 type: Structural
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
	router.post('/', isAdminToProject, validateAddModelData(modelType), addModel(modelType));

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
	 *           enum: [containers, federations, drawings]
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
	 *             examples:
     *               containers:
	 *                 summary: containers
     *                 value:
	 *                   containers: [{ _id: 3549ddf6-885d-4977-87f1-eeac43a0e818, name: Lego House Container, role: admin, isFavourite: true }]
     *               federations:
	 *                 summary: federations
     *                 value:
     *                   federations: [{ _id: 3549ddf6-885d-4977-87f1-eeac43a0e818, name: Lego House Federation, role: admin, isFavourite: true }]
     *               drawings:
	 *                 summary: drawings
     *                 value:
     *                   drawings: [{ _id: 3549ddf6-885d-4977-87f1-eeac43a0e818, name: Lego House Drawing, role: admin, isFavourite: true }]
	 */
	router.get('/', hasAccessToTeamspace, getModelList(modelType));

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
	 *           enum: [containers, federations, drawings]
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
	 *           examples:
     *             containers:
	 *               summary: containers
     *               value:
	 *                 containers: [3549ddf6-885d-4977-87f1-eeac43a0e818, a54e8776-da7c-11ec-9d64-0242ac120002]
     *             federations:
	 *               summary: federations
     *               value:
	 *                 federations: [3549ddf6-885d-4977-87f1-eeac43a0e818, a54e8776-da7c-11ec-9d64-0242ac120002]
     *             drawings:
	 *               summary: drawings
     *               value:
     *                 drawings: [3549ddf6-885d-4977-87f1-eeac43a0e818, a54e8776-da7c-11ec-9d64-0242ac120002]
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: adds the models found in the request body to the user's favourites list
	 */
	router.patch('/favourites', hasAccessToTeamspace, appendFavourites(modelType));

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
	 *           enum: [containers, federations, drawings]
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
	router.delete('/favourites', hasAccessToTeamspace, deleteFavourites(modelType));

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
	 *           enum: [containers, federations,drawings]
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
	 *             examples:
	 *               container:
	 *                 summary: container
     *                 value:
	 *                   type: Architectural
     *                   code: STR-01
     *                   status: ok
	 *                   unit: mm
	 *                   desc: Floor 1 MEP with Facade
	 *                   revisions: { total: 2, lastUpdated: 1715354970000, latestRevision: rev1 }
	 *               federation:
	 *                 summary: federation
     *                 value:
     *                   code: STR-01
     *                   status: ok
	 *                   desc: Floor 1 MEP with Facade
	 *                   lastUpdated: 1630598072000
	 *                   tickets: { issues: 10, risks: 5 }
	 *                   containers: [{ group: Architectural, _id: 374bb150-065f-11ec-8edf-ab0f7cc84da8 }]
	 *               drawing:
	 *                 summary: drawing
     *                 value:
     *                   number: SC1-SFT-V1-01-M3-ST-30_10_30-0001
     *                   status: ok
	 *                   type: Architectural
	 *                   desc: Floor 1 MEP with Facade
	 *                   revisions: { total: 2, lastUpdated: 1715354970000, latestRevision: S1-rev1 }
	 *                   calibration: uncalibrated
	 */
	router.get('/:model/stats', hasReadAccessToModel[modelType], getModelStats(modelType), formatModelStats(modelType));

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
	 *           enum: [containers, federations, drawings]
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
	router.delete('/:model', hasAdminAccessToModel[modelType], canDeleteModel[modelType], deleteModel(modelType));

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
	 *           enum: [containers, federations, drawings]
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
	 *               number:
	 *                 type: string
	 *                 example: SC1-SFT-V1-01-M3-ST-30_10_30-0001
	 *                 description: Unique identifier of a drawing (drawings only)
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
	 *           examples:
     *             container:
	 *               summary: container
     *               value:
     *                 name: Lego House Container
     *                 unit: mm
	 *                 desc: The Container model of the Lego House
	 *                 defaultView: '374bb150-065f-11ec-8edf-ab0f7cc84da8'
	 *                 defaultLegend: '374bb150-065f-11ec-8edf-ab0f7cc84da8'
	 *                 angleFromNorth: 100
	 *                 surveyPoints: [{ position: [23.45, 1.23, 4.32], latLong: [4.45, 7,76] }]
     *             federation:
	 *               summary: federation
     *               value:
     *                 name: Lego House Federation
     *                 unit: m
	 *                 desc: The Federation model of the Lego House
	 *                 defaultView: '374bb150-065f-11ec-8edf-ab0f7cc84da8'
	 *                 defaultLegend: '374bb150-065f-11ec-8edf-ab0f7cc84da8'
	 *                 angleFromNorth: 120
	 *                 surveyPoints: [{ position: [23.45, 1.23, 4.32], latLong: [4.45, 7,76] }]
	 *             drawing:
	 *               summary: drawing
     *               value:
     *                 name: Lego House Drawing
     *                 number: SC1-SFT-V1-01-M3-ST-30_10_30-0001
	 *                 desc: The Drawing of the Lego House
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: updates the settings of the model
	 */
	router.patch('/:model', hasAdminAccessToModel[modelType], validateUpdateSettingsData(modelType), updateModelSettings(modelType));

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
	 *           enum: [containers, federations, drawings]
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
	 *             examples:
     *               container:
	 *                 summary: container
     *                 value:
	 *                   _id: 3549ddf6-885d-4977-87f1-eeac43a0e818
     *                   name: Lego House Container
     *                   unit: mm
	 *                   code: MOD1
	 *                   type: Structural
	 *                   desc: The Container model of the Lego House
	 *                   timestamp: 1629976656315
	 *                   status: ok
	 *                   errorReason: { message: System error occured. Please contact support., timestamp: 1629976656315, errorCode: 14 }
	 *                   defaultView: '374bb150-065f-11ec-8edf-ab0f7cc84da8'
	 *                   defaultLegend: '374bb150-065f-11ec-8edf-ab0f7cc84da8'
	 *                   angleFromNorth: 100
	 *                   surveyPoints: [{ position: [23.45, 1.23, 4.32], latLong: [4.45, 7,76] }]
     *               federation:
	 *                 summary: federation
     *                 value:
	 *                   _id: 3549ddf6-885d-4977-87f1-eeac43a0e818
     *                   name: Lego House Federation
     *                   unit: mm
	 *                   code: MOD1
	 *                   desc: The Federation model of the Lego House
	 *                   timestamp: 1629976656315
	 *                   status: ok
	 *                   errorReason: { message: System error occured. Please contact support., timestamp: 1629976656315, errorCode: 14 }
	 *                   defaultView: '374bb150-065f-11ec-8edf-ab0f7cc84da8'
	 *                   defaultLegend: '374bb150-065f-11ec-8edf-ab0f7cc84da8'
	 *                   angleFromNorth: 100
	 *                   surveyPoints: [{ position: [23.45, 1.23, 4.32], latLong: [4.45, 7,76] }]
	 *               drawing:
	 *                 summary: drawing
     *                 value:
	 *                   _id: 3549ddf6-885d-4977-87f1-eeac43a0e818
     *                   name: Lego House Drawing
     *                   number: SC1-SFT-V1-01-M3-ST-30_10_30-0001
	 *                   type: Structural
	 *                   desc: The Drawing of the Lego House
	 *                   calibration: { verticalRange: [0,10], units: m }
	 */
	router.get('/:model', hasReadAccessToModel[modelType], getModelSettings(modelType), formatModelSettings);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/members:
	 *   get:
	 *     description: Get the name of the users who have access to the model
	 *     tags: [Models]
	 *     operationId: getUsersWithPermissions
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
	 *           enum: [containers, federations, drawings]
	 *       - name: model
	 *         description: Model ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: excludeViewers
	 *         description: exclude users who have viewer permission
	 *         in: query
	 *         schema:
	 *           type: boolean
	 *         example: true
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns the users who have access to the model
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 users:
	 *                   type: array
	 *                   items:
	 *                     type: string
	 *                     example: user1
	 */
	router.get('/:model/members', hasReadAccessToModel[modelType], getUsersWithPermissions);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/roles:
	 *   get:
	 *     description: Get the names of the roles that are associated with users who have access to the model
	 *     tags: [Models]
	 *     operationId: getRolesWithAccess
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
	 *           enum: [containers, federations, drawings]
	 *       - name: model
	 *         description: Model ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: excludeViewers
	 *         description: exclude users who have viewer permission
	 *         in: query
	 *         schema:
	 *           type: boolean
	 *         example: true
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns the roles that are associated with users who have access to the model
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 roles:
	 *                   type: array
	 *                   items:
	 *                     type: string
	 *                     example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 */
	router.get('/:model/roles', hasReadAccessToModel[modelType], getRolesWithAccess);

	router.get('/:model/jobs', routeDecommissioned('GET', '/v5/teamspaces/{teamspace}/projects/{project}/{type}/{model}/roles'));

	if (modelType === modelTypes.DRAWING) {
	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/drawings/{drawing}/thumbnail:
	 *   get:
	 *     description: Fetches the thumbnail for a drawing.
	 *     tags: [Models]
	 *     operationId: getThumbnail
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
	 *       - name: drawing
	 *         description: Drawing ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: returns a raster image of the thumbnail
	 */
		router.get('/:model/thumbnail', hasReadAccessToDrawing, getThumbnail);
	}

	return router;
};

module.exports = establishRoutes;
