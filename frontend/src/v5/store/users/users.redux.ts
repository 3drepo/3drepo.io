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

import { produceAll } from '@/v5/helpers/reducers.helper';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../../helpers/actions.helper';
import { TeamspaceId } from '../store.types';

export const { Types: UsersTypes, Creators: UsersActions } = createActions({
	fetchUsers: ['teamspace'],
	fetchUsersSuccess: ['teamspace', 'users'],
	updateUserSuccess: ['teamspace', 'user', 'data'],
}, { prefix: 'USERS/' }) as { Types: Constants<IUsersActions>; Creators: IUsersActions };

export const INITIAL_STATE: IUsersState = {
	usersByTeamspace: {},
};

export const fetchUsersSuccess = (state, { teamspace, users }: FetchUsersSuccessAction) => {
	state.usersByTeamspace[teamspace] = users;
};

export const updateUserSuccess = (state, { teamspace, user, data }: UpdateUserSuccessAction) => {
	const users = state.usersByTeamspace[teamspace];
	Object.assign(users.find((oldUser) => oldUser.user === user), data);
};

export const usersReducer = createReducer(INITIAL_STATE, produceAll({
	[UsersTypes.FETCH_USERS_SUCCESS]: fetchUsersSuccess,
	[UsersTypes.UPDATE_USER_SUCCESS]: updateUserSuccess,
}));

/**
 * Types
 */
export interface IUsersState {
	usersByTeamspace: Record<string, IUser[]>;
}

export interface IUser {
	user: string;
	firstName: string;
	lastName: string;
	company?: string;
	job?: string;
	email?: string;
	hasAvatar?: boolean;
	avatarUrl: string;
	isNotTeamspaceMember?: boolean;
	isViewer?: boolean;
}

export type FetchUsersAction = Action<'FETCH_USERS'> & TeamspaceId;
export type FetchUsersSuccessAction = Action<'FETCH_USERS_SUCCESS'> & TeamspaceId & { users: IUser[] };
export type UpdateUserSuccessAction = Action<'UPDATE_USER_SUCCESS'> & TeamspaceId & { user: string, data: Partial<IUser> };

export interface IUsersActions {
	fetchUsers: (teamspace: string) => FetchUsersAction;
	fetchUsersSuccess: (teamspace: string, users: IUser[]) => FetchUsersSuccessAction;
	updateUserSuccess: (teamspace: string, user: string, data: Partial<IUser>) => UpdateUserSuccessAction;
}
