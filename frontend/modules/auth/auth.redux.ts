/**
 *  Copyright (C) 2017 3D Repo Ltd
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

export const { Types: AuthTypes, Creators: AuthActions } = createActions({
	authenticate: [],
	login: ['username', 'password'],
	loginSuccess: [],
	loginFailure: [],
	logout: [],
	sessionExpired: [],
	sendPasswordChangeRequest: ['userNameOrEmail'],
	setPendingStatus: ['isPending'],
	changePassword: ['username', 'token', 'password']
}, { prefix: 'AUTH_' });

export const INITIAL_STATE = {
	isAuthenticated: null,
	isPending: false
};

export const loginSuccess = (state = INITIAL_STATE) => {
	return { ...state, isAuthenticated: true };
};

export const loginFailure = (state = INITIAL_STATE) => {
	return { ...state, isAuthenticated: false };
};

export const setPendingStatus = (state = INITIAL_STATE, { isPending }) => {
	return { ...state, isPending };
};

export const reducer = createReducer(INITIAL_STATE, {
	[AuthTypes.LOGIN_SUCCESS]: loginSuccess,
	[AuthTypes.LOGIN_FAILURE]: loginFailure,
	[AuthTypes.SET_PENDING_STATUS]: setPendingStatus
});
