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

import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../../helpers/actions.helper';

export const { Types: TeamspacesTypes, Creators: TeamspacesActions } = createActions({
	fetch: [],
	fetchSuccess: ['teamspaces'],
	setCurrentTeamspace: ['currentTeamspace'],
}, { prefix: 'TEAMSPACES2/' }) as { Types: Constants<ITeamspacesActionCreators>; Creators: ITeamspacesActionCreators };

export const INITIAL_STATE: ITeamspacesState = {
	teamspaces: [],
	currentTeamspace: null,
};

// eslint-disable-next-line max-len
export const setCurrentTeamspace = (state = INITIAL_STATE, { currentTeamspace }: SetCurrentTeamspaceAction): ITeamspacesState => ({
	...state,
	currentTeamspace,
});

export const fetchSuccess = (state = INITIAL_STATE, { teamspaces }: FetchSuccessAction): ITeamspacesState => ({
	...state,
	teamspaces,
});

export const teamspacesReducer = createReducer(INITIAL_STATE, {
	[TeamspacesTypes.FETCH_SUCCESS]: fetchSuccess,
	[TeamspacesTypes.SET_CURRENT_TEAMSPACE]: setCurrentTeamspace,
});

/**
 * Types
 */
export interface ITeamspacesState {
	teamspaces: ITeamspace[];
	currentTeamspace: string;
}

export interface ITeamspace {
	name: string;
	isAdmin: boolean;
}

export type FetchAction = Action<'FETCH'>;
export type FetchSuccessAction = Action<'FETCH_SUCCESS'> & { teamspaces: ITeamspace[] };
export type SetCurrentTeamspaceAction = Action<'SET_CURRENT_TEAMSPACE'> & { currentTeamspace: string };

export interface ITeamspacesActionCreators {
	fetch: () => FetchAction;
	fetchSuccess: (teamspaces: ITeamspace[]) => FetchSuccessAction;
	setCurrentTeamspace: (teamspace: string) => SetCurrentTeamspaceAction;
}
