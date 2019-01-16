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
import { selectJobsList } from '../jobs';
import { prepareRisk } from '../../helpers/risks';

export const selectRisksDomain = (state) => Object.assign({}, state.risks);

export const selectRisks = createSelector(
	selectRisksDomain, (state) => values(state.risksMap)
);

export const selectIsPending = createSelector(
	selectRisksDomain, (state) => state.isPending
);

export const selectComponentState = createSelector(
	selectRisksDomain, (state) => state.componentState
);

export const selectActiveRiskId = createSelector(
	selectComponentState, (state) => state.activeRisk
);

export const selectActiveRiskDetails = createSelector(
	selectRisksDomain, selectComponentState, selectJobsList,
	(state, componentState, jobsList) => {
		const risk = state.risksMap[componentState.activeRisk] || {};
		return prepareRisk(risk, jobsList);
	}
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
