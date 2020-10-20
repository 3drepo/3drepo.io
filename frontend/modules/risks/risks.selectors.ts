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

import { RISK_LEVELS } from '../../constants/risks';
import { prepareComments, transformCustomsLinksToMarkdown } from '../../helpers/comments';
import { hasPin, riskToPin } from '../../helpers/pins';
import { getRiskColor } from '../../helpers/risks';
import { searchByFilters } from '../../helpers/searching';
import { selectIssuesMap } from '../issues';
import { selectQueryParams } from '../router/router.selectors';

export const selectRisksDomain = (state) => state.risks;

export const selectRisksMap = createSelector(
	selectRisksDomain, (state) => state.risksMap
);

export const selectRisks = createSelector(
	selectRisksMap, (risksMap) => values(risksMap).map((risk) =>
		({...risk, color: getRiskColor(risk.residual_level_of_risk)}))
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

export const selectActiveRiskDetails = createSelector(
	selectRisksDomain, selectComponentState, (state, componentState) => {
		return state.risksMap[componentState.activeRisk] || componentState.newRisk;
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

export const selectNewRiskDetails = createSelector(
	selectComponentState, (state) => state.newRisk
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

export const selectFilteredRisks = createSelector(
	selectRisks, selectSelectedFilters, (risks, selectedFilters) => {
		const returnHiddenRisk = selectedFilters.length && selectedFilters
			.some(({ value: { value } }) => [RISK_LEVELS.AGREED_FULLY, RISK_LEVELS.VOID].includes(value));

		return searchByFilters(risks, selectedFilters, returnHiddenRisk);
	}
);

export const selectAllFilteredRisks = createSelector(
	selectRisks, selectSelectedFilters, (risks, selectedFilters) =>
		searchByFilters(risks, selectedFilters, true, ['name', 'desc', 'number'])
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

export const selectSortOrder = createSelector(
	selectComponentState, (state) => state.sortOrder
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
	(risks: any, detailedRisk, showPins, showDetails, activeRiskId) => {

		let pinsToShow = [];

		if (showPins) {
			pinsToShow = risks.reduce((pins, risk) => {
				if (!hasPin(risk)) {
					return pins;
				}

				pins.push(riskToPin(risk, activeRiskId === risk._id ));
				return pins;
			} , []);
		}

		if (showDetails && detailedRisk && hasPin(detailedRisk)) {
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
