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

export const { Types: TeamspaceTypes, Creators: TeamspaceActions } = createActions({
	fetchUser: ['username'],
	fetchUserSuccess: ['userData'],
	fetchUserError: ['error'],

	setPendingState: ['pendingState'],
	updateButtonText: ['value']
}, { prefix: 'TEAMSPACE_' });

export const INITIAL_STATE = {
	currentTeamspace: '',
	currentUser: {},
	isPending: true
};

const setPendingState = (state = INITIAL_STATE, { pendingState }) => {
	return Object.assign({}, state, { isPending: pendingState });
};

const fetchUserSuccess = (state = INITIAL_STATE, { userData }) => {
	return {
		...state,
		currentTeamspace: userData.username,
		currentUser: userData
	};
};

const fetchUserError = (state = INITIAL_STATE, { error }) => {
	console.error(error);
};

export const reducer = createReducer(INITIAL_STATE, {
	[TeamspaceTypes.FETCH_USER_SUCCESS]: fetchUserSuccess,
	[TeamspaceTypes.FETCH_USER_ERROR]: fetchUserError,
	[TeamspaceTypes.SET_PENDING_STATE]: setPendingState
});
