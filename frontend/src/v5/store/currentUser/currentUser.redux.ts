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
import { ICurrentUser, UpdatePersonal, UpdateUserPassword } from './currentUser.types';

export const { Types: CurrentUserTypes, Creators: CurrentUserActions } = createActions({
	fetchUser: [],
	fetchUserSuccess: ['userData'],
	updateUser: ['userData'],
	updateUserSuccess: ['userData'],
	updateUserFailure: ['personalError'],
	updateUserAvatar: ['avatarFile'],
	updateUserAvatarSuccess: ['avatarUrl'],
	updateUserAvatarFailure: ['avatarError'],
	updateUserPassword: ['passwordData'],
	updateUserPasswordSuccess: [],
	updateUserPasswordFailure: ['passwordError'],
	resetErrors: [],
	setIsPending: ['isPending'],
	generateApiKey: [],
	deleteApiKey: [],
}, { prefix: 'CURRENT_USER2/' }) as { Types: Constants<ICurrentUserActionCreators>; Creators: ICurrentUserActionCreators };

export const INITIAL_STATE: ICurrentUserState = {
	currentUser: { username: '', email: '' },
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

export const updateUserFailure = (state = INITIAL_STATE, { personalError }): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		...personalError,
	},
});

export const updateUserAvatarSuccess = (state = INITIAL_STATE, { avatarUrl }): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		avatarUrl,
		avatarError: null,
	},
});

export const updateUserAvatarFailure = (state = INITIAL_STATE, { avatarError }): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		avatarError,
	},
});

export const updateUserPasswordFailure = (state = INITIAL_STATE, { passwordError }): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		passwordError,
	},
});

export const updateUserPasswordSuccess = (state = INITIAL_STATE): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		passwordError: null,
	},
});

export const resetErrors = (state = INITIAL_STATE): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		avatarError: null,
		passwordError: null,
		personalError: null,
	},
});

export const setIsPending = (state = INITIAL_STATE, { pendingState }) => ({
	...state,
	isPending: pendingState,
});

export const currentUserReducer = createReducer<ICurrentUserState>(INITIAL_STATE, {
	[CurrentUserTypes.FETCH_USER_SUCCESS]: fetchUserSuccess,
	[CurrentUserTypes.UPDATE_USER_SUCCESS]: updateUserSuccess,
	[CurrentUserTypes.UPDATE_USER_FAILURE]: updateUserFailure,
	[CurrentUserTypes.UPDATE_USER_AVATAR_SUCCESS]: updateUserAvatarSuccess,
	[CurrentUserTypes.UPDATE_USER_AVATAR_FAILURE]: updateUserAvatarFailure,
	[CurrentUserTypes.UPDATE_USER_PASSWORD_SUCCESS]: updateUserPasswordSuccess,
	[CurrentUserTypes.UPDATE_USER_PASSWORD_FAILURE]: updateUserPasswordFailure,
	[CurrentUserTypes.RESET_ERRORS]: resetErrors,
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
export type UpdateUserAction = Action<'UPDATE_USER'> & { userData: UpdatePersonal };
export type UpdateUserSuccessAction = Action<'UPDATE_USER_SUCCESS'> & { userData: UpdatePersonal };
export type UpdateUserFailureAction = Action<'UPDATE_USER_FAILURE'> & { error: string };
export type UpdateUserAvatarAction = Action<'UPDATE_USER_AVATAR'> & { avatarFile: File };
export type UpdateUserAvatarSuccessAction = Action<'UPDATE_USER_AVATAR_SUCCESS'> & { avatarUrl: string };
export type UpdateUserAvatarFailureAction = Action<'UPDATE_USER_AVATAR_FAILURE'> & { avatarError: string };
export type UpdateUserPasswordAction = Action<'UPDATE_USER_PASSWORD'> & { passwordData: UpdateUserPassword };
export type UpdateUserPasswordSuccessAction = Action<'UPDATE_USER_PASSWORD_SUCCESS'>;
export type UpdateUserPasswordFailureAction = Action<'UPDATE_USER_PASSWORD_FAILURE'> & { passwordError: string };
export type ResetErrorsActions = Action<'RESET_ERRORS'>;
export type SetIsPendingAction = Action<'SET_IS_PENDING'>;

export interface ICurrentUserActionCreators {
	fetchUser: () => FetchUserAction;
	fetchUserSuccess: (userData: ICurrentUser) => FetchUserSuccessAction;
	updateUser: (userData: UpdatePersonal) => UpdateUserAction;
	updateUserSuccess: (userData: UpdatePersonal) => UpdateUserSuccessAction;
	updateUserFailure: (personalError: string) => UpdateUserFailureAction;
	updateUserAvatar: (avatarFile: File) => UpdateUserAvatarAction;
	updateUserAvatarSuccess: (avatarUrl: string) => UpdateUserAvatarSuccessAction;
	updateUserAvatarFailure: (avatarError: string) => UpdateUserAvatarFailureAction;
	updateUserPassword: (passwordData: UpdateUserPassword) => UpdateUserPasswordAction;
	updateUserPasswordSuccess: () => UpdateUserPasswordSuccessAction;
	updateUserPasswordFailure: (passwordError: string) => UpdateUserPasswordFailureAction;
	resetErrors: () => ResetErrorsActions;
	setIsPending: (isPending: boolean) => SetIsPendingAction;
	generateApiKey: () => UpdateUserSuccessAction;
	deleteApiKey: () => UpdateUserSuccessAction;
}
