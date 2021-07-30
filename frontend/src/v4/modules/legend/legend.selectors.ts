/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { selectDefaultLegend } from '../model';
import { selectSelectedSequenceId } from '../sequences';

export const selectLegendDomain = (state) => ({...state.legend});

export const selectIsPending = createSelector(
	selectLegendDomain, (state) => state.isPending
);

export const selectLegendUpdatePending = createSelector(
	selectLegendDomain, (state) => state.isUpdatePending
);

export const selectLegend = createSelector(
	selectLegendDomain, (state) => state.legend
);

export const selectComponentState = createSelector(
	selectLegendDomain, (state) => state.componentState
);

export const selectNewLegendEditMode = createSelector(
	selectComponentState, (state) => state?.editMode
);

export const selectLegendNames = createSelector(
	selectLegend, (state) => [...state].map(({ name }) => name )
);

export const selectIsCurrentLegendDefault = createSelector(
	selectDefaultLegend, selectSelectedSequenceId, (defaultLegend, sequenceId) =>
	defaultLegend === sequenceId
);
