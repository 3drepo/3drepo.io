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

import { put, takeLatest, select, all } from 'redux-saga/effects';
import { CompareTypes, CompareActions } from './compare.redux';
import { selectRevisions, selectIsFederation, selectSettings, ModelTypes } from '../model';
import { } from './compare.selectors';
import { modelsMock } from '../../constants/compare';
import { DialogActions } from '../dialog';
import { Viewer } from '../../services/viewer/viewer';

const getNextRevision = (revisions, revision) => {

	if (!revision) {
		return revisions[0];
	}

	const len = revisions.length;
	const index = revisions.findIndex((r) => r._id === revision);

	const lastRev = index + 1 === len;
	if (lastRev) {
		return revisions[index];
	}

	return revisions[index + 1];
};

export function* getCompareModelData({ isFederation, settings }) {
	try {
		const revisions = yield select(selectRevisions);
		const [, , currentRevisionTag] = window.location.pathname.replace('/viewer/', '').split('/');

		const baseRevision = isFederation ? revisions[0] :
		revisions.find((rev) => rev.tag === currentRevisionTag || rev._id === currentRevisionTag ) || revisions[0];

		const targetRevision = getNextRevision(revisions, currentRevisionTag);
		const currentRevision =
			currentRevisionTag ? revisions.find((revision) => revision.tag === currentRevisionTag) : revisions[0];

		const model = {
			_id: settings._id,
			name: settings.name,
			baseRevision: baseRevision._id,
			currentRevision: currentRevision._id,
			targetDiffRevision: targetRevision._id,
			targetClashRevision: baseRevision._id,
			revisions
		};

		if (!isFederation) {
			yield put(CompareActions.setComponentState({ compareModels: [model] }));
		} else {
			yield put(CompareActions.setComponentState({ compareModels: [model] })); // TODO: generate for subModels
		}

	} catch (error) {
		console.error(error);
	}
}

export function* getModelInfo(model) {
	try {
		return yield Viewer.getModelInfo(model);
	} catch (error) {
		console.error(error);
	}
}

export function* getCompareModels() {
	try {
		const isFederation = yield select(selectIsFederation);
		const settings = yield select(selectSettings);

		yield put(CompareActions.getCompareModelData(isFederation, settings));

	} catch (error) {
		console.error(error);
	}
}

export function* onRenderingTypeChange({ renderingType }) {
	try {
		yield put(CompareActions.setComponentState({ renderingType }));
	} catch (error) {
		DialogActions.showErrorDialog('change', 'rendering type');
	}
}

export default function* CompareSaga() {
	yield takeLatest(ModelTypes.FETCH_SETTINGS_SUCCESS, getCompareModels);
	yield takeLatest(CompareTypes.ON_RENDERING_TYPE_CHANGE, onRenderingTypeChange);
	yield takeLatest(CompareTypes.GET_COMPARE_MODEL_DATA, getCompareModelData);
	yield takeLatest(CompareTypes.GET_MODEL_INFO, getModelInfo);
}
