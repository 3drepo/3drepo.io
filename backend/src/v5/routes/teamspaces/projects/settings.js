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
	*                   example: ["Architectural, "Existing", "GIS"]
	*/
	router.get('/drawingCategories', getDrawingCategories);

	return router;
};

module.exports = establishRoutes();
