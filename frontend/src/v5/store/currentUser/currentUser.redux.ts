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
import { ICurrentUser, UpdateUser, UpdatePassword, UpdatePersonalData, UpdateUserSuccess } from './currentUser.types';

export const { Types: CurrentUserTypes, Creators: CurrentUserActions } = createActions({
	fetchUser: [],
	fetchUserSuccess: ['userData'],
	updateUser: ['userData'],
	updateUserSuccess: ['userData'],
	// personal
	updatePersonalData: ['personalData'],
	setPersonalDataIsUpdating: ['personalDataIsUpdating'],
	setPersonalError: ['personalError'],
	// password
	updatePassword: ['passwordData'],
	setPasswordIsUpdating: ['passwordIsUpdating'],
	setPasswordError: ['passwordError'],
	// api key
	generateApiKey: [],
	deleteApiKey: [],
	setApiKeyIsUpdating: ['apiKeyIsUpdating'],
	setApiKeyError: ['apiKeyError'],
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

// personal
export const setPersonalDataIsUpdating = (state = INITIAL_STATE, { personalDataIsUpdating }): ICurrentUserState => ({
	...state,
	personalDataIsUpdating,
});

export const setPersonalError = (state = INITIAL_STATE, { personalError }): ICurrentUserState => ({
	...state,
	personalError,
});

// password
export const setPasswordIsUpdating = (state = INITIAL_STATE, { passwordIsUpdating }): ICurrentUserState => ({
	...state,
	passwordIsUpdating,
});

export const setPasswordError = (state = INITIAL_STATE, { passwordError }): ICurrentUserState => ({
	...state,
	passwordError,
});

// api key
export const setApiKeyIsUpdating = (state = INITIAL_STATE, { apiKeyIsUpdating }): ICurrentUserState => ({
	...state,
	apiKeyIsUpdating,
});

export const setApiKeyError = (state = INITIAL_STATE, { apiKeyError }): ICurrentUserState => ({
	...state,
	apiKeyError,
});

export const currentUserReducer = createReducer<ICurrentUserState>(INITIAL_STATE, {
	[CurrentUserTypes.FETCH_USER_SUCCESS]: fetchUserSuccess,
	[CurrentUserTypes.UPDATE_USER_SUCCESS]: updateUserSuccess,
	// personal
	[CurrentUserTypes.SET_PERSONAL_DATA_IS_UPDATING]: setPersonalDataIsUpdating,
	[CurrentUserTypes.SET_PERSONAL_ERROR]: setPersonalError,
	//password
	[CurrentUserTypes.SET_PASSWORD_IS_UPDATING]: setPasswordIsUpdating,
	[CurrentUserTypes.SET_PASSWORD_ERROR]: setPasswordError,
	// api key
	[CurrentUserTypes.SET_API_KEY_IS_UPDATING]: setApiKeyIsUpdating,
	[CurrentUserTypes.SET_API_KEY_ERROR]: setApiKeyError,
});

/**
 * Types
*/

export interface ICurrentUserState {
	currentUser: ICurrentUser;
	personalDataIsUpdating?: boolean,
	personalError?: any,
	passwordIsUpdating?: boolean,
	passwordError?: any,
	apiKeyIsUpdating?: boolean,
	apiKeyError?: any,
}

export type FetchUserAction = Action<'FETCH_USER'>;
export type FetchUserSuccessAction = Action<'FETCH_USER_SUCCESS'> & { userData: ICurrentUser };
export type UpdateUserSuccessAction = Action<'UPDATE_USER_SUCCESS'> & { userData: UpdateUser };
// personal
export type UpdatePersonalDataAction = Action<'UPDATE_PERSONAL_DATA'> & { personalData: UpdatePersonalData };
export type SetPersonalDataIsUpdatingAction = Action<'SET_PERSONAL_DATA_IS_UPDATING'> & { personalDataIsUpdating: boolean };
export type SetPersonalErrorAction = Action<'SET_PERSONAL_ERROR'> & { personalError: any };
// password
export type UpdatePasswordAction = Action<'UPDATE_PASSWORD'> & { passwordData: UpdatePassword };
export type SetPasswordIsUpdatingAction = Action<'SET_PASSWORD_IS_UPDATING'> & { passwordIsUpdating: boolean };
export type SetPasswordErrorAction = Action<'SET_PASSWORD_ERROR'> & { passwordError: any };
// api key
export type SetApiKeyIsUpdatingAction = Action<'SET_API_KEY_IS_UPDATING'> & { personalDataIsUpdating: boolean };
export type SetApiKeyErrorAction = Action<'SET_API_KEY_ERROR'> & { apiKeyError: any };

export interface ICurrentUserActionCreators {
	fetchUser: () => FetchUserAction;
	fetchUserSuccess: (userData: ICurrentUser) => FetchUserSuccessAction;
	updateUserSuccess: (userData: UpdateUserSuccess) => UpdateUserSuccessAction;
	// personal
	updatePersonalData: (personalData: UpdatePersonalData) => UpdatePersonalDataAction;
	setPersonalDataIsUpdating: (personalDataIsUpdating: boolean) => SetPersonalDataIsUpdatingAction;
	setPersonalError: (personalError: any) => SetPersonalErrorAction;
	// password
	updatePassword: (passwordData: UpdatePassword) => UpdatePasswordAction;
	setPasswordIsUpdating: (passwordIsUpdating: boolean) => SetPasswordIsUpdatingAction;
	setPasswordError: (passwordError: any) => SetPasswordErrorAction;
	// api key
	generateApiKey: () => UpdateUserSuccessAction;
	deleteApiKey: () => UpdateUserSuccessAction;
	setApiKeyIsUpdating: (apiKeyIsUpdating: boolean) => SetApiKeyIsUpdatingAction;
	setApiKeyError: (apiKeyError: any) => SetApiKeyErrorAction;
}
