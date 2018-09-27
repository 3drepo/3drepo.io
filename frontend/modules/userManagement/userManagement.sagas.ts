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

import { put, call, takeLatest, all, select } from 'redux-saga/effects';

import * as API from '../../services/api';
import { UserManagementTypes, UserManagementActions } from './userManagement.redux';
import { DialogActions } from '../dialog/dialog.redux';

import { selectCurrentTeamspaceName } from '../userManagement/userManagement.selectors';

export function* fetchTeamspaceDetails({ teamspace }) {
	try {
		yield put(UserManagementActions.setPendingState(true));

		const response = yield all([
			API.fetchUsers(teamspace),
			API.getQuotaInfo(teamspace),
			API.getJobs(teamspace),
			API.getJobsColors(teamspace)
		]);

		yield put(UserManagementActions.fetchTeamspaceDetailsSuccess(
			teamspace,
			...response.map(({data}) => data)
		));
	} catch (error) {
		yield put(UserManagementActions.setPendingState(false));
	}
}

export function* addUser({ user }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const { data } = yield API.addUser(teamspace, user);
		yield put(UserManagementActions.addUserSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('add', 'licence', error.response));
	}
}

export function* removeUser({ username }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.removeUser(teamspace, username);
		yield put(UserManagementActions.removeUserSuccess(username));
	} catch (error) {
		const responseCode = API.getResponseCode('USER_IN_COLLABORATOR_LIST');
		const errorData = error.response.data || {};

		if (errorData.status === 400 && errorData.value === responseCode) {
			const config = {
				title: 'Remove User',
				templateType: 'confirmUserRemove',
				confirmText: 'Remove',
				onConfirm: () => UserManagementActions.removeUserCascade(username),
				data: {
					models: errorData.models,
					projects: errorData.projects,
					teamspacePerms: '',
					username
				}
			};

			if (errorData.teamspace) {
				config.data.teamspacePerms = errorData.teamspace.permissions.join(", ");
			}

			yield put(DialogActions.showDialog(config));
		} else {
			yield put(DialogActions.showErrorDialog('remove', 'licence', error.response));
		}
	}
}

export function* removeUserCascade({ username }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.removeUserCascade(teamspace, username);
		yield put(UserManagementActions.removeUserSuccess(username));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('remove', 'licence', error.response));
	}
}

export function* updateUserJob({ username, job }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield (
				job ?
				API.updateUserJob(teamspace, job, username) :
				API.removeUserJob(teamspace, username)
		);
		yield put(UserManagementActions.updateUserJobSuccess(username, job));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('assign', 'job', error.response));
	}
}

export function* updatePermissions({ permissions }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.setUserPermissions(teamspace, permissions);
		yield put(UserManagementActions.updatePermissionsSuccess(permissions));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'teamspace permissions', error.response));
	}
}

export function* getUsersSuggestions({ searchText }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const {data: suggestions} = yield API.findUsers(teamspace, searchText);
		yield put(UserManagementActions.getUsersSuggestionsSuccess(suggestions));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('search', 'users', error.response));
	}
}

// Jobs

export function* updateJobColor({ job }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.updateJob(teamspace, job);

		yield put(UserManagementActions.updateJobSuccess(job));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'job color', error.response));
	}
}

export function* createJob({ job }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.createJob(teamspace, job);

		yield put(UserManagementActions.createJobSuccess(job));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('create', 'job', error.response));
	}
}

export function* removeJob({ jobId }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.deleteJob(teamspace, jobId);

		yield put(UserManagementActions.removeJobSuccess(jobId));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('remove', 'job', error.response));
	}
}

// Projects
export function* fetchProject({ project }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.fetchProject(teamspace, project);
		yield put(UserManagementActions.fetchProjectSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'models/federations permissions', error.response));
	}
}

export function* updateProject({ project }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.updateProject(teamspace, project);
		yield put(UserManagementActions.updateProjectSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'models/federations permissions', error.response));
	}
}

// Models
export function* fetchModelPermissions({ model }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.fetchModelPermissions(teamspace, model);
		yield put(UserManagementActions.fetchModelPermissionsSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'models/federations permissions', error.response));
	}
}

export function* fetchMultipleModelsPermissions({ models }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.fetchMultipleModelsPermissions(teamspace, models);
		yield put(UserManagementActions.fetchModelPermissionsSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'models/federations permissions', error.response));
	}
}

export function* updateMultipleModelsPermissions({ permissions }) {
	try {
		const teamspace = yield select(selectCurrentTeamspaceName);
		const data = yield API.updateMultipleModelsPermissions(teamspace, permissions);
		yield put(UserManagementActions.updatePermissionsSuccess(permissions));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'models/federations permissions', error.response));
	}
}

export default function* UserManagementSaga() {
	yield takeLatest(UserManagementTypes.FETCH_TEAMSPACE_DETAILS, fetchTeamspaceDetails);
	yield takeLatest(UserManagementTypes.ADD_USER, addUser);
	yield takeLatest(UserManagementTypes.REMOVE_USER, removeUser);
	yield takeLatest(UserManagementTypes.REMOVE_USER_CASCADE, removeUserCascade);
	yield takeLatest(UserManagementTypes.UPDATE_PERMISSIONS, updatePermissions);
	yield takeLatest(UserManagementTypes.GET_USERS_SUGGESTIONS, getUsersSuggestions);

	// Jobs
	yield takeLatest(UserManagementTypes.UPDATE_JOB, updateUserJob);
	yield takeLatest(UserManagementTypes.CREATE_JOB, createJob);
	yield takeLatest(UserManagementTypes.REMOVE_JOB, removeJob);
	yield takeLatest(UserManagementTypes.UPDATE_JOB_COLOR, updateJobColor);

	// Models
	yield takeLatest(UserManagementTypes.FETCH_MODEL_PERMISSIONS, fetchModelPermissions);
	yield takeLatest(UserManagementTypes.FETCH_MULTIPLE_MODELS_PERMISSIONS, fetchMultipleModelsPermissions);
	yield takeLatest(UserManagementTypes.UPDATE_MULTIPLE_MODELS_PERMISSIONS, updateMultipleModelsPermissions);

	// Projects
	yield takeLatest(UserManagementTypes.FETCH_PROJECT, fetchProject);
	yield takeLatest(UserManagementTypes.UPDATE_PROJECT, updateProject);
}
