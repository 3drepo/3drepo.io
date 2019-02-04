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

import { createSelector } from 'reselect';
import { values } from 'lodash';
import { extendTeamspacesInfo } from './teamspaces.helpers';

export const selectTeamspacesDomain = (state) => Object.assign({}, state.teamspaces);

export const selectTeamspaces = createSelector(
	selectTeamspacesDomain, (state) => values(state.teamspaces)
);

export const selectTeamspacesWithAdminAccess = createSelector(
	selectTeamspaces, (teamspaces) => extendTeamspacesInfo(teamspaces)
);

export const selectIsPending = createSelector(
	selectTeamspacesDomain, (state) => state.isPending
);
