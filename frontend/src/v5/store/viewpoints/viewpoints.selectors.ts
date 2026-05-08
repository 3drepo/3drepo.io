/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { isEmpty, isNumber, values } from 'lodash';
import { createSelector } from 'reselect';
import { getTransparency, hasTransparency } from '@/v5/helpers/colors.helper';
import { addToGroupDictionary } from '@/v4/helpers/colorOverrides';
import { selectActiveIssue } from '@/v4/modules/issues';
import { selectDefaultView } from '@/v4/modules/model';
import { selectActiveRisk } from '@/v4/modules/risks';
import { selectQueryParams } from '@/v4/modules/router/router.selectors';
import { IViewpointsState } from './viewpoints.redux';
import { getSortingFunction } from '@components/dashboard/dashboardList/useOrderedList/useOrderedList.helpers';

// Re-export helper functions consumed by other parts of the codebase

const selectViewpointsDomain = (state): IViewpointsState => state.viewpoints;

export const selectIsPending = createSelector(
	selectViewpointsDomain, (state) => state.isPending,
);

export const selectNewViewpoint = createSelector(
	selectViewpointsDomain, (state) => state.newViewpoint,
);

export const selectSortOrder = createSelector(
	selectViewpointsDomain, (state) => state.sortOrder,
);

export const selectViewpointsList = createSelector(
	selectViewpointsDomain,
	selectSortOrder,
	(state, sortOrder) => {
		return values(state.viewpointsMap).sort(getSortingFunction({ column: ['name'], direction:[sortOrder] }));
	},
);

export const selectViewpointById = createSelector(
	selectViewpointsDomain,
	(state, id) => id,
	(state, id) => state.viewpointsMap[id],
);

export const selectSelectedViewpoint = createSelector(
	selectViewpointsDomain, (state) => state.selectedViewpoint,
);

export const selectTransformations = createSelector(
	selectSelectedViewpoint, (viewpoint) => {
		if (!viewpoint?.transformation_groups?.length) {
			return {};
		}
		return viewpoint.transformation_groups.reduce(
			(transformations, group) => addToGroupDictionary(transformations, group, group.transformation),
			{},
		);
	},
);

const selectOverridesDict = createSelector(
	selectSelectedViewpoint, (viewpoint) => {
		if (!viewpoint?.override_groups?.length) {
			return {};
		}
		return viewpoint.override_groups.reduce((overrides, group) => {
			const { color, opacity } = group;
			if (color) {
				addToGroupDictionary(overrides.colors, group, color);
			}
			if (isNumber(opacity) || hasTransparency(color)) {
				addToGroupDictionary(overrides.transparencies, group, opacity ?? getTransparency(color));
			}
			return overrides;
		}, { colors: {}, transparencies: {} });
	},
);

export const selectOverrides = createSelector(
	selectOverridesDict, (overrides) => overrides?.colors || {},
);

export const selectTransparencies = createSelector(
	selectOverridesDict, (overrides) => overrides?.transparencies || {},
);

export const selectInitialView = createSelector(
	selectViewpointsDomain, selectQueryParams, selectDefaultView, selectActiveIssue, selectActiveRisk,
	({ viewpointsMap }, { viewId }, defaultView, activeIssue, activeRisk) => {
		if (!isEmpty(activeIssue)) return activeIssue;
		if (!isEmpty(activeRisk)) return activeRisk;
		return !viewpointsMap ? null : viewpointsMap[viewId || defaultView?.id];
	},
);

export const selectViewpointsGroups = createSelector(
	selectViewpointsDomain, (state) => state.viewpointsGroups,
);

export const selectViewpointsGroupsBeingLoaded = createSelector(
	selectViewpointsDomain, (state) => state.viewpointsGroupsBeingLoaded,
);
