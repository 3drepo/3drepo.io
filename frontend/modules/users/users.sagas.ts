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

import { put, takeLatest } from 'redux-saga/effects';

import api from '../../services/api';
import { UsersTypes, UsersActions } from './users.redux';

/**
 * Find users by usernname and email
 * @param teamspace
 * @param searchText
 */
export function* fetchUsers({ teamspace, searchText }) {
	try {
		const { data } = yield api.get(`${teamspace}/members/search/${searchText}`);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Remove user from teamspace
 * @param teamspace
 * @param username
 */
export function* removeUser({ teamspace, username }) {
	try {
		const { data } = yield api.delete(`${teamspace}/members/${username}`);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Remove user from teamspace (cascade)
 * @param teamspace
 * @param username
 */
export function* removeUserCascade({ teamspace, username }) {
	try {
		const { data } = yield api.delete(`${teamspace}/members/${username}?cascadeRemove=true`);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Update user job
 * @param teamspace
 * @param job
 * @param username
 */
export function* updateMemberJob({ teamspace, job, username }) {
	try {
		const { data } = yield api.post(`${teamspace}/jobs/${job}/${username}`);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Remove user job
 * @param teamspace
 * @param job
 * @param username
 */
export function* removeMemberJob({ teamspace, job, username }) {
	try {
		const { data } = yield api.delete(`${teamspace}/jobs/unassign/${username}`);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Set user permissions
 * @param teamspace
 * @param permissionData
 */
export function* setMemberPermissions({ teamspace, permissionsData }) {
	try {
		const { data } = yield api.post(`${teamspace}/permissions/`, permissionsData);
	} catch (error) {
		console.error(error);
	}
}

/**
 * Add new user
 * @param teamspace
 * @param username
 */
export function* addMember({ teamspace, username }) {
	try {
		const { data } = yield api.post(`${teamspace}/members`, username);
	} catch (error) {
		console.error(error);
	}
}

export default function* UsersSaga() {
	yield takeLatest(UsersTypes.FETCH_USERS, fetchUsers);
	yield takeLatest(UsersTypes.REMOVE_USER, removeUser);
	yield takeLatest(UsersTypes.REMOVE_USER_CASCADE, removeUserCascade);
	yield takeLatest(UsersTypes.UPDATE_MEMBER_JOB, updateMemberJob);
	yield takeLatest(UsersTypes.REMOVE_MEMBER_JOB, removeMemberJob);
	yield takeLatest(UsersTypes.SET_MEMBER_PERMISSIONS, setMemberPermissions);
	yield takeLatest(UsersTypes.ADD_MEMBER, addMember);
}
