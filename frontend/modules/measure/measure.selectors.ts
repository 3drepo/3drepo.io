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

import { createSelector } from 'reselect';
import { MEASURE_TYPE } from './measure.constants';

export const selectMeasureDomain = (state) => ({...state.measure});

export const selectIsMeasureActive = createSelector(
	selectMeasureDomain, (state) => state.isActive
);

export const selectIsMeasureDisabled = createSelector(
	selectMeasureDomain, (state) => state.isDisabled
);

export const selectMeasureMode = createSelector(
	selectMeasureDomain, (state) => state.mode
);

export const selectMeasureUnits = createSelector(
	selectMeasureDomain, (state) => state.units
);

export const selectEdgeSnapping = createSelector(
	selectMeasureDomain, (state) => state.edgeSnapping
);

export const selectXYZdisplay = createSelector(
	selectMeasureDomain, (state) => state.XYZdisplay
);

export const selectAreaMeasurements = createSelector(
		selectMeasureDomain, (state) => state.areaMeasurements
);

export const selectLengthMeasurements = createSelector(
		selectMeasureDomain, (state) => state.lengthMeasurements
);

export const selectPointMeasurements = createSelector(
		selectMeasureDomain, (state) => state.pointMeasurements
);
