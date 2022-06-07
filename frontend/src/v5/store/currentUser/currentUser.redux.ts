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
import { ICurrentUser, UpdateUser, UpdatePersonalData, UpdateUserSuccess } from './currentUser.types';

export const { Types: CurrentUserTypes, Creators: CurrentUserActions } = createActions({
	fetchUser: [],
	fetchUserSuccess: ['userData'],
	updateUser: ['userData'],
	updateUserSuccess: ['userData'],
	resetErrors: [],
	// personal
	updatePersonalData: ['personalData'],
	setPersonalDataIsUpdating: ['personalDataIsUpdating'],
	setPersonalError: ['personalError'],
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

export const resetErrors = (state = INITIAL_STATE): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		personalError: null,
		apiKeyError: null,
	},
});

// personal
export const setPersonalDataIsUpdating = (state = INITIAL_STATE, { personalDataIsUpdating }): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		personalDataIsUpdating,
	},
});

export const setPersonalError = (state = INITIAL_STATE, { personalError }): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		personalError,
	},
});

// api key
export const setApiKeyIsUpdating = (state = INITIAL_STATE, { apiKeyIsUpdating }): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		apiKeyIsUpdating,
	},
});

export const setApiKeyError = (state = INITIAL_STATE, { apiKeyError }): ICurrentUserState => ({
	...state,
	currentUser: {
		...state.currentUser,
		apiKeyError,
	},
});



export const currentUserReducer = createReducer<ICurrentUserState>(INITIAL_STATE, {
	[CurrentUserTypes.FETCH_USER_SUCCESS]: fetchUserSuccess,
	[CurrentUserTypes.UPDATE_USER_SUCCESS]: updateUserSuccess,
	[CurrentUserTypes.RESET_ERRORS]: resetErrors,
	// personal
	[CurrentUserTypes.SET_PERSONAL_DATA_IS_UPDATING]: setPersonalDataIsUpdating,
	[CurrentUserTypes.SET_PERSONAL_ERROR]: setPersonalError,
	// api key
	[CurrentUserTypes.SET_API_KEY_IS_UPDATING]: setApiKeyIsUpdating,
	[CurrentUserTypes.SET_API_KEY_ERROR]: setApiKeyError,
}) as (state: ICurrentUserState, action: any) => ICurrentUserState;

/**
 * Types
*/

export interface ICurrentUserState {
	currentUser: ICurrentUser;
}

export type FetchUserAction = Action<'FETCH_USER'>;
export type FetchUserSuccessAction = Action<'FETCH_USER_SUCCESS'> & { userData: ICurrentUser };
export type UpdateUserSuccessAction = Action<'UPDATE_USER_SUCCESS'> & { userData: UpdateUser };
export type ResetErrorsAction = Action<'RESET_ERRORS'>;
// personal
export type UpdatePersonalDataAction = Action<'UPDATE_PERSONAL_DATA'> & { personalData: UpdatePersonalData };
export type SetPersonalDataIsUpdatingAction = Action<'SET_PERSONAL_DATA_IS_UPDATING'> & { personalDataIsUpdating: boolean };
export type SetPersonalErrorAction = Action<'SET_PERSONAL_ERROR'> & { personalError: any };
// api key
export type SetApiKeyIsUpdatingAction = Action<'SET_API_KEY_IS_UPDATING'> & { personalDataIsUpdating: boolean };
export type SetApiKeyErrorAction = Action<'SET_API_KEY_ERROR'> & { apiKeyError: any };

export interface ICurrentUserActionCreators {
	fetchUser: () => FetchUserAction;
	fetchUserSuccess: (userData: ICurrentUser) => FetchUserSuccessAction;
	updateUserSuccess: (userData: UpdateUserSuccess) => UpdateUserSuccessAction;
	resetErrors: () => ResetErrorsAction;
	// personal
	updatePersonalData: (personalData: UpdatePersonalData) => UpdatePersonalDataAction;
	setPersonalDataIsUpdating: (personalDataIsUpdating: boolean) => SetPersonalDataIsUpdatingAction;
	setPersonalError: (personalError: any) => SetPersonalErrorAction;
	// api key
	generateApiKey: () => UpdateUserSuccessAction;
	deleteApiKey: () => UpdateUserSuccessAction;
	setApiKeyIsUpdating: (apiKeyIsUpdating: boolean) => SetApiKeyIsUpdatingAction;
	setApiKeyError: (apiKeyError: any) => SetApiKeyErrorAction;
}
