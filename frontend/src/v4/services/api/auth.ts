/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import api from './';

/**
 * Log in user
 */
export const login = (username, password) => {
	return api.post('login', { username, password });
};

/**
 * Check user session
 */
export const authenticate = () => {
	return api.get('login');
};

/**
 * Log out user
 */
export const logout = () => {
	return api.post('logout');
};

/**
 * Reset password
 */
export const forgotPassword = (userNameOrEmail) => {
	return api.post('forgot-password', { userNameOrEmail });
};

/**
 * Change password
 */
export const changePassword = (username, token, newPassword) => {
	return api.put(`${username}/password`, { token, newPassword });
};

/**
 * Register user
 */
export const register = (username, data) => {
	return api.post(username, { ...data });
};

/**
 * Verify user
 */
export const verify = (username, token) => {
	return api.post(`${username}/verify`, { token });
};
