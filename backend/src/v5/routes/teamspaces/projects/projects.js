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

const { hasAccessToTeamspace, isAdminToProject, isTeamspaceAdmin } = require('../../../middleware/permissions/permissions');
const Projects = require('../../../processors/teamspaces/projects');
const { Router } = require('express');
const { UUIDToString } = require('../../../utils/helper/uuids');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');
const { validateProjectData } = require('../../../middleware/dataConverter/inputs/teamspaces/projects');

const serialiseProject = (project) =>
	({ ...project, _id: UUIDToString(project._id) });

const getProjectList = (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace } = req.params;
	Projects.getProjectList(teamspace, user).then((projects) => {
		respond(req, res, templates.ok, { projects: projects.map(serialiseProject) });
	}).catch((err) =>
		respond(req, res, err));
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

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects:
	 *   get:
	 *     description: Get a list of projects within the specified teamspace the user has access to
	 *     tags: [Projects]
	 *     operationId: getProjectList
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
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

	/**
	 * @openapi
	 * /teamspaces/{teamspace}/projects:
	 *   post:
	 *     description: Creates a new project
	 *     tags: [Projects]
	 *     operationId: createProject
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
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
	 * /teamspaces/{teamspace}/projects/{project}:
	 *   delete:
	 *     description: Deletes a project
	 *     tags: [Projects]
	 *     operationId: deleteProject
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - project:
	 *         name: project
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
	 *     tags: [Projects]
	 *     operationId: updateProject
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - project:
	 *         name: project
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
	 * /teamspaces/{teamspace}/projects/{project}:
	 *   get:
	 *     description: Gets a project
	 *     tags: [Projects]
	 *     operationId: getProjectSettings
	 *     parameters:
	 *       - teamspace:
	 *         name: teamspace
	 *         description: name of teamspace
	 *         in: path
	 *         required: true
	 *         schema:
	 *           type: string
	 *       - project:
	 *         name: project
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

	return router;
};

module.exports = establishRoutes();
