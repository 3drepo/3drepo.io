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

const Metadata = require('../../../../processors/teamspaces/projects/models/metadata');
const { Router } = require('express');
const { hasWriteAccessToContainer } = require('../../../../middleware/permissions/permissions');
const { respond } = require('../../../../utils/responder');
const { templates } = require('../../../../utils/responseCodes');
const { validateUpdateMetadata } = require('../../../../middleware/dataConverter/inputs/teamspaces/projects/models/metadata');

const updateMetadata = async (req, res) => {
	const { teamspace, container, metadata } = req.params;
	const updatedMetadata = req.body.metadata;

	try {
		await Metadata.updateMetadata(teamspace, container, metadata, updatedMetadata);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

    /**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/metadata/{metadata}:
	 *   patch:
	 *     description: Adds, removes or edits metadata of an element of a 3D model. If a metadata does not exist it is added and if it exists it is updated. To remove a metadata provide null value.
	 *     tags: [Containers]
	 *     operationId: updateMetadata
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
	 *       - metadata:
	 *         name: metadata
	 *         description: Metadata ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
     *     requestBody:
	 *       content:
     *         application/json:
	 *           schema:
	 *             properties:
	 *               metadata:
	 *                 description: The metadata to be added, removed or updated
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     key:
	 *                       description: The key of the metadata
	 *                       type: string
     *                       example: Length
	 *                     value:
	 *                       description: The value of the metadata
     *                       type: string
	 *                       example: 100mm
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Adds, removes or edits metadata of an element of a 3D model
	 */
	router.patch('/:metadata', hasWriteAccessToContainer, validateUpdateMetadata, updateMetadata);

	return router;
};

module.exports = establishRoutes();
