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

import { createActions, createReducer } from 'reduxsauce';

export const { Types: UsersTypes, Creators: UsersActions } = createActions({
	fetchUsers: ['teamspace', 'searchText'],
	removeUser: ['teamspace', 'username'],
	removeUserCascade: ['teamspace', 'username'],
	updateMemberJob: ['teamspace', 'job', 'username'],
	removeMemberJob: ['teamspace', 'job', 'username'],
	setMemberPermissions: ['teamspace', 'permissionsData'],
	addMember: ['teamspace', 'username']
}, { prefix: 'USERS_' });

export const INITIAL_STATE = {
	users: []
};

export const reducer = createReducer(INITIAL_STATE, {
});
