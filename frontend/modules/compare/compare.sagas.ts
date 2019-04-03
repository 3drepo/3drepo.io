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

import { put, takeLatest, select } from 'redux-saga/effects';
import { CompareTypes, CompareActions } from './compare.redux';
import { selectRevisions, selectIsFederation, selectSettings, ModelTypes } from '../model';
import { } from './compare.selectors';
import { modelsMock } from '../../constants/compare';
import { DialogActions } from '../dialog';

const getNextRevisionId = (revisions, revision) => {

	if (!revision) {
		return revisions[0];
	}

	const len = revisions.length;
	const index = revisions.findIndex((r) => r._id === revision);

	const lastRev = index + 1 === len;
	if (lastRev) {
		return revisions[index];
	}

	return revisions[index + 1]._id;
};

export function* getCompareModelData() {
	try {
		const [, , currentRevision] = window.location.pathname.replace('/viewer/', '').split('/');
		const revisions = yield select(selectRevisions);
		const isFederation = yield select(selectIsFederation);
		const settings = yield select(selectSettings);

		const baseRevision = isFederation ? revisions[0] :
		revisions.find((rev) => rev.tag === currentRevision || rev._id === currentRevision ) || revisions[0];

		const targetRevisionId = getNextRevisionId(revisions, currentRevision);

		return {
			_id: settings._id,
			name: settings.name,
			baseRevision,
			targetDiffRevision: targetRevisionId,
			targetClashRevision: baseRevision._id
		};

	} catch (error) {
		console.error(error);
	}
}

export function* getCompareModels() {
	try {
		const settings = yield select(selectSettings);
		yield put(CompareActions.getCompareModelData());
		yield put(CompareActions.setComponentState({compareModels: modelsMock}));
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
}
