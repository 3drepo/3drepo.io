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

const { hasAccessToTeamspace, isAdminToProject, isTeamspaceAdmin } = require('../../../middleware/permissions');
const { projectExists, validateProjectData } = require('../../../middleware/dataConverter/inputs/teamspaces/projects');
const { BYPASS_AUTH } = require('../../../utils/config.constants');
const Projects = require('../../../processors/teamspaces/projects');
const { Router } = require('express');
const { UUIDToString } = require('../../../utils/helper/uuids');
const { fileExtensionFromBuffer } = require('../../../utils/helper/typeCheck');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { singleImageUpload } = require('../../../middleware/dataConverter/multer');
const { templates } = require('../../../utils/responseCodes');

const serialiseProject = (project) => ({ ...project, _id: UUIDToString(project._id) });

const getProjectList = async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace } = req.params;
	try {
		const projects = await Projects.getProjectList(teamspace, user, req.app.get(BYPASS_AUTH));
		respond(req, res, templates.ok, { projects: projects.map(serialiseProject) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const createProject = async (req, res) => {
	const { teamspace } = req.params;
	const { name } = req.body;

	try {
		const newProjectId = await Projects.createProject(teamspace, name);
		respond(req, res, templates.ok, { _id: UUIDToString(newProjectId) });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const deleteProject = async (req, res) => {
	const { teamspace, project } = req.params;

	try {
		await Projects.deleteProject(teamspace, project);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateProject = async (req, res) => {
	const { teamspace, project } = req.params;
	const updatedProject = req.body;

	try {
		await Projects.updateProject(teamspace, project, updatedProject);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getProject = async (req, res) => {
	const { teamspace, project } = req.params;

	try {
		const projectSettings = await Projects.getProjectSettings(teamspace, project);
		respond(req, res, templates.ok, projectSettings);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getImage = async (req, res) => {
	const { teamspace, project } = req.params;

	try {
		const buffer = await Projects.getImage(teamspace, project);
		const fileExt = await fileExtensionFromBuffer(buffer);
		req.params.format = fileExt || 'png';
		respond(req, res, templates.ok, buffer);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateImage = async (req, res) => {
	const { teamspace, project } = req.params;

	try {
		await Projects.updateImage(teamspace, project, req.file.buffer);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const deleteImage = async (req, res) => {
	const { teamspace, project } = req.params;

	try {
		await Projects.deleteImage(teamspace, project);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getDrawingCategories = (req, res) => {
	try {
		const drawingCategories = Projects.getDrawingCategories();
		respond(req, res, templates.ok, { drawingCategories });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getStatusCodes = (req, res) => {
	try {
		const statusCodes = Projects.getStatusCodes();
		respond(req, res, templates.ok, { statusCodes });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = (isInternal) => {
	const router = Router({ mergeParams: true });

	if (!isInternal) {
		/**
		 * @openapi
		 * /teamspaces/{teamspace}/projects/{project}:
		 *   get:
		 *     description: Gets a project
		 *     tags: [v:external, Projects]
		 *     operationId: getProjectSettings
		 *     parameters:
		 *       - name: teamspace
		 *         description: name of teamspace
		 *         in: path
		 *         required: true
		 *         schema:
		 *           type: string
		 *       - name: project
		 *         description: Id of the project
		 *         in: path
		 *         required: true
		 *         schema:
		 *           type: string
		 *           format: uuid
		 *     responses:
		 *       401:
		 *         $ref: "#/components/responses/notLoggedIn"
		 *       200:
		 *         description: returns a project
		 *         content:
		 *           application/json:
		 *             schema:
		 *               type: object
		 *               properties:
		 *                 name:
		 *                   type: string
		 *                   description: Name of the project
		 *                   example: project1
		 */
		router.get('/:project', hasAccessToTeamspace, getProject);

		/**
		 * @openapi
		 * /teamspaces/{teamspace}/projects/{project}:
		 *   delete:
		 *     description: Deletes a project
		 *     tags: [v:external, Projects]
		 *     operationId: deleteProject
		 *     parameters:
		 *       - name: teamspace
		 *         description: name of teamspace
		 *         in: path
		 *         required: true
		 *         schema:
		 *           type: string
		 *       - name: project
		 *         description: Id of the project
		 *         in: path
		 *         required: true
		 *         schema:
		 *           type: string
		 *           format: uuid
		 *     responses:
		 *       401:
		 *         $ref: "#/components/responses/notLoggedIn"
		 *       200:
		 *         description: Delete a project
		 */
		router.delete('/:project', isTeamspaceAdmin, deleteProject);

		/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}:
	 *   patch:
	 *     description: Edits a project
	 *     tags: [v:external, Projects]
	 *     operationId: updateProject
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Id of the project
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 description: The new name of the project
	 *                 example: project 1
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Update the project settings
	 */
		router.patch('/:project', isAdminToProject, validateProjectData, updateProject);

		/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/image:
	 *   get:
	 *     description: Gets a project image
	 *     tags: [v:external, Projects]
	 *     operationId: getProjectImage
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Id of the project
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: returns a project image
	 *         content:
	 *           image/png:
	 *             schema:
	 *               type: string
	 *               format: binary
	 */
		router.get('/:project/image', hasAccessToTeamspace, projectExists, getImage);

		/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/image:
	 *   put:
	 *     description: Upload a project image
	 *     tags: [v:external, Projects]
	 *     operationId: uploadProjectImage
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Id of the project
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
	 *               file:
	 *                 type: string
	 *                 format: binary
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         $ref: "#/components/responses/ok"
	 */
		router.put('/:project/image', isAdminToProject, singleImageUpload('file'), updateImage);

		/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects/{project}/image:
	 *   delete:
	 *     description: Deletes a project image
	 *     tags: [v:external, Projects]
	 *     operationId: deleteProjectImage
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - name: project
	 *         description: Id of the project
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *           format: uuid
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         $ref: "#/components/responses/ok"
	 */
		router.delete('/:project/image', isAdminToProject, deleteImage);

		/**
	* @openapi
	* /teamspaces/{teamspace}/projects/{project}/settings/drawingCategories:
	*   get:
	*     description: Get the list of drawing categories available within the project
	*     tags: [v:external, Projects]
	*     operationId: getDrawingCategories
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*       - name: project
	*         description: Id of the project
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*           format: uuid
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
		router.get('/:project/settings/drawingCategories', isAdminToProject, getDrawingCategories);

		/**
	* @openapi
	* /teamspaces/{teamspace}/projects/{project}/settings/statusCodes:
	*   get:
	*     description: Get the list of status codes available within the project
	*     tags: [v:external, Projects]
	*     operationId: getStatusCodes
	*     parameters:
	*       - name: teamspace
	*         description: name of teamspace
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*       - name: project
	*         description: Id of the project
	*         in: path
	*         required: true
	*         schema:
	*           type: string
	*           format: uuid
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: returns the array of status codes
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 statusCodes:
	*                   type: array
	*                   items:
	*                     type: object
	*                     properties:
	*                       code:
	*                         type: string
	*                         description: The status code
	*                         example: S1
	*                       description:
	*                         type: string
	*                         description: Suitable for coordinationn
	*                         example: S1
	*             example: [ { code: "S0", description: "Initial status" }, { code: "S1", description: "Suitable for coordination" }]
	*/
		router.get('/:project/settings/statusCodes', hasAccessToTeamspace, projectExists, getStatusCodes);
	}

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects:
	 *   post:
	 *     description: Creates a new project
	 *     tags: [v:external, v:internal,Projects]
	 *     operationId: createProject
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               name:
	 *                 type: string
	 *                 description: The name of the new project
	 *                 example: project 1
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Create a new project
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 _id:
	 *                   type: string
	 *                   format: uuid
	 *                   description: The id of the new project
	 *                   example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 */
	router.post('/', isTeamspaceAdmin, validateProjectData, createProject);

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects:
	 *   get:
	 *     description: Get a list of projects within the specified teamspace the user has access to
	 *     tags: [v:external, v:internal, Projects]
	 *     operationId: getProjectList
	 *     parameters:
	 *       - name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: returns list of projects
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 projects:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       id:
	 *                         type: string
	 *                         format: uuid
	 *                         description: Project ID
	 *                         example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       name:
	 *                         type: string
	 *                         description: name of the project
	 *                         example: project1
	 *                       isAdmin:
	 *                         type: boolean
	 *                         description: whether the user is an admin
	 *
	 *
	 */
	router.get('/', hasAccessToTeamspace, getProjectList);

	return router;
};

module.exports = establishRoutes;
