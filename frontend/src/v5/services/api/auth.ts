/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import axios, { AxiosResponse } from 'axios';
import api from './default';
import { cookies } from '@/v5/helpers/cookie.helper';


const CSRF_TOKEN = 'csrf_token';
const TOKEN_HEADER = 'X-CSRF-TOKEN';

export const authenticate = async (): Promise<string> => {
	axios.defaults.headers[TOKEN_HEADER] = cookies(CSRF_TOKEN);
	const { data } = await api.get('login');
	return data.username;
};

export const login = (user, password): Promise<AxiosResponse<void>> => api.post('login', { user, password });

export const logout = (): Promise<AxiosResponse<void>> => api.post('logout');

export const resetPassword = (user) => api.post('user/password', { user });

export const changePassword = (user, newPassword, token) => api.put('user/password', { user, newPassword, token });
