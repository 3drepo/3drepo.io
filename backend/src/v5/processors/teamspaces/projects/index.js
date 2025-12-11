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

const { MODEL_CATEGORIES, modelTypes, statusCodes } = require('../../../models/modelSettings.constants');
const { createProject, deleteProject, getProjectById, getProjectList, updateProject } = require('../../../models/projectSettings');
const { getFile, removeFile, storeFile } = require('../../../services/filesManager');
const {
	hasProjectAdminPermissions,
	hasReadAccessToSomeModels,
	isTeamspaceAdmin,
} = require('../../../utils/permissions');
const { COL_NAME } = require('../../../models/projectSettings.constants');
const { deleteDrawing } = require('./models/drawings');
const { getAllTemplates } = require('../../../models/tickets.templates');
const { getModelById } = require('../../../models/modelSettings');
const { removeModelData } = require('../../../utils/helper/models');

const Projects = {};

Projects.getProjectList = async (teamspace, user, bypassAuth) => {
	const [projects, tsAdmin] = await Promise.all([
		getProjectList(teamspace, { _id: 1, name: 1, permissions: 1, models: 1 }),
		bypassAuth ? Promise.resolve(true) : isTeamspaceAdmin(teamspace, user),
	]);
	return (await Promise.all(projects.map(async ({ _id, name, permissions, models }) => {
		const isAdmin = tsAdmin || hasProjectAdminPermissions(permissions, user);
		const hasAccess = isAdmin || await hasReadAccessToSomeModels(teamspace, _id, models, user);
		return hasAccess ? { _id, name, isAdmin } : [];
	}))).flat();
};

Projects.createProject = (teamspace, name) => createProject(teamspace, name);

Projects.deleteProject = async (teamspace, projectId) => {
	const project = await getProjectById(teamspace, projectId, { models: 1 });

	await Promise.all(project.models.map(async (model) => {
		const { modelType } = await getModelById(teamspace, model, { modelType: 1 });

		if (modelType === modelTypes.DRAWING) {
			return deleteDrawing(teamspace, projectId, model);
		}

		return removeModelData(teamspace, projectId, model);
	}));

	await deleteProject(teamspace, projectId);
};

// passing project in to future proof this - the list will be filtered by project settings configurations
Projects.getAllTemplates = (teamspace, project, getDetails, showDeprecated) => {
	const projection = getDetails ? undefined : {
		name: 1,
		deprecated: 1,
		code: 1,
	};

	return getAllTemplates(teamspace, showDeprecated, projection);
};

Projects.getProjectSettings = (teamspace, projectId) => getProjectById(teamspace, projectId, { name: 1, _id: 0 });

Projects.updateProject = updateProject;

Projects.getImage = (teamspace, project) => getFile(teamspace, COL_NAME, project);

Projects.updateImage = (teamspace, project, imageBuffer) => storeFile(teamspace, COL_NAME, project, imageBuffer);

Projects.deleteImage = (teamspace, project) => removeFile(teamspace, COL_NAME, project);

Projects.getDrawingCategories = () => MODEL_CATEGORIES;

Projects.getStatusCodes = () => statusCodes;

module.exports = Projects;
