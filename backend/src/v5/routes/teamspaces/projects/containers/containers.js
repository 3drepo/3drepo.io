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
const { hasAccessToTeamspace, hasAdminAccessToContainer, hasReadAccessToContainer } = require('../../../../middleware/permissions/permissions');
const Containers = require('../../../../processors/teamspaces/projects/models/containers');
const { Router } = require('express');
const { UUIDToString } = require('../../../../utils/helper/uuids');
const { formatModelSettings } = require('../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/modelSettings');
const { getUserFromSession } = require('../../../../utils/sessions');
const { respond } = require('../../../../utils/responder');
const { templates } = require('../../../../utils/responseCodes');
const { validateUpdateSettingsData } = require('../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/modelSettings');

const getContainerList = (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	Containers.getContainerList(teamspace, project, user).then((containers) => {
		respond(req, res, templates.ok, { containers });
	}).catch((err) => respond(req, res, err));
};

const getContainerStats = async (req, res) => {
	const { teamspace, project, container } = req.params;
	Containers.getContainerStats(teamspace, project, container).then((stats) => {
		const statsSerialised = { ...stats };
		statsSerialised.revisions.lastUpdated = stats.revisions.lastUpdated
			? stats.revisions.lastUpdated.getTime() : undefined;
		statsSerialised.revisions.latestRevision = UUIDToString(stats.revisions.latestRevision);

		respond(req, res, templates.ok, statsSerialised);
	}).catch(
		// istanbul ignore next
		(err) => respond(req, res, err),
	);
};

const deleteFavourites = (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	const favouritesToRemove = req.body.containers;

	Containers.deleteFavourites(user, teamspace, project, favouritesToRemove)
		.then(() => respond(req, res, templates.ok)).catch((err) => respond(req, res, err));
};

const appendFavourites = (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace, project } = req.params;
	const favouritesToAdd = req.body.containers;

	Containers.appendFavourites(user, teamspace, project, favouritesToAdd)
		.then(() => respond(req, res, templates.ok)).catch((err) => respond(req, res, err));
};

const updateSettings = (req, res) => {
	const { teamspace, container } = req.params;

	Containers.updateSettings(teamspace, container, req.body)
		.then(() => respond(req, res, templates.ok)).catch(
			// istanbul ignore next
			(err) => respond(req, res, err),
		);
};

const getSettings = (req, res, next) => {
	const { teamspace, container } = req.params;
	Containers.getSettings(teamspace, container)
		.then((settings) =>{
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
	 * /teamspaces/{teamspace}/projects/{project}/containers:
	 *   get:
	 *     description: Get a list of containers within the specified project the user has access to
	 *     tags: [Containers]
	 *     operationId: getContainerList
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
	 *         type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns list of containers
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 containers:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       id:
	 *                         type: string
	 *                         description: Container ID
	 *                         example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       name:
	 *                         type: string
	 *                         description: name of the container
	 *                         example: Structure
	 *                       role:
	 *                         $ref: "#/components/roles"
	 *                       isFavourite:
	 *                         type: boolean
	 *                         description: whether the container is a favourited item for the user
	 *
	 *
	 */
	router.get('/', hasAccessToTeamspace, getContainerList);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/stats:
	 *   get:
	 *     description: Get the statistics and general information about a container
	 *     tags: [Containers]
	 *     operationId: getContainerStats
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
   	 *       - container:
	 *         name: container
	 *         description: Container ID
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
	 *         description: returns the statistics of a container
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   description: Container ID
	 *                   example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                 type:
	 *                   type: string
	 *                   description: Name of the container
	 *                   example: Structure
   	 *                 code:
	 *                   type: string
	 *                   description: Container code
	 *                   example: STR-01
     *                 status:
	 *                   type: string
	 *                   description: Current status of the container
	 *                   example: ok
     *                 units:
	 *                   type: string
	 *                   enum: [mm, cm, dm, m, ft]
	 *                   description: Container units
	 *                   example: mm
	 *                 revisions:
	 *                   type: object
	 *                   properties:
	 *                     total:
	 *                       type: integer
	 *                       description: Number of revisions (non voided) in the container
	 *                       example: 10
     *                     lastUpdated:
	 *                       type: integer
	 *                       description: Timestamp(ms) of when the container was last updated
	 *                       example: 1630598072000
	 *                     latestRevision:
	 *                       type: string
	 *                       description: Revision name of the latest version
	 *                       example: rev1
	 */
	router.get('/:container/stats', hasReadAccessToContainer, getContainerStats);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/favourites:
	 *   patch:
	 *     description: Add containers to the user's favourites list
	 *     tags: [Containers]
	 *     operationId: appendContainers
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
     *               containers:
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
	 *         description: adds the containers found in the request body to the user's favourites list
	 */
	router.patch('/favourites', hasAccessToTeamspace, appendFavourites);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/favourites:
	 *   delete:
	 *     description: Remove containers from the user's favourites list
	 *     tags: [Containers]
	 *     operationId: deleteContainers
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
     *               containers:
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
	 *         description: removes the containers found in the request body from the user's favourites list
	 */
	router.delete('/favourites', hasAccessToTeamspace, deleteFavourites);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}:
	 *   patch:
	 *     description: Updates the settings of a container
	 *     tags: [Containers]
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
	 *       - container:
	 *         name: container
	 *         description: ID of container
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
	 *                 example: container1
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
	 *         description: updates the settings of the container
	 */
	router.patch('/:container', hasAdminAccessToContainer, validateUpdateSettingsData, updateSettings);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}:
	 *   get:
	 *     description: Get the model settings of container
	 *     tags: [Containers]
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
	 *       - container:
	 *         name: container
	 *         description: Container ID
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
	 *         description: returns the model settings of a container
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: "#/components/schemas/modelSettings"
	 */
	router.get('/:container', hasReadAccessToContainer, getSettings, formatModelSettings);
	return router;
};

module.exports = establishRoutes();
