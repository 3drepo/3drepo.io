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

const Federations = require('../../../../../processors/teamspaces/projects/models/federations');
const { Router } = require('express');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { hasWriteAccessToFederation } = require('../../../../../middleware/permissions/permissions');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');
const { validateNewFederationRevisionData } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions');

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
	router.post('', hasWriteAccessToFederation, validateNewFederationRevisionData, createNewFederationRevision);
	return router;
};

module.exports = establishRoutes();
