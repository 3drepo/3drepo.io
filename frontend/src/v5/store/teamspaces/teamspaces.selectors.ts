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
import { ITeamspace, TeamspacesState } from './teamspaces.redux';
import { AddOn } from '../store.types';

const selectTeamspacesDomain = (state): TeamspacesState => state.teamspaces2 || {};

export const selectTeamspaces = createSelector(
	selectTeamspacesDomain, (state) => state.teamspaces,
);

export const selectCurrentTeamspace = createSelector(
	selectTeamspacesDomain, (state) => state.currentTeamspace,
);

export const selectTeamspacesArePending = createSelector(
	selectTeamspacesDomain, (state) => state.teamspacesArePending,
);

export const selectCurrentTeamspaceDetails = createSelector(
	selectTeamspacesDomain,
	selectCurrentTeamspace,
	(state, currentTeamspace) => state.teamspaces.find(({ name }) => name === currentTeamspace) || {} as ITeamspace,
);

export const selectCurrentQuota = createSelector(
	selectTeamspacesDomain, selectCurrentTeamspace, (state, teamspace) => state.quota[teamspace],
);

export const selectCurrentQuotaSeats = createSelector(
	selectCurrentQuota,
	(quota) => quota.seats,
);

export const selectIsTeamspaceAdmin = createSelector(
	selectCurrentTeamspaceDetails,
	(teamspace): boolean => !!teamspace?.isAdmin,
);

export const selectAddons = createSelector(
	selectTeamspacesDomain, selectCurrentTeamspace, (state, teamspace) => state.addOns[teamspace] || [],
);

export const selectRisksEnabled = createSelector(
	selectAddons, (addOns) => addOns.includes(AddOn.Risks),
);

export const selectIssuesEnabled = createSelector(
	selectAddons, (addOns) => addOns.includes(AddOn.Issues),
);