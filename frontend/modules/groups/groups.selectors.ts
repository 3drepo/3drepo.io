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

import { values } from 'lodash';
import { createSelector } from 'reselect';
import { getGroupOverride } from '../../helpers/colorOverrides';
import { getTransparency, hasTransparency } from '../../helpers/colors';
import { searchByFilters } from '../../helpers/searching';

export const selectGroupsDomain = (state) => ({...state.groups});

export const selectGroups = createSelector(
	selectGroupsDomain, (state) => values(state.groupsMap)
);

export const selectGroupsMap = createSelector(
	selectGroupsDomain, (state) => state.groupsMap
);

export const selectIsPending = createSelector(
	selectGroupsDomain, (state) => state.isPending
);

export const selectComponentState = createSelector(
	selectGroupsDomain, (state) => state.componentState
);

export const selectActiveGroupId = createSelector(
	selectComponentState, (state) => state.activeGroup
);

export const selectActiveGroupDetails = createSelector(
	selectComponentState, (state) => state.newGroup
);

export const selectUnalteredActiveGroupDetails = createSelector(
	selectActiveGroupId, selectGroupsMap, selectActiveGroupDetails,
		(groupId, groupMap, defaultGroup) => groupMap[groupId] || defaultGroup
);

export const selectShowDetails = createSelector(
	selectComponentState, (state) => state.showDetails
);

export const selectExpandDetails = createSelector(
	selectComponentState, (state) => state.expandDetails
);

export const selectNewGroupDetails = createSelector(
	selectComponentState, (state) => state.newGroup
);

export const selectHighlightedGroups = createSelector(
	selectComponentState, (state) => state.highlightedGroups
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectIsAllOverridden = createSelector(
	selectComponentState, (state) => state.allOverridden
);

export const selectFilteredGroups = createSelector(
	selectGroups, selectSelectedFilters, (issues, selectedFilters) => {
		return searchByFilters(issues, selectedFilters);
	}
);

export const selectColorOverrides = createSelector(
	selectGroupsDomain, (state) => {
		return state.colorOverrides;
	}
);

export const selectTotalMeshes = createSelector(
	selectComponentState, (state) => state.totalMeshes
);

export const selectCriteriaFieldState = createSelector(
	selectComponentState, (state) => state.criteriaFieldState
);

const selectOverridesDict = createSelector(
	selectColorOverrides, selectFilteredGroups, selectComponentState, (groupOverrides, filteredGroups, componentState) => {
		const filteredGroupsMap = filteredGroups.reduce((map, group) => {
			map[group._id] = group;
			return map;
		} , {});

		return groupOverrides.reduce((overrides, groupId) => {
			// filter out the filtered groups and if its showing details the selected group
			if (filteredGroupsMap[groupId] && (!componentState.showDetails || componentState.activeGroup !== groupId)) {
				const group = filteredGroupsMap[groupId];
				getGroupOverride(overrides.colors, group, group.color);

				if (hasTransparency(group.color)) {
					getGroupOverride(overrides.transparencies, group, getTransparency(group.color));
				}
			}
			return overrides;
		}, {colors: {}, transparencies: {} });
	}
);

export const selectOverrides = createSelector(
	selectOverridesDict, (overrides) => overrides.colors
);

export const selectTransparencies = createSelector(
	selectOverridesDict, (overrides) => overrides.transparencies
);
