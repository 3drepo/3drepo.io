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

import { STATUSES } from '../../constants/issues';
import { prepareComments, transformCustomsLinksToMarkdown } from '../../helpers/comments';
import { hasPin, issueToPin } from '../../helpers/pins';
import { searchByFilters } from '../../helpers/searching';
import { selectCurrentModel } from '../model';
import { selectQueryParams } from '../router/router.selectors';

export const selectIssuesDomain = (state) => state.issues;

export const selectComponentState = createSelector(
	selectIssuesDomain, (state) => state.componentState
);

export const selectShowSubmodelIssues = createSelector(
	selectComponentState, (state) => state.showSubmodelIssues
);

export const selectIssues = createSelector(
	selectIssuesDomain, selectCurrentModel, selectShowSubmodelIssues,
	(state, model, showSubmodelIssues) => {
		const issues = values(state.issuesMap);
		const preparedIssues = !showSubmodelIssues
			? issues.filter((issue) => issue.model === model)
			: issues;

		return preparedIssues;
	}
);

export const selectIssuesMap = createSelector(
	selectIssuesDomain, (state) => state.issuesMap
);

export const selectIsIssuesPending = createSelector(
	selectIssuesDomain, (state) => state.isPending
);

export const selectActiveIssueId = createSelector(
	selectComponentState, (state) => state.activeIssue
);

export const selectActiveIssueDetails = createSelector(
	selectIssuesDomain, selectComponentState, (state, componentState) => {
		return state.issuesMap[componentState.activeIssue] || componentState.newIssue;
	}
);

export const selectActiveIssueComments = createSelector(
	selectActiveIssueDetails, selectIssuesMap, (activeIssueDetails, issues) =>
		prepareComments(activeIssueDetails.comments || []).map((comment) => ({
			...comment,
			commentWithMarkdown: transformCustomsLinksToMarkdown(comment, issues, 'issue')
		}))
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
		const returnHiddenIssue = selectedFilters.length && selectedFilters
			.some(({ value: { value } }) => value === STATUSES.CLOSED);

		return searchByFilters(issues, selectedFilters, returnHiddenIssue);
	}
);

export const selectAllFilteredIssues = createSelector(
	selectIssues, selectSelectedFilters, (issues, selectedFilters) =>
		searchByFilters(issues, selectedFilters, true)
);

export const selectShowPins = createSelector(
	selectComponentState, (state) => state.showPins
);

export const selectFetchingDetailsIsPending = createSelector(
	selectComponentState, (state) => state.fetchingDetailsIsPending
);

export const selectPostCommentIsPending = createSelector(
	selectComponentState, (state) => state.postCommentIsPending
);

export const selectIsImportingBCF = createSelector(
	selectComponentState, (state) => state.isImportingBCF
);

export const selectSortOrder = createSelector(
	selectComponentState, (state) => state.sortOrder
);

export const selectFailedToLoad = createSelector(
	selectComponentState, (state) => state.failedToLoad
);

export const selectSelectedIssue = createSelector(
	selectIssuesMap, selectQueryParams, (issues,  {issueId}) => issues[issueId]
);

export const selectPins = createSelector(
	selectFilteredIssues, selectActiveIssueDetails,
	selectShowPins, selectShowDetails, selectActiveIssueId,
	(issues: any, detailedIssue, showPins, showDetails, activeIssueId) => {

	let pinsToShow = [];

	if (showPins) {
		pinsToShow =  issues.reduce((pins, issue) => {
			if (!hasPin(issue)) {
				return pins;
			}

			pins.push(issueToPin(issue, activeIssueId === issue._id ));
			return pins;
		} , []);
	}

	if (showDetails && detailedIssue && hasPin(detailedIssue)) {
		pinsToShow = pinsToShow.filter(({id}) => id !== detailedIssue._id);
		pinsToShow.push(issueToPin(detailedIssue, true));
	}

	return pinsToShow;
});
