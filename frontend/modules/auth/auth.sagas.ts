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

import * as API from '../../services/api';
import { AuthTypes, AuthActions } from './auth.redux';
import { DialogActions } from '../dialog';
import { CurrentUserActions } from '../currentUser';
import { getAvatarUrl } from '../currentUser/currentUser.sagas';

export function* login({ username, password }) {
	try {
		yield API.login(username, password);
		yield CurrentUserActions.fetchUserSuccess({
			username,
			avatarUrl: getAvatarUrl(username)
		});
		yield put(AuthActions.loginSuccess());
	} catch (e) {
		if (e.response.status === 401) {
			yield put(AuthActions.loginFailure());
		} else {
			yield put(DialogActions.showErrorDialog('login', 'user', e.response));
		}
	}
}
export function* authenticate() {
	try {
		const { data: { username }} = yield API.authenticate();
		yield CurrentUserActions.fetchUserSuccess({
			username,
			avatarUrl: getAvatarUrl(username)
		});
		yield put(AuthActions.loginSuccess());
	} catch (e) {
		if (e.response.status === 401) {
			yield put(AuthActions.loginFailure());
		} else {
			yield put(DialogActions.showErrorDialog('authenticate', 'user', e.response));
		}
	}
}

export default function* AuthSaga() {
	yield takeLatest(AuthTypes.LOGIN, login);
	yield takeLatest(AuthTypes.AUTHENTICATE, authenticate);
}
