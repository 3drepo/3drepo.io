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

import { map, omitBy, orderBy, keys, sum } from 'lodash';
import { createSelector } from 'reselect';
import { COMPARE_SORT_TYPES, DIFF_COMPARE_TYPE } from '../../constants/compare';
import { searchByFilters } from '../../helpers/searching';
import { selectModels } from '../teamspaces';
import { selectIsModelLoaded } from '../viewerGui';

export const selectCompareDomain = (state) => ({...state.compare});

export const selectComponentState = createSelector(
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

export const selectIsCompareProcessed = createSelector(
	selectCompareDomain, (state) => state.isCompareProcessed
);

export const selectIsCompareActive = createSelector(
	selectCompareDomain, (state) => state.isCompareActive
);

export const selectIsModelVisible = createSelector(
	selectCompareDomain, (state) => state.isModelVisible
);

export const selectCompareModels = createSelector(
	selectComponentState, (state) => state.compareModels
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectActiveTab = createSelector(
	selectComponentState, (state) => state.activeTab
);

export const selectSelectedModelsMap = createSelector(
	selectComponentState, selectActiveTab, (state, activeTab) => {
		const isDiff = activeTab === DIFF_COMPARE_TYPE;
		const selectedModelsMap = isDiff ? state.selectedDiffModelsMap : state.selectedClashModelsMap;
		return selectedModelsMap;
	}
);

export const selectSortOrder = createSelector(
	selectComponentState, (state) => state.sortOrder
);

export const selectSortType = createSelector(
	selectComponentState, (state) => state.sortType
);

export const selectTargetClashModels = createSelector(
	selectComponentState, (state) => state.targetClashModels
);

export const selectUnselectedClashModelsIds = createSelector(
	selectComponentState, (state) => {
		const modelsMap = state.selectedClashModelsMap || [];
		return Object.keys(modelsMap).filter((modelId) => !modelsMap[modelId]);
	},
);

export const selectCanTestForClash = createSelector(
	selectSelectedModelsMap,  selectTargetClashModels, (selectedModelsMap, targetClashModels) => {
		const selectedModels = Object.keys(selectedModelsMap).filter((model) => selectedModelsMap[model]);
		const selectedTargetModels =  Object.keys(targetClashModels).filter((model) => targetClashModels[model]);

		return selectedModels.some((model) => !targetClashModels[model]) // there must be at least one base model
				&& selectedModels.length >= 2
				&& selectedTargetModels.length >= 1 ; // there must be at least one target model
	}
);

export const selectTargetDiffModels = createSelector(
	selectComponentState, (state) => state.targetDiffModels
);

export const selectIsDiff = createSelector(
	selectActiveTab, (activeTab) => (activeTab === DIFF_COMPARE_TYPE)
);

export const selectTargetModels = createSelector(
	selectIsDiff, selectTargetClashModels, selectTargetDiffModels,
	(isDiff, targetClashModelsMap, targetDiffModelsMap) => {
		return isDiff ? targetDiffModelsMap : targetClashModelsMap;
	}
);

const getSortValue = (field, targetModels) => (model) => {
	if (field === COMPARE_SORT_TYPES.TYPE) {
		return !!targetModels[model._id];
	}
	return model[field];
};

export const selectFilteredCompareModels = createSelector(
	selectCompareModels, selectSelectedFilters, selectSortType, selectSortOrder, selectTargetModels,
	(compareModels, selectedFilters, sortType, sortOrder, targetModelsMap) => {
		return orderBy(
			searchByFilters(compareModels, selectedFilters),
			[getSortValue(sortType, targetModelsMap)],
			[sortOrder]
		);
	}
);

export const selectTargetModelsList = createSelector(
	selectCompareModels, selectTargetModels,
	(models, targetModelsMap) => models.filter(({ _id }) => targetModelsMap[_id])
);

export const selectBaseModelsList = createSelector(
	selectCompareModels, selectSelectedModelsMap, selectIsDiff, selectTargetModels,
	(models, selectedModelsMap, isDiff, targetModelsMap) => {
		let baseModels = selectedModelsMap;

		if (!isDiff) {
			baseModels = omitBy(baseModels, (value, key) => targetModelsMap[key]);
		}

		return models.filter(({ _id }) => baseModels[_id]);
	}
);

const isAllSelected = (allModels, selectedModelsMap) => {
	const filteredSelectedModels = Object.entries(selectedModelsMap).filter(([_, value]) => value).map(([key]) => key);
	const allModelsId = map(allModels, '_id');
	return !allModelsId.some((model) => !filteredSelectedModels.includes(model));
};

export const selectIsAllSelected = createSelector(
	selectFilteredCompareModels, selectSelectedModelsMap,
	(compareModels, selectedModelsMap) => isAllSelected(compareModels, selectedModelsMap)
);

export const selectRenderingType = createSelector(
	selectComponentState, (state) => state.renderingType
);

export const selectIsPending = createSelector(
	selectComponentState, (state) => state.isPending
);

export const selectIsCompareButtonDisabled = createSelector(
	selectSelectedModelsMap, selectIsCompareProcessed, selectIsModelLoaded, selectModels,
	(selectedModelsMap, isCompareProcessed, isModelLoaded, models) => {
		const selectedModels = keys(selectedModelsMap).filter((m) => selectedModelsMap[m]).map((id) => models[id]);

		const totalRevisions = sum(selectedModels.map((model) => {
			if (!model.federate) {
				return model.nRevisions;
			}
			return sum(model.subModels.map((subModel) => models[subModel.model].nRevisions));
		}));

		return !selectedModels.length || totalRevisions <= 1 || isCompareProcessed || !isModelLoaded;
	}
);
