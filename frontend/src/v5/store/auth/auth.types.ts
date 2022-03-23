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

export type LoginAction = Action<'LOGIN'> & { username: string, password: string };
export type LoginFailedAction = Action<'LOGIN_Failed'> & { errorMessage: string };
export type SetPendingStatusAction = Action<'SET_PENDING_STATUS'> & { isPending: boolean };
export type SetAuthenticationStatusAction = Action<'SET_AUTHENTICATION_STATUS'> & { status: boolean };

export interface IAuthActionCreators {
	authenticate: () => Action<'AUTHENTICATE'>;
	login: (username: string, password: string) => LoginAction;
	loginFailed: (errorMessage: string) => LoginFailedAction,
	logout: () => Action<'LOGOUT'>;
	setPendingStatus: (isPending: boolean) => SetPendingStatusAction;
	setAuthenticationStatus: (status: boolean) => SetAuthenticationStatusAction;
	sessionExpired: () => void;
}
