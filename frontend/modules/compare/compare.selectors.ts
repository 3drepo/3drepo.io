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
import { isEqual, values, orderBy } from 'lodash';
import { searchByFilters } from '../../helpers/searching';

export const selectCompareDomain = (state) => Object.assign({}, state.compare);

const selectComponentState = createSelector(
	selectCompareDomain, (state) => state.componentState
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

export const selectIsCompareActive = createSelector(
	selectCompareDomain, (state) => state.isCompareActive
);

export const selectIsModelVisible = createSelector(
	selectCompareDomain, (state) => state.isModelVisible
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectActiveTab = createSelector(
	selectComponentState, (state) => state.activeTab
);

export const selectSelectedModelsMap = createSelector(
	selectComponentState, (state) => state.selectedModelsMap
);

export const selectSortOrder = createSelector(
	selectComponentState, (state) => state.sortOrder
);

export const selectSortType = createSelector(
	selectComponentState, (state) => state.sortType
);

export const selectCompareModels = createSelector(
	selectComponentState, selectSortType, selectSortOrder, (state, sortType, sortOrder) => {
		return orderBy(
			searchByFilters(state.compareModels, state.selectedFilters),
			[sortType],
			[sortOrder]
		);
	}
);

export const selectTargetClashModels = createSelector(
	selectComponentState, (state) => state.targetClashModels
);

export const selectTargetDiffModels = createSelector(
	selectComponentState, (state) => state.targetDiffModels
);

export const selectTargetClashModelsList = createSelector(
	selectCompareModels, selectTargetClashModels,
	(models, targetClashModelsMap) => models.filter(({ _id }) => targetClashModelsMap[_id])
);

export const selectBaseClashModelsList = createSelector(
	selectCompareModels, selectTargetClashModels,
	(models, targetClashModelsMap) => models.filter(({ _id }) => !targetClashModelsMap[_id])
);

export const selectTargetDiffModelsList = createSelector(
	selectCompareModels, selectTargetDiffModels,
	(models, targetDiffModelsMap) => models.filter(({ _id }) => targetDiffModelsMap[_id])
);

export const selectBaseModelsList = createSelector(
	selectCompareModels, selectTargetDiffModels,
	(models, targetDiffModels) => models.filter(({ _id }) => !targetDiffModels[_id])
);

const isAllSelected = (allModels, selectedModelsMap) => isEqual(
	allModels.length,
	values(selectedModelsMap).filter((selectedModel) => selectedModel).length
);

export const selectIsAllSelected = createSelector(
	selectCompareModels, selectSelectedModelsMap,
	(compareModels, selectedModelsMap) => isAllSelected(compareModels, selectedModelsMap)
);

export const selectRenderingType = createSelector(
	selectComponentState, (state) => state.renderingType
);

export const selectIsPending = createSelector(
	selectComponentState, (state) => state.isPending
);
