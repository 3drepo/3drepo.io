/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { hasReadAccessToDrawing, hasWriteAccessToDrawing } = require('../../../../../middleware/permissions/permissions');
const { respond, writeStreamRespond } = require('../../../../../utils/responder');
const { validateNewDrawingRevisionData, validateUpdateRevisionData } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions');
const Drawings = require('../../../../../processors/teamspaces/projects/models/drawings');
const { Router } = require('express');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { serialiseRevisionArray } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/revisions');
const { templates } = require('../../../../../utils/responseCodes');

const getRevisions = async (req, res, next) => {
	const { teamspace, drawing } = req.params;
	const showVoid = req.query.showVoid === 'true';

	try {
		const revisions = await Drawings.getRevisions(teamspace, drawing, showVoid);
		req.outputData = revisions;
		next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateRevisionStatus = (req, res) => {
	const { teamspace, project, drawing, revision } = req.params;
	const status = req.body.void;

	Drawings.updateRevisionStatus(teamspace, project, drawing, revision, status).then(() => {
		respond(req, res, templates.ok);
	}).catch((err) => respond(req, res, err));
};

const createNewDrawingRevision = async (req, res) => {
	try {
		const { file } = req;
		const { teamspace, project, drawing } = req.params;
		const author = getUserFromSession(req.session);
		await Drawings.newRevision(teamspace, project, drawing, { ...req.body, author }, file);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const downloadRevisionFiles = async (req, res) => {
	const { teamspace, drawing, revision } = req.params;

	try {
		const file = await Drawings.downloadRevisionFiles(teamspace, drawing, revision);

		writeStreamRespond(req, res, templates.ok, file.readStream, file.filename, file.size);
	} catch (err) {
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });
	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/drawings/{drawing}/revisions:
	 *   get:
	 *     description: Get a list of revisions of a drawing
	 *     tags: [Revisions]
	 *     operationId: getDrawingRevisions
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
	 *       - name: drawing
	 *         description: Drawing ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: showVoid
	 *         description: Include void revisions or not
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: returns list of revisions
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 revisions:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       _id:
	 *                         type: string
	 *                         description: Revision ID
	 *                         example: ef0855b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       author:
	 *                         type: string
	 *                         description: name of the creator of the revision
	 *                         example: someUser
	 *                       timestamp:
	 *                         type: string
	 *                         description: Revision creation date
	 *                         example: 2018-06-28T11:15:47.000Z
	 *                       format:
	 *                         type: string
	 *                         description: File format
	 *                         example: .rvt
	 *
	 */
	router.get('', hasReadAccessToDrawing, getRevisions, serialiseRevisionArray);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/drawings/{drawing}/revisions:
	 *   post:
	 *     description: Create a new revision.
	 *     tags: [Revisions]
	 *     operationId: createNewDrawingRevision
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
	 *       - name: drawing
	 *         description: Drawing ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     requestBody:
	 *       content:
	 *         multipart/form-data:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               tag:
	 *                 description: Unique revision name
     *                 type: string
	 *                 example: rev01
	 *               desc:
	 *                 description: Description of the revision
	 *                 type: string
	 *                 example: Initial design
	 *               importAnimations:
	 *                 type: boolean
	 *                 description: Whether animations should be imported (Only relevant for .SPM uploads)
	 *               timezone:
	 *                 description: Timezone of the revision
	 *                 type: string
	 *                 example: Europe/Berlin
	 *               lod:
	 *                 description: Level of Detail (0 - 6)
	 *                 type: integer
	 *                 example: 0
	 *               file:
	 *                 type: string
	 *                 format: binary
	 *             required:
	 *               - tag
	 *               - file
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: creates a new revision
	 */
	router.post('', hasWriteAccessToDrawing, validateNewDrawingRevisionData, createNewDrawingRevision);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/drawings/{drawing}/revisions/{revision}:
	 *   patch:
	 *     description: Update a revision. Currently only the void status can be updated.
	 *     tags: [Revisions]
	 *     operationId: updateDrawingRevisionStatus
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
	 *       - name: drawing
	 *         description: Drawing ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: revision
	 *         description: Revision ID or Revision tag
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     requestBody:
	 *       content:
     *         application/json:
	 *           schema:
	 *             properties:
	 *               void:
	 *                 description: The new status value
	 *                 type: boolean
	 *             required:
	 *               - status
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: updates the status of the revision
	 */
	router.patch('/:revision', hasWriteAccessToDrawing, validateUpdateRevisionData, updateRevisionStatus);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/drawings/{drawing}/revisions/{revision}/files:
	 *   get:
	 *     description: Downloads the model files of the selected revision
	 *     tags: [Revisions]
	 *     operationId: downloadDrawingRevisionFiles
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
	 *       - name: drawing
	 *         description: Drawing ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: revision
	 *         description: Revision ID or Revision tag
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: downloads the revision files
	 *         content:
	 *           application/octet-stream:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
	router.get('/:revision/files/original', hasWriteAccessToDrawing, downloadRevisionFiles);

	return router;
};

module.exports = establishRoutes();
