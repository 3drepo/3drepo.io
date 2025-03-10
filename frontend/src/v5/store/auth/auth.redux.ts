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
	setAuthenticatedTeamspace: ['teamspace'],
	logout: [],
	setIsAuthenticationPending: ['isPending'],
	setIsAuthenticated: ['isAuthenticated'],
	sessionExpired: [],
	setReturnUrl: ['url'],
	kickedOut: [],
}, { prefix: 'AUTH2/' }) as { Types: Constants<IAuthActionCreators>; Creators: IAuthActionCreators };

export const INITIAL_STATE: IAuthState = {
	isAuthenticated: null,
	authenticatedTeamspace: null,
	isAuthenticationPending: false,
	returnUrl: null,
};

export const setIsAuthenticated = (state, { isAuthenticated }: SetIsAuthenticatedAction) => {
	state.isAuthenticated = isAuthenticated;
};

export const setAuthenticatedTeamspace = (state, { teamspace }: SetAuthenticatedTeamspaceAction) => {
	state.authenticatedTeamspace = teamspace;
};

export const setIsAuthenticationPending = (state, { isPending }: SetIsAuthenticationPendingAction) => {
	state.isPending = isPending;
};

export const setReturnUrl = (state, { url }: SetReturnUrlAction) => {
	state.returnUrl = url;
};

export const authReducer = createReducer(INITIAL_STATE, produceAll({
	[AuthTypes.SET_AUTHENTICATED_TEAMSPACE]: setAuthenticatedTeamspace,
	[AuthTypes.SET_IS_AUTHENTICATION_PENDING]: setIsAuthenticationPending,
	[AuthTypes.SET_IS_AUTHENTICATED]: setIsAuthenticated,
	[AuthTypes.SET_RETURN_URL]: setReturnUrl,
}));

/**
 * Types
*/

export interface IAuthState {
	isAuthenticated: boolean;
	authenticatedTeamspace: string;
	isAuthenticationPending: boolean;
	returnUrl: {
		pathname: string,
		search?: string,
		hash?: string
	}
}

export type AuthenticateAction = Action<'AUTHENTICATE'>;
export type SetAuthenticatedTeamspaceAction = Action<'SET_AUTHENTICATED_TEAMSPACE'> & { teamspace: string };
export type LogoutAction = Action<'LOGOUT'>;
export type SetIsAuthenticationPendingAction = Action<'SET_IS_AUTHENTICATION_PENDING'> & { isPending: boolean };
export type SetIsAuthenticatedAction = Action<'SET_AUTHENTICATION_STATUS'> & { isAuthenticated: boolean };
export type SetReturnUrlAction = Action<'SET_RETURN_URL'> & { url: string };

export interface IAuthActionCreators {
	authenticate: () => AuthenticateAction;
	setAuthenticatedTeamspace: (teamspace: string) => SetAuthenticatedTeamspaceAction;
	logout: () => LogoutAction;
	setIsAuthenticationPending: (isPending: boolean) => SetIsAuthenticationPendingAction;
	setIsAuthenticated: (isAuthenticated: boolean) => SetIsAuthenticatedAction;
	sessionExpired: () => void;
	setReturnUrl: (url: IAuthState['returnUrl']) => SetReturnUrlAction;
	kickedOut: () => void;
}
