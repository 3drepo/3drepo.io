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
	changePassword: ['username', 'token', 'password'],
	setLocalSessionStatus: ['status'],
	register: ['username', 'data'],
	verify: ['username', 'token'],
	setAuthMessage: ['message'],
	onLoggedOut: [],
	clearAuthMessage: []
}, { prefix: 'AUTH/' });

export const INITIAL_STATE = {
	isAuthenticated: null,
	isPending: false,
	message: ''
};

export const loginSuccess = (state = INITIAL_STATE) => {
	setLocalSessionStatus(state, { status: true });
	return { ...state, isAuthenticated: true, isPending: false };
};

export const loginFailure = (state = INITIAL_STATE) => {
	setLocalSessionStatus(state, { status: false });
	return { ...state, isAuthenticated: false, isPending: false };
};

export const setPendingStatus = (state = INITIAL_STATE, { isPending }) => {
	return { ...state, isPending };
};

export const setLocalSessionStatus = (state = INITIAL_STATE, { status }) => {
	window.localStorage.setItem('loggedIn', JSON.stringify(status));
	return state;
};

export const setAuthMessage = (state = INITIAL_STATE, { message }) => {
	return { ...state, message };
};

export const clearAuthMessage = (state = INITIAL_STATE) => {
	return { ...state, message: '' };
};

export const reducer = createReducer(INITIAL_STATE, {
	[AuthTypes.LOGIN_SUCCESS]: loginSuccess,
	[AuthTypes.LOGIN_FAILURE]: loginFailure,
	[AuthTypes.SET_PENDING_STATUS]: setPendingStatus,
	[AuthTypes.SET_LOCAL_SESSION_STATUS]: setLocalSessionStatus,
	[AuthTypes.SET_AUTH_MESSAGE]: setAuthMessage,
	[AuthTypes.CLEAR_AUTH_MESSAGE]: clearAuthMessage
});
