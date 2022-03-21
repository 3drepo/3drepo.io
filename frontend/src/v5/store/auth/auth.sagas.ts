/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import * as API from '@/v5/services/api';
import { CurrentUserActions } from '@/v4/modules/currentUser';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers/authActions.dispatchers';
import { AuthActions, AuthTypes } from './auth.redux';
import { LoginAction } from './auth.types';

function* authenticate() {
	yield put(AuthActions.setPendingStatus(true));
	try {
		const { data: { username } } = yield API.Auth.authenticate();
		yield put(CurrentUserActions.fetchUserSuccess({
			username,
			avatarUrl: yield API.Users.getAvatarUrl(),
		}));
		yield put(AuthActions.loginSuccess());
	} catch (e) {
	}
}

export function* login({ username, password }: LoginAction) {
	try {
		yield API.Auth.login(username, password);
		yield put(AuthActions.loginSuccess());
	// eslint-disable-next-line no-empty
	} catch (e) {
	}
}

function* logout() {
	try {
		yield API.Auth.logout();
	} catch (e) {
	}
	yield AuthActionsDispatchers.setLocalSessionStatus('false');
}

export default function* AuthSaga() {
	yield takeLatest(AuthTypes.AUTHENTICATE, authenticate);
	yield takeLatest(AuthTypes.LOGIN, login);
	yield takeLatest(AuthTypes.LOGOUT, logout);
}
