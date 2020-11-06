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
import { addToGroupDictionary } from '../../helpers/colorOverrides';
import { getTransparency, hasTransparency } from '../../helpers/colors';
import { searchByFilters } from '../../helpers/searching';
import { selectFocusedIssueOverrideGroups } from '../issues';

export const selectGroupsDomain = (state) => (state.groups);

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

export const selectFetchingDetailsIsPending = createSelector(
	selectComponentState, (state) => state.fetchingDetailsIsPending
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

export const selectAllOverridesDict = createSelector(
	selectColorOverrides, selectFilteredGroups, selectComponentState, selectFocusedIssueOverrideGroups,
	(groupOverrides, filteredGroups, componentState, issuesGroups) => {
		const issuesOverrides = issuesGroups.map(({_id}) => _id);

		const filteredGroupsMap = filteredGroups.concat(issuesGroups).reduce((map, group) => {
			map[group._id] = group;
			return map;
		} , {});

		return groupOverrides.concat(issuesOverrides).reduce((overrides, groupId) => {
			// filter out the filtered groups and if its showing details the selected group
			if (filteredGroupsMap[groupId]  && !componentState.showDetails) {
				const group = filteredGroupsMap[groupId];
				addToGroupDictionary(overrides.colors, group, group.color);

				if (hasTransparency(group.color)) {
					addToGroupDictionary(overrides.transparencies, group, getTransparency(group.color));
				}
			}
			return overrides;
		}, {colors: {}, transparencies: {} });
	}
);

export const selectOverridesDict = createSelector(
	selectAllOverridesDict, selectComponentState, (overrides, { activeGroup}) => {
		if (!activeGroup) {
			return overrides;
		}

		const filtered = { colors: {} , transparencies: {}};
		filtered.colors = {...overrides.colors};
		filtered.transparencies = {...overrides.transparencies};
		delete filtered.colors[activeGroup];
		delete filtered.transparencies[activeGroup];
		return filtered;
	}
);

export const selectOverrides = createSelector(
	selectOverridesDict, (overrides) => overrides.colors
);

export const selectTransparencies = createSelector(
	selectOverridesDict, (overrides) => overrides.transparencies
);
