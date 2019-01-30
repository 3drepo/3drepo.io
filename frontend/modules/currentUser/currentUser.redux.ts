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

export const { Types: CurrentUserTypes, Creators: CurrentUserActions } = createActions({
	fetchUser: ['username'],
	fetchUserSuccess: ['userData'],
	fetchQuotaInfo: ['teamspace'],
	fetchQuotaInfoSuccess: ['quota'],
	fetchUserError: ['error'],
	updateUser: ['userData'],
	updateUserSuccess: ['userData'],
	updateUserPassword: ['passwords'],
	setPendingState: ['pendingState'],
	setAvatarPendingState: ['pendingState'],
	updateButtonText: ['value'],
	uploadAvatar: ['file'],
	refreshAvatar: ['avatarUrl'],
	generateApiKey: [],
	deleteApiKey: [],
	setAsInitialised: []
}, { prefix: 'CURRENT_USER_' });

export const INITIAL_STATE = {
	currentTeamspace: '',
	currentUser: {
		username: ''
	},
	isPending: true,
	isInitialised: false,
	isAvatarPending: true,
	collaboratorLimit: null
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return Object.assign({}, state, { isPending: pendingState });
};

const setAvatarPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return Object.assign({}, state, { isAvatarPending: pendingState });
};

const setAsInitialised = (state = INITIAL_STATE) => Object.assign({}, state, { isInitialised: true });

const fetchQuotaInfoSuccess = (state = INITIAL_STATE, { quota }) => {
	return Object.assign({}, state, { ...quota });
};

const fetchUserSuccess = (state = INITIAL_STATE, { userData }) => {
	return {
		...state,
		currentTeamspace: userData.username,
		currentUser: userData,
		isAvatarPending: false
	};
};

const updateUserSuccess = (state = INITIAL_STATE, { userData }) => {
	const currentUser = { ...state.currentUser, ...userData };
	return { ...state, currentUser };
};

const refreshAvatar = (state = INITIAL_STATE, { avatarUrl }) => {
	const currentUser = { ...state.currentUser, avatarUrl };

	return {
		...state,
		currentUser,
		isAvatarPending: false
	};
};

export const reducer = createReducer({ ...INITIAL_STATE }, {
	[CurrentUserTypes.FETCH_USER_SUCCESS]: fetchUserSuccess,
	[CurrentUserTypes.FETCH_QUOTA_INFO_SUCCESS]: fetchQuotaInfoSuccess,
	[CurrentUserTypes.UPDATE_USER_SUCCESS]: updateUserSuccess,
	[CurrentUserTypes.SET_PENDING_STATE]: setPendingState,
	[CurrentUserTypes.SET_AVATAR_PENDING_STATE]: setAvatarPendingState,
	[CurrentUserTypes.REFRESH_AVATAR]: refreshAvatar,
	[CurrentUserTypes.SET_AS_INITIALISED]: setAsInitialised
});
