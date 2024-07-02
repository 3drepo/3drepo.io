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

import { selectIsCalibrating } from '@/v5/store/calibration/calibration.selectors';
import { ISSUE_DEFAULT_HIDDEN_STATUSES } from '../../constants/issues';
import { prepareComments, transformCustomsLinksToMarkdown } from '../../helpers/comments';
import { hasPin, issueToPin } from '../../helpers/pins';
import { searchByFilters } from '../../helpers/searching';
import { getHighlightedTicketShapes, getTicketsShapes, shouldDisplayShapes } from '../../helpers/shapes';
import { sortByDate } from '../../helpers/sorting';
import { selectCurrentModel } from '../model';
import { selectQueryParams } from '../router/router.selectors';
import { selectSelectedEndingDate, selectSelectedSequence, selectSelectedStartingDate } from '../sequences';

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

export const selectActiveIssue = createSelector(
	selectIssuesMap, selectActiveIssueId, (issuesMap, activeIssueId) => issuesMap[activeIssueId]
);

export const selectShowDetails = createSelector(
	selectComponentState, (state) => state.showDetails
);

export const selectNewIssueDetails = createSelector(
	selectComponentState, selectShowDetails, (state, showDetails) => showDetails ? state.newIssue : {}
);

export const selectActiveIssueDetails = createSelector(
	selectActiveIssue, selectNewIssueDetails, (activeIssue, newIssue) => {
		return activeIssue || newIssue;
	}
);

export const selectFocusedIssueOverrideGroups = createSelector(
	selectActiveIssueDetails, (activeIssue) => activeIssue.override_groups || []
);

export const selectActiveIssueComments = createSelector(
	selectActiveIssueDetails, selectIssuesMap, (activeIssueDetails, issues) =>
		prepareComments(activeIssueDetails.comments || []).map((comment) => ({
			...comment,
			commentWithMarkdown: transformCustomsLinksToMarkdown(activeIssueDetails, comment, issues, 'issue')
		}))
);

export const selectExpandDetails = createSelector(
	selectComponentState, (state) => state.expandDetails
);

export const selectNewComment = createSelector(
	selectComponentState, (state) => state.newComment
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectSortOrder = createSelector(
	selectComponentState, (state) => state.sortOrder
);

export const selectSortByField = createSelector(
	selectComponentState, (state) => state.sortBy
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectAllFilteredIssuesGetter = createSelector(
	selectIssues, selectSelectedFilters, selectSortOrder, selectSortByField,
	(issues, selectedFilters, sortOrder, sortByField) => (forceReturnHiddenIssue = false, ignoreFilters = false) =>  {
		const returnHiddenIssue = selectedFilters.length && selectedFilters
			.some(({ value: { value } }) => ISSUE_DEFAULT_HIDDEN_STATUSES.includes(value));

		return sortByDate(
			searchByFilters(issues, ignoreFilters ? [] : selectedFilters, returnHiddenIssue || forceReturnHiddenIssue),
			{ order: sortOrder },
			sortByField,
		);
	}
);

export const selectFilteredIssues = createSelector(
	selectAllFilteredIssuesGetter, (allFilteredIssuesGetter) => allFilteredIssuesGetter(true)
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

export const selectFailedToLoad = createSelector(
	selectComponentState, (state) => state.failedToLoad
);

export const selectSelectedIssue = createSelector(
	selectIssuesMap, selectQueryParams, (issues,  {issueId}) => issues[issueId]
);

export const selectPins = createSelector(
	selectFilteredIssues, selectActiveIssueDetails,
	selectShowPins, selectShowDetails, selectActiveIssueId,
	selectSelectedSequence, selectSelectedStartingDate, selectSelectedEndingDate,
	selectIsCalibrating,
	(issues: any, detailedIssue, showPins, showDetails, activeIssueId,
		selectedSequence, sequenceStartDate, sequenceEndDate, isCalibrating) => {

	let pinsToShow = [];

	if (isCalibrating) {
		return pinsToShow;
	}

	if (showPins) {
		pinsToShow =  issues.reduce((pins, issue) => {
			if (!hasPin(issue, selectedSequence, sequenceStartDate, sequenceEndDate)) {
				return pins;
			}

			pins.push(issueToPin(issue, activeIssueId === issue._id ));
			return pins;
		} , []);
	}

	// if is not showing pins show the pin while editing
	// if is shoiwng the pins and is editing an existing issue, then dont add it here because is already been added in the if block 167
	// if is a new issue show the pin.
	if (showDetails && detailedIssue && (!showPins || !detailedIssue._id)  && hasPin(detailedIssue)) {
		pinsToShow = pinsToShow.filter(({id}) => id !== detailedIssue._id);
		pinsToShow.push(issueToPin(detailedIssue, true));
	}

	return pinsToShow;
});

export const selectMeasureMode = createSelector(
	selectComponentState, (componentState) => componentState.measureMode
);

export const selectShapes = createSelector(
	selectFilteredIssues, selectActiveIssueDetails, selectShowDetails,
	selectSelectedSequence, selectSelectedStartingDate, selectSelectedEndingDate,
	getTicketsShapes
);

export const selectHighlightedShapes =  createSelector(
	selectActiveIssueDetails, selectSelectedSequence, selectShapes, selectShowDetails,
	getHighlightedTicketShapes
);
