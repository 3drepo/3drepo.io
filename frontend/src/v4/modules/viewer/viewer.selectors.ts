/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { rgbToHex } from '@controls/inputs/colorPicker/colorPicker.helpers';
import { createSelector } from 'reselect';

export const selectViewerDomain = (state) => ({...state.viewer});

export const selectSettings = createSelector(
	selectViewerDomain, (state) => state.settings
);

export const selectShadowSetting = createSelector(
	selectSettings, (state) => state.shadows
);

export const selectStatsSetting = createSelector(
	selectSettings, (state) => state.statistics
);

export const selectNearPlaneSetting = createSelector(
	selectSettings, (state) => state.nearPlane
);

export const selectFarPlaneAlgorithm = createSelector(
	selectSettings, (state) => state.farPlaneAlgorithm
);

export const selectViewerBackgroundColor = createSelector(
	selectSettings, (state) => rgbToHex(state.viewerBackgroundColor.map((col) => Math.round(col * 255)))
);

export const selectXraySetting = createSelector(
	selectSettings, (state) => state.xray
);

export const selectCacheSetting = createSelector(
	selectSettings, (state) => state.caching
);

export const selectMemory = createSelector(
	selectSettings, (state) => state.memory
);

export const selectFarPlaneSamplingPoints = createSelector(
	selectSettings, (state) => state.farPlaneSamplingPoints
);

export const selectMaxShadowDistance = createSelector(
	selectSettings, (state) => state.maxShadowDistance
);

export const selectClipPlaneBorderWidth = createSelector(
	selectSettings, (state) => state.clipPlaneBorderWidth
);

export const selectClipPlaneBorderColor = createSelector(
	selectSettings, (state) => state.clipPlaneBorderColor
);
