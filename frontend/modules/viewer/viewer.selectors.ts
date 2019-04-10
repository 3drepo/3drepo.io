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
import { createSelector } from 'reselect';
import { VIEWER_PANELS } from '../../constants/viewer';
import * as Bim from '../bim';

export const selectViewerDomain = (state) => Object.assign({}, state.viewer);

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

export const selectShadingSetting = createSelector(
	selectSettings, (state) => state.shading
);

export const selectXraySetting = createSelector(
	selectSettings, (state) => state.xray
);

export const selectMemory = createSelector(
	selectSettings, (state) => state.memory
);

export const selectFarPlaneSamplingPoints = createSelector(
	selectSettings, (state) => state.farPlaneSamplingPoints
);

export const selectNavigationMode = createSelector(
	selectViewerDomain, (state) => state.navigationMode
);

export const selectHelicopterSpeed = createSelector(
	selectViewerDomain, (state) => state.helicopterSpeed
);

export const selectIsFocusMode = createSelector(
	selectViewerDomain, (state) => state.isFocusMode
);

export const selectClippingMode = createSelector(
	selectViewerDomain, (state) => state.clippingMode
);

export const selectIsClipEdit = createSelector(
	selectViewerDomain, (state) => state.isClipEdit
);

export const selectClipNumber = createSelector(
	selectViewerDomain, (state) => state.clipNumber
);

export const selectVisiblePanels = createSelector(
	selectViewerDomain, (state) => state.visiblePanels
);

export const selectIsMetadataVisible = createSelector(
	selectVisiblePanels, Bim.selectIsPending,
	(state, isPending) => state[VIEWER_PANELS.METADATA] && !isPending
);

export const selectIsModelLoaded = createSelector(
	selectViewerDomain, (state) => state.isModelLoaded
);
