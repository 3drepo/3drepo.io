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

import * as API from '../../services/api';
import { TeamspaceTypes, TeamspaceActions } from './teamspace.redux';
import { selectCurrentUser } from './teamspace.selectors';
import { DialogActions } from '../dialog/dialog.redux';

export function* fetchUser({ username }) {
	try {
		yield put(TeamspaceActions.setPendingState(true));

		const { data } = yield call(API.fetchTeamspace, [username]);

		return yield all([
			put(TeamspaceActions.fetchUserSuccess({...data, username})),
			put(TeamspaceActions.setPendingState(false))
		]);
	} catch (e) {
		if (e.response) {
			return yield all([
				put(TeamspaceActions.fetchUserError(e.response.data)),
				put(TeamspaceActions.setPendingState(false))
			]);
		}
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
	yield takeLatest(TeamspaceTypes.UPLOAD_AVATAR, uploadAvatar);
}
