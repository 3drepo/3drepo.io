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

import * as queryString from 'query-string';
import { matchPath } from 'react-router';
import { createSelector } from 'reselect';
import { RouteParams, ROUTES } from '../../constants/routes';

export const selectRouterDomain = (state) => state.router || '';

export const selectLocation = createSelector(
	selectRouterDomain, (router) => router.location || ''
);

export const selectPathname = createSelector(
	selectLocation, (location) => location.pathname
);

export const selectSearch = createSelector(
	selectLocation, (location) => location.search
);

export const selectHash = createSelector(
	selectLocation, (location) => location.hash
);

const selectV4UrlParams = createSelector(
	selectLocation, (location) => {
		const viewerPath = ROUTES.MODEL_VIEWER;
		const boardPath = ROUTES.BOARD_SPECIFIC;

		const viewerParams = matchPath<RouteParams>(location.pathname, { path: viewerPath });
		const boardParams = matchPath<RouteParams>(location.pathname, { path: boardPath });

		return (viewerParams || boardParams || {}).params;
	}
);

const selectV5UrlParams = createSelector(
	selectLocation, (location) => {
		const viewerPath = ROUTES.V5_MODEL_VIEWER;
		const boardPath = ROUTES.V5_BOARD_SPECIFIC;

		const viewerParams = matchPath<RouteParams>(location.pathname, { path: viewerPath });
		const boardParams = matchPath<RouteParams>(location.pathname, { path: boardPath });

		const params: RouteParams & {v5?: boolean} = (viewerParams || boardParams || {}).params;

		if (params) {
			params.v5 = true;
		}

		return params;
	}
);

export const selectUrlParams =  createSelector(
	selectV4UrlParams, selectV5UrlParams, (v4Params, v5Params) => v4Params || v5Params
);

export const selectQueryParams = createSelector(
	selectLocation, (location) => queryString.parse(location.search)
);
