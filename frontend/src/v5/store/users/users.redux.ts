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

import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../common/actions.helper';

export interface IUser {
	user: string;
	firstName: string;
	lastName: string;
	company?: string;
	job?: string;
}

export interface IUsersActions {
	fetchUsers: (teamspace: string) => any;
	fetchUsersSuccess: (teamspace: string, users: IUser[]) => any;
}

export const { Types: UsersTypes, Creators: UsersActions } = createActions({
	fetchUsers: ['teamspace'],
	fetchUsersSuccess: ['teamspace', 'users'],
}, { prefix: 'USERS/' }) as { Types: Constants<IUsersActions>; Creators: IUsersActions };

export interface IUsersState {
	usersByTeamspace: Record<string, IUser[]>;
}

export const INITIAL_STATE: IUsersState = {
	usersByTeamspace: {},
};

export const fetchUsersSuccess = (state = INITIAL_STATE, { teamspace, users }) => ({
	...state,
	usersByTeamspace: {
		...state.usersByTeamspace,
		[teamspace]: users,
	},
});

export const reducer = createReducer(INITIAL_STATE, {
	[UsersTypes.FETCH_USERS_SUCCESS]: fetchUsersSuccess,
});
