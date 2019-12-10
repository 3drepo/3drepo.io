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

import { isNil } from 'lodash';
import { createSelector } from 'reselect';

const selectCurrentUserDomain = (state) => ({...state.currentUser});

export const selectCurrentTeamspace = createSelector(
	selectCurrentUserDomain, (state) => state.currentTeamspace
);

export const selectCurrentUser = createSelector(
	selectCurrentUserDomain, (state) => state.currentUser || {}
);

export const selectUsername = createSelector(
		selectCurrentUser, (state) => state.username || ''
);

export const selectAvatar = createSelector(
	selectCurrentUser, (state) => state.avatarUrl
);

export const selectIsInitialised = createSelector(
	selectCurrentUserDomain, (state) => state.isInitialised
);

export const selectIsPending = createSelector(
	selectCurrentUserDomain, (state) => state.isPending
);

export const selectIsAvatarPending = createSelector(
	selectCurrentUserDomain, (state) => state.isAvatarPending
);

export const selectBillingInfo = createSelector(
	selectCurrentUser, (state) => state.billingInfo
);

export const selectCollaboratorLimit = createSelector(
	selectCurrentUserDomain, (state) => state.collaboratorLimit
);

export const selectSpaceInfo = createSelector(
	selectCurrentUserDomain,
	(state) => ({ spaceLimit: state.spaceLimit, spaceUsed: state.spaceUsed })
);

export const selectSpaceLeft = createSelector(
	selectSpaceInfo, (state) =>
		(isNil(state.spaceLimit) ? Infinity : state.spaceLimit) - state.spaceUsed
);
