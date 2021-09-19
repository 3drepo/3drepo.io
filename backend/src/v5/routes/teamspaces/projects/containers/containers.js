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

const { hasAccessToTeamspace, hasReadAccessToContainer } = require('../../../../middleware/permissions/permissions');
const { hasPermissionsAndValidArguments } = require('../../../../middleware/permissions/components/revisions');
const Containers = require('../../../../processors/teamspaces/projects/models/containers');
const { Router } = require('express');
const { UUIDToString } = require('../../../../utils/helper/uuids');
const { getUserFromSession } = require('../../../../utils/sessions');
const { respond } = require('../../../../utils/responder');
const { templates } = require('../../../../utils/responseCodes');

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
	}).catch((err) => respond(req, res, err));
};

const getRevisions = async (req, res) => {
	const { teamspace, container } = req.params;
	const showVoid = req.query.showVoid === 'true';

	Containers.getRevisions(teamspace, container, showVoid).then((revisions) => {
		const formattedRevisions = revisions.map((rev)=> {
			return {...rev, _id: UUIDToString(rev._id)};
		});
		respond(req, res, templates.ok, { formattedRevisions });
	}).catch((err) => respond(req, res, err));
};

const updateRevisionStatus = async (req, res) => {
	const { teamspace, container, revision } = req.params;
	const status = req.body.void;

	Containers.updateRevisionStatus(teamspace, container, revision, status).then(() => {
		respond(req, res, templates.ok, {});
	}).catch((err) => respond(req, res, err));
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
	 *           type: string
	 *
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
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/revisions:
	 *   get:
	 *     description: Get a list of revisions of a container
	 *     tags: [Containers]
	 *     operationId: getRevisions
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
   	 *       - container:
	 *         name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
	 *       - showVoid :
	 *         name: showVoid
	 *         description: Include void revisions or not
	 *         in: query
	 *         required: false
	 *         schema:
	 *         type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns list of revisions
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 revisions:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       _id:
	 *                         type: string
	 *                         description: Revision ID
	 *                         example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       author:
	 *                         type: string
	 *                         description: name of the creator of the revision
	 *                         example: someUser
	 *                       timestamp:
	 *                         type: string
	 *                         description: Revision creation date
	 *                         example: 2018-06-28T11:15:47.000Z
	 *
	 *
	 */
	router.get('/:container/revisions', hasReadAccessToContainer, getRevisions);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/revisions/:revision:
	 *   patch:
	 *     description: Updates the void status of a revision
	 *     tags: [Containers]
	 *     operationId: updateRevisionStatus
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
   	 *       - container:
	 *         name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
	 *       - revision:
	 *         name: revision
	 *         description: Revision ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
	 *     requestBody:
	 *       content:
	 *         'application/x-www-form-urlencoded':
	 *           schema:
	 *             properties:
	 *               void:
	 *                 description: The new status value
	 *                 type: boolean
	 *             required:
	 *               - status
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: updates the status of the revision
	 */
	router.patch('/:container/revisions/:revision', hasPermissionsAndValidArguments, updateRevisionStatus);

	return router;
};

module.exports = establishRoutes();
