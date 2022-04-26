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

export const NOT_FOUND_ROUTE_PATH = '/v5/404';
export const LOGIN_PATH = '/v5/login';
export const PASSWORD_FORGOT_PATH = '/v5/password-forgot';
export const SIGN_UP_PATH = '/sign-up';
export const PASSWORD_CHANGE_PATH = '/v5/password-change';
export const VIEWER_ROUTE = '/v5/viewer/:teamspace/:containerOrFederation/:revision?';

export interface DashboardParams {
	teamspace?: string;
	project?: string;
}

export interface ViewerParams {
	teamspace?: string;
	containerOrFederation?: string;
	revision?: string;
}
