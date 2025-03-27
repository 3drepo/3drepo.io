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

import { AxiosResponse } from 'axios';
import api from './default';


export const authenticate = async (): Promise<string> => {
	const { data } = await api.get('login');
	return data.username;
};

export const login = (user, password): Promise<AxiosResponse<void>> => api.post('login', { user, password });

export const logout = (): Promise<AxiosResponse<void>> => api.post('logout');

export const resetPassword = () => api.post('user/password/reset');

export const changePassword = (user, newPassword, token) => api.put('user/password', { user, newPassword, token });
