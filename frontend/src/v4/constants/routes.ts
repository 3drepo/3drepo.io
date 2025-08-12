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

export const ROUTES = {
	HOME: '/',
	LOGIN: '/login',
	SIGN_UP: '/sign-up',
	PASSWORD_FORGOT: '/password-forgot',
	PASSWORD_CHANGE: '/password-change',
	REGISTER_REQUEST: '/register-request',
	REGISTER_VERIFY: '/register-verify',
	VIEWER: '/viewer',
	MODEL_VIEWER: '/viewer/:teamspace/:model/:revision?',
	V5_MODEL_VIEWER: '/v5/viewer/:teamspace/:project/:model',
	V5_REVISION_VIEWER: '/v5/viewer/:teamspace/:project/:model/:revision',
	DASHBOARD: '/dashboard',
	TEAMSPACES: '/dashboard/teamspaces',
	V5_TEAMSPACE: '/v5/dashboard/:teamspace',
	TEAMSPACE_SETTINGS: '/dashboard/teamspaces/:teamspace',
	MODEL_SETTINGS: '/dashboard/teamspaces/:teamspace/models/:modelId',
	USER_MANAGEMENT_MAIN: '/dashboard/user-management',
	USER_MANAGEMENT_TEAMSPACE: '/dashboard/user-management/:teamspace/*',
	PROFILE: '/dashboard/profile',
	BILLING: '/dashboard/billing',
	BOARD_MAIN: '/dashboard/board',
	BOARD_SPECIFIC: '/dashboard/board/:type/:teamspace/:project?/:modelId?',
	V5_BOARD_SPECIFIC: '/v5/dashboard/:teamspace/:project/t/board/:type/:modelId?',
};

export const PUBLIC_ROUTES = [
	ROUTES.LOGIN,
	ROUTES.SIGN_UP,
	ROUTES.REGISTER_REQUEST,
	ROUTES.REGISTER_VERIFY,
	ROUTES.PASSWORD_FORGOT,
	ROUTES.PASSWORD_FORGOT
] as any;


export type RouteParams = {
	teamspace: string,
	model?: string,
	revision?: string,
	modelId?: string,
	type?: string
};