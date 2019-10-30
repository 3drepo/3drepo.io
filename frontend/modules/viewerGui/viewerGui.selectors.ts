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
import { VIEWER_PANELS } from '../../constants/viewerGui';
import * as Bim from '../bim';
import { selectIsTreeProcessed } from '../tree';

export const selectViewerGuiDomain = (state) => ({...state.viewerGui});

export const selectVisiblePanels = createSelector(
	selectViewerGuiDomain, (state) => state.visiblePanels
);

export const selectIsMetadataVisible = createSelector(
	selectVisiblePanels, Bim.selectIsPending,
	(state, isPending) => state[VIEWER_PANELS.BIM] && !isPending
);

export const selectIsModelLoaded = createSelector(
	selectViewerGuiDomain, selectIsTreeProcessed, (state, isTreeProcessed) =>
		state.isModelLoaded && isTreeProcessed
);

export const selectNavigationMode = createSelector(
	selectViewerGuiDomain, (state) => state.navigationMode
);

export const selectHelicopterSpeed = createSelector(
	selectViewerGuiDomain, (state) => state.helicopterSpeed
);

export const selectIsFocusMode = createSelector(
	selectViewerGuiDomain, (state) => state.isFocusMode
);

export const selectClippingMode = createSelector(
	selectViewerGuiDomain, (state) => state.clippingMode
);

export const selectIsClipEdit = createSelector(
	selectViewerGuiDomain, (state) => state.isClipEdit
);

export const selectClipNumber = createSelector(
	selectViewerGuiDomain, (state) => state.clipNumber
);
