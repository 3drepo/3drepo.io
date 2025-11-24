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

const Federations = require('../../../../../processors/teamspaces/projects/models/federations');
const { Router } = require('express');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { hasReadAccessToFederation } = require('../../../../../middleware/permissions');
const { respond } = require('../../../../../utils/responder');
const { serialiseRevisionArray } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/revisions');

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
     * /teamspaces/{teamspace}/projects/{project}/federations/{federation}/files/original/info:
     *   get:
     *     description: Get the details of the original files uploaded to that federation
     *     tags: [v:external, Files]
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
     *     responses:
     *       401:
     *         $ref: "#/components/responses/notLoggedIn"
     *       404:
     *         $ref: "#/components/responses/teamspaceNotFound"
     *       200:
     *         description: get the details of the original file uploaded to the latest revisions of a federation's containers
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
     *                           description: Latest revision tag
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
     *                     tag: X01
     *                     timestamp: 1711929600
     *                     hash: 14703cffd1a95017a95eb092315c3ee1
     *                     filename: test_1.rvt
     *                     size: 123456789
     *                   - container: ef0855b6-4bb7-4be1-b2d6-c032dce7806a
     *                     tag: X01
     *                     timestamp: 1711929690
     *                     hash: 14703cffd1a95017a95eb092315c3ee1
     *                     filename: test_2.rvt
     *                     size: 123456780
     */
	router.get('/original/info', hasReadAccessToFederation, getFederationMD5Hash, serialiseRevisionArray);

	return router;
};

module.exports = establishRoutes();
