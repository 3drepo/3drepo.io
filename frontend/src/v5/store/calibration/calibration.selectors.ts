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
import { createSelector } from 'reselect';
import { ICalibrationState } from './calibration.redux';

const selectCalibrationDomain = (state): ICalibrationState => state.calibration;

export const selectIsCalibrating = createSelector(
	selectCalibrationDomain, (state) => state.isCalibrating,
);

export const selectOrigin = createSelector(
	selectCalibrationDomain, (state) => state.origin,
);

export const selectStep = createSelector(
	selectCalibrationDomain, (state) => state.step,
);

export const selectIsStepValid = createSelector(
	selectCalibrationDomain, (state) => state.isStepValid,
);

const selectHorizontalCalibration = createSelector(
	selectCalibrationDomain, (state) => state.horizontal,
);

export const selectDrawingCalibration = createSelector(
	selectHorizontalCalibration, (calibration) => calibration.drawing,
);

export const selectModelCalibration = createSelector(
	selectHorizontalCalibration, (calibration) => calibration.model,
);

export const selectIsCalibratingModel = createSelector(
	selectCalibrationDomain, (state) => state.isCalibratingModel,
);
