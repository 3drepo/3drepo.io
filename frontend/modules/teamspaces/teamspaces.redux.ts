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

import { omit } from 'lodash';
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
		showStarredOnly: false,
		visibleItems: {},
		starredVisibleItems: {},
		teamspacesItems: []
	}
};

const fetchTeamspacesSuccess = (state = INITIAL_STATE, { entities }) => {
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

const getProject = (state, teamspaceName, projectName) => {
	const projects = { ...state.projects };
	const projectId = state.teamspaces[teamspaceName].projects.find((project) => {
		return projects[project].name === projectName;
	});
	return { ...projects[projectId] };
};

// Models
const updateModelSuccess = (state = INITIAL_STATE, { modelId, modelData }) => {
	const model = { ...state.models[modelId], name: modelData.name };
	if (modelData.federate) {
		model.subModels = modelData.subModels;
		model.timestamp = modelData.timestamp;
	}

	const models = { ...state.models, [modelId]: model };
	return { ...state, models };
};

const createModelSuccess = (state = INITIAL_STATE, { teamspace, modelData }) => {
	const project = getProject(state, teamspace, modelData.projectName);
	project.models = [...project.models, modelData.model];

	const projects = { ...state.projects, [project._id]: project };
	const models = { ...state.models, [modelData.model]: modelData };
	return { ...state, models, projects };
};

const removeModelSuccess = (state = INITIAL_STATE, { teamspace, modelData }) => {
	const project = getProject(state, teamspace, modelData.projectName);
	project.models = project.models.filter((modelId) => modelId !== modelData.model);

	const projects = { ...state.projects, [project._id]: project };
	const models = omit(state.models, modelData.model);
	return { ...state, models, projects };
};

const setModelUploadStatus = (state = INITIAL_STATE, { model, modelData }) => {
	const uploadedModel = { ...state.models[model], status: modelData.status };

	if (modelData.timestamp) {
		uploadedModel.timestamp = modelData.timestamp;
	}

	const models = { ...state.models, [model]: uploadedModel };
	return { ...state, models };
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
