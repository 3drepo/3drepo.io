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

import { omit, values } from 'lodash';
import { createActions, createReducer } from 'reduxsauce';
import { DATA_TYPES } from '../../routes/components/filterPanel/filterPanel.component';
import { SORTING_BY_LAST_UPDATED } from '../../routes/teamspaces/teamspaces.contants';

export const { Types: TeamspacesTypes, Creators: TeamspacesActions } = createActions({
	fetchTeamspaces: ['username'],
	fetchTeamspacesIfNecessary: ['username'],
	fetchTeamspacesSuccess: ['entities'],
	setPendingState: ['pendingState'],
	setModelUploadStatus: ['teamspace', 'project', 'model', 'modelData'],
	setComponentState: ['componentState'],
	removeTeamspaceSuccess: ['teamspace'],
	leaveTeamspace: ['teamspace'],
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
	removeModelSuccess: ['teamspace', 'modelData'],
	subscribeOnChanges: [],
	unsubscribeFromChanges: [],
}, { prefix: 'TEAMSPACES/' });

interface ISubModel {
	database: string;
	model: string;
	name: string;
}

interface IModel {
	code?: string;
	federate?: boolean;
	permissions: string[];
	model: string;
	units: string;
	name: string;
	status: string;
	subModels: ISubModel[];
	timestamp: string;
	nRevisions: number;
	projectName: string;
}

export interface ITeamspacesComponentState {
	showStarredOnly: boolean;
	visibleItems: any;
	starredVisibleItems: any;
	teamspacesItems: any[];
	searchEnabled?: boolean;
	selectedFilters: any[];
	selectedDataTypes: any[];
	activeSorting: string;
	nameSortingDescending: boolean;
	dateSortingDescending: boolean;
}

export interface IActivitiesState {
	teamspaces: any;
	projects: any;
	models: Record<IModel['model'], IModel>;
	componentState: ITeamspacesComponentState;
	isPending: boolean;
}

export const INITIAL_STATE: IActivitiesState = {
	teamspaces: {},
	projects: {},
	models: {},
	componentState: {
		showStarredOnly: false,
		visibleItems: {},
		starredVisibleItems: {},
		teamspacesItems: [],
		searchEnabled: false,
		selectedFilters: [],
		selectedDataTypes: [DATA_TYPES.MODELS, DATA_TYPES.FEDERATIONS, DATA_TYPES.PROJECTS],
		activeSorting: SORTING_BY_LAST_UPDATED,
		nameSortingDescending: true,
		dateSortingDescending: true,
	},
	isPending: true
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

const createProjectSuccess = (state = INITIAL_STATE, { teamspace, projectData }) => {
	const teamspaceData = { ...state.teamspaces[teamspace] };
	teamspaceData.projects = [...teamspaceData.projects, projectData._id];

	const projects = { ...state.projects };
	projects[projectData._id] = {
		...projectData,
		teamspace,
	};
	const teamspaces = { ...state.teamspaces, [teamspace]: teamspaceData };

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
	const allFederations = values({ ...state.models })
		.filter((modelItem: IModel) => modelItem.federate);

	const federationsWithModel = allFederations
		.filter((federation) => federation.subModels
			.filter(({ model: subModelId }) => subModelId === modelId ).length
		);

	const model = { ...state.models[modelId],
		name: modelData.name || state.models[modelId].name,
		code: modelData.code || state.models[modelId].code
	};

	if (modelData.federate) {
		model.subModels = modelData.subModels;
		model.timestamp = modelData.timestamp;

		const models = { ...state.models, [modelId]: model };
		return { ...state, models };
	} else {
		if (federationsWithModel.length) {
			federationsWithModel.forEach((_, index) => {
				federationsWithModel[index].subModels = federationsWithModel[index].subModels
					.map((subModel) => subModel.model === modelId ? {
						...subModel,
						name: modelData.name || state.models[modelId].name,
					} : {
						...subModel
					});
			});
		}

		const updatedFederations = federationsWithModel.reduce((federations, federation) => {
			federations[federation.model] = federation;
			return federations;
		}, {});

		const models = { ...state.models, [modelId]: model, ...updatedFederations };
		return { ...state, models };
	}
};

const createModelSuccess = (state = INITIAL_STATE, { teamspace, modelData }) => {
	const project = getProject(state, teamspace, modelData.projectName);

	if (!project.models.includes(modelData.model)) {
		project.models = [...project.models, modelData.model];
	}

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

	if (modelData.nRevisions) {
		uploadedModel.nRevisions = modelData.nRevisions;
	}

	const models = { ...state.models, [model]: uploadedModel };
	return { ...state, models };
};

const removeTeamspaceSuccess = (state = INITIAL_STATE, { teamspace }) => {
	return {...state,  teamspaces: omit(state.teamspaces, teamspace)};
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
	[TeamspacesTypes.REMOVE_TEAMSPACE_SUCCESS]: removeTeamspaceSuccess,

	// Projects
	[TeamspacesTypes.UPDATE_PROJECT_SUCCESS]: updateProjectSuccess,
	[TeamspacesTypes.CREATE_PROJECT_SUCCESS]: createProjectSuccess,
	[TeamspacesTypes.REMOVE_PROJECT_SUCCESS]: removeProjectSuccess,
	// Models
	[TeamspacesTypes.UPDATE_MODEL_SUCCESS]: updateModelSuccess,
	[TeamspacesTypes.CREATE_MODEL_SUCCESS]: createModelSuccess,
	[TeamspacesTypes.REMOVE_MODEL_SUCCESS]: removeModelSuccess
});
