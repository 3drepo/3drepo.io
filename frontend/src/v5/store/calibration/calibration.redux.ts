/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { produceAll } from '@/v5/helpers/reducers.helper';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../../helpers/actions.helper';
import { Vector2D, Vector3D } from './calibration.types';
import { EMPTY_VECTOR } from './calibration.constants';
import { ICalibration } from '../drawings/drawings.types';

export const { Types: CalibrationTypes, Creators: CalibrationActions } = createActions({
	setIsCalibrating: ['isCalibrating'],
	setOrigin: ['origin'],
	setStep: ['step'],
	setIsStepValid: ['isStepValid'],
	setModelCalibration: ['model'],
	setDrawingCalibration: ['drawing'],
	setUnitsConvertionFactor: ['unitsConvertionFactor'],
	setIsCalibratingModel: ['isCalibratingModel'],
	setDrawingId: ['drawingId'],
}, { prefix: 'CALIBRATION/' }) as { Types: Constants<ICalibrationActionCreators>; Creators: ICalibrationActionCreators };

export const INITIAL_STATE: ICalibrationState = {
	isCalibrating: false,
	origin: '',
	step: 0,
	isStepValid: false,
	unitsConvertionFactor: 1,
	horizontal: {
		model: EMPTY_VECTOR,
		drawing: EMPTY_VECTOR,
	},
	verticalRange: null,
	isCalibratingModel: false,
	drawingId: '',
};

export const setIsCalibrating = (state, { isCalibrating }: SetIsCalibratingAction) => {
	state.isCalibrating = isCalibrating;
};

export const setOrigin = (state, { origin }: SetOriginAction) => {
	state.origin = origin;
};

export const setStep = (state, { step }: SetStepAction) => {
	state.step = step;
};

export const setIsStepValid = (state, { isStepValid }: SetIsStepValidAction) => {
	state.isStepValid = isStepValid;
};

export const setModelCalibration = (state, { model }: SetModelCalibrationAction) => {
	state.horizontal.model = model;
};

export const setDrawingCalibration = (state, { drawing }: SetDrawingCalibrationAction) => {
	state.horizontal.drawing = drawing;
};

export const setUnitsConvertionFactor = (state, { unitsConvertionFactor }: SetUnitsConvertionFactorAction) => {
	state.horizontal.unitsConvertionFactor = unitsConvertionFactor;
};

export const setIsCalibratingModel = (state, { isCalibratingModel }: SetIsCalibratingModelAction) => {
	state.isCalibratingModel = isCalibratingModel;
};

export const setDrawingId = (state, { drawingId }: SetDrawingIdAction) => {
	state.drawingId = drawingId;
};

export const calibrationReducer = createReducer(INITIAL_STATE, produceAll({
	[CalibrationTypes.SET_IS_CALIBRATING]: setIsCalibrating,
	[CalibrationTypes.SET_ORIGIN]: setOrigin,
	[CalibrationTypes.SET_STEP]: setStep,
	[CalibrationTypes.SET_IS_STEP_VALID]: setIsStepValid,
	[CalibrationTypes.SET_MODEL_CALIBRATION]: setModelCalibration,
	[CalibrationTypes.SET_DRAWING_CALIBRATION]: setDrawingCalibration,
	[CalibrationTypes.SET_UNITS_CONVERTION_FACTOR]: setUnitsConvertionFactor,
	[CalibrationTypes.SET_IS_CALIBRATING_MODEL]: setIsCalibratingModel,
	[CalibrationTypes.SET_DRAWING_ID]: setDrawingId,
}));

/**
 * Types
*/

export interface ICalibrationState extends Omit<ICalibration, 'state' | 'units'> {
	isCalibrating: boolean;
	origin: string;
	step: number;
	// TODO - remove after logic for 2d vector and vertical plan is implemented
	isStepValid: boolean;
	unitsConvertionFactor: number;
	isCalibratingModel: boolean;
	drawingId: string;
}

export type SetIsCalibratingAction = Action<'SET_IS_CALIBRATING_ACTION'> & { isCalibrating: boolean };
export type SetOriginAction = Action<'SET_ORIGIN_ACTION'> & { origin: string };
export type SetStepAction = Action<'SET_STEP_ACTION'> & { step: number };
export type SetIsStepValidAction = Action<'SET_IS_STEP_VALID_ACTION'> & { isStepValid: boolean };
export type SetModelCalibrationAction = Action<'SET_MODEL_CALIBRATION_ACTION'> & { model: Vector3D };
export type SetDrawingCalibrationAction = Action<'SET_DRAWING_CALIBRATION_ACTION'> & { drawing: Vector2D };
export type SetUnitsConvertionFactorAction = Action<'SET_UNITS_CONVERTION_FACTOR_ACTION'> & { unitsConvertionFactor: number };
export type SetIsCalibratingModelAction = Action<'SET_IS_CALIBRATING_MODEL_ACTION'> & { isCalibratingModel: boolean };
export type SetDrawingIdAction = Action<'SET_DRAWING_ID_ACTION'> & { drawingId: string };

export interface ICalibrationActionCreators {
	setIsCalibrating: (isCalibrating: boolean) => SetIsCalibratingAction;
	setOrigin: (origin: string) => SetOriginAction;
	setStep: (step: number) => SetStepAction;
	setIsStepValid: (isStepValid: boolean) => SetIsStepValidAction;
	setModelCalibration: (model: Vector3D) => SetModelCalibrationAction;
	setDrawingCalibration: (drawing: Vector2D) => SetDrawingCalibrationAction;
	setUnitsConvertionFactor: (unitsConvertionFactor: number) => SetUnitsConvertionFactorAction;
	setIsCalibratingModel: (isCalibratingModel: boolean) => SetIsCalibratingModelAction;
	setDrawingId: (drawingId: string) => SetDrawingIdAction;
}
