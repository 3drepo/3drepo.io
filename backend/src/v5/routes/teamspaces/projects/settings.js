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

const ProjectSettings = require('../../../processors/teamspaces/projects/settings');
const { Router } = require('express');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');

const getDrawingCategories = async (req, res) => {
	try {
		const drawingCategories = await ProjectSettings.getDrawingCategories();
		respond(req, res, templates.ok, { drawingCategories });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	* @openapi
	* /teamspaces/{teamspace}/projects/{project}/settings/drawingCategories:
	*   get:
	*     description: Get the list of drawing categories available within the project
	*     tags: [Teamspaces]
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*     operationId: getDrawingCategories
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: returns the array of drawing categories
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 drawingCategories:
	*                   type: array
	*                   items:
	*                     type: string
	*                   example: ["Architectural", "Existing", "GIS"]
	*/
	router.get('/drawingCategories', getDrawingCategories);

	return router;
};

module.exports = establishRoutes();
