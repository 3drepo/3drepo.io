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
export const SIGN_UP_SSO_PATH = '/v5/signup-sso';
export const PASSWORD_CHANGE_PATH = '/v5/password-change';
export const REGISTER_VERIFY_PATH = '/v5/register-verify';
export const VIEWER_ROUTE = '/v5/viewer/:teamspace/:project/:containerOrFederation/:revision?';
export const DASHBOARD_ROUTE = '/v5/dashboard';
export const TEAMSPACE_ROUTE_BASE = `${DASHBOARD_ROUTE}/:teamspace`;
export const TEAMSPACE_ROUTE_BASE_TAB = `${TEAMSPACE_ROUTE_BASE}/t`;
export const TEAMSPACE_ROUTE = `${TEAMSPACE_ROUTE_BASE}/t/:tab`;
export const PROJECT_ROUTE_BASE = `${TEAMSPACE_ROUTE_BASE}/:project`;

export const PROJECT_ROUTE_BASE_TAB = `${PROJECT_ROUTE_BASE}/t`;
export const PROJECT_ROUTE = `${PROJECT_ROUTE_BASE_TAB}/:tab`;
export const CONTAINERS_ROUTE = `${PROJECT_ROUTE_BASE_TAB}/containers`;
export const FEDERATIONS_ROUTE = `${PROJECT_ROUTE_BASE_TAB}/federations`;
export const BOARD_ROUTE = `${PROJECT_ROUTE_BASE_TAB}/board/:type?/:containerOrFederation?`;
export const TICKETS_ROUTE = `${PROJECT_ROUTE_BASE_TAB}/tickets/:template/:ticketId?`;
export const TICKETS_SELECTION_ROUTE = `${PROJECT_ROUTE_BASE_TAB}/tickets`;


export const PRIVACY_ROUTE = 'https://www.asite.com/privacy-policy';
export const COOKIES_ROUTE = '/v5/cookies';
export const TERMS_ROUTE = '/v5/terms';

export const RELEASE_NOTES_ROUTE = 'https://help.3drepo.io/en/collections/3358238';

// eslint-disable-next-line no-restricted-globals
export const matchesPath = (path) => Boolean(matchPath(location.pathname, { path, exact: true }));
// eslint-disable-next-line no-restricted-globals
export const matchesSubPath = (path) => Boolean(matchPath(location.pathname, { path }));

export interface TeamspaceParams extends Record<string, string> {
	teamspace: string;
}

export interface DashboardParams extends TeamspaceParams {
	project: string;
}

export interface DashboardTicketsParams extends DashboardParams {
	groupBy?: string;
	template?: string;
	ticketId?: string;
}

export interface ViewerParams extends DashboardParams {
	containerOrFederation: string;
	revision?: string;
}

export interface LegalPageParams {
	legalPage: string;
}
