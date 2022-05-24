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

const { createProject, deleteProject, getProjectById, getProjectList, updateProject } = require('../../../models/projectSettings');
const {
	hasProjectAdminPermissions,
	hasReadAccessToModel,
	isTeamspaceAdmin,
} = require('../../../utils/permissions/permissions');
const { removeModelData } = require('../../../utils/helper/models');

const Projects = {};

const hasSomeModelAccess = async (teamspace, models, user) => {
	const modelAccess = await Promise.all(models.map((model) => hasReadAccessToModel(teamspace, model, user)));
	return modelAccess.some((bool) => bool);
};

Projects.getProjectList = async (teamspace, user) => {
	const projects = await getProjectList(teamspace, { _id: 1, name: 1, permissions: 1, models: 1 });
	const tsAdmin = await isTeamspaceAdmin(teamspace, user);
	return (await Promise.all(projects.map(async ({ _id, name, permissions, models }) => {
		const isAdmin = tsAdmin || hasProjectAdminPermissions(permissions, user);
		const hasAccess = isAdmin || await hasSomeModelAccess(teamspace, models, user);
		return hasAccess ? { _id, name, isAdmin } : [];
	}))).flat();
};

Projects.createProject = (teamspace, name) => createProject(teamspace, name);

Projects.deleteProject = async (teamspace, projectId) => {
	const project = await getProjectById(teamspace, projectId, { models: 1 });

	await Promise.all(project.models.map((model) => removeModelData(teamspace, model)));

	await deleteProject(teamspace, projectId);
};

Projects.getProjectSettings = (teamspace, projectId) => getProjectById(teamspace, projectId, { name: 1, _id: 0 });

Projects.updateProject = updateProject;

module.exports = Projects;
