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
		console.error(error);
	}
}

export function* addUser({ user }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		const { data } = yield API.addUser(teamspace, user);
		yield put(UserManagementActions.addUserSuccess(data));
	} catch (error) {
		yield put(UserManagementActions.removeUserFailure(error));
		console.error(error);
	}
}

export function* removeUser({ username }) {
	try {
		const teamspace = yield select(selectCurrentTeamspace);
		const data = yield API.removeUser(teamspace, username);
		yield put(UserManagementActions.removeUserSuccess(username));
	} catch (error) {
		yield put(UserManagementActions.removeUserFailure(error));
		console.error(error);
	}
}

export default function* UserManagementSaga() {
	yield takeLatest(UserManagementTypes.FETCH_TEAMSPACE_DETAILS, fetchTeamspaceDetails);
	yield takeLatest(UserManagementTypes.ADD_USER, addUser);
	yield takeLatest(UserManagementTypes.REMOVE_USER, removeUser);
}
