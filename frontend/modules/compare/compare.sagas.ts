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

import { put, takeLatest, select, all, call } from 'redux-saga/effects';
import { cond, isEqual, curry, keys, intersection } from 'lodash';

import { CompareTypes, CompareActions, ICompareComponentState } from './compare.redux';
import { selectRevisions, selectIsFederation, selectSettings, ModelTypes } from '../model';
import { COMPARE_SORT_TYPES, DIFF_COMPARE_TYPE, RENDERING_TYPES, VULNERABLE_PROPS } from '../../constants/compare';
import { DialogActions } from '../dialog';
import { Viewer } from '../../services/viewer/viewer';
import { SORT_ORDER_TYPES } from '../../constants/sorting';
import * as API from '../../services/api';
import { getAngularService } from '../../helpers/migration';
import {
	selectSortType,
	selectSortOrder,
	selectIsCompareActive,
	selectActiveTab,
	selectSelectedModelsMap,
	selectBaseModelsList,
	selectTargetClashModels,
	selectTargetDiffModels,
	selectTargetModelsList,
	selectComponentState,
	selectCompareModels
} from './compare.selectors';

const getNextRevision = (revisions, currentRevision) => {
	if (!currentRevision) {
		return revisions[0];
	}

	const index = revisions.findIndex((r) => r._id === currentRevision._id);
	const lastRev = index + 1 === revisions.length;

	if (lastRev) {
		return revisions[index];
	}

	return revisions[index + 1];
};

const prepareModelToCompare = (teamspace, modelId, name, isFederation, revisions, currentRevision?) => {
	const baseRevision = isFederation
		? revisions[0]
		: revisions.find((rev) => rev.tag === currentRevision || rev._id === currentRevision ) || revisions[0];

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

function* getCompareModelData({ isFederation, settings }) {
	try {
		const revisions = yield select(selectRevisions);
		const [teamspace, , currentRevision] = window.location.pathname.replace('/viewer/', '').split('/');

		if (!isFederation) {
			const model =
				prepareModelToCompare(teamspace, settings._id, settings.name, isFederation, revisions, currentRevision);
			yield put(CompareActions.setComponentState({ compareModels: [model], isPending: false }));
		} else {
			const { data: submodelsRevisionsMap } = yield API.getSubModelsRevisions(teamspace, settings._id, currentRevision);
			const compareModels = settings.subModels.map(({ model }) => {
				const subModelData = submodelsRevisionsMap[model];
				return prepareModelToCompare(teamspace, model, subModelData.name, false, subModelData.revisions);
			});

			const selectedModelsMap = compareModels.reduce((map, model) => {
				map[model._id] = true;
				return map;
			}, {});

			yield put(CompareActions.setComponentState({
				compareModels,
				selectedDiffModelsMap: selectedModelsMap,
				selectedClashModelsMap: selectedModelsMap,
				targetDiffModels: selectedModelsMap,
				isPending: false
			}));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'model data', error.message));
	}
}

function* getCompareModels() {
	try {
		const isFederation = yield select(selectIsFederation);
		const settings = yield select(selectSettings);

		yield put(CompareActions.getCompareModelData(isFederation, settings));
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
			componentState.targetDiffModels = {
				...targetDiffModels,
					[modelId]: isTarget
			};
		}

		if (!isTarget) {
			const { baseRevision } = compareModels.find((model) => model._id === modelId);
			yield put(CompareActions.setTargetRevision(modelId, baseRevision));
		}

		if (!isDiff) {
			componentState.targetClashModels = {
				...targetClashModels,
				[modelId]: isTypeChange ? isTarget : false
			};
		}

		yield put(CompareActions.setComponentState(componentState));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'target model', error.message));
	}
}

function changeModelNodesVisibility(nodeName: string, visible: boolean) {
	const TreeService = getAngularService('TreeService') as any;
	const tree = TreeService.getAllNodes();
	if (tree.children) {
		for (let index = 0; index < tree.children.length; index++) {
			const node = tree.children[index];
			if (node.name === nodeName) {
				if (visible) {
					TreeService.showTreeNodes([node]);
				} else {
					TreeService.hideTreeNodes([node]);
				}
			}
		}
	}
}

function setModelsNodesVisibility(models, isVisible = true) {
	for (let index = 0; index < models.length; index++) {
		const model = models[index];
		changeModelNodesVisibility(`${model.teamspace}:${model.name}`, isVisible);
	}
}

function* startComparisonOfFederation() {
	yield put(CompareActions.setIsPending(true));
	const activeTab = yield select(selectActiveTab);
	const isDiff = activeTab === DIFF_COMPARE_TYPE;

	const targetModels = yield select(selectTargetModelsList);
	const baseModels = yield select(selectBaseModelsList);
	const compareModels = yield select(selectCompareModels);
	const selectedModels = yield select(selectSelectedModelsMap);

	setModelsNodesVisibility(compareModels, false);
	setModelsNodesVisibility(baseModels);

	const modelsToLoad = [];
	for (let index = 0; index < targetModels.length; index++) {
		const model = targetModels[index];
		if (model && selectedModels[model._id]) {
			const targetRevision = isDiff ? model.targetDiffRevision : model.targetClashRevision;
			const sharedRevisionModel = baseModels.find(({ baseRevision }) => baseRevision.name === targetRevision.name);
			const canReuseModel = sharedRevisionModel && selectedModels[sharedRevisionModel];

			if (canReuseModel) {
				const { teamspace, name } = sharedRevisionModel;
				changeModelNodesVisibility(`${teamspace}:${name}`, true);
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
	}

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
		const shouldStopCompare = Boolean(intersection(keys(componentState), VULNERABLE_PROPS).length);
		if (isCompareActive && shouldStopCompare) {
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

function* setTargetRevision({ modelId, targetRevision }) {
	try {
		const componentState = yield select(selectComponentState);
		const modelIndex = componentState.compareModels.findIndex((model) => model._id === modelId);
		componentState.compareModels[modelIndex].targetClashRevision = targetRevision;
		yield put(CompareActions.setComponentState(componentState));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'target revision', error.message));
	}
}

export default function* CompareSaga() {
	yield takeLatest(ModelTypes.FETCH_SETTINGS_SUCCESS, getCompareModels);
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
