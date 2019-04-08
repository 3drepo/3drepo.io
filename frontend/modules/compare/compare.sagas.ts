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

import { put, takeLatest, select, all, takeEvery, call } from 'redux-saga/effects';
import { cond, matches } from 'lodash';

import { CompareTypes, CompareActions } from './compare.redux';
import { selectRevisions, selectIsFederation, selectSettings, ModelTypes } from '../model';
import {
	selectSortType, selectSortOrder, selectIsCompareActive, selectActiveTab, selectTargetModels
} from './compare.selectors';
import { COMPARE_SORT_TYPES, DIFF_COMPARE_TYPE, RENDERING_TYPES } from '../../constants/compare';
import { DialogActions } from '../dialog';
import { Viewer } from '../../services/viewer/viewer';
import { SORT_ORDER_TYPES } from '../../constants/sorting';
import { selectCompareModels } from './compare.selectors';
import * as API from '../../services/api';

const getNextRevision = (revisions, currentRevision) => {
	if (!currentRevision) {
		return revisions[0];
	}

	const len = revisions.length;
	const index = revisions.findIndex((r) => r._id === currentRevision);

	const lastRev = index + 1 === len;
	if (lastRev) {
		return revisions[index];
	}

	return revisions[index + 1];
};

const createCompareModel = (modelId, name, isFederation, revisions, currentRevision?) => {
	const baseRevision = isFederation
		? revisions[0]
		: revisions.find((rev) => rev.tag === currentRevision || rev._id === currentRevision ) || revisions[0];

	const targetRevision = getNextRevision(revisions, currentRevision);
	const revisionData = currentRevision
		? revisions.find((revision) => revision.tag === currentRevision)
		: revisions[0];

	return {
		_id: modelId,
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
			const model = createCompareModel(settings._id, settings.name, isFederation, revisions, currentRevision);
			yield put(CompareActions.setComponentState({ compareModels: [model] }));
		} else {
			const { data: submodelsRevisionsMap } = yield API.getSubModelsRevisions(teamspace, settings._id, currentRevision);
			const compareModels = settings.subModels.map(({ model }) => {
				const subModelData = submodelsRevisionsMap[model];
				return createCompareModel(model, subModelData.name, false, subModelData.revisions);
			});
			yield put(CompareActions.setComponentState({ compareModels }));
		}
	} catch (error) {
		console.error(error);
	}
}

function* getCompareModels() {
	try {
		const isFederation = yield select(selectIsFederation);
		const settings = yield select(selectSettings);

		yield put(CompareActions.getCompareModelData(isFederation, settings));
	} catch (error) {
		console.error(error);
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

function* startComparisonOfFederation() {
	const activeTab = yield select(selectActiveTab);
	/* TO DO */
	/* yield this.loadModels(isDiffMode); */

	if (activeTab === DIFF_COMPARE_TYPE) {
		Viewer.diffToolEnableWithDiffMode();
	} else {
		Viewer.diffToolEnableWithClashMode();
	}

	yield call(handleLoadedModels);
}

function* startComparisonOfModel() {
	yield put(CompareActions.setIsPending(true));

	const targetModels = yield select(selectTargetModels);
	const { account, model, targetRevision } = targetModels;

	try {
		yield Viewer.diffToolLoadComparator(account, model, targetRevision.diff.name);
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
}
