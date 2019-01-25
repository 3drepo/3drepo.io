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
import { STATUSES } from '../../constants/issues';
import { searchByFilters } from '../../helpers/searching';

export const selectIssuesDomain = (state) => Object.assign({}, state.issues);

export const selectIssues = createSelector(
	selectIssuesDomain, (state) => values(state.issuesMap)
);

export const selectIssuesMap = createSelector(
	selectIssuesDomain, (state) => state.issuesMap
);

export const selectIsIssuesPending = createSelector(
	selectIssuesDomain, (state) => state.isPending
);

export const selectComponentState = createSelector(
	selectIssuesDomain, (state) => state.componentState
);

export const selectActiveIssueId = createSelector(
	selectComponentState, (state) => state.activeIssue
);

export const selectActiveIssueDetails = createSelector(
	selectIssuesDomain, selectComponentState, (state, componentState) => {
		return state.issuesMap[componentState.activeIssue] || componentState.newIssue;
	}
);

export const selectShowDetails = createSelector(
	selectComponentState, (state) => state.showDetails
);

export const selectExpandDetails = createSelector(
	selectComponentState, (state) => state.expandDetails
);

export const selectNewIssueDetails = createSelector(
	selectComponentState, (state) => state.newIssue
);

export const selectNewComment = createSelector(
	selectComponentState, (state) => state.newComment
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectFilteredIssues = createSelector(
	selectIssues, selectSelectedFilters, (issues, selectedFilters) => {
		let returnHiddenIssue = false;
		if (selectedFilters.length) {
			returnHiddenIssue = selectedFilters
				.some(({ value: { value } }) => value === STATUSES.CLOSED);
		}

		return searchByFilters(issues, selectedFilters, returnHiddenIssue);
	}
);

export const selectShowPins = createSelector(
	selectComponentState, (state) => state.showPins
);

export const selectLogs = createSelector(
	selectComponentState, (state) => state.logs
);

export const selectFetchingDetailsIsPending = createSelector(
	selectComponentState, (state) => state.fetchingDetailsIsPending
);
