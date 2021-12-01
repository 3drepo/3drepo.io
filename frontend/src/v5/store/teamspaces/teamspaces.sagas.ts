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

import { put, select, takeLatest } from 'redux-saga/effects';
import { isEmpty } from 'lodash';

import * as API from '@/v5/services/api';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { selectTeamspaceUsers } from '@/v5/store/teamspaces/teamspaces.selectors';
import { formatMessage } from '@/v5/services/intl';
import { TeamspacesActions, TeamspacesTypes, ITeamspace } from './teamspaces.redux';

export function* fetch() {
	try {
		const { data: { teamspaces } } = yield API.fetchTeamspaces();
		yield put(TeamspacesActions.fetchSuccess(teamspaces as ITeamspace[]));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'teamspaces.fetch.error', defaultMessage: 'trying to fetch teamspaces' }),
			error,
		}));
		yield put(TeamspacesActions.fetchFailure());
	}
}

export function* fetchUsers({ teamspace }) {
	try {
		const users = yield select(selectTeamspaceUsers, teamspace);

		if (isEmpty(users)) {
			const { data: { members } } = yield API.fetchTeamspaceMembers(teamspace);

			yield put(TeamspacesActions.fetchUsersSuccess(teamspace, members));
		}
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'teamspaces.fetchUsers.error', defaultMessage: 'trying to fetch users' }),
			error,
		}));
	}
}

export default function* TeamspacesSaga() {
	yield takeLatest(TeamspacesTypes.FETCH as any, fetch);
	yield takeLatest(TeamspacesTypes.FETCH_USERS as any, fetchUsers);
}
