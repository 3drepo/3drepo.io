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
export const LOGIN_PATH = '/v5/login';
export const PASSWORD_FORGOT_PATH = '/v5/password-forgot';
export const SIGN_UP_PATH = '/v5/signup';
export const PASSWORD_CHANGE_PATH = '/v5/password-change';
export const VIEWER_ROUTE = '/v5/viewer/:teamspace/:project/:containerOrFederation/:revision?';
export const DASHBOARD_ROUTE = '/v5/dashboard';
export const PROJECTS_LIST_ROUTE = `${DASHBOARD_ROUTE}/:teamspace`;

const PROJECT_ROUTE_BASE = `${PROJECTS_LIST_ROUTE}/:project/t`;

export const PROJECT_ROUTE = `${PROJECT_ROUTE_BASE}/:tab`;
export const CONTAINERS_ROUTE = `${PROJECT_ROUTE_BASE}/containers`;
export const FEDERATIONS_ROUTE = `${PROJECT_ROUTE_BASE}/federations`;

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
