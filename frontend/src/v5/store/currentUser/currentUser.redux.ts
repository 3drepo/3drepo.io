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
import { produceAll } from '@/v5/helpers/reducers.helper';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { ICurrentUser, UpdateUser, UpdatePersonalData, UpdateUserSuccess } from './currentUser.types';

export const { Types: CurrentUserTypes, Creators: CurrentUserActions } = createActions({
	fetchUser: [],
	fetchUserSuccess: ['userData'],
	updateUser: ['userData'],
	updateUserSuccess: ['userData'],
	updatePersonalData: ['personalData', 'onSuccess', 'onError'],
	generateApiKey: [],
	deleteApiKey: [],
	setApiKeyIsUpdating: ['apiKeyIsUpdating'],
}, { prefix: 'CURRENT_USER2/' }) as { Types: Constants<ICurrentUserActionCreators>; Creators: ICurrentUserActionCreators };

export const INITIAL_STATE: ICurrentUserState = {
	currentUser: { username: '', email: '', firstName: '', lastName: '' },
};

export const fetchUserSuccess = (state, { userData }: FetchUserSuccessAction) => {
	state.currentUser = userData;
};

export const updateUserSuccess = (state, { userData }: UpdateUserSuccessAction) => {
	state.currentUser = { ...state.currentUser, ...userData };
};

export const setApiKeyIsUpdating = (state, { apiKeyIsUpdating }: SetApiKeyIsUpdatingAction) => {
	state.currentUser.apiKeyIsUpdating = apiKeyIsUpdating;
};

export const currentUserReducer = createReducer<ICurrentUserState>(INITIAL_STATE, produceAll({
	[CurrentUserTypes.FETCH_USER_SUCCESS]: fetchUserSuccess,
	[CurrentUserTypes.UPDATE_USER_SUCCESS]: updateUserSuccess,
	[CurrentUserTypes.SET_API_KEY_IS_UPDATING]: setApiKeyIsUpdating,
})) as (state: ICurrentUserState, action: any) => ICurrentUserState;

/**
 * Types
*/

export interface ICurrentUserState {
	currentUser: ICurrentUser;
}

export type FetchUserAction = Action<'FETCH_USER'>;
export type FetchUserSuccessAction = Action<'FETCH_USER_SUCCESS'> & { userData: ICurrentUser };
export type UpdateUserSuccessAction = Action<'UPDATE_USER_SUCCESS'> & { userData: UpdateUser };
export type UpdatePersonalDataAction = Action<'UPDATE_PERSONAL_DATA'> & {
	personalData: UpdatePersonalData,
	onSuccess: () => void,
	onError: (error: Error) => void,
};
export type UpdateApiKeyAction = Action<'UPDATE_API_KEY'>;
export type SetApiKeyIsUpdatingAction = Action<'SET_API_KEY_IS_UPDATING'> & { apiKeyIsUpdating: boolean };

export interface ICurrentUserActionCreators {
	fetchUser: () => FetchUserAction;
	fetchUserSuccess: (userData: ICurrentUser) => FetchUserSuccessAction;
	updateUserSuccess: (userData: UpdateUserSuccess) => UpdateUserSuccessAction;
	updatePersonalData: (
		personalData: UpdatePersonalData,
		onSuccess: () => void,
		onError: (error) => void,
	) => UpdatePersonalDataAction;
	generateApiKey: () => UpdateApiKeyAction;
	deleteApiKey: () => UpdateApiKeyAction;
	setApiKeyIsUpdating: (apiKeyIsUpdating: boolean) => SetApiKeyIsUpdatingAction;
}
