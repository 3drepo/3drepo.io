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

 import {
	INITIAL_STATE,
	usersReducer,
	UsersActions,
	IUser
} from '@/v5/store/users/users.redux';
import { selectUser, selectUsersByTeamspace } from '@/v5/store/users/users.selectors';


describe('Users: redux', () => {
	const teamspace = 'teamspaceA';

	const bob = {
		user: 'bob',
		firstName: 'Bob',
		lastName: 'User',
		company: 'Company A',
		job: '',
		email: 'bob@companya.com',
		hasAvatar: false,
		avatarUrl: '',
	}

	const alice = {
		user: 'alice',
		firstName: 'Alice',
		lastName: 'Member',
		company: 'Company B',
		job: 'Architect',
		email: 'bob@companyb.com',
		hasAvatar: true,
		avatarUrl: 'http://companyb.com/avatar/alice.png',
	};

	const users: IUser[] = [bob, alice];

	describe('on fetchSuccess action', () => {
		const fetchSuccessState = usersReducer({...INITIAL_STATE}, UsersActions.fetchUsersSuccess(teamspace,users));
		const state = { users : fetchSuccessState };

		it('should return the users for the teamspace', () => {
			expect(selectUsersByTeamspace(state,teamspace)).toEqual(users);
		});

		it('shouldnt return the users for non existent teamspace', () => {
			expect(selectUsersByTeamspace(state,'nonExistenTeamspace')).toEqual([]);
		});

		it('should return the specific user for the teamspace', () => {
			expect(selectUser(state, teamspace, 'alice')).toEqual(alice);
			expect(selectUser(state, teamspace, 'bob')).toEqual(bob);
		});

		it('shouldnt return a non existent user for the teamspace', () => {
			expect(selectUser(state, teamspace, 'nonExistentUser')).toBeFalsy();
		});

		it('shouldnt return a existent user for  non existent teamspace', () => {
			expect(selectUser(state, 'nonExistent', 'alice')).toBeFalsy();
		});
	});
});
