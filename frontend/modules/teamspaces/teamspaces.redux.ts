/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { createActions, createReducer } from 'reduxsauce';
import { cloneDeep, keyBy } from 'lodash';

export const { Types: TeamspacesTypes, Creators: TeamspacesActions } = createActions({
	setTeamspaces: ['teamspaces'],
	setModelUploadStatus: ['teamspace', 'project', 'model', 'status'],
	// Projects
	createProject: ['teamspace', 'projectData'],
	updateProject: ['teamspace', 'projectName', 'projectData'],
	removeProject: ['teamspace', 'projectName'],
	createProjectSuccess: ['teamspace', 'projectData'],
	updateProjectSuccess: ['teamspace', 'projectName', 'projectData'],
	removeProjectSuccess: ['teamspace', 'projectName'],
	// Models
	createModel: ['teamspace', 'modelData'],
	updateModel: ['teamspace', 'modelId', 'modelData'],
	removeModel: ['teamspace', 'modelData'],
	createModelSuccess: ['teamspace', 'modelData'],
	updateModelSuccess: ['teamspace', 'modelId', 'modelData'],
	removeModelSuccess: ['teamspace', 'modelData']
}, { prefix: 'TEAMSPACES_' });

export const INITIAL_STATE = {
	teamspaces: []
};

const setTeamspaces = (state = INITIAL_STATE, action) => {
	const teamspaces = keyBy(action.teamspaces, 'account');
	return { ...state, teamspaces };
};

// Projects
const updateProjectSuccess = (state = INITIAL_STATE, action) => {
	const teamspaces = { ...state.teamspaces };
	const projects = [...state.teamspaces[action.teamspace].projects].map((project) => {
		if (project.name === action.projectName) {
			return { ...project, ...action.projectData };
		}
		return project;
	});
	teamspaces[action.teamspace].projects = projects;

	return { ...state, teamspaces };
};

const createProjectSuccess = (state = INITIAL_STATE, action) => {
	const teamspaces = cloneDeep(state.teamspaces);
	teamspaces[action.teamspace].projects.push(action.projectData);

	return { ...state, teamspaces };
};

const removeProjectSuccess = (state = INITIAL_STATE, action) => {
	const teamspaces = cloneDeep(state.teamspaces);
	const projects = [...state.teamspaces[action.teamspace].projects]
		.filter(({ name }) => name !== action.projectName);
	teamspaces[action.teamspace].projects = projects;

	return { ...state, teamspaces };
};

const getModelData = (state, teamspace, projectName) => {
	const teamspaces = { ...state.teamspaces };
	const projects = [...state.teamspaces[teamspace].projects];
	const projectIndex = projects.findIndex((project) => project.name === projectName);
	const foundProject = projects[projectIndex];

	return { projectIndex, foundProject, teamspaces };
};

// Models
const updateModelSuccess = (state = INITIAL_STATE, action) => {
	const { projectIndex, foundProject, teamspaces } = getModelData(state, action.teamspace, action.modelData.project);
	const modelIndex = foundProject.models.findIndex((model) => model.name === action.modelData.modelName);
	teamspaces[action.teamspace].projects[projectIndex].models[modelIndex].subModels = action.modelData.subModels;

	return { ...state, teamspaces };
};

const createModelSuccess = (state = INITIAL_STATE, action) => {
	const { projectIndex, foundProject, teamspaces } = getModelData(state, action.teamspace, action.modelData.projectName);
	const targetModels = foundProject.models;
	teamspaces[action.teamspace].projects[projectIndex].models = [...targetModels, action.modelData];

	return { ...state, teamspaces };
};

const removeModelSuccess = (state = INITIAL_STATE, action) => {
	const { projectIndex, foundProject, teamspaces } = getModelData(state, action.teamspace, action.modelData.projectName);
	const updatedModels = foundProject.models.filter((model) => model.name !== action.modelData.name);
	teamspaces[action.teamspace].projects[projectIndex].models = updatedModels;

	return { ...state, teamspaces };
};

const setModelUploadStatus = (state = INITIAL_STATE, action) => {
	const { projectIndex, foundProject, teamspaces } = getModelData(state, action.teamspace, action.project);
	const modelIndex = foundProject.models.findIndex((model) => model.model === action.model);
	teamspaces[action.teamspace].projects[projectIndex].models[modelIndex].status = action.status;

	return { ...state, teamspaces };
};

export const reducer = createReducer({ ...INITIAL_STATE }, {
	[TeamspacesTypes.SET_TEAMSPACES]: setTeamspaces,
	[TeamspacesTypes.SET_MODEL_UPLOAD_STATUS]: setModelUploadStatus,
	// Projects
	[TeamspacesTypes.UPDATE_PROJECT_SUCCESS]: updateProjectSuccess,
	[TeamspacesTypes.CREATE_PROJECT_SUCCESS]: createProjectSuccess,
	[TeamspacesTypes.REMOVE_PROJECT_SUCCESS]: removeProjectSuccess,
	// Models
	[TeamspacesTypes.UPDATE_MODEL_SUCCESS]: updateModelSuccess,
	[TeamspacesTypes.CREATE_MODEL_SUCCESS]: createModelSuccess,
	[TeamspacesTypes.REMOVE_MODEL_SUCCESS]: removeModelSuccess
});
