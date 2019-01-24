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

export const selectIssuesDomain = (state) => Object.assign({}, state.issues);

export const selectIssues = createSelector(
	selectIssuesDomain, (state) => values(state.issuesMap)
);

export const selectIsPending = createSelector(
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
		return state.issuesMap[componentState.activeIssue] || {};
	}
);

export const selectShowDetails = createSelector(
	selectComponentState, (state) => state.showDetails
);

export const selectExpandDetails = createSelector(
	selectComponentState, (state) => state.expandDetails
);
