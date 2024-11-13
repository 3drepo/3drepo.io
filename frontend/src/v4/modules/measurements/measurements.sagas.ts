/**
 *  Copyright (C) 2020 3D Repo Ltd
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

 import { all, put, select, takeLatest } from 'redux-saga/effects';

import { dispatch } from '@/v5/helpers/redux.helpers';
 import { VIEWER_EVENTS } from '../../constants/viewer';
 import { disableConflictingMeasurementActions, generateName } from '../../helpers/measurements';
 import { Viewer } from '../../services/viewer/viewer';
 import { DialogActions } from '../dialog';
 import { MEASURE_TYPE_STATE_MAP } from './measurements.constants';
 import {
	 selectAreaMeasurements,
	 selectEdgeSnapping,
	 selectLengthMeasurements,
	 selectMeasurementsDomain,
	 selectMeasureMode,
	 selectMeasureUnits,
	 selectPointMeasurements,
	 MeasurementsActions,
	 MeasurementsTypes,
	 selectXyzDisplay,
	 selectAngleMeasurements,
	 selectSlopeMeasurements,
 } from './';

const onMeasurementCreated = (measure) => {
	dispatch(MeasurementsActions.addMeasurement(measure));
};

function toggleMeasurementListeners(enabled) {
	if (enabled) {
		Viewer.on(VIEWER_EVENTS.MEASUREMENT_CREATED, onMeasurementCreated);
		Viewer.on(VIEWER_EVENTS.MEASUREMENT_MODE_CHANGED, onMeasurementChanged);
	} else {
		Viewer.off(VIEWER_EVENTS.MEASUREMENT_CREATED, onMeasurementCreated);
		Viewer.off(VIEWER_EVENTS.MEASUREMENT_MODE_CHANGED, onMeasurementChanged);
	}
}

const onMeasurementChanged = () => {
	toggleMeasurementListeners(false);
	dispatch(MeasurementsActions.setMeasureModeSuccess(''));
};

export function* setMeasureMode({ mode }) {
	try {
		toggleMeasurementListeners(false);
		yield put(MeasurementsActions.setMeasureModeSuccess(mode));
		yield Viewer.setMeasureMode(mode);

		if (!mode) {
			yield Viewer.clearMeasureMode();
			return
		}

		yield Viewer.setVisibilityOfMeasurementsLabels(true);
		toggleMeasurementListeners(true);
		disableConflictingMeasurementActions();

		const isSnapping = yield select(selectEdgeSnapping);

		if (isSnapping) {
			yield Viewer.enableEdgeSnapping();
		} else {
			yield Viewer.disableEdgeSnapping();
		}

	} catch (error) {
		DialogActions.showErrorDialog('set', `measure mode to ${mode}`, error);
	}
}

export function* setMeasureUnits({ units }) {
	try {
		yield all([
			Viewer.setMeasuringUnits(units),
			put(MeasurementsActions.setMeasureUnitsSuccess(units))
		]);
	} catch (error) {
		DialogActions.showErrorDialog('set', `measure units to ${units}`, error);
	}
}

export function* addMeasurement({ measurement }) {
	try {
		const measurementStateName = MEASURE_TYPE_STATE_MAP[measurement.type];

		if (measurementStateName) {
			const measurementsState = yield select(selectMeasurementsDomain);
			measurement.name =  generateName(measurement,  measurementsState[measurementStateName]);

			yield Viewer.setMeasurementName(measurement.uuid, measurement.name);
			yield put(MeasurementsActions.addMeasurementSuccess(measurement));
		}
	} catch (error) {
		DialogActions.showErrorDialog('add', `measurement`, error);
	}
}

export function* removeMeasurement({ uuid }) {
	try {
		yield all([
			Viewer.removeMeasurement(uuid),
			put(MeasurementsActions.removeMeasurementSuccess(uuid))
		]);
	} catch (error) {
		DialogActions.showErrorDialog('remove', `measurement`, error);
	}
}

export function* setMeasurementColor({ uuid, color }) {
	try {
		yield Viewer.setMeasurementColor(uuid, color);
		yield put(MeasurementsActions.setMeasurementColorSuccess(uuid, color));
	} catch (error) {
		DialogActions.showErrorDialog('set color', 'measure', error);
	}
}

export function* setMeasurementName({ uuid, name, measureType }) {
	try {
		yield Viewer.setMeasurementName(uuid, name);
		yield put(MeasurementsActions.setMeasurementNameSuccess(uuid, name, measureType));
	} catch (error) {
		DialogActions.showErrorDialog('set name', 'measure', error);
	}
}

export function* resetMeasurementColors() {
	try {
		const areaMeasurements = yield select(selectAreaMeasurements);
		const lengthMeasurements = yield select(selectLengthMeasurements);
		const pointMeasurements = yield select(selectPointMeasurements);
		const angleMeasurements = yield select(selectAngleMeasurements);
		const slopeMeasurements = yield select(selectSlopeMeasurements);

		const setDefaultColor = async ({ uuid, color }) => {
			await Viewer.setMeasurementColor(uuid, color);
		};

		if (areaMeasurements.length) {
			areaMeasurements.forEach(setDefaultColor);
		}

		if (lengthMeasurements.length) {
			lengthMeasurements.forEach(setDefaultColor);
		}

		if (pointMeasurements.length) {
			pointMeasurements.forEach(setDefaultColor);
		}

		if (angleMeasurements.length) {
			angleMeasurements.forEach(setDefaultColor);
		}

		if (slopeMeasurements.length) {
			slopeMeasurements.forEach(setDefaultColor);
		}

		yield put(MeasurementsActions.resetMeasurementColorsSuccess());
	} catch (error) {
		DialogActions.showErrorDialog('set color', 'measure', error);
	}
}

export function* setMeasureEdgeSnapping({ edgeSnapping }) {
	try {
		if ((yield select(selectMeasureMode)) !==  '') {
			if (edgeSnapping) {
				yield Viewer.enableEdgeSnapping();
			} else {
				yield Viewer.disableEdgeSnapping();
			}
		}
		yield put(MeasurementsActions.setMeasureEdgeSnappingSuccess(edgeSnapping));
	} catch (error) {
		DialogActions.showErrorDialog('set edge snapping', 'measure', error);
	}
}

export function* setMeasureXyzDisplay({ xyzDisplay }) {
	try {
		if (xyzDisplay) {
			yield Viewer.enableMeasureXYZDisplay();
		} else {
			yield Viewer.disableMeasureXYZDisplay();
		}
		yield put(MeasurementsActions.setMeasureXyzDisplaySuccess(xyzDisplay));
	} catch (error) {
		DialogActions.showErrorDialog('set XYZ display', 'measure', error);
	}
}

export function* clearMeasurements() {
	try {
		const areaMeasurements = yield select(selectAreaMeasurements);
		const lengthMeasurements = yield select(selectLengthMeasurements);
		const angleMeasurements = yield select(selectAngleMeasurements);
		const slopeMeasurements = yield select(selectSlopeMeasurements);

		[...areaMeasurements, ...lengthMeasurements, ...angleMeasurements, ...slopeMeasurements].forEach(({uuid}) => Viewer.removeMeasurement(uuid));
		yield put(MeasurementsActions.clearMeasurementsSuccess());
	} catch (error) {
		DialogActions.showErrorDialog('clear', 'measurements', error);
	}
}

export function* resetMeasurementTool() {
	try {
		yield put(MeasurementsActions.resetMeasurementToolSuccess());
		yield put(MeasurementsActions.setMeasureXyzDisplay(yield select(selectXyzDisplay)));
		yield put(MeasurementsActions.setMeasureUnits(yield select(selectMeasureUnits)));
	} catch (error) {
		DialogActions.showErrorDialog('reset', 'measurements tool', error);
	}
}

export default function* MeasurementsSaga() {
	yield takeLatest(MeasurementsTypes.SET_MEASURE_MODE, setMeasureMode);
	yield takeLatest(MeasurementsTypes.SET_MEASURE_UNITS, setMeasureUnits);
	yield takeLatest(MeasurementsTypes.ADD_MEASUREMENT, addMeasurement);
	yield takeLatest(MeasurementsTypes.REMOVE_MEASUREMENT, removeMeasurement);
	yield takeLatest(MeasurementsTypes.CLEAR_MEASUREMENTS, clearMeasurements);
	yield takeLatest(MeasurementsTypes.SET_MEASUREMENT_COLOR, setMeasurementColor);
	yield takeLatest(MeasurementsTypes.RESET_MEASUREMENT_COLORS, resetMeasurementColors);
	yield takeLatest(MeasurementsTypes.SET_MEASURE_EDGE_SNAPPING, setMeasureEdgeSnapping);
	yield takeLatest(MeasurementsTypes.SET_MEASURE_XYZ_DISPLAY, setMeasureXyzDisplay);
	yield takeLatest(MeasurementsTypes.SET_MEASUREMENT_NAME, setMeasurementName);
	yield takeLatest(MeasurementsTypes.RESET_MEASUREMENT_TOOL, resetMeasurementTool);
}
