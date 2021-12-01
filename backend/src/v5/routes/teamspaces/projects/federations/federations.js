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

const { hasAccessToTeamspace, hasAdminAccessToFederation, hasReadAccessToFederation, isAdminToProject } = require('../../../../middleware/permissions/permissions');
const { validateAddModelData, validateUpdateSettingsData } = require('../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings');
const Federations = require('../../../../processors/teamspaces/projects/models/federations');
const { Router } = require('express');
const { formatModelSettings } = require('../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/modelSettings');
const { getUserFromSession } = require('../../../../utils/sessions');
const { respond } = require('../../../../utils/responder');
const { templates } = require('../../../../utils/responseCodes');

const addFederation = (req, res) => {
	const { teamspace, project } = req.params;
	Federations.addFederation(teamspace, project, req.body).then((federationId) => {
		respond(req, res, templates.ok, { _id: federationId });
	}).catch(
		// istanbul ignore next
		(err) => respond(req, res, err),
	);
};

const deleteFederation = (req, res) => {
	const { teamspace, project, federation } = req.params;
	Federations.deleteFederation(teamspace, project, federation).then(() => {
		respond(req, res, templates.ok);
	}).catch(
		// istanbul ignore next
		(err) => respond(req, res, err),
	);
};

const getFederationList = (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	Federations.getFederationList(teamspace, project, user).then((federations) => {
		respond(req, res, templates.ok, { federations });
	}).catch((err) => respond(req, res, err));
};

const appendFavourites = (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	const favouritesToAdd = req.body.federations;

	Federations.appendFavourites(user, teamspace, project, favouritesToAdd)
		.then(() => respond(req, res, templates.ok)).catch((err) => respond(req, res, err));
};

const deleteFavourites = (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	const favouritesToRemove = req.body.federations;

	Federations.deleteFavourites(user, teamspace, project, favouritesToRemove)
		.then(() => respond(req, res, templates.ok)).catch((err) => respond(req, res, err));
};

const getFederationStats = async (req, res) => {
	const { teamspace, federation } = req.params;
	Federations.getFederationStats(teamspace, federation).then((stats) => {
		const statsSerialised = { ...stats };
		statsSerialised.lastUpdated = stats.lastUpdated ? stats.lastUpdated.getTime() : undefined;
		if (statsSerialised.subModels) statsSerialised.subModels = statsSerialised.subModels.map(({ model }) => model);
		respond(req, res, templates.ok, statsSerialised);
	}).catch(
		/* istanbul ignore next */
		(err) => respond(req, res, err),
	);
};

const updateSettings = (req, res) => {
	const { teamspace, federation } = req.params;

	Federations.updateSettings(teamspace, federation, req.body)
		.then(() => respond(req, res, templates.ok)).catch(
			// istanbul ignore next
			(err) => respond(req, res, err),
		);
};

