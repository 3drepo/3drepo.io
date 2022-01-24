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
const Views = require('../../../../processors/teamspaces/projects/models/federations');
const { fromBuffer: fileTypeFromBuffer } = require('file-type');
const { hasReadAccessToFederation } = require('../../../../middleware/permissions/permissions');
const { serialiseViews } = require('../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/views');
const { templates } = require('../../../../utils/responseCodes');

const getViewList = (req, res, next) => {
	const { teamspace, federation } = req.params;
	Views.getViewList(teamspace, federation)
		.then((views) => {
			req.outputData = views;
			next();
		}).catch(
			// istanbul ignore next
			(err) => respond(req, res, err),
		);
};

const getViewThumbnail = async (req, res) => {
	const { teamspace, federation, view } = req.params;

	try {
		const image = await Views.getThumbnail(teamspace, federation, view);
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
	 * /teamspaces/{teamspace}/projects/{project}/federations/{federation}/views:
	 *   get:
	 *     description: Get the list of views available within the federation
	 *     tags: [Federations]
	 *     operationId: FederationViewsList
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
	 *       - federation:
	 *         name: federation
	 *         description: Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *         type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/federationsNotFound"
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
	 * /teamspaces/{teamspace}/projects/{project}/federations/{federation}/views/{view}/thumbnail:
	 *   get:
	 *     description: Get the thumbnail of the view specified
	 *     tags: [Federations]
	 *     operationId: FederationViewThumbnail
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
	 *       - federation:
	 *         name: federation
	 *         description: Federation ID
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
	router.get('/', hasReadAccessToFederation, getViewList, serialiseViews);
	router.get('/:view/thumbnail', hasReadAccessToFederation, getViewThumbnail);

	return router;
};

module.exports = establishRoutes();
