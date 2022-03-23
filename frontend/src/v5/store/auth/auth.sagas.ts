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

import { getAvatarUrl } from '@/v4/services/api/users';
import { CurrentUserActions } from '@/v4/modules/currentUser';

import { put, takeLatest } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import { formatMessage } from '@/v5/services/intl';
import { AuthActions, AuthTypes } from './auth.redux';
import { LoginAction } from './auth.types';
import { DialogsActions } from '../dialogs/dialogs.redux';

function* authenticate() {
	yield put(AuthActions.setPendingStatus(true));
	try {
		const { data: { username } } = yield API.Auth.authenticate();
		yield put(CurrentUserActions.fetchUserSuccess({
			username,
			avatarUrl: yield getAvatarUrl(username),
		}));
	} catch (error) {
		if (error.response.status === 401) {
			yield put(AuthActions.setPendingStatus(false));
			yield put(AuthActions.setAuthenticationStatus(false));
		} else {
			yield put(DialogsActions.open('alert', {
				currentActions: formatMessage({ id: 'auth.authenticate.error', defaultMessage: 'trying to authenticate' }),
				error,
			}));
		}
	}
	yield put(AuthActions.setPendingStatus(false));
}

export function* login({ username, password }: LoginAction) {
	yield put(AuthActions.setPendingStatus(true));
	try {
		yield API.Auth.login(username, password);
		yield authenticate();
		yield put(AuthActions.setAuthenticationStatus(true));
	} catch ({ message, response: { data: { status, code } } }) {
		if (status === 400 && code === 'INCORRECT_USERNAME_OR_PASSWORD') {
			yield put(AuthActions.loginFailed(
				formatMessage({ id: 'auth.login.badFields', defaultMessage: 'Incorrect username or password. Please try again.' }),
			));
		} else if (status === 400 && code === 'ALREADY_LOGGED_IN') {
			yield put(AuthActions.authenticate());
		} else yield put(AuthActions.loginFailed(message));
	}
	yield put(AuthActions.setPendingStatus(false));
}

function* logout() {
	yield put(AuthActions.setPendingStatus(true));
	try {
		yield API.Auth.logout();
		yield put({ type: 'RESET_APP' });
	} catch (error) {
		if (error.response.status === 401) {
			yield put({ type: 'RESET_APP' });
		} else {
			yield put(DialogsActions.open('alert', {
				currentActions: formatMessage({ id: 'auth.logout.error', defaultMessage: 'trying to log out' }),
				error,
			}));
		}
	}
	yield put(AuthActions.setAuthenticationStatus(false));
	yield put(AuthActions.setPendingStatus(false));
}

export default function* AuthSaga() {
	yield takeLatest(AuthTypes.AUTHENTICATE, authenticate);
	yield takeLatest(AuthTypes.LOGIN, login);
	yield takeLatest(AuthTypes.LOGOUT, logout);
}
