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
import { formatMessage } from '@/v5/services/intl';
import { AuthActions, AuthTypes, LoginAction } from './auth.redux';
import { DialogsActions } from '../dialogs/dialogs.redux';
import { CurrentUserActions } from '../currentUser/currentUser.redux';

function* authenticate() {
	yield put(AuthActions.setPendingStatus(true));
	try {
		yield API.Auth.authenticate();
		yield put(CurrentUserActions.getProfile());
		yield put(AuthActions.setAuthenticationStatus(true));
	} catch (error) {
		if (error.response.status !== 401) {
			yield put(DialogsActions.open('alert', {
				currentActions: formatMessage({ id: 'auth.authenticate.error', defaultMessage: 'trying to authenticate' }),
				error,
			}));
		}
		yield put(AuthActions.setAuthenticationStatus(false));
	}
	yield put(AuthActions.setPendingStatus(false));
}

export function* login({ username, password }: LoginAction) {
	yield put(AuthActions.setPendingStatus(true));
	try {
		yield API.Auth.login(username, password);
		yield put(CurrentUserActions.getProfile());
		yield put(AuthActions.setAuthenticationStatus(true));
	} catch (error) {
		const data = error.response?.data;

		if (data?.status === 400) {
			const lockoutDuration = Math.round(ClientConfig.loginPolicy.lockoutDuration / 1000 / 60);

			switch (data?.code) {
				case 'INCORRECT_USERNAME_OR_PASSWORD':
					yield put(AuthActions.loginFailed(
						formatMessage({ id: 'auth.login.error.badFields', defaultMessage: 'Incorrect username or password. Please try again.' }),
					));
					break;
				case 'ALREADY_LOGGED_IN':
					yield put(AuthActions.authenticate());
					break;
				case 'TOO_MANY_LOGIN_ATTEMPTS':
					yield put(AuthActions.loginFailed(
						formatMessage(
							{
								id: 'auth.login.error.tooManyAttempts',
								defaultMessage: 'Too many unsuccessful login attempts! Account locked for {time} minutes.',
							}, { time: lockoutDuration },
						),
					));
					break;
				default:
					yield put(AuthActions.loginFailed(error.message));
					break;
			}
		} else yield put(AuthActions.loginFailed(error.message));
	}
	yield put(AuthActions.setPendingStatus(false));
}

function* logout() {
	yield put(AuthActions.setPendingStatus(true));
	try {
		yield API.Auth.logout();
		yield put({ type: 'RESET_APP' });
	} catch (error) {
		if (error.response?.status !== 401) {
			yield put(DialogsActions.open('alert', {
				currentActions: formatMessage({ id: 'auth.logout.error', defaultMessage: 'trying to log out' }),
				error,
			}));
			yield put({ type: 'RESET_APP' });
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
