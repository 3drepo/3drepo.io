/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { TeamspaceId } from '../store.types';

export const { Types: UsersTypes, Creators: UsersActions } = createActions({
	fetchUsers: ['teamspace'],
	fetchUsersSuccess: ['teamspace', 'users'],
}, { prefix: 'USERS/' }) as { Types: Constants<IUsersActions>; Creators: IUsersActions };

export const INITIAL_STATE: IUsersState = {
	usersByTeamspace: {},
};

export const fetchUsersSuccess = (state = INITIAL_STATE, { teamspace, users }): IUsersState => ({
	...state,
	usersByTeamspace: {
		...state.usersByTeamspace,
		[teamspace]: users,
	},
});

export const usersReducer = createReducer(INITIAL_STATE, {
	[UsersTypes.FETCH_USERS_SUCCESS]: fetchUsersSuccess,
});

/**
 * Types
 */
export interface IUsersState {
	usersByTeamspace: Record<string, IUser[]>;
}

export interface IUser {
	username: string;
	firstName: string;
	lastName: string;
	countryCode?: string;
	company?: string;
	job?: string;
	email: string;
	hasAvatar?: boolean;
	avatarUrl: string;
}

export type FetchUsersAction = Action<'FETCH_USERS'> & TeamspaceId;
export type FetchUsersSuccessAction = Action<'FETCH_USERS_SUCCESS'> & TeamspaceId & {users: IUser[]};

export interface IUsersActions {
	fetchUsers: (teamspace: string) => FetchUsersAction;
	fetchUsersSuccess: (teamspace: string, users: IUser[]) => FetchUsersSuccessAction;
}
