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

import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../../helpers/actions.helper';
import { IAuthActionCreators } from './auth.types';

interface IAuthState {
	isAuthenticated: boolean;
	isPending: boolean;
}

export const { Types: AuthTypes, Creators: AuthActions } = createActions({
	authenticate: [],
	login: ['username', 'password'],
	loginSuccess: [],
	logout: [],
	setPendingStatus: ['isPending'],
}, { prefix: 'AUTH2/' }) as { Types: Constants<IAuthActionCreators>; Creators: IAuthActionCreators };

export const INITIAL_STATE: IAuthState = {
	isAuthenticated: null,
	isPending: false,
};

export const setPendingStatus = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

export const loginSuccess = (state = INITIAL_STATE): IAuthState => (
	{ ...state, isAuthenticated: true, isPending: false }
);

export const logout = (state = INITIAL_STATE): IAuthState => (
	{ ...state, isAuthenticated: false, isPending: false }
);

export const reducer = createReducer(INITIAL_STATE, {
	[AuthTypes.LOGIN_SUCCESS]: loginSuccess,
	[AuthTypes.SET_PENDING_STATUS]: setPendingStatus,
	[AuthTypes.LOGOUT]: logout,
});
