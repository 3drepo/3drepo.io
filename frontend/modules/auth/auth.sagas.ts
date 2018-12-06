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
import { getAngularService } from '../../helpers/migration';
import { NewTermsDialog } from '../../routes/components/newTermsDialog/newTermsDialog.component';
import { CurrentUserActions } from '../currentUser';
import { getAvatarUrl } from '../currentUser/currentUser.sagas';
import { DialogActions } from '../dialog';
import { AuthActions, AuthTypes } from './auth.redux';
import { SnackbarActions } from '../snackbar';

export function* login({ username, password }) {
	yield put(AuthActions.setPendingStatus(true));

	try {
		const { data: { flags }} = yield API.login(username, password);

		if (flags && flags.termsPrompt) {
			yield put(DialogActions.showDialog({
				title: 'Terms and Privacy Policy Update',
				template: NewTermsDialog
			}));
		}

		// TODO: Replace to proper service after migration
		const AnalyticService = getAngularService('AnalyticService') as any;
		yield AnalyticService.setUserId(username);

		yield put(CurrentUserActions.fetchUserSuccess({
			username,
			avatarUrl: getAvatarUrl(username)
		}));
		yield put(AuthActions.loginSuccess());
	} catch (e) {
		if (e.response.status === 401) {
			yield put(AuthActions.loginFailure());
		} else if (e.response.status === 400) {
			yield put(AuthActions.authenticate());
		} else {
			yield put(DialogActions.showErrorDialog('login', 'user', e.response));
		}
	}
	yield put(AuthActions.setPendingStatus(false));
}

export function* logout() {
	try {
		yield API.logout();

		// TODO: Replace to proper service after migration
		const StateManager = getAngularService('StateManager') as any;
		StateManager.resetServiceStates();

		yield put({ type: 'RESET_APP' });
	} catch (e) {
		if (e.response.status === 401) {
			yield put({ type: 'RESET_APP' });
		} else {
			yield put(DialogActions.showErrorDialog('logout', 'user', e.response));
		}
	}
	yield put(AuthActions.setLocalSessionStatus(false));
}

export function* authenticate() {
	// TODO: Replace to proper service after migration
	const AuthService = getAngularService('AuthService') as any;

	try {
		const { data: { username }} = yield API.authenticate();
		yield put(CurrentUserActions.fetchUserSuccess({
			username,
			avatarUrl: getAvatarUrl(username)
		}));

		yield AuthService.initialAuthPromise.resolve();

		yield put(AuthActions.loginSuccess());
	} catch (e) {
		if (e.response.status === 401) {
			yield put(AuthActions.loginFailure());
		} else {
			yield put(DialogActions.showErrorDialog('authenticate', 'user', e.response));
		}
		yield AuthService.initialAuthPromise.reject();
	}
}

export function* sessionExpired() {
	try {
		// TODO: Replace to proper service after migration
		const StateManager = getAngularService('StateManager') as any;
		StateManager.resetServiceStates();

		yield put({ type: 'RESET_APP' });
		yield put(DialogActions.showDialog({
			title: 'Session expired',
			content: 'You have been logged out as your session has expired'
		}));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('verify', 'user session', e.response));
	}
}

export function* sendPasswordChangeRequest({ userNameOrEmail }) {
	yield put(AuthActions.setPendingStatus(true));

	try {
		yield API.forgotPassword(userNameOrEmail);
		yield put(SnackbarActions.show('Thank you. You will receive an email shortly with a link to change your password.'));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('send', 'request', e.response));
	}
	yield put(AuthActions.setPendingStatus(false));
}

export function* changePassword({ username, token, password }) {
	yield put(AuthActions.setPendingStatus(true));

	try {
		yield API.changePassword(username, token, password);
		yield put(SnackbarActions.show('Your password has been reset.'));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('change', 'password', e.response));
	}

	yield put(AuthActions.setPendingStatus(false));
}

export default function* AuthSaga() {
	yield takeLatest(AuthTypes.AUTHENTICATE, authenticate);
	yield takeLatest(AuthTypes.LOGIN, login);
	yield takeLatest(AuthTypes.LOGOUT, logout);
	yield takeLatest(AuthTypes.SESSION_EXPIRED, sessionExpired);
	yield takeLatest(AuthTypes.SEND_PASSWORD_CHANGE_REQUEST, sendPasswordChangeRequest);
	yield takeLatest(AuthTypes.CHANGE_PASSWORD, changePassword);
}
