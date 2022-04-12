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

import { Constants } from '@/v5/helpers/actions.helper';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { ICurrentUser, UpdateUser } from './currentUser.types';

export const { Types: CurrentUserTypes, Creators: CurrentUserActions } = createActions({
	fetchUser: [],
	fetchUserSuccess: ['userData'],
	updateUser: ['userData'],
	updateUserSuccess: ['userData'],
	setIsPending: ['isPending'],
	generateApiKey: [],
	deleteApiKey: [],
}, { prefix: 'CURRENT_USER2/' }) as { Types: Constants<ICurrentUserActionCreators>; Creators: ICurrentUserActionCreators };

export const INITIAL_STATE: ICurrentUserState = {
	currentUser: { username: '' },
};

export const fetchUserSuccess = (state = INITIAL_STATE, { userData }): ICurrentUserState => ({
	...state,
	currentUser: userData,
});

export const updateUserSuccess = (state = INITIAL_STATE, { userData }): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		...userData,
	},
});

const setIsPending = (state = INITIAL_STATE, { pendingState }) => ({
	...state,
	isPending: pendingState,
});

export const currentUserReducer = createReducer<ICurrentUserState>(INITIAL_STATE, {
	[CurrentUserTypes.FETCH_USER_SUCCESS]: fetchUserSuccess,
	[CurrentUserTypes.UPDATE_USER_SUCCESS]: updateUserSuccess,
	[CurrentUserTypes.SET_IS_PENDING]: setIsPending,
});

/**
 * Types
*/

export interface ICurrentUserState {
	currentUser: ICurrentUser;
}

export type FetchUserAction = Action<'FETCH_USER'>;
export type FetchUserSuccessAction = Action<'FETCH_USER_SUCCESS'> & { userData: ICurrentUser };
export type UpdateUserAction = Action<'UPDATE_USER'> & { userData: UpdateUser };
export type UpdateUserSuccessAction = Action<'UPDATE_USER_SUCCESS'> & { userData: UpdateUser };
export type SetIsPendingAction = Action<'SET_IS_PENDING'>;

export interface ICurrentUserActionCreators {
	fetchUser: () => FetchUserAction;
	fetchUserSuccess: (userData: Object) => FetchUserSuccessAction;
	updateUser: (userData: Object) => UpdateUserAction;
	updateUserSuccess: (userData: Object) => UpdateUserSuccessAction;
	setIsPending: (isPending: boolean) => SetIsPendingAction;
	generateApiKey: () => UpdateUserSuccessAction;
	deleteApiKey: () => UpdateUserSuccessAction;
}
