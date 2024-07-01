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

export const { Types: CalibrationTypes, Creators: CalibrationActions } = createActions({
	setIsCalibrating: ['isCalibrating'],
	setOrigin: ['origin'],
	setStep: ['step'],
	setIsStepValid: ['isStepValid'],
	setVector2D: ['vector2D'],
	setVector3D: ['vector3D'],
	setIsCalibrating3D: ['isCalibrating3D'],
	setDrawingId: ['drawingId'],
}, { prefix: 'CALIBRATION/' }) as { Types: Constants<ICalibrationActionCreators>; Creators: ICalibrationActionCreators };

export const INITIAL_STATE: ICalibrationState = {
	isCalibrating: false,
	origin: '',
	step: 0,
	isStepValid: false,
	vector2D: EMPTY_VECTOR,
	vector3D: EMPTY_VECTOR,
	isCalibrating3D: false,
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

export const setVector2D = (state, { vector2D }: SetVector2DAction) => {
	state.vector2D = vector2D;
};

export const setVector3D = (state, { vector3D }: SetVector3DAction) => {
	state.vector3D = vector3D;
};

export const setIsCalibrating3D = (state, { isCalibrating3D }: SetIsCalibrating3DAction) => {
	state.isCalibrating3D = isCalibrating3D;
};

export const setDrawingId = (state, { drawingId }: SetDrawingIdAction) => {
	state.drawingId = drawingId;
};

export const calibrationReducer = createReducer(INITIAL_STATE, produceAll({
	[CalibrationTypes.SET_IS_CALIBRATING]: setIsCalibrating,
	[CalibrationTypes.SET_ORIGIN]: setOrigin,
	[CalibrationTypes.SET_STEP]: setStep,
	[CalibrationTypes.SET_IS_STEP_VALID]: setIsStepValid,
	[CalibrationTypes.SET_VECTOR2_D]: setVector2D,
	[CalibrationTypes.SET_VECTOR3_D]: setVector3D,
	[CalibrationTypes.SET_IS_CALIBRATING3_D]: setIsCalibrating3D,
	[CalibrationTypes.SET_DRAWING_ID]: setDrawingId,
}));

/**
 * Types
*/

export interface ICalibrationState {
	isCalibrating: boolean;
	origin: string;
	step: number;
	// TODO - remove after logic for 2d vector and vertical plan is implemented
	isStepValid: boolean;
	vector2D: Vector2D;
	vector3D: Vector3D;
	isCalibrating3D: boolean;
	drawingId: string;
}

export type SetIsCalibratingAction = Action<'SET_IS_CALIBRATING_ACTION'> & { isCalibrating: boolean };
export type SetOriginAction = Action<'SET_ORIGIN_ACTION'> & { origin: string };
export type SetStepAction = Action<'SET_STEP_ACTION'> & { step: number };
export type SetIsStepValidAction = Action<'SET_IS_STEP_VALID_ACTION'> & { isStepValid: boolean };
export type SetVector2DAction = Action<'SET_VECTOR_2D_ACTION'> & { vector2D: Vector2D };
export type SetVector3DAction = Action<'SET_VECTOR_3D_ACTION'> & { vector3D: Vector3D };
export type SetIsCalibrating3DAction = Action<'SET_IS_CALIBRATING_3D_ACTION'> & { isCalibrating3D: boolean };
export type SetDrawingIdAction = Action<'SET_DRAWING_ID_ACTION'> & { drawingId: string };

export interface ICalibrationActionCreators {
	setIsCalibrating: (isCalibrating: boolean) => SetIsCalibratingAction;
	setOrigin: (origin: string) => SetOriginAction;
	setStep: (step: number) => SetStepAction;
	setIsStepValid: (isStepValid: boolean) => SetIsStepValidAction;
	setVector2D: (vector2D: Vector2D) => SetVector2DAction;
	setVector3D: (vector3D: Vector3D) => SetVector3DAction;
	setIsCalibrating3D: (isCalibrating3D: boolean) => SetIsCalibrating3DAction;
	setDrawingId: (drawingId: string) => SetDrawingIdAction;
}
