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

const { hasReadAccessToContainer, hasReadAccessToDrawing, hasWriteAccessToContainer, hasWriteAccessToDrawing } = require('../../../../../middleware/permissions/permissions');
const { respond, writeStreamRespond } = require('../../../../../utils/responder');
const Containers = require('../../../../../processors/teamspaces/projects/models/containers');
const Drawings = require('../../../../../processors/teamspaces/projects/models/drawings');
const { Router } = require('express');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { serialiseRevisionArray } = require('../../../../../middleware/dataConverter/outputs/teamspaces/projects/models/commons/revisions');
const { templates } = require('../../../../../utils/responseCodes');
const { validateNewRevisionData: validateNewContainerRev } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/containers');
const { validateNewRevisionData: validateNewDrawingRev } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/drawings');
const { validateUpdateRevisionData } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions');

const getRevisions = (modelType) => async (req, res, next) => {
	const { teamspace, model } = req.params;
	const showVoid = req.query.showVoid === 'true';

	const fn = {
		[modelTypes.CONTAINER]: Containers.getRevisions,
		[modelTypes.DRAWING]: Drawings.getRevisions,
	};

	try {
		const revisions = await fn[modelType](teamspace, model, showVoid);
		req.outputData = revisions;
		next();
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const updateRevisionStatus = (modelType) => async (req, res) => {
	const { teamspace, project, model, revision } = req.params;
	const status = req.body.void;

	const fn = {
		[modelTypes.CONTAINER]: Containers.updateRevisionStatus,
		[modelTypes.DRAWING]: Drawings.updateRevisionStatus,
	};

	try {
		await fn[modelType](teamspace, project, model, revision, status);
		respond(req, res, templates.ok);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const createNewRevision = (modelType) => async (req, res) => {
	const { file } = req;
	const { teamspace, project, model } = req.params;
	const owner = getUserFromSession(req.session);

	const fn = {
		[modelTypes.CONTAINER]: () => Containers.newRevision(teamspace, model,
			{ ...req.body, owner }, file),
		[modelTypes.DRAWING]: () => Drawings.newRevision(teamspace, project, model,
			{ ...req.body, author: owner }, file),
	};

	try {
		await fn[modelType]();
		respond(req, res, templates.ok);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const downloadRevisionFiles = (modelType) => async (req, res) => {
	const { teamspace, model, revision } = req.params;

	const fn = {
		[modelTypes.CONTAINER]: Containers.downloadRevisionFiles,
		[modelTypes.DRAWING]: Drawings.downloadRevisionFiles,
	};

	try {
		const file = await fn[modelType](teamspace, model, revision);
		writeStreamRespond(req, res, templates.ok, file.readStream, file.filename, file.size);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const establishRoutes = (modelType) => {
	const router = Router({ mergeParams: true });

	const hasReadAccessToModel = {
		[modelTypes.CONTAINER]: hasReadAccessToContainer,
		[modelTypes.DRAWING]: hasReadAccessToDrawing,
	};

	const hasWriteAccessToModel = {
		[modelTypes.CONTAINER]: hasWriteAccessToContainer,
		[modelTypes.DRAWING]: hasWriteAccessToDrawing,
	};

	const validateNewModelRev = {
		[modelTypes.CONTAINER]: validateNewContainerRev,
		[modelTypes.DRAWING]: validateNewDrawingRev,
	};

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/revisions:
	 *   get:
	 *     description: Get a list of revisions of a model
	 *     tags: [Revisions]
	 *     operationId: getModelRevisions
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
	 *           enum: [containers, drawings]
	 *       - name: model
	 *         description: Model ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
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
	 *                         type: number
	 *                         description: Revision creation date
	 *                         example: 1644925152000
	 *                       format:
	 *                         type: string
	 *                         description: File format
	 *                         example: .rvt
	 *                       tag:
	 *                         description: Unique revision name
	 *                         type: string
	 *                         example: rev01
	 *                       statusCode:
	 *                         type: string
	 *                         description: Revision status code
	 *                         example: S0
	 *                       revCode:
	 *                         type: string
	 *                         description: Revision code
	 *                         example: P01
	 *                       desc:
	 *                         type: string
	 *                         description: Revision description
	 *                         example: Level 2 floor plan
	 *                       void:
	 *                         type: boolean
	 *                         description: Whether revision is void or not
	 *                         example: false
	 *             examples:
     *               containers:
	 *                 summary: containers
     *                 value:
	 *                   revisions: [{ _id: ef0855b6-4cc7-4be1-b2d6-c032dce7806a, author: someUser, timestamp: 1644925152000, format: .rvt, tag: rev01, desc: The Architecture model of the Lego House, void: true }]
	 *               drawings:
	 *                 summary: drawings
     *                 value:
	 *                   revisions: [{ _id: ef0855b6-4cc7-4be1-b2d6-c032dce7806a, author: someUser, timestamp: 1644925152000, format: .rvt, statusCode: S0, revCode: P01, desc: The Architecture model of the Lego House, void: true }]
	 */
	router.get('', hasReadAccessToModel[modelType], getRevisions(modelType), serialiseRevisionArray);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/revisions:
	 *   post:
	 *     description: Create a new revision.
	 *     tags: [Revisions]
	 *     operationId: createNewModelRevision
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
	 *           enum: [containers, drawings]
	 *       - name: model
	 *         description: Model ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
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
	 *               statusCode:
	 *                 type: string
	 *                 description: Revision status code
	 *                 example: S0
	 *               revCode:
	 *                 type: string
	 *                 description: Revision code
	 *                 example: P01
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
	 *               - statusCode
	 *               - revCode
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: creates a new revision
	 */
	router.post('', hasWriteAccessToModel[modelType], validateNewModelRev[modelType], createNewRevision(modelType));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/{type}/{model}/revisions/{revision}:
	 *   patch:
	 *     description: Update a revision. Currently only the void status can be updated.
	 *     tags: [Revisions]
	 *     operationId: updateModelRevisionStatus
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
	 *           enum: [containers, drawings]
	 *       - name: model
	 *         description: Model ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
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
	router.patch('/:revision', hasWriteAccessToModel[modelType], validateUpdateRevisionData, updateRevisionStatus(modelType));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/containers/{container}/revisions/{revision}/files:
	 *   get:
	 *     description: Downloads the container files of the selected revision
	 *     tags: [Revisions]
	 *     operationId: downloadContainerRevisionFiles
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
	 *       - name: container
	 *         description: Container ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
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
	router.get('/:revision/files', hasWriteAccessToContainer, downloadRevisionFiles(modelTypes.CONTAINER));

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/drawings/{drawing}/revisions/{revision}/files/original:
	 *   get:
	 *     description: Downloads the drawing files of the selected revision
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
	 *           format: uuid
	 *       - name: drawing
	 *         description: Drawing ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *       - name: revision
	 *         description: Revision ID
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
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
	router.get('/:revision/files/original', hasWriteAccessToDrawing, downloadRevisionFiles(modelTypes.DRAWING));

	return router;
};

module.exports = establishRoutes;
