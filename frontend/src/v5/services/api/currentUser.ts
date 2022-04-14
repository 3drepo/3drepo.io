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

import { ICurrentUser, UpdateUser } from '@/v5/store/currentUser/currentUser.types';
import api from './default';

export const fetchUser = async (): Promise<ICurrentUser> => {
	const { data } = await api.get('user');
	return data;
};

export const updateUser = async (user: UpdateUser) => api.put('user', user);

export const updateUserAvatar = async (avatarFile: FormData) => api.put('user/avatar', avatarFile);

export const generateApiKey = async (): Promise<{ apiKey: string }> => {
	const { data } = await api.post('user/key');
	return data;
};

export const deleteApiKey = () => api.delete('user/key');
