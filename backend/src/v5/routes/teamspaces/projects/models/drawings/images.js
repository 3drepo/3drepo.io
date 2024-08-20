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

const Metadata = require('../../../../../processors/teamspaces/projects/models/metadata');
const { Router } = require('express');
const { hasReadAccessToDrawing } = require('../../../../../middleware/permissions/permissions');
const { respond } = require('../../../../../utils/responder');
const { templates } = require('../../../../../utils/responseCodes');

const updateCustomMetadata = async (req, res) => {
	const { teamspace, drawing, metadata } = req.params;
	const updatedMetadata = req.body.metadata;

	try {
		await Metadata.updateCustomMetadata(teamspace, drawing, metadata, updatedMetadata);
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
	 * /teamspaces/{teamspace}/projects/{project}/drawings/{drawing}/thumbnail:
	 *   get:
	 *     description: Fetches the thumbnail for a drawing.
	 *     tags: [Drawing]
	 *     operationId: getThumbnail
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
	 *       - name: drawing
	 *         description: Drawing ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: returns a raster image of the thumbnail
	 */
	router.patch('/:metadata', hasReadAccessToDrawing, getThumbnail);

	return router;
};

module.exports = establishRoutes();
