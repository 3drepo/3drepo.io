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

import { createActions, createReducer } from 'reduxsauce';
import { MEASURE_TYPE } from './measure.constants';

export const { Types: MeasureTypes, Creators: MeasureActions } = createActions({
	activateMeasure: [],
	deactivateMeasure: [],
	setMeasureActive: ['isActive'],
	setDisabled: ['isDisabled'],
	setActiveSuccess: ['isActive'],
	setDisabledSuccess: ['isDisabled'],
	setMeasureMode: ['mode'],
	setMeasureModeSuccess: ['mode'],
	setMeasureUnits: ['units'],
	setMeasureUnitsSuccess: ['units'],
	addMeasurement: ['measurement'],
	clearMeasurements: [],
	clearMeasurementsSuccess: [],
	removeMeasurement: ['uuid'],
	removeMeasurementSuccess: ['uuid'],
	setMeasurementColor: ['uuid', 'color'],
	setMeasurementColorSuccess: ['uuid', 'color'],
	resetMeasurementColors: [],
	resetMeasurementColorsSuccess: [],
	setMeasureEdgeSnapping: ['edgeSnapping'],
	setMeasureEdgeSnappingSuccess: ['edgeSnapping'],
	setMeasureXyzDisplay: ['XYZdisplay'],
	setMeasureXyzDisplaySuccess: ['XYZdisplay'],
	setMeasurementCheck: ['uuid', 'measureType'],
	setMeasurementCheckAll: ['measureType'],
}, { prefix: 'MEASURE/' });

export const INITIAL_STATE = {
	isDisabled: false,
	isActive: false,
	mode: '',
	units: 'm',
	areaMeasurements: [],
	lengthMeasurements: [],
	pointMeasurements: [],
	edgeSnapping: true,
	XYZdisplay: false,
};

export const setActiveSuccess = (state = INITIAL_STATE, { isActive }) => ({ ...state, isActive });

export const setDisabledSuccess = (state = INITIAL_STATE, { isDisabled }) => ({ ...state, isDisabled });

export const setMeasureModeSuccess = (state = INITIAL_STATE, { mode }) => ({ ...state, mode });

export const setMeasureUnitsSuccess = (state = INITIAL_STATE, { units }) => ({ ...state, units });

export const setMeasureEdgeSnappingSuccess = (state = INITIAL_STATE, { edgeSnapping }) => ({ ...state, edgeSnapping });

export const setMeasureXyzDisplaySuccess = (state = INITIAL_STATE, { XYZdisplay }) => ({ ...state, XYZdisplay });

export const clearMeasurementsSuccess  = (state = INITIAL_STATE) => ({
	...state,
	areaMeasurements: INITIAL_STATE.areaMeasurements,
	lengthMeasurements: INITIAL_STATE.lengthMeasurements,
	pointMeasurements: INITIAL_STATE.pointMeasurements,
});

export const removeMeasurementSuccess = (state = INITIAL_STATE, { uuid }) => ({
	...state,
	areaMeasurements: state.areaMeasurements.filter((measurement) => measurement.uuid !== uuid),
	lengthMeasurements: state.lengthMeasurements.filter((measurement) => measurement.uuid !== uuid),
	pointMeasurements: state.pointMeasurements.filter((measurement) => measurement.uuid !== uuid),
});

export const addMeasurement = (state = INITIAL_STATE, { measurement }) => {
	measurement.checked = true;
	measurement.color.r = measurement.color.r * 255;
	measurement.color.g = measurement.color.g * 255;
	measurement.color.b = measurement.color.b * 255;

	if (measurement.type === MEASURE_TYPE.AREA) {
		return ({ ...state, areaMeasurements: [...state.areaMeasurements, measurement]});
	} else if (measurement.type === MEASURE_TYPE.LENGTH) {
		return ({ ...state, lengthMeasurements: [...state.lengthMeasurements, measurement]});
	} else if (measurement.type === MEASURE_TYPE.POINT) {
		return ({ ...state, pointMeasurements: [...state.pointMeasurements, measurement]});
	}
	return ({ ...state });
};

