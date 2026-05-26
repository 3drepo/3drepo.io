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

type AuthenticateReturnType = {
	authenticatedTeamspace: string;
	username: string;
};
export const authenticate = (): Promise<AxiosResponse<AuthenticateReturnType>> => api.get('login');

export const logout = (): Promise<AxiosResponse<void>> => api.post('logout');

export const resetPassword = () => api.post('user/password/reset');