const getSettings = (req, res, next) => {
	const { teamspace, federation } = req.params;

	Federations.getSettings(teamspace, federation)
		.then((settings) => {
			req.outputData = settings;
			next();
		})
		.catch(
		// istanbul ignore next
			(err) => respond(req, res, err),
		);
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations:
	 *   post:
	 *     description: Add a new federation to the specified project the user is admin of
	 *     tags: [Federations]
	 *     operationId: addFederation
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
	 *           type: string
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
	 *                 description: Name of the federation - this has to be unique within the project
	 *                 maxLength: 120
	 *               unit:
	 *                 type: string
	 *                 enum: [mm, cm, dm, m, ft]
	 *                 example: mm
	 *                 description: Unit of measurement
	 *               desc:
	 *                 type: string
	 *                 example: The Architecture model of the Lego House
	 *                 description: Federation description
	 *                 maxLength: 50
	 *               code:
	 *                 type: string
	 *                 example: LEGO_ARCHIT_001
	 *                 description: Federation reference code
	 *               type:
	 *                 type: string
	 *                 example: Architecture
	 *                 description: Federation type
	 *               surveyPoints:
	 *                 type: array
	 *                 description: Survey points for federation location
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     position:
	 *                       description: The point coordinate that maps to the latLong value (should be in OpenGL axis conventions)
	 *                       type: array
	 *                       items:
	 *                         type: float
	 *                         example: 23.45
	 *                         minItems: 3
	 *                         maxItems: 3
	 *                     latLong:
	 *                       type: array
	 *                       description: 'The latitude and longitude of the survey point'
	 *                       items:
	 *                         type: float
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
	 *         description: Federation ID
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   format: uuid
	 *                   description: Federation ID
	 *                   example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 */
	router.post('/', isAdminToProject, validateAddModelData, addFederation);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations:
	 *   get:
	 *     description: Get a list of federations within the specified project the user has access to
	 *     tags: [Federations]
	 *     operationId: getFederationList
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
	 *           type: string
	 *
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/federationNotFound"
	 *       200:
	 *         description: returns list of federations
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 federations:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       id:
	 *                         type: string
	 *                         description: Federation ID
	 *                         example: 02b05cb0-0057-11ec-8d97-41a278fb55fd
	 *                       name:
	 *                         type: string
	 *                         description: name of the federation
	 *                         example: Complete structure
	 *                       role:
	 *                         $ref: "#/components/roles"
	 *                       isFavourite:
	 *                         type: boolean
	 *                         description: whether the federation is a favourited item for the user
	 *
	 *
	 */
	router.get('/', hasAccessToTeamspace, getFederationList);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations/favourites:
	 *   patch:
	 *     description: Add federations to the user's favourites list
	 *     tags: [Federations]
	 *     operationId: appendFederations
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
		   *       - project:
	 *         name: project
	 *         description: ID of project
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
	 *               federations:
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
	 *         description: adds the federations found in the request body to the user's favourites list
	 */
	router.patch('/favourites', hasAccessToTeamspace, appendFavourites);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations/favourites:
	 *   delete:
	 *     description: Remove federations from the user's favourites list
	 *     tags: [Federations]
	 *     operationId: deleteFederations
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
		   *       - project:
	 *         name: project
	 *         description: ID of project
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
	 *               federations:
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
	 *         description: removes the federations found in the request body from the user's favourites list
	 */
	router.delete('/favourites', hasAccessToTeamspace, deleteFavourites);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations/{federation}/stats:
	 *   get:
	 *     description: Get the statistics and general information about a federation
	 *     tags: [Federations]
	 *     operationId: getFederationStats
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
	 *           type: string
   	 *       - federation:
	 *         name: federation
	 *         description: Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns the statistics of a federation
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 code:
	 *                   type: string
	 *                   description: Federation code
	 *                   example: STR-01
     *                 status:
	 *                   type: string
	 *                   description: Current status of the federation
	 *                   example: ok
   	 *                 subModels:
	 *                   type: array
	 *                   description: The IDs of the models the federation consists of
	 *                   items:
	 *                     type: string
	 *                     format: uuid
	 *                 tickets:
	 *                   type: object
	 *                   properties:
	 *                     issues:
	 *                       type: integer
	 *                       description: The number of non closed issues of the federation
	 *                     risks:
	 *                       type: integer
	 *                       description: The number of unmitigated risks of the federation
     *                 category:
	 *                   type: string
	 *                   description: Category of the federation
	 *                   example:
     *                 lastUpdated:
	 *                   type: integer
	 *                   description: Timestamp(ms) of when any of the submodels was updated
	 *                   example: 1630598072000
	 */
	router.get('/:federation/stats', hasReadAccessToFederation, getFederationStats);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations/{federation}:
	 *   delete:
	 *     description: Delete federation from project the user is admin of
	 *     tags: [Federations]
	 *     operationId: deleteFederation
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
	 *           type: string
   	 *       - federation:
	 *         name: federation
	 *         description: Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/federationNotFound"
	 *       200:
	 *         description: Federation removed.
	 */
	router.delete('/:federation', hasAdminAccessToFederation, deleteFederation);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations/{federation}:
	 *   patch:
	 *     description: Updates the settings of a federation
	 *     tags: [Federations]
	 *     operationId: updateSettings
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
		   *       - project:
	 *         name: project
	 *         description: ID of project
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - federation:
	 *         name: federation
	 *         description: ID of federation
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
	 *                 type: String
	 *                 example: federation1
	 *               desc:
	 *                 type: String
	 *                 example: description1
	 *               type:
	 *                 type: String
	 *                 example: type1
	 *               surveyPoints:
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     position:
	 *                       type: array
	 *                       items:
	 *                         type: float
	 *                         example: 23.45
	 *                     latLong:
	 *                       type: array
	 *                       items:
	 *                         type: float
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
	 *         description: updates the settings of the federation
	 */
	router.patch('/:federation', hasAdminAccessToFederation, validateUpdateSettingsData, updateSettings);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations/{federation}:
	 *   get:
	 *     description: Get the model settings of federation
	 *     tags: [Federations]
	 *     operationId: getSettings
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
	 *           type: string
	 *       - federation:
	 *         name: federation
	 *         description: Federation ID
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
	 *         description: returns the model settings of a federation
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: "#/components/schemas/modelSettings"
	 */
	router.get('/:federation', hasReadAccessToFederation, getSettings, formatModelSettings);
	return router;
};

module.exports = establishRoutes();
