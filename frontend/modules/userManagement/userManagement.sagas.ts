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

import { selectCurrentTeamspace } from '../teamspace/teamspace.selectors';

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
		const teamspace = yield select(selectCurrentTeamspace);
		const { data } = yield API.addUser(teamspace, user);
		yield put(UserManagementActions.addUserSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('add', 'licence', error.response));
	}
}

export function* removeUser({ username }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		const data = yield API.removeUser(teamspace, username);
		yield put(UserManagementActions.removeUserSuccess(username));
	} catch (error) {
		const responseCode = API.getResponseCode('USER_IN_COLLABORATOR_LIST');
		const errorData = error.response.data || {};

		if (errorData.status === 400 && errorData.value === responseCode) {
			const config = {
				title: 'Remove licence',
				templateType: 'confirmUserRemove',
				confirmText: 'Remove',
				onConfirm: () => console.log('confirmed!'),
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

export function* updateJob({ username, job }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		const data = yield (
				job ?
				API.updateUserJob(teamspace, job, username) :
				API.removeUserJob(teamspace, username)
		);
		yield put(UserManagementActions.updateJobSuccess(username, job));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('assign', 'job', error.response));
	}
}

export function* updatePermissions({ permissions }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		const data = yield API.setUserPermissions(teamspace, permissions);
		yield put(UserManagementActions.updatePermissionsSuccess(permissions));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'teamspace permissions', error.response));
	}
}

export default function* UserManagementSaga() {
	yield takeLatest(UserManagementTypes.FETCH_TEAMSPACE_DETAILS, fetchTeamspaceDetails);
	yield takeLatest(UserManagementTypes.ADD_USER, addUser);
	yield takeLatest(UserManagementTypes.REMOVE_USER, removeUser);
	yield takeLatest(UserManagementTypes.UPDATE_JOB, updateJob);
	yield takeLatest(UserManagementTypes.UPDATE_PERMISSIONS, updatePermissions);
}
