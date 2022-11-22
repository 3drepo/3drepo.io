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

import { produceAll } from '@/v5/helpers/reducers.helper';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../../helpers/actions.helper';
import { OnError, OnSuccess, TeamspaceAndProjectId } from '../store.types';
import { IProject } from './projects.types';

export const { Types: ProjectsTypes, Creators: ProjectsActions } = createActions({
	fetch: ['teamspace'],
	fetchSuccess: ['teamspace', 'projects'],
	fetchFailure: [],
	setCurrentProject: ['projectId'],
	createProject: ['teamspace', 'projectName', 'onSuccess', 'onError'],
	createProjectSuccess: ['teamspace', 'project'],
	updateProject: ['teamspace', 'projectId', 'project', 'onSuccess', 'onError'],
	updateProjectSuccess: ['teamspace', 'projectId', 'project'],
	deleteProject: ['teamspace', 'projectId', 'onSuccess', 'onError'],
	deleteProjectSuccess: ['teamspace', 'projectId'],
}, { prefix: 'PROJECTS/' }) as { Types: Constants<IProjectsActions>; Creators: IProjectsActions };

export const INITIAL_STATE: IProjectsState = {
	projectsByTeamspace: {},
	currentProject: '',
};

export const fetchSuccess = (state, { teamspace, projects }: FetchProjectsSuccessAction) => {
	state.projectsByTeamspace[teamspace] = projects;
};

export const setCurrentProject = (state, { projectId }: SetCurrentProjectAction) => {
	state.currentProject = projectId;
};

export const createProjectSuccess = (state, { teamspace, project }: CreateProjectSuccessAction) => {
	state.projectsByTeamspace[teamspace].push(project);
};

export const updateProjectSuccess = (state, { teamspace, projectId, project }: UpdateProjectSuccessAction) => {
	const oldProject = state.projectsByTeamspace[teamspace].find(({ _id }) => _id === projectId);
	Object.assign(oldProject, project);
};

export const deleteProjectSuccess = (state, { teamspace, projectId }: DeleteProjectSuccessAction) => {
	state.projectsByTeamspace[teamspace] = state.projectsByTeamspace[teamspace].filter(
		(project) => projectId !== project._id,
	);
};

export const projectsReducer = createReducer(INITIAL_STATE, produceAll({
	[ProjectsTypes.FETCH_SUCCESS]: fetchSuccess,
	[ProjectsTypes.SET_CURRENT_PROJECT]: setCurrentProject,
	[ProjectsTypes.CREATE_PROJECT_SUCCESS]: createProjectSuccess,
	[ProjectsTypes.UPDATE_PROJECT_SUCCESS]: updateProjectSuccess,
	[ProjectsTypes.DELETE_PROJECT_SUCCESS]: deleteProjectSuccess,
})) as (state: IProjectsState, action: any) => IProjectsState;

/**
 * Types
 */
export interface IProjectsState {
	projectsByTeamspace: Record<string, IProject[]>;
	currentProject: string;
}
export type FetchProjectsAction = Action<'FETCH_PROJECTS'> & { teamspace: string };
export type FetchProjectsSuccessAction = Action<'FETCH_PROJECTS_SUCCESS'> & { teamspace: string, projects: IProject[] };
export type SetCurrentProjectAction = Action<'SET_CURRENT_PROJECT_SUCCESS'> & { projectId: string };
export type CreateProjectAction = Action<'CREATE_PROJECT'> & OnSuccess & OnError & {
	teamspace: string,
	projectName: string,
};
export type CreateProjectSuccessAction = Action<'CREATE_PROJECT_SUCCESS'> & { teamspace: string, project: IProject };
export type UpdateProjectAction = Action<'UPDATE_PROJECT'> & TeamspaceAndProjectId & OnSuccess & OnError & { project: Partial<IProject> };
export type UpdateProjectSuccessAction = Action<'UPDATE_PROJECT_SUCCESS'> & TeamspaceAndProjectId & { project: Partial<IProject> };
export type DeleteProjectAction = Action<'DELETE_PROJECT'> & TeamspaceAndProjectId & OnSuccess & OnError;
export type DeleteProjectSuccessAction = Action<'DELETE_PROJECT_SUCCESS'> & TeamspaceAndProjectId;

export interface IProjectsActions {
	fetch: (teamspace: string) => FetchProjectsAction;
	fetchSuccess: (teamspace: string, projects: IProject[]) => FetchProjectsSuccessAction;
	fetchFailure: () => any;
	setCurrentProject: (projectId: string) => SetCurrentProjectAction;
	createProject: (
		teamspace: string,
		projectName: string,
		onSuccess: () => void,
		onError: (error) => void,
	) => CreateProjectAction;
	createProjectSuccess: (teamspace: string, project: IProject) => CreateProjectSuccessAction;
	updateProject: (
		teamspace: string,
		projectId: string,
		project: Partial<IProject>,
		onSuccess: () => void,
		onError: (error) => void,
	) => UpdateProjectAction;
	updateProjectSuccess: (
		teamspace: string,
		projectId: string,
		project: Partial<IProject>,
	) => UpdateProjectSuccessAction;
	deleteProject: (
		teamspace: string,
		projectId: string,
		onSuccess: () => void,
		onError: (error) => void,
	) => DeleteProjectAction;
	deleteProjectSuccess: (teamspace: string, projectId: string) => DeleteProjectSuccessAction;
}
