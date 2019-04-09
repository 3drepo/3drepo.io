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

import { put, takeLatest, all, select } from 'redux-saga/effects';

import { Viewer } from '../../services/viewer/viewer';
import { DialogActions } from '../dialog';
import { MeasureTypes, MeasureActions, selectIsMeasureActive } from './';

export function* activateMeasure() {
	try {
		yield all([
			Viewer.activateMeasure(),
			put(MeasureActions.setActiveSuccess(true))
		]);
	} catch (error) {
		DialogActions.showErrorDialog('activate', 'measure', error);
	}
}

export function* deactivateMeasure() {
	try {
		yield all([
			Viewer.disableMeasure(),
			put(MeasureActions.setActiveSuccess(false))
		]);
	} catch (error) {
		DialogActions.showErrorDialog('deactivate', 'measure', error);
	}
}

export function* setMeasureActive({ isActive }) {
	try {
		if (isActive) {
			yield put(MeasureActions.activateMeasure());
		} else {
			yield put(MeasureActions.deactivateMeasure());
		}
	} catch (error) {
		DialogActions.showErrorDialog('toggle', 'measure', error);
	}
}

export function* setDisabled({ isDisabled }) {
	try {
		yield put(MeasureActions.setDisabledSuccess(isDisabled));

		if (isDisabled) {
			yield put(MeasureActions.setActiveSuccess(false));
		}
	} catch (error) {
		DialogActions.showErrorDialog('deactivate', 'measure', error);
	}
}

export default function* MeasureSaga() {
	yield takeLatest(MeasureTypes.ACTIVATE_MEASURE, activateMeasure);
	yield takeLatest(MeasureTypes.DEACTIVATE_MEASURE, deactivateMeasure);
	yield takeLatest(MeasureTypes.SET_MEASURE_ACTIVE, setMeasureActive);
	yield takeLatest(MeasureTypes.SET_DISABLED, setDisabled);
}
