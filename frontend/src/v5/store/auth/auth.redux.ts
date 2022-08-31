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

import { produceAll } from '@/v5/helpers/reducers.helper';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../../helpers/actions.helper';

export const { Types: AuthTypes, Creators: AuthActions } = createActions({
	authenticate: [],
	login: ['username', 'password'],
	loginFailed: ['errorMessage'],
	logout: [],
	setPendingStatus: ['isPending'],
	setAuthenticationStatus: ['status'],
	sessionExpired: [],
	setReturnUrl: ['url'],
	kickedOut: [],
}, { prefix: 'AUTH2/' }) as { Types: Constants<IAuthActionCreators>; Creators: IAuthActionCreators };

export const INITIAL_STATE: IAuthState = {
	isAuthenticated: null,
	isPending: false,
	errorMessage: null,
	returnUrl: null,
};

export const setAuthenticationStatus = (state, { status }: SetAuthenticationStatusAction) => {
	state.isAuthenticated = status;
};

export const setPendingStatus = (state, { isPending }: SetPendingStatusAction) => {
	state.isPending = isPending;
};

export const loginFailed = (state, { errorMessage }: LoginFailedAction) => {
	state.errorMessage = errorMessage;
};

export const setReturnUrl = (state, { url }: SetReturnUrlAction) => {
	state.returnUrl = url;
};

export const authReducer = createReducer(INITIAL_STATE, produceAll({
	[AuthTypes.LOGIN_FAILED]: loginFailed,
	[AuthTypes.SET_PENDING_STATUS]: setPendingStatus,
	[AuthTypes.SET_AUTHENTICATION_STATUS]: setAuthenticationStatus,
	[AuthTypes.SET_RETURN_URL]: setReturnUrl,
}));

/**
 * Types
*/

export interface IAuthState {
	isAuthenticated: boolean;
	isPending: boolean;
	errorMessage: string;
	returnUrl: {
		pathname: string,
		search?: string,
		hash?: string
	}
}

export type AuthenticateAction = Action<'AUTHENTICATE'>;
export type LoginAction = Action<'LOGIN'> & { username: string, password: string };
export type LoginFailedAction = Action<'LOGIN_FAILED'> & { errorMessage: string };
export type LogoutAction = Action<'LOGOUT'>;
export type SetPendingStatusAction = Action<'SET_PENDING_STATUS'> & { isPending: boolean };
export type SetAuthenticationStatusAction = Action<'SET_AUTHENTICATION_STATUS'> & { status: boolean };
export type SetReturnUrlAction = Action<'SET_RETURN_URL'> & { url: string };

export interface IAuthActionCreators {
	authenticate: () => AuthenticateAction;
	login: (username: string, password: string) => LoginAction;
	loginFailed: (errorMessage: string) => LoginFailedAction,
	logout: () => LogoutAction;
	setPendingStatus: (isPending: boolean) => SetPendingStatusAction;
	setAuthenticationStatus: (status: boolean) => SetAuthenticationStatusAction;
	sessionExpired: () => void;
	setReturnUrl: (url: IAuthState['returnUrl']) => SetReturnUrlAction;
	kickedOut: () => void;
}
