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

const { createProject, deleteProject, editProject, getProjectById, getProjectList } = require('../../../models/projects');
const {
	hasProjectAdminPermissions,
	hasReadAccessToModel,
	isTeamspaceAdmin,
} = require('../../../utils/permissions/permissions');
const { deleteModels } = require('../../../models/modelSettings');

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

const projAdminPermissions = [
	'create_model',
	'create_federation',
	'admin_project',
	'edit_project',
	'delete_project',
	'upload_files_all_models',
	'edit_federation_all_models',
	'create_issue_all_models',
	'comment_issue_all_models',
	'view_issue_all_models',
	'view_model_all_models',
	'download_model_all_models',
	'change_model_settings_all_models',
];

Projects.createProject = async (username, teamspace, name) => {
	const project = { name, models: [], permissions: [] };
	const addedProject = await createProject(teamspace, project);
	return { ...addedProject, permissions: projAdminPermissions };
};

Projects.deleteProject = async (teamspace, projectId) => {
	const project = await getProjectById(teamspace, projectId, { models: 1 });
	await deleteProject(teamspace, projectId);

	if (project.models.length > 0) {
		await deleteModels(teamspace, project.models);
	}
};

Projects.editProject = async (teamspace, projectId, updatedProject) => {
	await editProject(teamspace, projectId, updatedProject);
};

module.exports = Projects;
