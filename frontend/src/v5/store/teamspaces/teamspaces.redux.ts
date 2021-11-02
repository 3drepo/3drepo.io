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

export interface IUser {
	user: string;
	firstName: string;
	lastName: string;
	company?: string;
	job?: string;
}

export interface ITeamspace {
	name: string;
	isAdmin: boolean;
}

export interface ITeamspacesActions {
	fetch: () => any;
	fetchSuccess: (teamspaces: ITeamspace[]) => any;
	fetchFailure: () => any;
	fetchUsers: (teamspace: string) => any;
	fetchUsersSuccess: (teamspace: string, users: IUser[]) => any;
}

export const { Types: TeamspacesTypes, Creators: TeamspacesActions } = createActions({
	fetch: [],
	fetchSuccess: ['teamspaces'],
	fetchFailure: [],
	fetchUsers: ['teamspace'],
	fetchUsersSuccess: ['teamspace', 'users'],
}, { prefix: 'TEAMSPACES2/' }) as { Types: Constants<ITeamspacesActions>; Creators: ITeamspacesActions };

interface ITeamspacesState {
	teamspaces: ITeamspace[];
	users: Record<string, IUser[]>
}

export const INITIAL_STATE: ITeamspacesState = {
	teamspaces: [],
	users: {},
};

export const fetchSuccess = (state = INITIAL_STATE, { teamspaces }) => ({ ...state, teamspaces });

export const fetchUsersSuccess = (state = INITIAL_STATE, { teamspace, users }) => ({
	...state,
	users: {
		...state.users,
		[teamspace]: users,
	},
});

export const reducer = createReducer(INITIAL_STATE, {
	[TeamspacesTypes.FETCH_SUCCESS]: fetchSuccess,
	[TeamspacesTypes.FETCH_USERS_SUCCESS]: fetchUsersSuccess,
});
