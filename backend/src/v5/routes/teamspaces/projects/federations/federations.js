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

const { hasAccessToTeamspace, hasAdminToProject, hasReadAccessToFederation } = require('../../../../middleware/permissions/permissions');
const Federations = require('../../../../processors/teamspaces/projects/models/federations');
const { Router } = require('express');
const { getUserFromSession } = require('../../../../utils/sessions');
const { respond } = require('../../../../utils/responder');
const { templates } = require('../../../../utils/responseCodes');
const { validateUpdateSettingsData } = require('../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings');

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

const addFederation = (req, res) => {
	const { teamspace, project } = req.params;

	Federations.addFederation(teamspace, project, req.body)
		.then((federationId) => respond(req, res, templates.ok, {_id: federationId})).catch((err) => respond(req, res, err));
};


const deleteFederation = (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, federation } = req.params;
	Federations.deleteFederation(teamspace, federation, user).then(() => {
		respond(req, res, templates.ok);
	}).catch((err) => respond(req, res, err));
};


const establishRoutes = () => {
	const router = Router({ mergeParams: true });

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
	router.patch('/:federation', hasAdminToProject, validateUpdateSettingsData, updateSettings);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations:
	 *   post:
	 *     description: Creates a new federation
	 *     tags: [Federations]
	 *     operationId: createFederation
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
	 *               name:
	 *                 type: string
	 *                 description: The name of the federation
	 *                 example: Federation name
	 *               unit:
	 *                 type: string
	 *                 description: The unit of the federation
	 *                 enum: [mm, cm, dm, m, ft]
	 *                 example: mm
	 *               desc:
	 *                 type: string
	 *                 description: The description of the federation
	 *                 example: description1
	 *               code:
	 *                 type: string
	 *                 description: The code of the federation
	 *                 example: CODE1
	 *               type:
	 *                 type: string
	 *                 description: The type of the federation
	 *                 example: Structural
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: creates new federation
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
	 *                
	 */
	router.post('', hasAdminToProject, addFederation);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations:
	 *   post:
	 *     description: Deletes a federation
	 *     tags: [Federations]
	 *     operationId: deleteFederation
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
	 *         description: deletes federation
	 *                
	 */
	 router.delete('/:federation', hasAdminToProject, deleteFederation);
	return router;
};

module.exports = establishRoutes();
