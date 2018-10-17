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
import { omit, keyBy } from 'lodash';

export const { Types: TeamspaceTypes, Creators: TeamspaceActions } = createActions({
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
	refreshAvatar: ['avatarUrl']
}, { prefix: 'TEAMSPACE_' });

export const INITIAL_STATE = {
	currentTeamspace: '',
	currentUser: {
		username: ''
	},
	teamspaces: [],
	isPending: true,
	isAvatarPending: true,
	collaboratorLimit: null
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return Object.assign({}, state, { isPending: pendingState });
};

const setAvatarPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return Object.assign({}, state, { isAvatarPending: pendingState });
};

const fetchQuotaInfoSuccess = (state = INITIAL_STATE, { quota }) => {
	return Object.assign({}, state, { ...quota });
};

const fetchUserSuccess = (state = INITIAL_STATE, { userData }) => {
	const currentUser = omit(userData, ['accounts']);
	const teamspaces = keyBy(userData.accounts, 'account');

	return {
		...state,
		currentTeamspace: userData.username,
		currentUser,
		teamspaces,
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

// Projects
const updateProjectSuccess = (state = INITIAL_STATE, action) => {
	return state;
};

const createProjectSuccess = (state = INITIAL_STATE, action) => {
	return state;
};

const removeProjectSuccess = (state = INITIAL_STATE, action) => {
	return state;
};

export const reducer = createReducer({ ...INITIAL_STATE }, {
	[TeamspaceTypes.FETCH_USER_SUCCESS]: fetchUserSuccess,
	[TeamspaceTypes.FETCH_QUOTA_INFO_SUCCESS]: fetchQuotaInfoSuccess,
	[TeamspaceTypes.UPDATE_USER_SUCCESS]: updateUserSuccess,
	[TeamspaceTypes.SET_PENDING_STATE]: setPendingState,
	[TeamspaceTypes.SET_AVATAR_PENDING_STATE]: setAvatarPendingState,
	[TeamspaceTypes.REFRESH_AVATAR]: refreshAvatar,

	// Projects
	[TeamspaceTypes.UPDATE_PROJECT_SUCCESS]: updateProjectSuccess,
	[TeamspaceTypes.CREATE_PROJECT_SUCCESS]: createProjectSuccess,
	[TeamspaceTypes.REMOVE_PROJECT_SUCCESS]: removeProjectSuccess
});
