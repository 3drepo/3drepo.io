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
import { TEAMSPACE_PERMISSIONS } from '../../constants/teamspace-permissions';

export const { Types: UserManagementTypes, Creators: UserManagementActions } = createActions({
	fetchTeamspaceDetails: ['teamspace'],
	fetchTeamspaceDetailsSuccess: ['teamspace', 'users', 'quotaInfo', 'jobs', 'jobsColors'],
	setPendingState: ['isPending'],
	addUser: ['user'],
	addUserSuccess: ['user'],
	removeUser: ['username'],
	removeUserCascade: ['username'],
	removeUserSuccess: ['username'],
	setTeamspace: ['teamspace'],
	updateJob: ['username', 'job'],
	updateUserJobSuccess: ['username', 'job'],
	updatePermissions: ['permissions'],
	updatePermissionsSuccess: ['permissions'],
	getUsersSuggestions: ['searchText'],
	getUsersSuggestionsSuccess: ['suggestions'],
	clearUsersSuggestions: [],
	createJob: ['job'],
	createJobSuccess: ['job'],
	removeJob: ['jobId'],
	removeJobSuccess: ['jobId'],
	updateJobColor: ['job'],
	updateJobSuccess: ['job'],
	fetchProject: ['project'],
	updateProject: ['project'],
	updateProjectSuccess: ['project'],
	fetchModelPermissions: ['model'],
	fetchMultipleModelsPermissions: ['models'],
	updateMultipleModelsPermissions: ['permissions']
}, { prefix: 'USER_MANAGEMENT_' });

export const INITIAL_STATE = {
	teamspace: null,
	users: [],
	jobs: [],
	jobsColors: [],
	projects: [],
	collaboratorLimit: null,
	isPending: false,
	usersSuggestions: []
};

/**
 * Add additional fields to user data
 * @param users
 * @returns
 */
const prepareUserData = (teamspaceName, users): object => {
	return {
		...users,
		isAdmin: users.permissions.includes(TEAMSPACE_PERMISSIONS.admin.key),
		isOwner: teamspaceName === users.user
	};
};

export const fetchTeamspaceDetailsSuccess = (state = INITIAL_STATE, action) => {
	const { teamspace, quotaInfo = {}, jobs, jobsColors } = action;
	const users = action.users.map(prepareUserData.bind(null, teamspace));

	return { ...state, ...quotaInfo, teamspace, users, jobs, jobsColors, isPending: false };
};

export const setPendingState = (state = INITIAL_STATE, { isPending }) => {
	return { ...state, isPending};
};

export const addUserSuccess = (state = INITIAL_STATE, { user }) => {
	const users = [
		...state.users,
		prepareUserData(state.teamspace, user)
	];
	return { ...state, users };
};

export const removeUserSuccess = (state = INITIAL_STATE, { username }) => {
	const users = state.users.filter(({user}) => {
		return user !== username;
	});
	return { ...state, users };
};

export const setTeamspace = (state = INITIAL_STATE, { teamspace }) => {
	return { ...state, teamspace };
};

export const updateUserJobSuccess = (state = INITIAL_STATE, { username, job }) => {
	const users = [...state.users].map((userData) => {
		if (userData.user === username) {
			userData.job = job;
		}

		return userData;
	});
	return { ...state, users };
};

export const updatePermissionsSuccess = (state = INITIAL_STATE, { permissions }) => {
	const users = [...state.users].map((userData) => {
		if (userData.user === permissions.user) {
			const newUserData = {...userData, ...permissions};
			return prepareUserData(state.teamspace, newUserData);
		}

		return userData;
	});
	return { ...state, users };
};

export const getUsersSuggestionsSuccess = (state = INITIAL_STATE, { suggestions }) => {
	return { ...state, usersSuggestions: suggestions };
};

export const clearUsersSuggestions = (state = INITIAL_STATE, { suggestions }) => {
	return { ...state, usersSuggestions: [] };
};

export const updateJobsColors = (state = INITIAL_STATE, { color }) => {
	const jobsColors = [...state.jobsColors] as any;
	if (color && !jobsColors.includes(color)) {
		jobsColors.unshift(color);
	}

	return { ...state, jobsColors };
};

export const createJobSuccess = (state = INITIAL_STATE, { job }) => {
	const jobs = [...state.jobs, job];
	return updateJobsColors({ ...state, jobs }, job);
};

export const updateJobSuccess = (state = INITIAL_STATE, { job }) => {
	const jobs = [...state.jobs].map((jobData) => {
		if (jobData._id === job._id) {
			return job;
		}

		return jobData;
	});

	return updateJobsColors({ ...state, jobs }, job);
};

export const removeJobSuccess = (state = INITIAL_STATE, { jobId }) => {
	const jobs = [...state.jobs].filter(({_id}) => {
		return _id !== jobId;
	});

	return { ...state, jobs };
};

export const createProjectSuccess = (state = INITIAL_STATE, { job }) => {
	const jobs = [...state.jobs, job];
	return updateJobsColors({ ...state, jobs }, job);
};

export const updateProjectSuccess = (state = INITIAL_STATE, { job }) => {
	const jobs = [...state.jobs].map((jobData) => {
		if (jobData._id === job._id) {
			return job;
		}

		return jobData;
	});

	return updateJobsColors({ ...state, jobs }, job);
};

export const removeProjectSuccess = (state = INITIAL_STATE, { jobId }) => {
	const jobs = [...state.jobs].filter(({ _id }) => {
		return _id !== jobId;
	});

	return { ...state, jobs };
};

export const reducer = createReducer(INITIAL_STATE, {
	[UserManagementTypes.FETCH_TEAMSPACE_DETAILS_SUCCESS]: fetchTeamspaceDetailsSuccess,
	[UserManagementTypes.SET_PENDING_STATE]: setPendingState,
	[UserManagementTypes.ADD_USER_SUCCESS]: addUserSuccess,
	[UserManagementTypes.REMOVE_USER_SUCCESS]: removeUserSuccess,
	[UserManagementTypes.SET_TEAMSPACE]: setTeamspace,
	[UserManagementTypes.UPDATE_USER_JOB_SUCCESS]: updateUserJobSuccess,
	[UserManagementTypes.UPDATE_PERMISSIONS_SUCCESS]: updatePermissionsSuccess,
	[UserManagementTypes.GET_USERS_SUGGESTIONS_SUCCESS]: getUsersSuggestionsSuccess,
	[UserManagementTypes.CLEAR_USERS_SUGGESTIONS]: clearUsersSuggestions,

	// Jobs
	[UserManagementTypes.CREATE_JOB_SUCCESS]: createJobSuccess,
	[UserManagementTypes.UPDATE_JOB_SUCCESS]: updateJobSuccess,
	[UserManagementTypes.REMOVE_JOB_SUCCESS]: removeJobSuccess,

	// Project
	[UserManagementTypes.UPDATE_PROJECT_SUCCESS]: updateProjectSuccess
});
