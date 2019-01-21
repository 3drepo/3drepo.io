/**
 *  Copyright (C) 2018 3D Repo Ltd
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
 * Get notifications list
 *
 * @returns {*|promise}
 */
export const getNotifications = (): Promise<any> => {
	return api.get('notifications');
};

/**
 * Patch a notification
 *
 * @returns {*|promise}
 */
export const patchNotification = (id, data): Promise<any> => {
	return api.patch(`notifications/${id}`, data);
};

/**
 * Get a particular notification
 *
 * @returns {*|promise}
 */
export const getNotification = (id): Promise<any> => {
	return api.get(`notifications/${id}`);
};

/**
 * Delete a particular notification
 *
 * @returns {*|promise}
 */
export const deleteNotification = (id): Promise<any> => {
	return api.delete(`notifications/${id}`);
};

/**
 * Delete all notifications
 *
 * @returns {*|promise}
 */
export const deleteAllNotifications = (): Promise<any> => {
	return api.delete(`notifications`);
};
