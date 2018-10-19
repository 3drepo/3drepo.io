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
import { keyBy } from 'lodash';

export const { Types: TeamspacesTypes, Creators: TeamspacesActions } = createActions({
	setTeamspaces: ['teamspaces'],
	// Projects
	createProject: ['teamspace', 'projectData'],
	updateProject: ['teamspace', 'projectName', 'projectData'],
	removeProject: ['teamspace', 'projectName'],
	createProjectSuccess: ['teamspace', 'projectData'],
	updateProjectSuccess: ['teamspace', 'projectName', 'projectData'],
	removeProjectSuccess: ['teamspace', 'projectName'],
	// Models
	createModel: ['teamspace', 'modelData'],
	updateModel: ['teamspace', 'modelName', 'modelData'],
	removeModel: ['teamspace', 'modelName'],
	createModelSuccess: ['teamspace', 'modelData'],
	updateModelSuccess: ['teamspace', 'modelName', 'modelData'],
	removeModelSuccess: ['teamspace', 'modelName']
}, { prefix: 'TEAMSPACES_' });

export const INITIAL_STATE = {
	teamspaces: [],
	models: []
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
	const teamspaces = { ...state.teamspaces };
	teamspaces[action.teamspace].projects.push(action.projectData);
	return { ...state, teamspaces };
};

const removeProjectSuccess = (state = INITIAL_STATE, action) => {
	const teamspaces = { ...state.teamspaces };
	const projects = [...state.teamspaces[action.teamspace].projects]
		.filter(({ name }) => name !== action.projectName);
	teamspaces[action.teamspace].projects = projects;

	return { ...state, teamspaces };
};

// Models
const updateModelSuccess = (state = INITIAL_STATE, action) => {
	return { ...state };
};

const createModelSuccess = (state = INITIAL_STATE, action) => {
	return { ...state };
};

const removeModelSuccess = (state = INITIAL_STATE, action) => {
	return { ...state };
};

export const reducer = createReducer({ ...INITIAL_STATE }, {
	[TeamspacesTypes.SET_TEAMSPACES]: setTeamspaces,
	// Projects
	[TeamspacesTypes.UPDATE_PROJECT_SUCCESS]: updateProjectSuccess,
	[TeamspacesTypes.CREATE_PROJECT_SUCCESS]: createProjectSuccess,
	[TeamspacesTypes.REMOVE_PROJECT_SUCCESS]: removeProjectSuccess,
	// Models
	[TeamspacesTypes.UPDATE_MODEL_SUCCESS]: updateModelSuccess,
	[TeamspacesTypes.CREATE_MODEL_SUCCESS]: createModelSuccess,
	[TeamspacesTypes.REMOVE_MODEL_SUCCESS]: removeModelSuccess
});
