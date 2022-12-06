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
import { createSelector } from 'reselect';
import { sortBy } from 'lodash';
import { selectJobs } from '@/v4/modules/jobs';
import { selectCurrentTeamspace } from '../teamspaces/teamspaces.selectors';
import { IUser, IUsersState } from './users.redux';

const selectUsersDomain = (state): IUsersState => state?.users || {};

export const selectUsersByTeamspace = createSelector(
	selectUsersDomain,
	(_, teamspace) => teamspace,
	(state, teamspace) => (state.usersByTeamspace || {})[teamspace] || [],
);

export const selectUser = createSelector(
	selectUsersByTeamspace,
	(_, teamspace, userName) => userName,
	(usersInTeamspace, userName): IUser | null => usersInTeamspace
		.find((teamspaceUser) => teamspaceUser.user === userName),
);

export const selectCurrentTeamspaceUsers = createSelector(
	selectUsersDomain,
	selectCurrentTeamspace,
	(state, teamspace) => {
		const users = (state.usersByTeamspace || {})[teamspace] || [];
		return sortBy(users, 'firstName');
	},
);

export const selectAssigneesListItems = createSelector(
	selectCurrentTeamspaceUsers,
	selectJobs,
	(users, jobs) => [
		...users.map(({ user, firstName, lastName }) => ({ value: user, label: `${firstName} ${lastName}` })),
		...jobs.map(({ _id }) => ({ value: _id, label: _id })),
	],
);
