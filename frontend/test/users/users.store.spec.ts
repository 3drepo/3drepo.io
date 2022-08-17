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
import { selectUser, selectUsersByTeamspace } from '@/v5/store/users/users.selectors';
import { createTestStore } from '../test.helpers';
import { userWithAvatarMockFactory, userWithoutAvatarMockFactory } from './users.fixtures';


describe('Users: store', () => {
	const teamspace = 'teamspaceA';
	let dispatch, getState;

	beforeEach(() => {
		({ dispatch, getState } = createTestStore());
	});

	it('should set users', () => {
		const username = 'username';
		const mockUsers = [
			userWithoutAvatarMockFactory({ user: username }),
			userWithAvatarMockFactory({ user: username.toUpperCase() })
		];
		dispatch(UsersActions.fetchUsersSuccess(teamspace, mockUsers));

		const users = selectUsersByTeamspace(getState(), teamspace);
		expect(users[0]).toEqual(mockUsers[0]);
		expect(users[1]).toEqual(mockUsers[1]);

		const existingUser = selectUser(getState(), teamspace, username);
		const nonExistingUser = selectUser(getState(), teamspace, '');
		const nonExistingTeamspace = selectUser(getState(), '', username);
		expect(existingUser).toBeTruthy();
		expect(nonExistingUser).toBeFalsy();
		expect(nonExistingTeamspace).toBeFalsy();
	});
});
