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

const { hasReadAccessToFederation, hasWriteAccessToFederation } = require('../../../../../middleware/permissions');
const Federations = require('../../../../../processors/teamspaces/projects/models/federations');
const { Router } = require('express');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { respond } = require('../../../../../utils/responder');
const { serialiseRevisionArray } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/revisions');
const { templates } = require('../../../../../utils/responseCodes');
const { validateNewRevisionData } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/federations');

const createNewFederationRevision = async (req, res) => {
	const revInfo = req.body;
	const { teamspace, federation } = req.params;
	const owner = getUserFromSession(req.session);
	try {
		await Federations.newRevision(teamspace, federation, { ...revInfo, owner });
		respond(req, res, templates.ok);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const getFederationMD5Hash = async (req, res, next) => {
	const { teamspace, project, federation } = req.params;
	const user = getUserFromSession(req.session);

	try {
		req.outputData = await Federations.getMD5Hash(teamspace, project, federation, user);
		next();
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });
	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations/{federation}/revisions:
	 *   post:
	 *     description: Create a new revision.
	 *     tags: [Revisions]
	 *     operationId: createNewFederationRevision
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
	 *       - name: federation
	 *         description: Federation ID
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
	 *                 description: array of containers to federate together
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     _id:
	 *                       description: container id
	 *                       type: string
	 *                       format: uuid
	 *                     group:
	 *                       description: federation group it should go under (optional)
	 *                       type: string
	 *                       example: Structural
	 *                   required:
	 *                     - _id
	 *             required:
	 *               - containers
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: The request is sent successfully.
	 */
	router.post('', hasWriteAccessToFederation, validateNewRevisionData, createNewFederationRevision);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/federations/{federation}/revisions/{revision}/files/original/info:
	 *   get:
	 *     description: Get the details of the original files uploaded to that federation
	 *     tags: [Revisions]
	 *     operationId: getFederationMD5Hash
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
	 *       - name: federation
	 *         description: Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: revision
	 *         description: Revision ID or Revision tag
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
	 *         description: get the details of the original file uploaded to that revision of the container
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 revisions:
	 *                   type: array
	 *                   items:
	 *                       type: object
	 *                       properties:
	 *                         container:
	 *                           type: string
	 *                           description: Container ID
	 *                           example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                         tag:
	 *                           type: string
	 *                           description: Container tag
	 *                           example: X01
	 *                         timestamp:
	 *                           type: number
	 *                           description: Upload date
	 *                           example: 1435068682
	 *                         hash:
	 *                           type: string
	 *                           description: MD5 hash of the original file uploaded
	 *                           example: 76dea970d89477ed03dc5289f297443c
	 *                         filename:
	 *                           type: string
	 *                           description: Name of the file
	 *                           example: test.rvt
	 *                         size:
	 *                           type: number
	 *                           description: File size in bytes
	 *                           example: 329487234
	 *               example:
	 *                 revisions:
	 *                   - container: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                     code: X01
	 *                     uploadedAt: 1711929600
	 *                     hash: 14703cffd1a95017a95eb092315c3ee1
	 *                     filename: test_1.rvt
	 *                     size: 123456789
	 *                   - container: ef0855b6-4bb7-4be1-b2d6-c032dce7806a
	 *                     code: X01
	 *                     uploadedAt: 1711929690
	 *                     hash: 14703cffd1a95017a95eb092315c3ee1
	 *                     filename: test_2.rvt
	 *                     size: 123456780
	 */
	router.get('/:revision/files/original/info', hasReadAccessToFederation, getFederationMD5Hash, serialiseRevisionArray);

	return router;
};

module.exports = establishRoutes();
