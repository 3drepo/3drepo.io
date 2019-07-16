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

import { cloneDeep, keyBy } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';
import { sortByField } from '../../helpers/sorting';

export const { Types: TeamspacesTypes, Creators: TeamspacesActions } = createActions({
	fetchTeamspaces: ['username'],
	fetchTeamspacesSuccess: ['entities'],
	setPendingState: ['pendingState'],
	setModelUploadStatus: ['teamspace', 'project', 'model', 'modelData'],
	setComponentState: ['componentState'],
	// Projects
	createProject: ['teamspace', 'projectData'],
	updateProject: ['teamspace', 'projectId', 'projectData'],
	removeProject: ['teamspace', 'projectId'],
	createProjectSuccess: ['teamspace', 'projectData'],
	updateProjectSuccess: ['projectData'],
	removeProjectSuccess: ['teamspace', 'projectId'],
	// Models
	createModel: ['teamspace', 'modelData'],
	updateModel: ['teamspace', 'modelId', 'modelData'],
	removeModel: ['teamspace', 'modelData'],
	createModelSuccess: ['teamspace', 'modelData'],
	updateModelSuccess: ['teamspace', 'modelId', 'modelData'],
	removeModelSuccess: ['teamspace', 'modelData']
}, { prefix: 'TEAMSPACES/' });

export const INITIAL_STATE = {
	teamspaces: {},
	projects: {},
	models: {},
	componentState: {
		visibleItems: {},
		activeTeamspace: '',
		activeProject: '',
		teamspacesItems: []
	}
};

const fetchTeamspacesSuccess = (state = INITIAL_STATE, { entities }) => {
	const teamspacesList = Object.keys(entities.teamspaces);

	// teamspacesList.forEach((user) => {
	// 	return teamspaces[user].projects = sortByField(entities.teamspaces[user].projects,
	// 		{ order: 'asc', config: { field: 'name' } });
	// });

	return { ...state, ...entities };
};

// Projects
const updateProjectSuccess = (state = INITIAL_STATE, action) => {
	const projects = { ...state.projects };
	projects[action.projectData._id] = action.projectData;

	return { ...state, projects };
};

const createProjectSuccess = (state = INITIAL_STATE, action) => {
	const teamspace = { ...state.teamspaces[action.teamspace] };
	teamspace.projects = [...teamspace.projects, action.projectData._id];
	const projects = { ...state.projects };
	projects[action.projectData._id] = action.projectData;
	const teamspaces = { ...state.teamspaces, [action.teamspace]: teamspace };

	return { ...state, projects, teamspaces };
};

const removeProjectSuccess = (state = INITIAL_STATE, action) => {
	const teamspace = { ...state.teamspaces[action.teamspace] };
	teamspace.projects = teamspace.projects.filter((id) => id !== action.projectId);
	const teamspaces = { ...state.teamspaces, [action.teamspace]: teamspace };
	const projects = { ...state.projects };
	delete projects[action.projectId];

	return { ...state, teamspaces, projects };
};

const getModelData = (state, teamspace, projectName) => {
	const teamspaces = cloneDeep(state.teamspaces);
	const projects = [...state.teamspaces[teamspace].projects];
	const projectIndex = projects.findIndex((project) => project.name === projectName);
	const foundProject = projects[projectIndex];

	return { projectIndex, foundProject, teamspaces };
};

// Models
const updateModelSuccess = (state = INITIAL_STATE, action) => {
	const { projectIndex, foundProject, teamspaces } = getModelData(state, action.teamspace, action.modelData.project);

	const modelIndex = foundProject.models.findIndex((model) => model.model === action.modelId);
	teamspaces[action.teamspace].projects[projectIndex].models[modelIndex].name = action.modelData.name;
	if (action.modelData.federate) {
		teamspaces[action.teamspace].projects[projectIndex].models[modelIndex].subModels = action.modelData.subModels;
		teamspaces[action.teamspace].projects[projectIndex].models[modelIndex].timestamp = action.modelData.timestamp;
	}

	return { ...state, teamspaces };
};

const createModelSuccess = (state = INITIAL_STATE, action) => {
	const { projectIndex, foundProject, teamspaces } = getModelData(state, action.teamspace, action.modelData.projectName);
	const targetModels = foundProject.models;
	const createdModel = action.modelData;

	if (action.modelData.federate && action.modelData.timestamp) {
		createdModel.timestamp = action.modelData.timestamp;
	}

	teamspaces[action.teamspace].projects[projectIndex].models = [...targetModels, createdModel];

	return { ...state, teamspaces };
};

const removeModelSuccess = (state = INITIAL_STATE, action) => {
	const { projectIndex, foundProject, teamspaces } = getModelData(state, action.teamspace, action.modelData.projectName);
	const models = foundProject.models.filter((model) => model.model !== action.modelData.model);
	teamspaces[action.teamspace].projects[projectIndex].models = models;

	return { ...state, teamspaces };
};

const setModelUploadStatus = (state = INITIAL_STATE, action) => {
	const { projectIndex, foundProject, teamspaces } = getModelData(state, action.teamspace, action.project);
	const modelIndex = foundProject.models.findIndex((model) => model.model === action.model);
	teamspaces[action.teamspace].projects[projectIndex].models[modelIndex].status = action.modelData.status;
	if (action.modelData.timestamp) {
		teamspaces[action.teamspace].projects[projectIndex].models[modelIndex].timestamp = action.modelData.timestamp;
	}
	return { ...state, teamspaces };
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return {...state,  isPending: pendingState};
};

const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const reducer = createReducer({ ...INITIAL_STATE }, {
	[TeamspacesTypes.FETCH_TEAMSPACES_SUCCESS]: fetchTeamspacesSuccess,
	[TeamspacesTypes.SET_MODEL_UPLOAD_STATUS]: setModelUploadStatus,
	[TeamspacesTypes.SET_PENDING_STATE]: setPendingState,
	[TeamspacesTypes.SET_COMPONENT_STATE]: setComponentState,
	// Projects
	[TeamspacesTypes.UPDATE_PROJECT_SUCCESS]: updateProjectSuccess,
	[TeamspacesTypes.CREATE_PROJECT_SUCCESS]: createProjectSuccess,
	[TeamspacesTypes.REMOVE_PROJECT_SUCCESS]: removeProjectSuccess,
	// Models
	[TeamspacesTypes.UPDATE_MODEL_SUCCESS]: updateModelSuccess,
	[TeamspacesTypes.CREATE_MODEL_SUCCESS]: createModelSuccess,
	[TeamspacesTypes.REMOVE_MODEL_SUCCESS]: removeModelSuccess
});
