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
import { isEqual, values } from 'lodash';
import { searchByFilters } from '../../helpers/searching';

export const selectCompareDomain = (state) => Object.assign({}, state.compare);

export const selectBaseModels = createSelector(
	selectCompareDomain, (state) => state.baseModels
);

export const selectTargetModels = createSelector(
	selectCompareDomain, (state) => state.targetModels
);

export const selectCompareType = createSelector(
	selectCompareDomain, (state) => state.compareType
);

export const selectModelType = createSelector(
	selectCompareDomain, (state) => state.modelType
);

export const selectIsComparePending = createSelector(
	selectCompareDomain, (state) => state.isComparePending
);

export const selectIsCompareDisabled = createSelector(
	selectCompareDomain, (state) => state.isCompareDisabled
);

export const selectIsModelVisible = createSelector(
	selectCompareDomain, (state) => state.isModelVisible
);

const selectComponentState = createSelector(
	selectCompareDomain, (state) => state.componentState
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectActiveTab = createSelector(
	selectComponentState, (state) => state.activeTab
);

export const selectDiffSelected = createSelector(
	selectComponentState, (state) => state.diffSelected
);

export const selectClashSelected = createSelector(
	selectComponentState, (state) => state.clashSelected
);

export const selectCompareModels = createSelector(
	selectComponentState, (state) => searchByFilters(state.compareModels, state.selectedFilters)
);

const isAllSelected = (allModels, selectedModelsMap) => isEqual(
	allModels.length,
	values(selectedModelsMap).filter((selectedModel) => selectedModel).length
);

export const selectIsAllDiffSelected = createSelector(
	selectComponentState, (state) => isAllSelected(state.compareModels, state.diffSelected)
);

export const selectIsAllClashSelected = createSelector(
	selectComponentState, (state) => isAllSelected(state.compareModels, state.clashSelected)
);

export const selectRenderingType = createSelector(
	selectComponentState, (state) => state.renderingType
);
