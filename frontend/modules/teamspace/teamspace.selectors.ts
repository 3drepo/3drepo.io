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
import { extendTeamspacesInfo } from './teamspace.helpers';

const selectTeamspaceDomain = (state) => Object.assign({}, state.teamspace);

export const selectCurrentTeamspace = createSelector(
	selectTeamspaceDomain, (state) => state.currentTeamspace
);

export const selectCurrentUser = createSelector(
	selectTeamspaceDomain, (state) => state.currentUser || {}
);

export const selectAvatar = createSelector(
	selectCurrentUser, (state) => state.avatarUrl
);

export const selectTeamspaces = createSelector(
	selectCurrentUser, (state) => state.accounts
);

export const selectTeamspacesWithAdminAccess = createSelector(
	selectTeamspaces, (accounts) => extendTeamspacesInfo(accounts)
);

export const selectIsPending = createSelector(
	selectTeamspaceDomain, (state) => state.isPending
);

export const selectIsAvatarPending = createSelector(
	selectTeamspaceDomain, (state) => state.isAvatarPending
);

export const selectBillingInfo = createSelector(
	selectCurrentUser, (state) => state.billingInfo
);

export const selectCollaboratorLimit = createSelector(
	selectTeamspaceDomain, (state) => state.collaboratorLimit
);

export const selectSpaceInfo = createSelector(
	selectTeamspaceDomain,
	state => {
		return { spaceLimit: state.spaceLimit, spaceUsed: state.spaceUsed };
	}
);

