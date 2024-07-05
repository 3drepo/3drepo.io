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

import { selectRisksEnabled } from '@/v5/store/teamspaces/teamspaces.selectors';
import { RISK_DEFAULT_HIDDEN_LEVELS } from '../../constants/risks';
import { prepareComments, transformCustomsLinksToMarkdown } from '../../helpers/comments';
import { hasPin, riskToPin } from '../../helpers/pins';
import { prepareRisk } from '../../helpers/risks';
import { searchByFilters } from '../../helpers/searching';
import { getHighlightedTicketShapes, getTicketsShapes, shouldDisplayShapes } from '../../helpers/shapes';
import { sortByDate } from '../../helpers/sorting';
import { selectJobsList } from '../jobs';
import { selectQueryParams } from '../router/router.selectors';
import { selectSelectedEndingDate, selectSelectedSequence, selectSelectedStartingDate } from '../sequences';

export const selectRisksDomain = (state) => state.risks;

export const selectRawRisksMap = createSelector(
	selectRisksDomain, (state) => state.risksMap
);

const selectPreparedRisks = createSelector(
	selectRawRisksMap, selectJobsList, (risksMap, jobs) =>  {
		const map = {};
		const list = [];
		values(risksMap).forEach((risk) => {
			risk = prepareRisk(risk, jobs);

			list.push(risk);
			map[risk._id] = risk;
		});

		return {map, list};
	}
);

export const selectRisksMap = createSelector(
	selectPreparedRisks, (prepRisks) => prepRisks.map
);

export const selectRisks = createSelector(
	selectPreparedRisks, (prepRisks) => prepRisks.list
);

export const selectComponentState = createSelector(
	selectRisksDomain, (state) => state.componentState
);

export const selectIsRisksPending = createSelector(
	selectRisksDomain, (state) => state.isPending
);

export const selectAssociatedActivities = createSelector(
	selectRisksDomain, (state) => state.associatedActivities
);

export const selectActiveRiskId = createSelector(
	selectComponentState, (state) => state.activeRisk
);

export const selectActiveRisk = createSelector(
	selectRisksMap, selectActiveRiskId, (risksMap, riskId) => risksMap[riskId]
);

export const selectNewRiskDetails = createSelector(
	selectComponentState, selectJobsList, (state, jobs) => prepareRisk(state.newRisk, jobs)
);

export const selectActiveRiskDetails = createSelector(
	selectActiveRisk, selectNewRiskDetails, (activeRisk, newRisk) => {
		return activeRisk || newRisk;
	}
);

export const selectActiveRiskComments = createSelector(
	selectActiveRiskDetails, selectRisksMap, (activeRiskDetails, risks) =>
		prepareComments(activeRiskDetails.comments || []).map((comment) => ({
			...comment,
			commentWithMarkdown: transformCustomsLinksToMarkdown(activeRiskDetails, comment, risks, 'risk')
		}))
);

export const selectShowDetails = createSelector(
	selectComponentState, (state) => state.showDetails
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

export const selectAllFilteredRisksGetter = createSelector(
	selectRisks, selectSelectedFilters, selectSortOrder, selectSortByField,
	(risks, selectedFilters, sortOrder, sortByField) => (forceReturnHiddenRisk = false, ignoreFilters = false) => {
		const returnHiddenRisk = selectedFilters.length && selectedFilters
			.some(({ value: { value } }) => RISK_DEFAULT_HIDDEN_LEVELS.includes(value));

		return sortByDate(
			searchByFilters(risks, ignoreFilters ? [] : selectedFilters, returnHiddenRisk || forceReturnHiddenRisk),
			{ order: sortOrder },
			sortByField,
		);
	}
);

export const selectFilteredRisks = createSelector(
	selectAllFilteredRisksGetter,
		(allFilteredRisksGetter) => allFilteredRisksGetter(true)
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

export const selectFailedToLoad = createSelector(
	selectComponentState, (state) => state.failedToLoad
);

export const selectSelectedRisk = createSelector(
	selectRisksMap, selectQueryParams, (risks,  {riskId}) => risks[riskId]
);

export const selectPins = createSelector(
	selectFilteredRisks, selectActiveRiskDetails,
	selectShowPins, selectShowDetails, selectActiveRiskId,
	selectSelectedSequence, selectSelectedStartingDate, selectSelectedEndingDate,
	(risks: any, detailedRisk, showPins, showDetails, activeRiskId,
		selectedSequence, sequenceStartDate, sequenceEndDate) => {

		let pinsToShow = [];

		if (showPins) {
			pinsToShow = risks.reduce((pins, risk) => {
				if (!hasPin(risk, selectedSequence, sequenceStartDate, sequenceEndDate)) {
					return pins;
				}

				pins.push(riskToPin(risk, activeRiskId === risk._id ));
				return pins;
			} , []);
		}

		// if is not showing pins show the pin while editing
		// if is shoiwng the pins and is editing an existing risk, then dont add it here because is already been added in the if block 171
		// if is a new risk show the pin.
		if (showDetails && detailedRisk && (!showPins || !detailedRisk._id) && hasPin(detailedRisk)) {
			pinsToShow.push(riskToPin(detailedRisk, true));
		}

		return pinsToShow;
	}
);

export const selectMitigationCriteria = createSelector(
	selectRisksDomain, (state) => state.mitigationCriteria
);

export const selectRiskCategories = createSelector(
	selectMitigationCriteria, (mitigation) => mitigation?.category || []
);

export const selectMeasureMode = createSelector(
	selectComponentState, (componentState) => componentState.measureMode
);

export const selectShapes = createSelector(
	selectFilteredRisks, selectActiveRiskDetails, selectShowDetails,
	selectSelectedSequence, selectSelectedStartingDate, selectSelectedEndingDate,
	getTicketsShapes
);

export const selectHighlightedShapes =  createSelector(
	selectActiveRiskDetails, selectSelectedSequence, selectShapes, selectShowDetails,
	getHighlightedTicketShapes
);
function selectIRisksEnabled(state: any): unknown {
	throw new Error('Function not implemented.');
}

