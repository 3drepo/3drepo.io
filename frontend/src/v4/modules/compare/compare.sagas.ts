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

import { cond, curry, intersection, isEqual, keys } from 'lodash';
import { all, call, put, select, take, takeLatest } from 'redux-saga/effects';

import { selectHasViewerAccess } from '@/v5/store/containers/containers.selectors';
import { getState } from '@/v5/helpers/redux.helpers';
import { CLASH_COMPARE_TYPE, COMPARE_SORT_TYPES, DIFF_COMPARE_TYPE, RENDERING_TYPES, VULNERABLE_PROPS } from '../../constants/compare';
import { SORT_ORDER_TYPES } from '../../constants/sorting';
import { VISIBILITY_STATES } from '../../constants/tree';
import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { DialogActions } from '../dialog';
import { selectIsFederation, selectRevisions, selectSettings, ModelTypes } from '../model';
import { selectNodesIndexesMap, selectTreeNodesList, TreeActions } from '../tree';
import { CompareActions, CompareTypes, ICompareComponentState } from './compare.redux';
import {
	selectActiveTab,
	selectBaseModelsList,
	selectCompareModels,
	selectComponentState,
	selectUnselectedClashModelsIds,
	selectIsCompareActive,
	selectSelectedModelsMap,
	selectSortOrder,
	selectSortType,
	selectTargetClashModels,
	selectTargetDiffModels,
	selectTargetModels,
	selectTargetModelsList
} from './compare.selectors';

const getNextRevision = (revisions, currentRevision) => {
	const index = revisions.findIndex((r) => r._id === currentRevision._id);
	return revisions[(index + 1) % revisions.length];
};

const prepareModelToCompare = (teamspace, modelId, name, isFederation, revisions, currentRevision?) => {
	const baseRevision = isFederation || !currentRevision
		? revisions[0]
		: revisions.find((rev) => rev.tag === currentRevision || rev._id === currentRevision) || revisions[0];

	const targetRevision = getNextRevision(revisions, baseRevision);
	const revisionData = currentRevision
		? revisions.find((revision) => revision.tag === currentRevision)
		: revisions[0];

	return {
		_id: modelId,
		teamspace,
		name,
		baseRevision,
		currentRevision: revisionData,
		targetDiffRevision: targetRevision,
		targetClashRevision: baseRevision,
		revisions
	};
};

function* getCompareModelData({ isFederation, revision }) {
	try {
		const settings = yield select(selectSettings);
		const revisions = yield select(selectRevisions);
		const teamspace = settings.account;

		if (!isFederation) {
			const model =
				prepareModelToCompare(teamspace, settings._id, settings.name, isFederation, revisions, revision);
			yield put(CompareActions.setComponentState({ compareModels: [model], isPending: false }));
		} else {
			const { data: submodelsRevisionsMap } = yield API.getSubModelsRevisions(teamspace, settings._id, revision);
			let compareModels = Object.keys(submodelsRevisionsMap).map((model) => {
				const subModelData = submodelsRevisionsMap[model];
				return prepareModelToCompare(teamspace, model, subModelData.name, false, subModelData.revisions);
			});

			compareModels = compareModels.filter((model) => selectHasViewerAccess(getState(), model._id));

			const selectedDiffModels = compareModels.reduce((map, model) => {
				map[model._id] = model.revisions?.length > 1;
				return map;
			}, {});

			const selectedClashModelsMap = compareModels.reduce((map, model) => {
				map[model._id] = model.revisions?.length >= 1;
				return map;
			}, {});

			yield put(CompareActions.setComponentState({
				compareModels,
				selectedDiffModelsMap: {...selectedDiffModels},
				selectedClashModelsMap,
				targetDiffModels: {...selectedDiffModels},
				isPending: false
			}));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'model data', error.message));
	}
}

function* getCompareModels({revision}) {
	try {
		const settings = yield select(selectSettings);
		if (!settings) {
			yield take(ModelTypes.FETCH_SETTINGS_SUCCESS);
		}
		const isFederation = yield select(selectIsFederation);

		yield put(CompareActions.getCompareModelData(isFederation, revision));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'models to compare', error.message));
	}
}

const equals = curry(isEqual);

const handleRenderingTypeChange = cond([
	[equals(RENDERING_TYPES.BASE), Viewer.diffToolShowBaseModel],
	[equals(RENDERING_TYPES.COMPARE), Viewer.diffToolDiffView],
	[equals(RENDERING_TYPES.TARGET), Viewer.diffToolShowComparatorModel]
]);

