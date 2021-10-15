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

import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../common/actions.helper';

export interface IProject {
	_id: string;
	name: string;
	isAdmin: boolean;
}

export interface IProjectsActions {
	fetch: (teamspace: string) => any;
	fetchSuccess: (teamspace: string, projects: IProject[]) => any;
	fetchFailure: () => any;
	setCurrentProject: (projectId: string) => any;
}

export const { Types: ProjectsTypes, Creators: ProjectsActions } = createActions({
	fetch: ['teamspace'],
	fetchSuccess: ['teamspace', 'projects'],
	fetchFailure: [],
	setCurrentProject: ['projectId'],
}, { prefix: 'PROJECTS/' }) as { Types: Constants<IProjectsActions>; Creators: IProjectsActions };

interface IProjectsState {
	projects: Record<string, IProject[]> | [];
	currentTeamspace: string;
	currentProject: string;
}

export const INITIAL_STATE: IProjectsState = {
	projects: [],
	currentTeamspace: '',
	currentProject: '',
};

export const fetchSuccess = (state = INITIAL_STATE, { teamspace, projects }) => ({
	...state,
	currentTeamspace: teamspace,
	projects: {
		...state.projects,
		[teamspace]: projects,
	},
});

export const setCurrentProject = (state = INITIAL_STATE, { projectId }) => ({
	...state,
	currentProject: projectId,
});

export const reducer = createReducer(INITIAL_STATE, {
	[ProjectsTypes.FETCH_SUCCESS]: fetchSuccess,
	[ProjectsTypes.SET_CURRENT_PROJECT]: setCurrentProject,
});
