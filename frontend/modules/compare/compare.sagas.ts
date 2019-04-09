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

import { put, takeLatest, select, all, take, call } from 'redux-saga/effects';
import { cond, matches } from 'lodash';

import { CompareTypes, CompareActions, ICompareComponentState } from './compare.redux';
import { selectRevisions, selectIsFederation, selectSettings, ModelTypes } from '../model';
import {
	selectSortType,
	selectSortOrder,
	selectIsCompareActive,
	selectActiveTab,
	selectBaseModels,
	selectSelectedModelsMap,
	selectTargetDiffModelsList,
	selectTargetClashModelsList,
	selectBaseModelsList,
	selectTargetClashModels,
	selectTargetDiffModels
} from './compare.selectors';
import { COMPARE_SORT_TYPES, DIFF_COMPARE_TYPE, RENDERING_TYPES } from '../../constants/compare';
import { DialogActions } from '../dialog';
import { Viewer } from '../../services/viewer/viewer';
import { SORT_ORDER_TYPES } from '../../constants/sorting';
import { selectCompareModels } from './compare.selectors';
import * as API from '../../services/api';
import { getAngularService } from '../../helpers/migration';

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
			yield put(CompareActions.setComponentState({ compareModels: [model] }));
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
				selectedModelsMap,
				targetDiffModels: selectedModelsMap
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

const handleRenderingTypeChange = cond([
	[matches(RENDERING_TYPES.BASE), Viewer.diffToolShowBaseModel],
	[matches(RENDERING_TYPES.COMPARE), Viewer.diffToolDiffView],
	[matches(RENDERING_TYPES.TARGET), Viewer.diffToolShowComparatorModel]
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

function* handleLoadedModels() {
	try {
		yield all([
			put(CompareActions.setIsActive(true)),
			put(CompareActions.setIsPending(true))
		]);

		yield call(setProperViewerCompareMode);

	} catch (error) {
		yield put(DialogActions.showErrorDialog('handle', 'loaded models', error.message));
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
		const targetDiffModels = yield select(selectTargetDiffModels);
		const targetClashModels = yield select(selectTargetClashModels);
		const componentState = {} as ICompareComponentState;

		if (!isTypeChange) {
			componentState.targetDiffModels = {
				...targetDiffModels,
					[modelId]: isTarget
			};
		}
		componentState.targetClashModels = {
			...targetClashModels,
			[modelId]: isTypeChange ? isTarget : false
		};

		yield put(CompareActions.setComponentState(componentState));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'target model', error.message));
	}
}

function* changeModelNodesVisibility(nodeName: string, visible: boolean) {
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

function* startComparisonOfFederation() {
	yield put(CompareActions.setIsPending(true));
	const activeTab = yield select(selectActiveTab);
	const isDiff = activeTab === DIFF_COMPARE_TYPE;

	const targetModels = isDiff ? yield select(selectTargetDiffModelsList) : yield select(selectTargetClashModelsList);
	const baseModels = yield select(selectBaseModelsList);
	const selectedModels = yield select(selectSelectedModelsMap);

	const modelsToLoad = [];
	for (let index = 0; index < targetModels.length; index++) {
		const model = targetModels[index];
		if (model && selectedModels[model._id]) {
			const targetRevision = isDiff ? model.targetDiffRevision : model.targetClashRevision;
			const sharedRevisionModel = baseModels.find(({ baseRevision }) => baseRevision.name === targetRevision.name);
			const isAlreadyLoaded = sharedRevisionModel && !sharedRevisionModel.visible;

			if (isAlreadyLoaded) {
				const { account, name } = sharedRevisionModel;
				yield call(changeModelNodesVisibility, `${account}:${name}`, true);
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

	yield call(handleLoadedModels);
}

function* startComparisonOfModel() {
	yield put(CompareActions.setIsPending(true));
	const activeTab = yield select(selectActiveTab);
	const isDiff = activeTab === DIFF_COMPARE_TYPE;

	const targetModels = yield select(selectTargetModels);
	const { account, model } = targetModels[0];
	const revision = isDiff ? targetModels[0].targetDiffRevision : targetModels[0].targetClashRevision;
	try {
		yield Viewer.diffToolLoadComparator(account, model, revision.name);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('load', 'comparator', error.message));
	}

	yield call(handleLoadedModels);
}

function* startCompare() {
	try {
		const isFederation = yield select(selectIsFederation);
		yield put(CompareActions.onRenderingTypeChange(RENDERING_TYPES.COMPARE));

		if (isFederation) {
			yield call(startComparisonOfFederation);
		} else {
			yield call(startComparisonOfModel);
		}

		yield put(CompareActions.setIsActive(true));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('start', 'comparison', error.message));
	}
}

function* stopCompare() {
	try {
		yield put(CompareActions.setIsActive(false));
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
			yield call(startCompare);
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'comparison', error.message));
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
}
