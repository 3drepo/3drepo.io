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
import { ICurrentUser, UpdateCurrentUser } from './currentUser.types';

export const { Types: CurrentUserTypes, Creators: CurrentUserActions } = createActions({
	getProfile: [],
	getProfileSuccess: ['userData'],
	updateUser: ['userData'],
	updateUserSuccess: ['userData'],
	setPendingState: ['pendingState'],
	generateApiKey: [],
	deleteApiKey: [],
}, { prefix: 'CURRENT_USER2/' }) as { Types: Constants<ICurrentUserActionCreators>; Creators: ICurrentUserActionCreators };

export const INITIAL_STATE: ICurrentUserState = {
	currentUser: { username: '' },
};

export const getProfileSuccess = (state = INITIAL_STATE, { userData }): ICurrentUserState => ({
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

const setPendingState = (state = INITIAL_STATE, { pendingState }) => ({
	...state,
	isPending: pendingState,
});

export const currentUserReducer = createReducer(INITIAL_STATE, {
	[CurrentUserTypes.GET_PROFILE_SUCCESS]: getProfileSuccess,
	[CurrentUserTypes.UPDATE_USER_SUCCESS]: updateUserSuccess,
	[CurrentUserTypes.SET_PENDING_STATE]: setPendingState,
});

/**
 * Types
*/

interface ICurrentUserState {
	currentUser: ICurrentUser;
}

export type GetProfileAction = Action<'GET_PROFILE'>;
export type GetProfileSuccessAction = Action<'GET_PROFILE_SUCCESS'> & { userData: ICurrentUser };
export type UpdateUserAction = Action<'UPDATE_USER'> & { userData: UpdateCurrentUser };
export type UpdateUserSuccessAction = Action<'UPDATE_USER_SUCCESS'> & { userData: UpdateCurrentUser };
export type UpdateApiKeySuccessAction = Action<'UPDATE_API_KEY_SUCCESS'>;
export type SetPendingStateAction = Action<'SET_PENDING_STATE'>;

export interface ICurrentUserActionCreators {
	getProfile: () => GetProfileAction;
	getProfileSuccess: (userData: Object) => GetProfileSuccessAction;
	updateUser: (userData: Object) => UpdateUserAction;
	updateUserSuccess: (userData: Object) => UpdateUserSuccessAction;
	setPendingState: (pendingState: boolean) => SetPendingStateAction;
	generateApiKey: () => UpdateApiKeySuccessAction;
	deleteApiKey: () => UpdateApiKeySuccessAction;
}
