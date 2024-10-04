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

import {createActions, createReducer} from 'reduxsauce';
import {PROJECT_ROLES_TYPES} from '../../constants/project-permissions';

export const { Types: UserManagementTypes, Creators: UserManagementActions } = createActions({
	fetchQuotaAndInvitations: [],
	fetchQuotaAndInvitationsSuccess: ['invitations', 'collaboratorLimit'],
	fetchTeamspaceUsers: [],
	fetchTeamspaceUsersSuccess: ['users'],
	setUsersPending: ['isPending'],
	setProjectsPending: ['isPending'],
	addUser: ['user'],
	addUserSuccess: ['user'],
	removeUser: ['username'],
	removeUserCascade: ['username'],
	removeUserSuccess: ['username'],
	setUserNotExists: ['userNotExists'],
	setTeamspace: ['teamspace'],
	updateUserJob: ['username', 'job'],
	updateUserJobSuccess: ['username', 'job'],
	updatePermissions: ['permissions', 'permissionsType'],
	updatePermissionsSuccess: ['permissions', 'currentUser'],
	getUsersSuggestions: ['searchText'],
	getUsersSuggestionsSuccess: ['suggestions'],
	clearUsersSuggestions: [],
	fetchProject: ['project'],
	fetchProjectSuccess: ['project'],
	updateProjectPermissions: ['permissions', 'permissionsType'],
	updateProjectPermissionsSuccess: ['permissions'],
	fetchModelsPermissions: ['models'],
	fetchModelPermissionsSuccess: ['models'],
	fetchCurrentTeamspaceJobsAndColors: [],
	updateModelsPermissions: ['modelsWithPermissions', 'permissionsType'],
	updateModelsPermissionsPre: ['modelsWithPermissions', 'permissionsType'],
	updateModelPermissionsSuccess: ['updatedModels'],
	sendInvitation: ['email', 'job', 'isAdmin', 'permissions', 'onFinish', 'onError'],
	removeInvitationSuccess: ['email'],
	removeInvitation: ['email'],
	sendInvitationSuccess: ['savedInvitation']

}, { prefix: 'USER_MANAGEMENT/' });

export const INITIAL_STATE = {
	models: [],
	users: [],
	invitations: [],
	usersSuggestions: [],
	usersPending: true,
	projectsPending: true,
	project: null,
	userNotExists: false
};

const mergePermissions = (permissions, newPermissions) => permissions.map((currentPermissions) => {
	const updatedPermissions = newPermissions.find(({user}) => currentPermissions.user === user);
	if (updatedPermissions) {
		return updatedPermissions;
	}
	return currentPermissions;
});

/**
 * Bind to users proper permissions` values
 * @param currentUsers
 * @param projectPermissions
 */
export const setProjectPermissionsToUsers = (state, { projectPermissions }) => {
	const usersWithPermissions = [...state.users].map((user) => {
		const isProjectAdmin = projectPermissions.some(({ user: {user: username}, permissions }) => {
			return permissions.includes(PROJECT_ROLES_TYPES.ADMINISTRATOR) && user === username;
		});

		return { ...user, isProjectAdmin };
	});

	return {...state, users: usersWithPermissions};
};

export const fetchQuotaAndInvitationsSuccess = (state = INITIAL_STATE, {invitations, collaboratorLimit}) => {
	return { ...state, invitations, collaboratorLimit };
};

export const fetchTeamspaceUsersSuccess = (state = INITIAL_STATE, { users }) => {
	return { ...state, users };
};

export const setUsersPending = (state = INITIAL_STATE, { isPending }) => {
	return {...state,  usersPending: isPending};
};

export const setProjectsPending = (state = INITIAL_STATE, { isPending }) => {
	return {...state, projectsPending: isPending};
};

export const addUserSuccess = (state = INITIAL_STATE, { user, currentUser }) => {
	return {...state, users: [...state.users, user] };
};

export const removeUserSuccess = (state = INITIAL_STATE, { username }) => {
	const users = state.users.filter(({user}) => {
		return user !== username;
	});
	return {...state, users};
};

export const removeInvitationSuccess = (state = INITIAL_STATE, { email }) => {
	const invitations = state.invitations.filter(({ email: inviteEmail }) => {
		return inviteEmail !== email;
	});

	return {...state, invitations};
};

