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

const { hasReadAccessToDrawing, hasWriteAccessToDrawing } = require('../../../../../middleware/permissions/permissions');
const Calibrations = require('../../../../../processors/teamspaces/projects/models/drawings/calibrations');
const { Router } = require('express');
const { getUserFromSession } = require('../../../../../utils/sessions');
const { modelTypes } = require('../../../../../models/modelSettings.constants');
const { respond } = require('../../../../../utils/responder');
const { revisionExists } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions');
const { templates } = require('../../../../../utils/responseCodes');
const { validateNewCalibration } = require('../../../../../middleware/dataConverter/inputs/teamspaces/projects/models/drawings/calibrations');

const getCalibration = async (req, res) => {
	const { teamspace, project, drawing, revision } = req.params;

	try {
		const latestCalibration = await Calibrations.getLastAvailableCalibration(teamspace, project, drawing, revision);
		respond(req, res, templates.ok, latestCalibration);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const addCalibration = async (req, res) => {
	const { teamspace, project, drawing, revision } = req.params;
	const createdBy = getUserFromSession(req.session);

	try {
		await Calibrations.addCalibration(teamspace, project, drawing, revision, { ...req.body, createdBy });
		respond(req, res, templates.ok);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/drawings/{drawing}/revisions/{revision}/calibrations:
	 *   post:
	 *     description: Create a new calibration.
	 *     tags: [Calibrations]
	 *     operationId: createNewCalibration
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
	 *       - name: usePrevious
	 *         description: Whether or not to use the data of the last calibration of the last revision
	 *         in: query
	 *         required: false
	 *         schema:
	 *           type: boolean
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               horizontal:
	 *                 description: The horizontal array of the calibration
     *                 type: object
	 *                 properties:
	 *                   model:
	 *                     type: array
	 *                     items:
	 *                       type: array
	 *                       minItems: 3
	 *                       maxItems: 3
	 *                       example: [1, 2, 3]
	 *                       items:
	 *                         type: number
	 *                         example: 1
	 *                     example: [[1, 2, 3], [4, 5, 6]]
	 *                     minItems: 2
	 *                     maxItems: 2
	 *                   drawing:
	 *                     type: array
	 *                     items:
	 *                       type: array
	 *                       minItems: 2
	 *                       maxItems: 2
	 *                       example: [1, 2]
	 *                       items:
	 *                         type: number
	 *                         example: 1
	 *                     example: [[1, 2], [3, 4]]
	 *                     minItems: 2
	 *                     maxItems: 2
	 *                 example: { model: [[1, 2, 3], [4, 5, 6]], drawing: [[1, 2], [3, 4]] }
	 *               verticalRange:
	 *                 description: The vertical range of the calibration
	 *                 type: array
	 *                 items:
	 *                   type: number
	 *                   example: 0
	 *                 example: [0, 10]
	 *                 minItems: 2
	 *                 maxItems: 2
	 *               units:
	 *                 description: The units of the calibration
	 *                 type: string
	 *                 enum: [mm, cm, dm, m, ft]
	 *                 example: mm
	 *             required:
	 *               - horizontal
	 *               - verticalRange
	 *               - units
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       404:
	 *         $ref: "#/components/responses/teamspaceNotFound"
	 *       200:
	 *         description: creates a new calibration
	 */
	router.post('/', hasWriteAccessToDrawing, revisionExists(modelTypes.DRAWING), validateNewCalibration, addCalibration);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/drawings/{drawing}/revisions/{revision}/calibrations:
	 *   get:
	 *     description: Gets the latest available calibration for the revision.
	 *     tags: [Calibrations]
	 *     operationId: getCalibration
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
	 *         description: returns the latest calibration
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 horizontal:
	 *                   description: The horizontal array of the calibration
     *                   type: object
	 *                   properties:
	 *                     model:
	 *                       type: array
	 *                       items:
	 *                         type: array
	 *                         minItems: 3
	 *                         maxItems: 3
	 *                         example: [1, 2, 3]
	 *                         items:
	 *                           type: number
	 *                           example: 1
	 *                       example: [[1, 2, 3], [4, 5, 6]]
	 *                       minItems: 2
	 *                       maxItems: 2
	 *                     drawing:
	 *                       type: array
	 *                       items:
	 *                         type: array
	 *                         minItems: 2
	 *                         maxItems: 2
	 *                         example: [1, 2]
	 *                         items:
	 *                           type: number
	 *                           example: 1
	 *                       example: [[1, 2], [3, 4]]
	 *                       minItems: 2
	 *                       maxItems: 2
	 *                   example: { model: [[1, 2, 3], [4, 5, 6]], drawing: [[1, 2], [3, 4]] }
	 *                 verticalRange:
	 *                   description: The vertical range of the calibration
	 *                   type: array
	 *                   items:
	 *                     type: number
	 *                     example: 0
	 *                   example: [0, 10]
	 *                   minItems: 2
	 *                   maxItems: 2
	 *                 units:
	 *                   description: The units of the calibration
	 *                   type: string
	 *                   enum: [mm, cm, dm, m, ft]
	 *                   example: mm
	 *             example: { horizontal: { model: [[1, 2, 3], [4, 5, 6]], drawing: [[1, 2], [3, 4]] }, verticalRange: [0, 10], units: m }
	 */
	router.get('/', hasReadAccessToDrawing, revisionExists(modelTypes.DRAWING), getCalibration);

	return router;
};

module.exports = establishRoutes();
