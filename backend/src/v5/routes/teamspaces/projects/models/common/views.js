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

const { getThumbnail: conGetThumbnail, getViewList: conGetViewList } = require('../../../../../processors/teamspaces/projects/models/containers');
const { getThumbnail: fedGetThumbnail, getViewList: fedGetViewList } = require('../../../../../processors/teamspaces/projects/models/federations');
const { hasReadAccessToContainer, hasReadAccessToFederation } = require('../../../../../middleware/permissions');
const { mimeTypes, respond } = require('../../../../../utils/responder');
const { Router } = require('express');
const { fileMimeFromBuffer } = require('../../../../../utils/helper/typeCheck');
const { serialiseViews } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/views');
const { templates } = require('../../../../../utils/responseCodes');

const getViewList = (isFed) => async (req, res, next) => {
	const { teamspace, model } = req.params;
	try {
		const fn = isFed ? fedGetViewList : conGetViewList;
		const views = await fn(teamspace, model);
		req.outputData = views;
		next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getViewThumbnail = (isFed) => async (req, res) => {
	const { teamspace, model, view } = req.params;

	try {
		const fn = isFed ? fedGetThumbnail : conGetThumbnail;
		const image = await fn(teamspace, model, view);
		const mimeType = await fileMimeFromBuffer(image) || mimeTypes.png;
		respond(req, res, templates.ok, image, { cache: true, mimeType });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (isFed) => {
	const router = Router({ mergeParams: true });
	const hasReadAccess = isFed ? hasReadAccessToFederation : hasReadAccessToContainer;
	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/views:
	 *   get:
	 *     description: Get the list of views available within the model
	 *     tags: [Views]
	 *     operationId: ViewsList
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
	 *       - name: type
 	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
 	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/federationNotFound"
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
	router.get('/', hasReadAccess, getViewList(isFed), serialiseViews);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/views/{view}/thumbnail:
	 *   get:
	 *     description: Get the thumbnail of the view specified
	 *     tags: [Views]
	 *     operationId: ViewThumbnail
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
	 *       - name: type
 	 *         description: Model type
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           enum: [containers, federations]
	 *       - name: model
 	 *         description: Container/Federation ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: view
	 *         description: View ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
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
	router.get('/:view/thumbnail', hasReadAccess, getViewThumbnail(isFed));

	return router;
};

module.exports = establishRoutes;
