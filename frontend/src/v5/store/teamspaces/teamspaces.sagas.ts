/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { put, takeLatest } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import * as APIv4 from '@/v4/services/api';
import { TeamspacesActions, TeamspacesTypes, ITeamspace } from './teamspaces.redux';

export function* fetch() {
	try {
		const { data: { teamspaces } } = yield API.fetchTeamspaces();
		yield put(TeamspacesActions.fetchSuccess(teamspaces as ITeamspace[]));
	} catch (e) {
		yield put(TeamspacesActions.fetchFailure());
	}
}

export function* fetchUsers({ teamspace }) {
	try {
		const { data } = yield APIv4.fetchUsers(teamspace);

		yield put(TeamspacesActions.fetchUsersSuccess(teamspace, data));
	} catch (e) {
		console.error(e);
	}
}

export default function* TeamspacesSaga() {
	yield takeLatest(TeamspacesTypes.FETCH as any, fetch);
	yield takeLatest(TeamspacesTypes.FETCH_USERS as any, fetchUsers);
}