function* onRenderingTypeChange({ renderingType }) {
	try {
		handleRenderingTypeChange(renderingType);
		yield put(CompareActions.setComponentState({ renderingType }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('change', 'rendering type', error.message));
	}
}

function* setSortType({ sortType }) {
	try {
		const currentSortType = yield select(selectSortType);
		const currentSortOrder = yield select(selectSortOrder);

		const sortSettings = {
			sortType: currentSortType,
			sortOrder: currentSortOrder
		};

		if (currentSortType !== sortType) {
			sortSettings.sortType = sortType;
			sortSettings.sortOrder = SORT_ORDER_TYPES.ASCENDING;
		} else {
			sortSettings.sortOrder = currentSortOrder === SORT_ORDER_TYPES.ASCENDING
				? SORT_ORDER_TYPES.DESCENDING
				: SORT_ORDER_TYPES.ASCENDING;
		}

		yield put(CompareActions.setComponentState(sortSettings));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'sort type', error.message));
	}
}

function* setProperViewerCompareMode() {
	try {
		const activeTab = yield select(selectActiveTab);
		const isFederation = yield select(selectIsFederation);

		if (activeTab === DIFF_COMPARE_TYPE) {
			Viewer.diffToolEnableWithDiffMode();
		} else if (isFederation) {
			Viewer.diffToolEnableWithClashMode();
		} else {
			Viewer.diffToolShowBaseModel();
		}

		handleRenderingTypeChange(RENDERING_TYPES.COMPARE);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('setup', 'diff tool mode', error.message));
	}
}

function* setActiveTab({ activeTab }) {
	try {
		const currentSortType = yield select(selectSortType);
		const componentStateUpdate = { activeTab } as any;

		if (activeTab === DIFF_COMPARE_TYPE) {
			if (currentSortType === COMPARE_SORT_TYPES.TYPE) {
				componentStateUpdate.sortType = COMPARE_SORT_TYPES.NAME;
				componentStateUpdate.sortOrder = SORT_ORDER_TYPES.ASCENDING;
			}
		}
		yield put(CompareActions.setComponentState(componentStateUpdate));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'sort type', error.message));
	}
}

function* setTargetModel({ modelId, isTarget, isTypeChange = false }) {
	try {
		const activeTab = yield select(selectActiveTab);
		const isDiff = activeTab === DIFF_COMPARE_TYPE;
		const targetDiffModels = yield select(selectTargetDiffModels);
		const targetClashModels = yield select(selectTargetClashModels);
		const componentState = {} as ICompareComponentState;
		const compareModels = yield select(selectCompareModels);

		if (isDiff) {
			const newModel = {};
			newModel[modelId] = isTarget;

			componentState.targetDiffModels = {
				...targetDiffModels,
				...newModel
			};
		}

		if (!isTarget) {
			const { baseRevision, targetDiffRevision } = compareModels.find((comparedModel) => comparedModel._id === modelId);
			yield put(CompareActions.setTargetRevision(modelId, isDiff ? targetDiffRevision : baseRevision, isDiff));
		}

		if (!isDiff) {
			const newModel = {};
			newModel[modelId] = isTypeChange ? isTarget : false;

			componentState.targetClashModels = {
				...targetClashModels,
				...newModel
			};
		}

		yield put(CompareActions.setComponentState(componentState));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'target model', error.message));
	}
}

function* startComparisonOfFederation() {
	yield put(CompareActions.setIsPending(true));

	const activeTab = yield select(selectActiveTab);
	const isDiff = activeTab === DIFF_COMPARE_TYPE;

	const compareModels = yield select(selectCompareModels);
	const baseModels = yield select(selectBaseModelsList);
	const selectedModelsMap = yield select(selectSelectedModelsMap);
	const targetModelsMap = yield select(selectTargetModels);

	const modelsToLoad = [];
	const modelsToHide = [];
	const modelsToShow = [...baseModels];

	for (let index = 0; index < compareModels.length; index++) {
		const model = compareModels[index];
		const isSelectedModel = selectedModelsMap[model._id];
		const isTargetModel = targetModelsMap[model._id];
		let keepModelShown = isSelectedModel;

		if (isTargetModel && isSelectedModel) {
			const targetRevision = isDiff ? model.targetDiffRevision : model.targetClashRevision;
			if (!model.baseRevision) {
				return
			}
			keepModelShown = model.baseRevision.name === targetRevision.name && !isDiff;

			if (keepModelShown) {
				Viewer.diffToolSetAsComparator(
					model.teamspace,
					model._id
				);
			} else {
				const modelPromise = Viewer.diffToolLoadComparator(
					model.teamspace,
					model._id,
					targetRevision.name
				);
				modelsToLoad.push(modelPromise);
			}
		}

		if (keepModelShown) {
			modelsToShow.push(model);
		} else {
			modelsToHide.push(model);
		}
	}

	yield  put(TreeActions.setSubmodelsVisibility(modelsToHide, VISIBILITY_STATES.INVISIBLE));
	yield  put(TreeActions.setSubmodelsVisibility(modelsToShow, VISIBILITY_STATES.VISIBLE));

	yield all(modelsToLoad);

	if (isDiff) {
		Viewer.diffToolEnableWithDiffMode();
	} else {
		Viewer.diffToolEnableWithClashMode();
	}
}

