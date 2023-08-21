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

import { DialogsTypes } from '@/v5/store/dialogs/dialogs.redux';
import { UsersActions } from '@/v5/store/users/users.redux';
import { selectUsersByTeamspace } from '@/v5/store/users/users.selectors';
import { mockServer } from '../../internals/testing/mockServer';
import { createTestStore } from '../test.helpers';
import { userWithAvatarMockFactory } from './users.fixtures';

describe('Users: sagas', () => {
	const teamspace = 'myTeamspace';
	const user = userWithAvatarMockFactory(teamspace);
	const members = [user];
	let dispatch, getState, waitForActions;

	beforeEach(() => {
		({ dispatch, getState, waitForActions } = createTestStore());
	})

	describe('fetch', () => {
		it('should fetch users data and dispatch FETCH_SUCCESS', async () => {
			mockServer
				.get(`/teamspaces/${teamspace}/members`)
				.reply(200, { members });
			
			await waitForActions(() => {
				dispatch(UsersActions.fetchUsers(teamspace));
			}, [UsersActions.fetchUsersSuccess(teamspace, members)]);

			const usersInStore = selectUsersByTeamspace(getState(), teamspace);
			expect(usersInStore).toEqual(members);
		});

		it('should handle fetch users api error and dispatch a dialog opening for an alert', async () => {
			dispatch(UsersActions.fetchUsersSuccess(teamspace, []));

			const nonExistingTeamspace = 'nonExistingTeamspace';
			mockServer
				.get(`/teamspaces/${nonExistingTeamspace}/members`)
				.reply(404)
			
			await waitForActions(() => {
				dispatch(UsersActions.fetchUsers(nonExistingTeamspace));
			}, [DialogsTypes.OPEN]);

			const usersInStore = selectUsersByTeamspace(getState(), teamspace);
			expect(usersInStore).toEqual([]);
		});

	});
});
