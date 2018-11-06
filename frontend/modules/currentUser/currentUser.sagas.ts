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

import { put, takeLatest, all, call, select } from 'redux-saga/effects';
import { get } from 'lodash';

import * as API from '../../services/api';
import { CurrentUserTypes, CurrentUserActions } from './currentUser.redux';
import { selectCurrentUser } from './currentUser.selectors';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { TeamspacesActions } from '../teamspaces';

export const getAvatarUrl = (username) => API.getAPIUrl(`${username}/avatar?${Date.now()}`);

export function* fetchUser({ username }) {
	try {
		yield put(CurrentUserActions.setPendingState(true));
		yield put(CurrentUserActions.setAvatarPendingState(true));

		const { data: { accounts, ...currentUser } } = yield call(API.fetchTeamspace, [username]);

		yield all([
			put(CurrentUserActions.fetchUserSuccess({
				...currentUser,
				username,
				avatarUrl: getAvatarUrl(username)
			})),
			put(TeamspacesActions.setTeamspaces(accounts)),
			put(CurrentUserActions.setPendingState(false))
		]);
	} catch (e) {
		yield put(DialogActions.showErrorDialog('fetch', 'user data', e.response));
		yield put(CurrentUserActions.setPendingState(false));
	}
}

export function* fetchQuotaInfo({ teamspace }) {
	try {
		const { data } = yield API.getQuotaInfo(teamspace);

		yield put(CurrentUserActions.fetchQuotaInfoSuccess({ ...data }));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('fetch', 'quota info', e.response));
	}
}

export function* updateUser({ userData }) {
	try {
		yield put(CurrentUserActions.setPendingState(true));

		const { username } = yield select(selectCurrentUser);
		yield API.updateUser(username, userData);
		yield put(SnackbarActions.show('Profile updated'));
		yield put(CurrentUserActions.setPendingState(false));
		yield put(CurrentUserActions.updateUserSuccess(userData));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('update', 'user', e.response));
		yield put(CurrentUserActions.setPendingState(false));
	}
}

export function* updateUserPassword({ passwords }) {
	try {
		const { username } = yield select(selectCurrentUser);
		yield API.updateUser(username, passwords);
		yield put(SnackbarActions.show('Password updated'));
	} catch (e) {
		const code = get(e.response, 'data.code');

		if (code === 'INCORRECT_USERNAME_OR_PASSWORD') {
			e.response.data.message = 'Your old password was incorrect';
		}

		yield put(DialogActions.showErrorDialog('update', 'password', e.response));
	}
}

export function* uploadAvatar({ file }) {
	try {
		yield put(CurrentUserActions.setAvatarPendingState(true));

		const {username} = yield select(selectCurrentUser);

		const formData = new FormData();
		const size = file.size;
		const maxSizeUser = '1 MB';
		const maxSize = 1024 * 1024; // 1 MB
		if (file.size < maxSize) {
			formData.append('file', file);
			yield API.uploadAvatar(username, formData);

			const avatarUrl = getAvatarUrl(username);
			yield put(CurrentUserActions.refreshAvatar(avatarUrl));
			yield put(SnackbarActions.show('Avatar updated'));
		} else {
			const message = `File is too big! Must be smaller than ${maxSizeUser}.`;
			throw {response: { data: { message }}};
		}
	} catch (e) {
		yield put(DialogActions.showErrorDialog('upload', 'avatar', e.response));
		yield put(CurrentUserActions.refreshAvatar());
	}
}

export default function* teamspaceSaga() {
	yield takeLatest(CurrentUserTypes.FETCH_USER, fetchUser);
	yield takeLatest(CurrentUserTypes.FETCH_QUOTA_INFO, fetchQuotaInfo);
	yield takeLatest(CurrentUserTypes.UPDATE_USER, updateUser);
	yield takeLatest(CurrentUserTypes.UPDATE_USER_PASSWORD, updateUserPassword);
	yield takeLatest(CurrentUserTypes.UPLOAD_AVATAR, uploadAvatar);
}
