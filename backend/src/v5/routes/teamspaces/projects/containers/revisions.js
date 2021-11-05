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

const { hasReadAccessToContainer, hasWriteAccessToContainer } = require('../../../../middleware/permissions/permissions');
const { validateNewRevisionData, validateUpdateRevisionData } = require('../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions');
const Containers = require('../../../../processors/teamspaces/projects/models/containers');
const { Router } = require('express');
const { getUserFromSession } = require('../../../../utils/sessions');
const { respond } = require('../../../../utils/responder');
const { serialiseRevisionArray } = require('../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/revisions');
const { templates } = require('../../../../utils/responseCodes');

const getRevisions = async (req, res, next) => {
	const { teamspace, container } = req.params;
	const showVoid = req.query.showVoid === 'true';

	Containers.getRevisions(teamspace, container, showVoid).then((revs) => {
		req.outputData = revs;
		next();
	}).catch(
		/* istanbul ignore next */
		(err) => respond(req, res, err),
	);
};

const updateRevisionStatus = async (req, res) => {
	const { teamspace, container, revision } = req.params;
	const status = req.body.void;

	Containers.updateRevisionStatus(teamspace, container, revision, status).then(() => {
		respond(req, res, templates.ok);
	}).catch((err) => respond(req, res, err));
};

const newRevision = async (req, res) => {
	const { file } = req;
	const revInfo = req.body;
	const { teamspace, container } = req.params;
	const owner = getUserFromSession(req.session);
	Containers.newRevision(teamspace, container, { ...revInfo, owner }, file).then(() => {
		respond(req, res, templates.ok);
	}).catch(
		/* istanbul ignore next */
		(err) => respond(req, res, err),
	);
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });
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
	router.get('', hasReadAccessToContainer, getRevisions, serialiseRevisionArray);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/revisions:
	 *   post:
	 *     description: Create a new revision.
	 *     tags: [Containers]
	 *     operationId: createNewRevision
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
	 *     requestBody:
	 *       content:
	 *         multipart/form-data:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               tag:
	 *                 description: Unique revision name
     *                 type: string
	 *                 example: rev01
	 *               desc:
	 *                 description: Description of the revision
	 *                 type: string
	 *                 example: Initial design
	 *               importAnimations:
	 *                 type: bool
	 *                 description: Whether animations should be imported (Only relevant for .SPM uploads)
	 *               file:
	 *                 type: string
	 *                 format: binary
	 *             required:
	 *               - tag
	 *               - file
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: updates the status of the revision
	 */
	router.post('', hasWriteAccessToContainer, validateNewRevisionData, newRevision);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/revisions/{revision}:
	 *   patch:
	 *     description: Update a revision. Currently only the void status can be updated.
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
	 *         description: Revision ID or Revision tag
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
	 *     requestBody:
	 *       content:
     *         application/json:
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
	router.patch('/:revision', hasWriteAccessToContainer, validateUpdateRevisionData, updateRevisionStatus);

	return router;
};

module.exports = establishRoutes();
