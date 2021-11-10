/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const selectTeamspacesDomain = (state) => state.teamspaces2;

export const selectTeamspaces = createSelector(
	selectTeamspacesDomain, (state) => state.teamspaces,
);

export const selectUsers = createSelector(
	selectTeamspacesDomain, (state) => state.users,
);

export const selectTeamspaceUsers = createSelector(
	selectUsers,
	(_, teamspace) => teamspace,
	(state, teamspace) => state[teamspace] || [],
);