export const sendInvitationSuccess = (state = INITIAL_STATE, { savedInvitation }) => {
	const invitations = [...state.invitations.filter(({ email }) => email !== savedInvitation.email), savedInvitation];
	return {...state, invitations};
};

export const setTeamspace = (state = INITIAL_STATE, { teamspace }) => {
	return {...state, teamspace};
};

export const updateUserJobSuccess = (state = INITIAL_STATE, { username, job }) => {
	const users = [...state.users].map((userData) => {
		if (userData.user === username) {
			userData.job = job;
		}

		return userData;
	});

	return {...state, users};
};

export const updatePermissionsSuccess = (state = INITIAL_STATE, { permissions }) => {
	const users = [...state.users].map((userData) => {
		if (userData.user === permissions.user) {
			return {...userData, ...permissions};
		}

		return userData;
	});

	return {...state, users};
};

export const getUsersSuggestionsSuccess = (state = INITIAL_STATE, { suggestions }) => {
	return {...state, usersSuggestions: suggestions};
};

export const clearUsersSuggestions = (state = INITIAL_STATE) => {
	return {...state, usersSuggestions: []};
};

export const setUserNotExists = (state = INITIAL_STATE, { userNotExists }) => {
	return {...state, userNotExists};
};

export const fetchProjectSuccess = (state = INITIAL_STATE, { project }) => {
	return {...state, project };
};

export const updateProjectPermissionsSuccess = (state = INITIAL_STATE, { permissions }) => {
	const project = {...state.project};

	project.permissions = mergePermissions(project.permissions, permissions);
	return {...state, project };
};

export const fetchModelPermissionsSuccess = (state = INITIAL_STATE, { models }) => {
	return { ...state, models };
};

export const updateModelPermissionsSuccess = (state = INITIAL_STATE, { updatedModels }) => {
	const models = state.models.map((model) => {
		const updatedModel = updatedModels.find((m) => m.model === model.model);

		if (updatedModel) {
			return {...model, permissions: mergePermissions(model.permissions, updatedModel.permissions)};
		}

		return model;
	});

	return {...state,  models};
};

export const reducer = createReducer(INITIAL_STATE, {
	[UserManagementTypes.FETCH_QUOTA_AND_INVITATIONS_SUCCESS]: fetchQuotaAndInvitationsSuccess,
	[UserManagementTypes.FETCH_TEAMSPACE_USERS_SUCCESS]: fetchTeamspaceUsersSuccess,

	[UserManagementTypes.SET_USERS_PENDING]: setUsersPending,
	[UserManagementTypes.SET_PROJECTS_PENDING]: setProjectsPending,

	[UserManagementTypes.ADD_USER_SUCCESS]: addUserSuccess,
	[UserManagementTypes.REMOVE_USER_SUCCESS]: removeUserSuccess,
	[UserManagementTypes.SET_TEAMSPACE]: setTeamspace,
	[UserManagementTypes.UPDATE_USER_JOB_SUCCESS]: updateUserJobSuccess,
	[UserManagementTypes.UPDATE_PERMISSIONS_SUCCESS]: updatePermissionsSuccess,
	[UserManagementTypes.GET_USERS_SUGGESTIONS_SUCCESS]: getUsersSuggestionsSuccess,
	[UserManagementTypes.CLEAR_USERS_SUGGESTIONS]: clearUsersSuggestions,
	[UserManagementTypes.REMOVE_INVITATION_SUCCESS]: removeInvitationSuccess,
	[UserManagementTypes.SEND_INVITATION_SUCCESS]: sendInvitationSuccess,
	[UserManagementTypes.SET_USER_NOT_EXISTS]: setUserNotExists,

	// Project
	[UserManagementTypes.FETCH_PROJECT_SUCCESS]: fetchProjectSuccess,
	[UserManagementTypes.UPDATE_PROJECT_PERMISSIONS_SUCCESS]: updateProjectPermissionsSuccess,

	// Models
	[UserManagementTypes.FETCH_MODEL_PERMISSIONS_SUCCESS]: fetchModelPermissionsSuccess,
	[UserManagementTypes.UPDATE_MODEL_PERMISSIONS_SUCCESS]: updateModelPermissionsSuccess
});
