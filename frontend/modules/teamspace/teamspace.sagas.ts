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
import { TeamspaceTypes, TeamspaceActions } from './teamspace.redux';
import { selectCurrentUser } from './teamspace.selectors';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';

export function* fetchUser({ username }) {
	try {
		yield put(TeamspaceActions.setPendingState(true));
		yield put(TeamspaceActions.setAvatarPendingState(true));

		const { data } = yield call(API.fetchTeamspace, [username]);

		return yield all([
			put(TeamspaceActions.fetchUserSuccess({...data, username})),
			put(TeamspaceActions.setPendingState(false))
		]);
	} catch (e) {
		yield put(DialogActions.showErrorDialog('fetch', 'user data', e.response));
		yield put(TeamspaceActions.setPendingState(false));
	}
}

export function* fetchQuotaInfo({ teamspace }) {
	try {
		const { data } = yield API.getQuotaInfo(teamspace);

		return yield put(TeamspaceActions.fetchQuotaInfoSuccess({ ...data }));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('fetch', 'quota info', e.response));
	}
}

export function* updateUser({ userData }) {
	try {
		yield put(TeamspaceActions.setPendingState(true));

		const { username } = yield select(selectCurrentUser);
		yield API.updateUser(username, userData);
		yield put(TeamspaceActions.updateUserSuccess(userData));
		yield put(SnackbarActions.show('Profile updated'));
		yield put(TeamspaceActions.setPendingState(false));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('update', 'user', e.response));
		yield put(TeamspaceActions.setPendingState(false));
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
		yield put(TeamspaceActions.setAvatarPendingState(true));

		const {username} = yield select(selectCurrentUser);

		const formData = new FormData();
		const size = file.size;
		const maxSizeUser = '1 MB';
		const maxSize = 1024 * 1024; // 1 MB
		if (file.size < maxSize) {
			formData.append('file', file);
			yield API.uploadAvatar(username, formData);
			yield put(TeamspaceActions.refreshAvatar());
			yield put(SnackbarActions.show('Avatar updated'));
		} else {
			const message = `File is too big! Must be smaller than ${maxSizeUser}.`;
			throw {response: { data: { message }}};
		}
	} catch (e) {
		yield put(DialogActions.showErrorDialog('upload', 'avatar', e.response));
		yield put(TeamspaceActions.refreshAvatar());
	}
}

export default function* teamspaceSaga() {
	yield takeLatest(TeamspaceTypes.FETCH_USER, fetchUser);
	yield takeLatest(TeamspaceTypes.FETCH_QUOTA_INFO, fetchQuotaInfo);
	yield takeLatest(TeamspaceTypes.UPDATE_USER, updateUser);
	yield takeLatest(TeamspaceTypes.UPDATE_USER_PASSWORD, updateUserPassword);
	yield takeLatest(TeamspaceTypes.UPLOAD_AVATAR, uploadAvatar);
}
