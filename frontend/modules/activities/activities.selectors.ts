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

import { createSelector } from 'reselect';
import { filterNestedData } from '../../helpers/filtering';
import { selectActivitiesDefinitions } from '../sequences';

export const selectActivitiesDomain = (state) => state.activities;

export const selectComponentState = createSelector(
		selectActivitiesDomain, (state) => state.componentState
);

export const selectActiveViewpoint = createSelector(
	selectComponentState, (state) => state.activeActivity
);

export const selectSearchQuery = createSelector(
	selectComponentState, (state) => state.searchQuery || ''
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectFilteredActivities = createSelector(
	selectActivitiesDefinitions, selectSearchEnabled, selectSearchQuery,
		(activities, searchEnabled, searchQuery) => {
			if (!activities) {
				return [];
			}

			const query = searchQuery.toLowerCase();
			const filterCondition = (item) => item.name.toLowerCase().includes(query);

			return searchEnabled ? filterNestedData(activities, filterCondition) : activities;
		}
);

export const selectShowDetails = createSelector(
	selectComponentState, (state) => state.showDetails
);

export const selectActivityDetails = createSelector(
	selectComponentState, (state) => state.details
);

export const selectIsDetailsPending = createSelector(
		selectComponentState, (state) => state.isPending
);
