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

export const { Types: UserManagementTypes, Creators: UserManagementActions } = createActions({
	fetchTeamspaceDetails: ['teamspace'],
	fetchTeamspaceDetailsSuccess: ['users', 'quotaInfo', 'jobs', 'jobsColors'],
	setPendingState: ['isPending']
}, { prefix: 'USER_MANAGEMENT_' });

export const INITIAL_STATE = {
	users: [],
	jobs: [],
	jobsColors: [],
	projects: [],
	collaboratorLimit: null,
	isPending: false
};

export const fetchTeamspaceDetailsSuccess = (state = INITIAL_STATE, action) => {
	const { users = [], quotaInfo = {}, jobs, jobsColors } = action;
	return { ...state, ...quotaInfo, users, jobs, jobsColors, isPending: false };
};

export const setPendingState = (state = INITIAL_STATE, { isPending }) => {
	return { ...state, isPending };
};

export const reducer = createReducer(INITIAL_STATE, {
	[UserManagementTypes.FETCH_TEAMSPACE_DETAILS_SUCCESS]: fetchTeamspaceDetailsSuccess,
	[UserManagementTypes.SET_PENDING_STATE]: setPendingState
});
