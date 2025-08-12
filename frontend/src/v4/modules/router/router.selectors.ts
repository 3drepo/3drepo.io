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
import { matchPath } from 'react-router-dom';
import { createSelector } from 'reselect';
import { ROUTES } from '../../constants/routes';

const selectRouterDomain = (state) => state.router || {};

export const selectLocation = createSelector(
	selectRouterDomain, (router) => router.location || { pathname: '' }
);

export const selectPathname = createSelector(
	selectLocation, (location) => location.pathname
)

export const selectNavigationTarget = createSelector(
	selectRouterDomain, (router) => router.navigationTarget || ''
);

export const selectGoBackRequested = createSelector(
	selectRouterDomain, (router) => router.goBackRequested || false
);

const selectV4UrlParams = createSelector(
	selectLocation, (location) => {
		const viewerModelPath = ROUTES.MODEL_VIEWER;
		const viewerRevisionPath = ROUTES.REVISION_VIEWER;
		const boardPath = ROUTES.BOARD_SPECIFIC;

		const viewerModelMatch = matchPath({ path: viewerModelPath, end: true }, location.pathname);
		const viewerRevisionMatch = matchPath({ path: viewerRevisionPath, end: true }, location.pathname);
		const viewerMatch = viewerModelMatch || viewerRevisionMatch;
		const boardMatch = matchPath({ path: boardPath }, location.pathname);

		return (viewerMatch || boardMatch || {}).params;
	}
);

const selectV5UrlParams = createSelector(
	selectLocation, (location) => {
		const viewerModelPath = ROUTES.V5_MODEL_VIEWER;
		const viewerRevisionPath = ROUTES.V5_REVISION_VIEWER;
		const boardPath = ROUTES.V5_BOARD_SPECIFIC;

		const viewerModelMatch = matchPath({ path: viewerModelPath }, location.pathname);
		const viewerRevisionMatch = matchPath({ path: viewerRevisionPath }, location.pathname);
		const viewerMatch = viewerModelMatch || viewerRevisionMatch
		const boardMatch = matchPath({ path: boardPath }, location.pathname);

		return (viewerMatch || boardMatch || {}).params;
	}
);

export const selectUrlParams =  createSelector(
	selectV4UrlParams, selectV5UrlParams, (v4Params, v5Params) => v4Params || v5Params
);

export const selectQueryParams = createSelector(
	selectLocation, (location) => queryString.parse(location.search)
);