function* startComparisonOfModel() {
	const targetModels = yield select(selectTargetModelsList);
	const { teamspace, _id } = targetModels[0];
	const revision = targetModels[0].targetDiffRevision;
	yield Viewer.diffToolLoadComparator(teamspace, _id, revision.name);
}

function* startCompare() {
	try {
		yield put(CompareActions.onRenderingTypeChange(RENDERING_TYPES.COMPARE));
		yield put(CompareActions.setIsActive(true));
		yield put(CompareActions.setIsPending(true));
		const isFederation = yield select(selectIsFederation);

		if (isFederation) {
			yield call(startComparisonOfFederation);
		} else {
			yield call(startComparisonOfModel);
		}
		yield call(setProperViewerCompareMode);
	} catch (error) {
		yield put(CompareActions.setIsActive(false));
		yield put(CompareActions.setIsPending(false));
		yield put(DialogActions.showErrorDialog('start', 'comparison', error.message));
	}
	yield put(CompareActions.setCompareProcessed(false));
}

function* stopCompare() {
	try {
		yield put(CompareActions.setIsActive(false));
		handleRenderingTypeChange(RENDERING_TYPES.COMPARE);
		Viewer.diffToolDisableAndClear();
		const activeTab = yield select(selectActiveTab);
		const isClash = activeTab === CLASH_COMPARE_TYPE;

		if (isClash) {
			const compareModels = yield select(selectCompareModels);
			const modelsIdsToShow = yield select(selectUnselectedClashModelsIds);
			const models = modelsIdsToShow.map((id) => compareModels.find((m) => m._id === id));
			yield put(TreeActions.setSubmodelsVisibility(models, VISIBILITY_STATES.VISIBLE));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('stop', 'comparison', error.message));
	}
}

function* toggleCompare() {
	try {
		const isActive = yield select(selectIsCompareActive);
		if (isActive) {
			yield call(stopCompare);
		} else {
			yield put(CompareActions.setCompareProcessed(true));
			yield call(startCompare);
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'comparison', error.message));
	}
}

function* setComponentState({ componentState }) {
	try {
		const isCompareActive = yield select(selectIsCompareActive);
		const activeTab = yield select(selectActiveTab);

		const shouldStopCompare = Boolean(intersection(keys(componentState), VULNERABLE_PROPS).length);
		const isTheSameTab = componentState.activeTab ? componentState.activeTab === activeTab : false;

		if (isCompareActive && shouldStopCompare && !isTheSameTab) {
			yield call(stopCompare);
		}

		yield put(CompareActions.setComponentStateSuccess(componentState));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'component state', error.message));
	}
}

function* resetComponentState() {
	try {
		Viewer.diffToolShowBaseModel();
		Viewer.diffToolDisableAndClear();
		yield put(CompareActions.resetComponentStateSuccess());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', 'component state', error.message));
	}
}

function* setTargetRevision({ modelId, targetRevision, isDiff }) {
	try {
		const isCompareActive = yield select(selectIsCompareActive);
		const componentState = yield select(selectComponentState);
		const modelIndex = componentState.compareModels.findIndex((model) => model._id === modelId);
		if (isDiff) {
			componentState.compareModels[modelIndex].targetDiffRevision = targetRevision;
		} else {
			componentState.compareModels[modelIndex].targetClashRevision = targetRevision;
		}
		yield put(CompareActions.setComponentState(componentState));

		if (isCompareActive) {
			yield call(stopCompare);
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'target revision', error.message));
	}
}

export default function* CompareSaga() {
	yield takeLatest(CompareTypes.GET_COMPARE_MODELS, getCompareModels);
	yield takeLatest(CompareTypes.TOGGLE_COMPARE, toggleCompare);
	yield takeLatest(CompareTypes.ON_RENDERING_TYPE_CHANGE, onRenderingTypeChange);
	yield takeLatest(CompareTypes.GET_COMPARE_MODEL_DATA, getCompareModelData);
	yield takeLatest(CompareTypes.SET_SORT_TYPE, setSortType);
	yield takeLatest(CompareTypes.SET_ACTIVE_TAB, setActiveTab);
	yield takeLatest(CompareTypes.SET_TARGET_MODEL, setTargetModel);
	yield takeLatest(CompareTypes.SET_COMPONENT_STATE, setComponentState);
	yield takeLatest(CompareTypes.RESET_COMPONENT_STATE, resetComponentState);
	yield takeLatest(CompareTypes.SET_TARGET_REVISION, setTargetRevision);
}
