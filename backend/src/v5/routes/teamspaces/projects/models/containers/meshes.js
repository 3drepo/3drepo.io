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

const { respond, writeCustomStreamRespond } = require('../../../../../utils/responder');
const ModelHelper = require('../../../../../utils/helper/models');
const { Router } = require('express');
const { hasReadAccessToContainer } = require('../../../../../middleware/permissions/permissions');
const { templates } = require('../../../../../utils/responseCodes');

const getMesh = async (req, res) => {
	const { teamspace, model, meshId } = req.params;

	try {
		const { readStream, mimeType } = await ModelHelper.getMeshById(teamspace, model, meshId);
		writeCustomStreamRespond(req, res, templates.ok, readStream, undefined, { mimeType });
	} catch (err) {
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{model}/meshes/{mesh}:
	 *   get:
	 *     description: Get the mesh with the specified ID for the specified model
	 *     tags: [Models]
	 *     operationId: getMesh
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
 	 *       - name: mesh
	 *         description: mesh ID
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
	 *         description:
	 *         content:
	 *           application/json
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 matrix:
	 *                   type: array
	 *                   description: 4x4 transformation matrix to be applied to the mesh.
	 *                   items:
	 *                     type: array
	 *                     items:
	 *                       type: number
	 *                 primitive:
	 *                   description: type of primitive used in the mesh.
	 *                   type: number
	 *                 vertices:
	 *                   description: Array holding 3d vectors describing vertex positions.
	 *                   type: array
	 *                   items:
	 *                     type: array
	 *                     items:
	 *                       type: number
	 *                 faces:
	 *                   type: array
	 *                   description: Array containing vertex indices making up the faces.
	 *                   items:
	 *                     type: number
	 */
	router.get('/:meshId', hasReadAccessToContainer, getMesh);

	return router;
};

module.exports = establishRoutes();
