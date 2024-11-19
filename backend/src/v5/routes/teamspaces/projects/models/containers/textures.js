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
const { Router } = require('express');
const UnityAssets = require('../../../../../models/unityAssets');
const { hasReadAccessToContainer } = require('../../../../../middleware/permissions/permissions');
const { templates } = require('../../../../../utils/responseCodes');

const getTexture = async (req, res) => {
	const { teamspace, model, texture } = req.params;

	try {
		const { readStream, size, mimeType, encoding } = await UnityAssets.getTexture(teamspace, model, texture);
		writeStreamRespond(req, res, templates.ok, readStream, undefined, size, { mimeType, encoding });
	} catch (err) {
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{model}/textures/{texture}.texture:
	 *   get:
	 *     description: Get the repo bundle with the specified ID for the specified model
	 *     tags: [Models]
	 *     operationId: getRepoBundle
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
 	 *       - name: texture
	 *         description: Texture ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       404:
	 *         $ref: "#/components/responses/projectNotFound"
	 *       404:
	 *         $ref: "#components/responses/containerNotFound"
	 *       404:
	 *         $ref: "#components/responses/fileNotFound"
	 *       200:
	 *         description: returns the texture file with the specified ID for the specified model
	 */
	router.get('/:texture.texture', hasReadAccessToContainer, getTexture);

	return router;
};

module.exports = establishRoutes();
