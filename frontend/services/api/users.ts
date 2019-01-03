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
 * Get users
 * @param teamspace
 * @param searchText
 */
export const fetchUsers = (teamspace) => {
	return api.get(`${teamspace}/members`).then(({ data }) => {
		return {data: data.members};
	});
};

/**
 * Find users by usernname and email
 * @param teamspace
 * @param searchText
 */
export const findUsers = (teamspace, searchText) => {
	return api.get(`${teamspace}/members/search/${searchText}`);
};

/**
 * Remove user from teamspace
 * @param teamspace
 * @param username
 */
export const removeUser = (teamspace, username): Promise<any> => {
	return api.delete(`${teamspace}/members/${username}`);
};

/**
 * Get user details
 * @param teamspace
 * @param username
 */
export const getUserDetails = (teamspace, username): Promise<any> => {
	return api.get(`${teamspace}/members/${username}`);
};

/**
 * Remove user from teamspace (cascade)
 * @param teamspace
 * @param username
 */
export const removeUserCascade = (teamspace, username) => {
	return api.delete(`${teamspace}/members/${username}?cascadeRemove=true`);
};

/**
 * Update user job
 * @param teamspace
 * @param job
 * @param username
 */
export const updateUserJob = (teamspace, job, username) => {
	return api.post(`${teamspace}/jobs/${job}/${username}`);
};

/**
 * Remove user job
 * @param teamspace
 * @param job
 * @param username
 */
export const removeUserJob = (teamspace, username) => {
	return api.delete(`${teamspace}/jobs/unassign/${username}`);
};

/**
 * Set user permissions
 * @param teamspace
 * @param permissionData
 */
export const setUserPermissions = (teamspace, permissionsData) => {
	return api.post(`${teamspace}/permissions/`, permissionsData);
};

/**
 * Add new user
 * @param teamspace
 * @param username
 */
export const addUser = (teamspace, user) => {
	return api.post(`${teamspace}/members`, user);
};

/**
 * Update user
 * @param teamspace
 * @param username
 */
export const updateUser = (teamspace, user) => {
	return api.put(teamspace, user);
};

/**
 * Upload avatar
 * @param teamspace
 * @param formData
 */
export const uploadAvatar = (teamspace, formData) => {
	return api.post(`${teamspace}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
