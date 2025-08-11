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
import { ROUTES } from '../../constants/routes';

const selectRouterDomain = (state) => state.router || '';

export const selectLocation = createSelector(
	selectRouterDomain, (router) => router.location || ''
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
		const viewerPath = ROUTES.MODEL_VIEWER;
		const boardPath = ROUTES.BOARD_SPECIFIC;

		const viewerParams = matchPath({ path: viewerPath, end: true }, location.pathname);
		const boardParams = matchPath({ path: boardPath }, location.pathname);

		return (viewerParams || boardParams || {}).params;
	}
);

const selectV5UrlParams = createSelector(
	selectLocation, (location) => {
		const viewerPath = ROUTES.V5_MODEL_VIEWER;
		const boardPath = ROUTES.V5_BOARD_SPECIFIC;

		const viewerParams = matchPath({ path: viewerPath }, location.pathname);
		const boardParams = matchPath({ path: boardPath }, location.pathname);

		const params = (viewerParams || boardParams || {}).params;
		console.log('@@ v5Params', location, boardParams)
		return params;
	}
);

export const selectUrlParams =  createSelector(
	selectV4UrlParams, selectV5UrlParams, (v4Params, v5Params) => v4Params || v5Params
);

export const selectQueryParams = createSelector(
	selectLocation, (location) => queryString.parse(location.search)
);
