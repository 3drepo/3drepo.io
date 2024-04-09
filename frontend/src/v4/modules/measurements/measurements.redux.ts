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

import { createActions, createReducer } from 'reduxsauce';
import { MEASURE_TYPE_STATE_MAP } from './measurements.constants';

export const { Types: MeasurementsTypes, Creators: MeasurementsActions } = createActions({
	setMeasureMode: ['mode'],
	setMeasureModeSuccess: ['mode'],
	setMeasureUnits: ['units'],
	setMeasureUnitsSuccess: ['units'],
	addMeasurement: ['measurement'],
	addMeasurementSuccess: ['measurement'],
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
	setMeasureXyzDisplay: ['xyzDisplay'],
	setMeasureXyzDisplaySuccess: ['xyzDisplay'],
	setMeasurementName: ['uuid', 'name', 'measureType'],
	setMeasurementNameSuccess: ['uuid', 'name', 'measureType'],
	resetMeasurementTool: [],
	resetMeasurementToolSuccess: [],
}, { prefix: 'MEASUREMENTS/' });

export interface IMeasurementState {
	isDisabled: boolean;
	mode: string;
	units: string;
	areaMeasurements: any[];
	lengthMeasurements: any[];
	pointMeasurements: any[];
	angleMeasurements: any[];
	edgeSnapping: boolean;
	xyzDisplay: boolean;
}

export const INITIAL_STATE: IMeasurementState = {
	isDisabled: false,
	mode: '',
	units: 'm',
	areaMeasurements: [],
	lengthMeasurements: [],
	pointMeasurements: [],
	angleMeasurements: [],
	edgeSnapping: true,
	xyzDisplay: false,
};

export const setMeasureModeSuccess = (state = INITIAL_STATE, { mode }) => ({ ...state, mode });

export const setMeasureUnitsSuccess = (state = INITIAL_STATE, { units }) => ({ ...state, units });

export const setMeasureEdgeSnappingSuccess = (state = INITIAL_STATE, { edgeSnapping }) => ({ ...state, edgeSnapping });

export const setMeasureXyzDisplaySuccess = (state = INITIAL_STATE, { xyzDisplay }) => ({ ...state, xyzDisplay });

export const resetMeasurementToolSuccess = () => ({ ...INITIAL_STATE });

export const clearMeasurementsSuccess  = (state = INITIAL_STATE) => ({
	...state,
	areaMeasurements: INITIAL_STATE.areaMeasurements,
	lengthMeasurements: INITIAL_STATE.lengthMeasurements,
	pointMeasurements: INITIAL_STATE.pointMeasurements,
	angleMeasurements: INITIAL_STATE.angleMeasurements,
});

export const removeMeasurementSuccess = (state = INITIAL_STATE, { uuid }) => ({
	...state,
	areaMeasurements: state.areaMeasurements.filter((measurement) => measurement.uuid !== uuid),
	lengthMeasurements: state.lengthMeasurements.filter((measurement) => measurement.uuid !== uuid),
	pointMeasurements: state.pointMeasurements.filter((measurement) => measurement.uuid !== uuid),
	angleMeasurements: state.angleMeasurements.filter((measurement) => measurement.uuid !== uuid),
});

export const addMeasurementSuccess = (state = INITIAL_STATE, { measurement }) => {
	const measurementStateName = MEASURE_TYPE_STATE_MAP[measurement.type];

	if (measurementStateName) {
		return ({ ...state, [measurementStateName]: [...state[measurementStateName], measurement]});
	}

	return ({ ...state });
};

export const setMeasurementNameSuccess = (state = INITIAL_STATE, { uuid, name, measureType }) => {
	const measurementStateName = MEASURE_TYPE_STATE_MAP[measureType];

	if (measurementStateName) {
		const searchedMeasurement = state[measurementStateName].find((measure) => measure.uuid === uuid);
		searchedMeasurement.name = name;
		return ({ ...state, [measurementStateName]: [...state[measurementStateName]]});
	}

	return ({ ...state });
};

export const setMeasurementColorSuccess = (state = INITIAL_STATE, { uuid, color }) => {
	const areaMeasurement = state.areaMeasurements.find((measure) => measure.uuid === uuid);
	const lengthMeasurement = state.lengthMeasurements.find((measure) => measure.uuid === uuid);
	const pointMeasurement = state.pointMeasurements.find((measure) => measure.uuid === uuid);
	const angleMeasurement = state.angleMeasurements.find((measure) => measure.uuid === uuid);

	if (areaMeasurement) {
		areaMeasurement.customColor = color;
		return ({ ...state, areaMeasurements: [...state.areaMeasurements]});
	} else if (lengthMeasurement) {
		lengthMeasurement.customColor = color;
		return ({ ...state, lengthMeasurements: [...state.lengthMeasurements]});
	} else if (pointMeasurement) {
		pointMeasurement.customColor = color;
		return ({ ...state, pointMeasurements: [...state.pointMeasurements]});
	} else if (angleMeasurement) {
		angleMeasurement.customColor = color;
		return ({ ...state, angleMeasurements: [...state.angleMeasurements]});
	}

	return ({ ...state });
};

export const resetMeasurementColorsSuccess = (state = INITIAL_STATE, {}) => {
	const removeCustomColor = ({ customColor, ...measure }) => measure;
	const areaMeasurements = state.areaMeasurements.map(removeCustomColor);
	const lengthMeasurements = state.lengthMeasurements.map(removeCustomColor);
	const pointMeasurements = state.pointMeasurements.map(removeCustomColor);
	const angleMeasurements = state.angleMeasurements.map(removeCustomColor);

	return ({
		...state,
		areaMeasurements,
		lengthMeasurements,
		pointMeasurements,
		angleMeasurements,
	});
};

export const reducer = createReducer(INITIAL_STATE, {
	[MeasurementsTypes.SET_MEASURE_MODE_SUCCESS]: setMeasureModeSuccess,
	[MeasurementsTypes.SET_MEASURE_UNITS_SUCCESS]: setMeasureUnitsSuccess,
	[MeasurementsTypes.ADD_MEASUREMENT_SUCCESS]: addMeasurementSuccess,
	[MeasurementsTypes.CLEAR_MEASUREMENTS_SUCCESS]: clearMeasurementsSuccess,
	[MeasurementsTypes.REMOVE_MEASUREMENT_SUCCESS]: removeMeasurementSuccess,
	[MeasurementsTypes.SET_MEASUREMENT_COLOR_SUCCESS]: setMeasurementColorSuccess,
	[MeasurementsTypes.RESET_MEASUREMENT_COLORS_SUCCESS]: resetMeasurementColorsSuccess,
	[MeasurementsTypes.SET_MEASURE_EDGE_SNAPPING_SUCCESS]: setMeasureEdgeSnappingSuccess,
	[MeasurementsTypes.SET_MEASURE_XYZ_DISPLAY_SUCCESS]: setMeasureXyzDisplaySuccess,
	[MeasurementsTypes.SET_MEASUREMENT_NAME_SUCCESS]: setMeasurementNameSuccess,
	[MeasurementsTypes.RESET_MEASUREMENT_TOOL_SUCCESS]: resetMeasurementToolSuccess,
});
