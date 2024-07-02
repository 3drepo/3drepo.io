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

import { selectIsCalibrating } from '@/v5/store/calibration/calibration.selectors';
import { createSelector } from 'reselect';

export const selectMeasurementsDomain = (state) => state.measurements;

export const selectMeasureMode = createSelector(
	selectMeasurementsDomain, (state) => state.mode
);

export const selectMeasureUnits = createSelector(
	selectMeasurementsDomain, (state) => state.units
);

export const selectEdgeSnapping = createSelector(
	selectMeasurementsDomain, (state) => state.edgeSnapping
);

export const selectXyzDisplay = createSelector(
	selectMeasurementsDomain, (state) => state.xyzDisplay
);

export const selectAreaMeasurements = createSelector(
	selectMeasurementsDomain,
	selectIsCalibrating,
	(state, isCalibrating) => isCalibrating ? [] : state.areaMeasurements
);

export const selectLengthMeasurements = createSelector(
	selectMeasurementsDomain,
	selectIsCalibrating,
	(state, isCalibrating) => isCalibrating ? [] : state.lengthMeasurements
);

export const selectPointMeasurements = createSelector(
	selectMeasurementsDomain,
	selectIsCalibrating,
	(state, isCalibrating) => isCalibrating ? [] : state.pointMeasurements
);

export const selectAngleMeasurements = createSelector(
	selectMeasurementsDomain,
	selectIsCalibrating,
	(state, isCalibrating) => isCalibrating ? [] : state.angleMeasurements
);

export const selectPins = createSelector(
	selectPointMeasurements, selectIsCalibrating,
	(state, isCalibrating) =>
		isCalibrating ? [] : state.map(({ customColor, ...measure }) => {
			const colour = customColor || measure.color;
			return ({
				id: measure.uuid,
				type: 'point',
				isSelected: false,
				position: measure.position,
				colour,
			});
		})
);