export const setMeasurementColorSuccess = (state = INITIAL_STATE, { uuid, color }) => {
	const areaMeasurement = state.areaMeasurements.find((measure) => measure.uuid === uuid);
	const lengthMeasurement = state.lengthMeasurements.find((measure) => measure.uuid === uuid);
	const pointMeasurement = state.pointMeasurements.find((measure) => measure.uuid === uuid);

	if (areaMeasurement) {
		areaMeasurement.customColor = color;
		return ({ ...state, areaMeasurements: [...state.areaMeasurements]});
	} else if (lengthMeasurement) {
		lengthMeasurement.customColor = color;
		return ({ ...state, lengthMeasurements: [...state.lengthMeasurements]});
	} else if (pointMeasurement) {
		pointMeasurement.customColor = color;
		return ({ ...state, pointMeasurements: [...state.pointMeasurements]});
	}
	return ({ ...state });
};

export const setMeasurementCheck = (state = INITIAL_STATE, { uuid, measureType }) => {
	if (measureType === MEASURE_TYPE.AREA) {
		const areaMeasurement = state.areaMeasurements.find((measure) => measure.uuid === uuid);
		areaMeasurement.checked = !areaMeasurement.checked;
		return ({ ...state, areaMeasurements: [...state.areaMeasurements]});
	} else if (measureType === MEASURE_TYPE.LENGTH) {
		const lengthMeasurement = state.lengthMeasurements.find((measure) => measure.uuid === uuid);
		lengthMeasurement.checked = !lengthMeasurement.checked;
		return ({ ...state, lengthMeasurements: [...state.lengthMeasurements]});
	}

	return ({ ...state });
};

export const setMeasurementCheckAll = (state = INITIAL_STATE, { measureType }) => {
	if (measureType === MEASURE_TYPE.AREA) {
		const checkedAreaMeasurements = state.areaMeasurements.filter((measure) => measure.checked === true);
		if (checkedAreaMeasurements.length === state.areaMeasurements.length) {
			return ({
				...state,
				areaMeasurements: [...state.areaMeasurements.map((measure) => ({ ...measure, checked: false }))],
			});
		}
		return ({
			...state,
			areaMeasurements: [...state.areaMeasurements.map((measure) => ({ ...measure, checked: true }))],
		});
	} else if (measureType === MEASURE_TYPE.LENGTH) {
		const checkedLengthMeasurements = state.lengthMeasurements.filter((measure) => measure.checked);
		if (checkedLengthMeasurements.length === state.lengthMeasurements.length) {
			return ({
				...state,
				lengthMeasurements: [...state.lengthMeasurements.map((measure) => ({ ...measure, checked: false }))],
			});
		}
		return ({
			...state,
			lengthMeasurements: [...state.lengthMeasurements.map((measure) => ({ ...measure, checked: true }))],
		});
	}

	return ({ ...state });
};

export const resetMeasurementColorsSuccess = (state = INITIAL_STATE, {}) => {
	const removeCustomColor = ({ customColor, ...measure }) => measure;
	const areaMeasurements = state.areaMeasurements.map(removeCustomColor);
	const lengthMeasurements = state.lengthMeasurements.map(removeCustomColor);
	const pointMeasurements = state.pointMeasurements.map(removeCustomColor);

	return ({
		...state,
		areaMeasurements,
		lengthMeasurements,
		pointMeasurements,
	});
};

export const reducer = createReducer(INITIAL_STATE, {
	[MeasureTypes.SET_ACTIVE_SUCCESS]: setActiveSuccess,
	[MeasureTypes.SET_DISABLED_SUCCESS]: setDisabledSuccess,
	[MeasureTypes.SET_MEASURE_MODE]: setMeasureModeSuccess,
	[MeasureTypes.SET_MEASURE_UNITS_SUCCESS]: setMeasureUnitsSuccess,
	[MeasureTypes.ADD_MEASUREMENT]: addMeasurement,
	[MeasureTypes.CLEAR_MEASUREMENTS_SUCCESS]: clearMeasurementsSuccess,
	[MeasureTypes.REMOVE_MEASUREMENT_SUCCESS]: removeMeasurementSuccess,
	[MeasureTypes.SET_MEASUREMENT_COLOR_SUCCESS]: setMeasurementColorSuccess,
	[MeasureTypes.RESET_MEASUREMENT_COLORS_SUCCESS]: resetMeasurementColorsSuccess,
	[MeasureTypes.SET_MEASURE_EDGE_SNAPPING_SUCCESS]: setMeasureEdgeSnappingSuccess,
	[MeasureTypes.SET_MEASURE_XYZ_DISPLAY_SUCCESS]: setMeasureXyzDisplaySuccess,
	[MeasureTypes.SET_MEASUREMENT_CHECK]: setMeasurementCheck,
	[MeasureTypes.SET_MEASUREMENT_CHECK_ALL]: setMeasurementCheckAll,
});
