/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { respond, writeStreamRespond } = require('../../../../../utils/responder');
const JSONAssets = require('../../../../../models/jsonAssets');
const { Router } = require('express');
const { hasReadAccessToContainer } = require('../../../../../middleware/permissions/permissions');
const { templates } = require('../../../../../utils/responseCodes');

const getBundleMappings = async (req, res) => {
	const { teamspace, model, bundle } = req.params;

	try {
		const { readStream, size, mimeType, encoding } = await JSONAssets.getBundleMappings(teamspace, model, bundle);
		writeStreamRespond(req, res, templates.ok, readStream, undefined, size, { mimeType, encoding });
	} catch (err) {
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{model}/bundleMappings/{bundle}:
	 *   get:
	 *     description: Get the unity bundle or repo bundle mpc json file.
	 *     tags: [Models]
	 *     operationId: getBundleMappings
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
	 *       - name: model
	 *         description: Model ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: bundle
	 *         description: Bundle ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         description: 401 Unauthorized
	 *         content:
	 *           application/json:
	 *             schema:
	 *               oneOf:
	 *                 - $ref: "#/components/responses/notLoggedIn"
	 *                 - $ref: "#/components/responses/notAuthorized"
	 *       404:
	 *         description: 404 Not Found
	 *         content:
	 *           application/json:
	 *             schema:
	 *               oneOf:
	 *                 - $ref: "#/components/responses/teamspaceNotFound"
	 *                 - $ref: "#/components/responses/projectNotFound"
	 *                 - $ref: "#components/responses/containerNotFound"
	 *                 - $ref: "#components/responses/fileNotFound"
	 *       200:
	 *         description: returns the the unity bundle or repo bundle mpc json file.
	 */
	router.get('/:bundle', hasReadAccessToContainer, getBundleMappings);

	return router;
};

module.exports = establishRoutes();
