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

export const selectViewpointsDomain = (state) => Object.assign({}, state.viewpoints);

export const selectIsPending = createSelector(
	selectViewpointsDomain, (state) => state.isPending
);

export const selectViewpointsList = createSelector(
	selectViewpointsDomain, (state) => state.viewpointsList
);

export const selectFilteredViewpointsList = createSelector(
	selectViewpointsDomain, (state) => {
		const { viewpointsList, searchQuery } = state;
		return viewpointsList;
	}
);

export const selectComponentState = createSelector(
	selectViewpointsDomain, (state) => state.componentState
);

export const selectNewViewpoint = createSelector(
	selectComponentState, (state) => state.newViewpoint
);

export const selectActiveViewpoint = createSelector(
	selectComponentState, (state) => state.activeViewpointId
);

export const selectSearchQuery = createSelector(
	selectComponentState, (state) => state.searchQuery
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectEditMode = createSelector(
	selectComponentState, (state) => state.editMode
);
