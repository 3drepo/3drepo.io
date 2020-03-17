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

import { all, put, takeLatest } from 'redux-saga/effects';

import { Viewer } from '../../services/viewer/viewer';
import { DialogActions } from '../dialog';
import { MeasureActions, MeasureTypes } from './';

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

export function* setMeasureMode({ mode }) {
	try {
		yield all([
			Viewer.setMeasureMode(mode),
			put(MeasureActions.setMeasureModeSuccess(mode))
		]);
	} catch (error) {
		DialogActions.showErrorDialog('set', `measure mode to ${mode}`, error);
	}
}

export function* setMeasuringUnits({ units }) {
	try {
		yield all([
			Viewer.setMeasuringUnits(units),
			put(MeasureActions.setMeasureUnitsSuccess(units))
		]);
	} catch (error) {
		DialogActions.showErrorDialog('set', `measure units to ${units}`, error);
	}
}

export function* removeMeasurement({ uuid }) {
	try {
		yield all([
			Viewer.removeMeasurement(uuid),
			put(MeasureActions.removeMeasurementSuccess(uuid))
		]);
	} catch (error) {
		DialogActions.showErrorDialog('remove', `measurement`, error);
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

export function* setMeasurementColor({ uuid, color }) {
	const colorToSet = [color.r / 255, color.g / 255, color.b / 255, color.a];
	try {
		yield Viewer.setMeasurementColor(uuid, colorToSet);
		yield put(MeasureActions.setMeasurementColorSuccess(uuid, color));
	} catch (error) {
		DialogActions.showErrorDialog('set color', 'measure', error);
	}
}

export function* setMeasureEdgeSnapping({ edgeSnapping }) {
	try {
		if (edgeSnapping) {
			yield Viewer.enableEdgeSnapping();
		} else {
			yield Viewer.disableEdgeSnapping();
		}
		yield put(MeasureActions.setMeasureEdgeSnappingSuccess(edgeSnapping));
	} catch (error) {
		DialogActions.showErrorDialog('set color', 'measure', error);
	}
}

export default function* MeasureSaga() {
	yield takeLatest(MeasureTypes.ACTIVATE_MEASURE, activateMeasure);
	yield takeLatest(MeasureTypes.DEACTIVATE_MEASURE, deactivateMeasure);
	yield takeLatest(MeasureTypes.SET_MEASURE_ACTIVE, setMeasureActive);
	yield takeLatest(MeasureTypes.SET_DISABLED, setDisabled);
	yield takeLatest(MeasureTypes.SET_MEASURE_MODE, setMeasureMode);
	yield takeLatest(MeasureTypes.SET_MEASURE_UNITS, setMeasuringUnits);
	yield takeLatest(MeasureTypes.REMOVE_MEASUREMENT, removeMeasurement);
	yield takeLatest(MeasureTypes.SET_MEASUREMENT_COLOR, setMeasurementColor);
	yield takeLatest(MeasureTypes.SET_MEASURE_EDGE_SNAPPING, setMeasureEdgeSnapping);
}
