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

import { UsersActions } from '@/v5/store/users/users.redux';
import * as UsersSaga from '@/v5/store/users/users.sagas';
import { expectSaga } from 'redux-saga-test-plan';
import { mockServer } from '../../internals/testing/mockServer';

expectSaga.DEFAULT_TIMEOUT = 100;

describe('Users: sagas', () => {
	const members = [];
	const teamspace = 'myTeamspace'

	describe('fetch', () => {
		it('should fetch users data and dispatch FETCH_SUCCESS', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/members`)
				.reply(200, { members });

			await expectSaga(UsersSaga.default)
					.dispatch(UsersActions.fetchUsers(teamspace))
					.put(UsersActions.fetchUsersSuccess(teamspace, members))
					.silentRun();
		});

	});
});
