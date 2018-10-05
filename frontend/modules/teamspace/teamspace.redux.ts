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

const getAvatartUrl = (username) => `/api/${username}/avatar?${Date.now()}`;

export const { Types: TeamspaceTypes, Creators: TeamspaceActions } = createActions({
	fetchUser: ['username'],
	fetchUserSuccess: ['userData'],
	fetchUserError: ['error'],
	setPendingState: ['pendingState'],
	setAvatarPendingState: ['pendingState'],
	updateButtonText: ['value'],
	uploadAvatar: ['file'],
	refreshAvatar: []
}, { prefix: 'TEAMSPACE_' });

export const INITIAL_STATE = {
	currentTeamspace: '',
	currentUser: {
		username: ''
	},
	isPending: true,
	isAvatarPending: true
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return Object.assign({}, state, { isPending: pendingState });
};

const setAvatarPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return Object.assign({}, state, { isAvatarPending: pendingState });
};

const fetchUserSuccess = (state = INITIAL_STATE, { userData }) => {
	userData.avatarUrl = getAvatartUrl(userData.username);
	return {
		...state,
		currentTeamspace: userData.username,
		currentUser: userData,
		isAvatarPending: false
	};
};

const fetchUserError = (state = INITIAL_STATE, { error }) => {
	console.error(error);
};

const refreshAvatar = (state = INITIAL_STATE) => {
	const currentUser = {
		...state.currentUser,
		avatarUrl: getAvatartUrl(state.currentUser.username)
	};

	return {
		...state,
		currentUser,
		isAvatarPending: false
	};
};

export const reducer = createReducer({ ...INITIAL_STATE }, {
	[TeamspaceTypes.FETCH_USER_SUCCESS]: fetchUserSuccess,
	[TeamspaceTypes.FETCH_USER_ERROR]: fetchUserError,
	[TeamspaceTypes.SET_PENDING_STATE]: setPendingState,
	[TeamspaceTypes.REFRESH_AVATAR]: refreshAvatar
});
