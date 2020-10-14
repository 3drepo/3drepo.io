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
import { values } from 'lodash';
import { createSelector } from 'reselect';
import { getGroupOverride } from '../../helpers/colorOverrides';
import { getTransparency, hasTransparency } from '../../helpers/colors';
import { selectActiveIssueDetails } from '../issues';
import { selectDefaultView } from '../model';
import { selectActiveRiskDetails } from '../risks';
import { selectQueryParams } from '../router/router.selectors';

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

export const selectSelectedViewpoint = createSelector(
	selectViewpointsDomain, (state) => state.selectedViewpoint
);

export const selectOverridesDict = createSelector(
	selectSelectedViewpoint, (viewpoint) =>  {
		if ( !Boolean(viewpoint?.override_groups?.length)) {
			return {};
		}

		const groups = viewpoint.override_groups ;

		return groups.reduce((overrides, group) => {
			getGroupOverride(overrides.colors, group, group.color);

			if (hasTransparency(group.color)) {
				getGroupOverride(overrides.transparencies, group, getTransparency(group.color));
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
	selectViewpointsDomain, selectQueryParams,  selectDefaultView, selectActiveIssueDetails, selectActiveRiskDetails,
		({viewpointsMap}, {viewId},  defaultView, activeIssue, activeRisk) => {
			return activeIssue || activeRisk || (!viewpointsMap ? null : viewpointsMap[viewId || defaultView?.id]);
		}
);
