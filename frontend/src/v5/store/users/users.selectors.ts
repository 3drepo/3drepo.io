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
import { selectJobsByJobId as selectJobsById } from '@/v4/modules/jobs';
import { selectCurrentTeamspace } from '../teamspaces/teamspaces.selectors';
import { IUser, IUsersState } from './users.redux';
import { getDefaultUserNotFound } from './users.helpers';

const selectUsersDomain = (state): IUsersState => state?.users || {};

export const selectUsersByTeamspace = createSelector(
	selectUsersDomain,
	(_, teamspace) => teamspace,
	(state, teamspace) => (state.usersByTeamspace || {})[teamspace] || [],
);

export const selectUser = createSelector(
	selectUsersByTeamspace,
	(_, teamspace, userName) => userName,
	(usersInTeamspace, userName): IUser => {
		const user = usersInTeamspace.find((teamspaceUser) => teamspaceUser.user === userName);
		if (user) return user;
		return { ...getDefaultUserNotFound(userName), isNotTeamspaceMember: true };
	},
);

const selectCurrentTeamspaceUsers = createSelector(
	selectUsersDomain,
	selectCurrentTeamspace,
	(state, teamspace) => (state.usersByTeamspace || {})[teamspace] || [],
);

export const selectCurrentTeamspaceUsersById = createSelector(
	selectCurrentTeamspaceUsers,
	(users) => Object.fromEntries(users.map((user) => [user.user, user])),
);

export const selectJobsAndUsers = createSelector(
	selectCurrentTeamspaceUsersById,
	selectJobsById,
	(users, jobs) => ({ ...users, ...jobs }),
);
