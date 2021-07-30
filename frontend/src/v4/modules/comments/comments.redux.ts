/**
 *  Copyright (C) 2020 3D Repo Ltd
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

export const { Types: CommentsTypes, Creators: CommentsActions } = createActions({
	fetchUsers: ['teamspace'],
	fetchUsersSuccess: ['users'],
}, { prefix: 'COMMENTS/' });

export const INITIAL_STATE = {
	users: [],
};

const fetchUsersSuccess = (state = INITIAL_STATE, { users }) => ({
	...state,
	users,
});

export const reducer = createReducer(INITIAL_STATE, {
	[CommentsTypes.FETCH_USERS_SUCCESS]: fetchUsersSuccess,
});
