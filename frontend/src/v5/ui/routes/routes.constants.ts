/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { matchPath } from 'react-router';

export const NOT_FOUND_ROUTE_PATH = '/v5/404';

export const VIEWER_ROUTE = '/v5/viewer/:teamspace/:project/:containerOrFederation/:revision?';
export const DASHBOARD_ROUTE = '/v5/dashboard';
export const PROJECTS_ROUTE = `${DASHBOARD_ROUTE}/:teamspace`;
export const PROJECT_ROUTE = `${PROJECTS_ROUTE}/:project/t/:tab`;
export const CONTAINERS_ROUTE = `${PROJECTS_ROUTE}/:project/t/containers`;
export const FEDERATIONS_ROUTE = `${PROJECTS_ROUTE}/:project/t/federations`;

// eslint-disable-next-line no-restricted-globals
export const matchesPath = (path) => Boolean(matchPath(location.pathname, { path, exact: true }));

export interface DashboardParams {
	teamspace?: string;
	project?: string;
}

export interface ViewerParams {
	teamspace?: string;
	containerOrFederation?: string;
	revision?: string;
}
