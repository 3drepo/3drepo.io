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

const { mimeTypes, respond } = require('../../../../utils/responder');
const { Router } = require('express');
const Views = require('../../../../processors/teamspaces/projects/models/containers');
const { fromBuffer: fileTypeFromBuffer } = require('file-type');
const { hasReadAccessToContainer } = require('../../../../middleware/permissions/permissions');
const { serialiseViews } = require('../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/views');
const { templates } = require('../../../../utils/responseCodes');

const getViewList = (req, res, next) => {
	const { teamspace, container } = req.params;
	Views.getViewList(teamspace, container)
		.then((views) => {
			req.outputData = views;
			next();
		}).catch(
			// istanbul ignore next
			(err) => respond(req, res, err),
		);
};

const getViewThumbnail = async (req, res) => {
	const { teamspace, container, view } = req.params;

	try {
		const image = await Views.getThumbnail(teamspace, container, view);
		const mimeType = await fileTypeFromBuffer(image)?.mime || mimeTypes.png;
		respond(req, res, templates.ok, image, { cache: true, mimeType });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });
	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/views:
	 *   get:
	 *     description: Get the list of views available within the container
	 *     tags: [Containers]
	 *     operationId: ContainerViewsList
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
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/containersNotFound"
	 *       200:
	 *         description: returns list of views
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 views:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       _id:
	 *                         type: string
	 *                         format: uuid
	 *                         description: unique identifier for the view
	 *                       name:
	 *                         type: string
	 *                         description: name of the view
	 *                         example: Floor 1
	 *                       hasThumbnail:
	 *                         type: boolean
	 *                         description: indicates whether a thumbnail is available for the view
	 */

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/views/{view}/thumbnail:
	 *   get:
	 *     description: Get the thumbnail of the view specified
	 *     tags: [Containers]
	 *     operationId: ContainerViewThumbnail
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
	 *           format: uuid
	 *       - container:
	 *         name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - view:
	 *         name: view
	 *         description: View ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *         type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/thumbnailNotFound"
	 *       200:
	 *         description: returns a png of the thumbnail
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/', hasReadAccessToContainer, getViewList, serialiseViews);
	router.get('/:view/thumbnail', hasReadAccessToContainer, getViewThumbnail);

	return router;
};

module.exports = establishRoutes();
