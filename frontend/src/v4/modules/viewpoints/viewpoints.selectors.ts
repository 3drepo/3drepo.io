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
import { isEmpty, orderBy, values } from 'lodash';
import { createSelector } from 'reselect';
import { addToGroupDictionary } from '../../helpers/colorOverrides';
import { getTransparency, hasTransparency } from '../../helpers/colors';
import { groupsOfViewpoint, isViewpointLoaded } from '../../helpers/viewpoints';
import { selectActiveIssue } from '../issues';
import { selectDefaultView } from '../model';
import { selectActiveRisk } from '../risks';
import { selectQueryParams } from '../router/router.selectors';
import { selectIsViewpointFrame, selectSelectedFrameViewpoint } from '../sequences';

export const selectViewpointsDomain = (state) => state.viewpoints;

export const selectIsPending = createSelector(
	selectViewpointsDomain, (state) => state.isPending
);

export const selectViewpointsList = createSelector(
	selectViewpointsDomain, (state) => values(state.viewpointsMap)
);

export const selectComponentState = createSelector(
	selectViewpointsDomain, (state) => state.componentState
);

export const selectNewViewpoint = createSelector(
	selectComponentState, (state) => state.newViewpoint
);

export const selectActiveViewpoint = createSelector(
	selectComponentState, (state) => state.activeViewpoint
);

export const selectSearchQuery = createSelector(
	selectComponentState, (state) => state.searchQuery || ''
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectEditMode = createSelector(
	selectComponentState, (state) => state.editMode
);

export const selectSortOrder = createSelector(
		selectComponentState, (state) => state.sortOrder
);

export const selectSelectedViewpoint = createSelector(
	selectViewpointsDomain, (state) => state.selectedViewpoint
);

export const selectTransformations = createSelector(
	selectSelectedViewpoint, (viewpoint) => {
		if (!Boolean(viewpoint?.transformation_groups?.length)) {
			return {};
		}

		const groups = viewpoint.transformation_groups;
		return groups.reduce((transformations, group) =>
			addToGroupDictionary(transformations, group, group.transformation),
		{});
	}
);

export const selectOverridesDict = createSelector(
	selectSelectedViewpoint, (viewpoint) =>  {
		if ( !Boolean(viewpoint?.override_groups?.length)) {
			return {};
		}

		const groups = viewpoint.override_groups ;

		return groups.reduce((overrides, group) => {
			addToGroupDictionary(overrides.colors, group, group.color);

			if (hasTransparency(group.color)) {
				addToGroupDictionary(overrides.transparencies, group, getTransparency(group.color));
			}

			return overrides;
		}, {colors: {}, transparencies: {} });
	}
);

export const selectOverrides = createSelector(
	selectOverridesDict, (overrides) => overrides?.colors || {}
);

export const selectTransparencies = createSelector(
	selectOverridesDict, (overrides) => overrides?.transparencies || {}
);

export const selectInitialView =  createSelector(
	selectViewpointsDomain, selectQueryParams,  selectDefaultView, selectActiveIssue, selectActiveRisk,
		({viewpointsMap}, {viewId},  defaultView, activeIssue, activeRisk) => {
			return !isEmpty(activeIssue) ? activeIssue :
				!isEmpty(activeRisk) ?  activeRisk :
				(!viewpointsMap ? null : viewpointsMap[viewId || defaultView?.id]);
		}
);

export const selectViewpointsGroups = createSelector(
	selectViewpointsDomain, (state) => state.viewpointsGroups
);

export const selectViewpointsGroupsBeingLoaded = createSelector(
	selectViewpointsDomain, (state) => state.viewpointsGroupsBeingLoaded
);

export const selectIsLoadingSequenceViewpoint = createSelector(
	selectIsViewpointFrame, selectSelectedFrameViewpoint , selectViewpointsGroups,
	(isViewpointFrame, viewpoint, groups) => {
		if (!isViewpointFrame) {
			return false;
		}

		return !isViewpointLoaded(viewpoint, groups);
	}
);
