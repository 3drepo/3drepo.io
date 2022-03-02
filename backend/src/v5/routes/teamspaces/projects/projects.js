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
const Projects = require('../../../processors/teamspaces/projects/projects');
const { Router } = require('express');
const { UUIDToString } = require('../../../utils/helper/uuids');
const { getUserFromSession } = require('../../../utils/sessions');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');
const { validateProjectData } = require('../../../middleware/dataConverter/inputs/teamspaces/projects/projects');

const serialiseProject = (project) => ({ ...project, _id: UUIDToString(project._id) });

const getProjectList = (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace } = req.params;
	Projects.getProjectList(teamspace, user).then((projects) => {
		respond(req, res, templates.ok, { projects: projects.map(serialiseProject) });
	}).catch((err) => respond(req, res, err));
};

const createProject = async (req, res) => {
	const user = getUserFromSession(req.session);
	const { teamspace } = req.params;
	const { name } = req.body;

	try {
		const newProject = await Projects.createProject(user, teamspace, name, req.session.user.permissions);
		respond(req, res, templates.ok, { ...newProject, _id: UUIDToString(newProject._id) });
	} catch (err) {
		respond(req, res, err);
	}
};

const deleteProject = async (req, res) => {
	const { teamspace, project } = req.params;

	try {
		await Projects.deleteProject(teamspace, project);
		respond(req, res, templates.ok);
	} catch (err) {
		respond(req, res, err);
	}
};

const editProject = async (req, res) => {
	const { teamspace, project } = req.params;
	const updatedProject = req.body;

	try {
		await Projects.editProject(teamspace, project, updatedProject);
		respond(req, res, templates.ok);
	} catch (err) {
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
	 *                         description: Project ID
	 *                         example: ef0857b6-4cc7-4be1-b2d6-c032dce7806a
	 *                       name:
	 *                         type: string
	 *                         description: name of the teamspace
	 *                         example: teamspace1
	 *                       isAdmin:
	 *                         type: boolean
	 *                         description: whether the user is an admin
	 *
	 *
	 */
	router.get('/', hasAccessToTeamspace, getProjectList);

	router.post('/', isTeamspaceAdmin, validateProjectData, createProject);

	router.delete('/:project', isTeamspaceAdmin, deleteProject);

	router.patch('/:project', isAdminToProject, validateProjectData, editProject);

	return router;
};

module.exports = establishRoutes();
