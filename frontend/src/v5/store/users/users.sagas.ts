/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { formatMessage } from '@/v5/services/intl';
import { UsersActions, UsersTypes } from './users.redux';
import { selectUsersByTeamspace } from './users.selectors';

export function* fetchUsers({ teamspace }) {
	try {
		const users = yield select(selectUsersByTeamspace, teamspace);

		if (isEmpty(users)) {
			const { data: { members } } = yield API.Users.fetchTeamspaceMembers(teamspace);

			yield put(UsersActions.fetchUsersSuccess(teamspace, members));
		}
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'users.fetchUsers.error', defaultMessage: 'trying to fetch users' }),
			error,
		}));
	}
}

export default function* UsersSaga() {
	yield takeLatest(UsersTypes.FETCH_USERS as any, fetchUsers);
}
