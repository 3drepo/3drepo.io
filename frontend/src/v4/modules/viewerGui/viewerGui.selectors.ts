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

import { createSelector } from 'reselect';
import { selectTicketOverrides, selectTicketTransparencies } from '@/v5/store/tickets/card/ticketsCard.selectors';
import { VIEWER_PANELS } from '../../constants/viewerGui';
import * as Bim from '../bim';
import { selectOverrides as selectGroupsOverrides,
	selectTransparencies as selectGroupsTransparencies } from '../groups/groups.selectors';
import { selectIsTreeProcessed } from '../tree';
import { selectOverrides as selectViewsOverrides,
		selectTransparencies as selectViewsTransparencies } from '../viewpoints';

export const selectViewerGuiDomain = (state) => ({...state.viewerGui});

export const selectLeftPanels = createSelector(
	selectViewerGuiDomain, (state) => state.leftPanels || []
);

export const selectRightPanels = createSelector(
	selectViewerGuiDomain, (state) => state.rightPanels || []
);

export const selectLockedPanels = createSelector(
	selectViewerGuiDomain, (state) => state.lockedPanels || []
);

export const selectDraggablePanels = createSelector(
	selectViewerGuiDomain, (state) => state.draggablePanels || []
);

export const selectIsMetadataVisible = createSelector(
		selectRightPanels, Bim.selectIsPending,
	(state, isPending) => state[VIEWER_PANELS.BIM] && !isPending
);

export const selectIsModelLoaded = createSelector(
	selectViewerGuiDomain, selectIsTreeProcessed, (state, isTreeProcessed) =>
		state.isModelLoaded && isTreeProcessed
);

export const selectIsCoordViewActive = createSelector(
	selectViewerGuiDomain, (state) => state.coordViewActive
);

export const selectProjectionMode = createSelector(
	selectViewerGuiDomain, (state) => state.projectionMode
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

export const selectGizmoMode = createSelector(
	selectViewerGuiDomain, (state) => state.gizmoMode
);

export const selectIsClipEdit = createSelector(
	selectViewerGuiDomain, (state) => state.isClipEdit
);

export const selectColorOverrides = createSelector(
	selectViewsOverrides, selectGroupsOverrides, selectTicketOverrides,
		(viewsOverrides, groupsOverrides, ticketsOverrides) =>
			({...viewsOverrides,  ...groupsOverrides, ...ticketsOverrides })
);


export const selectAllTransparencyOverrides = createSelector(
	selectViewsTransparencies, selectGroupsTransparencies, selectTicketTransparencies,
		(viewsTransparencies, groupsTransparencies, ticketsTransparencies) =>
			({...viewsTransparencies, ...groupsTransparencies, ...ticketsTransparencies })
);
