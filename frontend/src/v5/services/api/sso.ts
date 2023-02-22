/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { AxiosResponse } from 'axios';
import api from './default';

const getRedirectUrl = (searchParams = '') => {
	const { origin, pathname } = new URL(window.location.href);
	return `${origin}${pathname}${searchParams}`;
};

const SSO_ROUTE = 'sso/aad';

export const signup = (data): Promise<AxiosResponse<{link: string}>> => api.post(`${SSO_ROUTE}/signup?redirectUri=${getRedirectUrl('?signupPost=1')}`, data);

export const signin = (): Promise<AxiosResponse<{link: string}>> => api.get(`${SSO_ROUTE}/authenticate?redirectUri=${getRedirectUrl('?loginPost=1')}`);

export const linkAccount = (): Promise<any> => api.get(`${SSO_ROUTE}/link?redirectUri=${getRedirectUrl('?linkPost=1')}`);

export const unlinkAccount = (): Promise<any> => api.post(`${SSO_ROUTE}/unlink`);
