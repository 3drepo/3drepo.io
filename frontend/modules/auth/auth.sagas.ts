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

import { push } from 'connected-react-router';
import { put, take, takeLatest } from 'redux-saga/effects';

import { NewTermsDialog } from '../../routes/components/newTermsDialog/newTermsDialog.component';
import * as API from '../../services/api';
import { CurrentUserActions } from '../currentUser';
import { DialogActions } from '../dialog';
import { changePasswordMessages, forgotPasswordMessages, verificationMessages } from './auth.helpers';
import { AuthActions, AuthTypes } from './auth.redux';

function* login({ username, password }) {
	yield put(AuthActions.setPendingStatus(true));

	try {
		// tslint:disable-next-line:no-shadowed-variable
		const {data} = yield API.login(username, password);
		const flags = data.flags;
		username = data.username;

		yield put(CurrentUserActions.fetchUserSuccess({
			username,
			avatarUrl: API.getAvatarUrl(username)
		}));
		yield put(AuthActions.loginSuccess());

		if (flags && flags.termsPrompt) {
			yield put(DialogActions.showDialog({
				title: 'Terms and Privacy Policy Update',
				template: NewTermsDialog
			}));
		}
	} catch (e) {
		if (e.response.status === 401) {
			yield put(AuthActions.loginFailure());
		} else if (e.response.status === 400 && e.response.code === 'ALREADY_LOGGED_IN') {
			yield put(AuthActions.authenticate());
		} else {
			yield put(DialogActions.showEndpointErrorDialog('login', 'user', e));
		}
	}
	yield put(AuthActions.setPendingStatus(false));
}

function* logout() {
	try {
		yield API.logout();
		yield put({ type: 'RESET_APP' });
		yield put(AuthActions.loginFailure());
	} catch (e) {
		if (e.response.status === 401) {
			yield put({ type: 'RESET_APP' });
			yield put(AuthActions.loginFailure());
		} else {
			yield put(DialogActions.showEndpointErrorDialog('logout', 'user', e));
		}
	}
	yield put(AuthActions.setLocalSessionStatus(false));

}

function* authenticate() {
	yield put(AuthActions.setPendingStatus(true));
	try {
		const { data: { username }} = yield API.authenticate();
		yield put(CurrentUserActions.fetchUserSuccess({
			username,
			avatarUrl: API.getAvatarUrl(username)
		}));

		yield put(AuthActions.loginSuccess());
	} catch (e) {
		if (e.response.status === 401) {
			yield put(AuthActions.loginFailure());
		} else {
			yield put(DialogActions.showEndpointErrorDialog('authenticate', 'user', e));
		}
	}
}

function* sessionExpired() {
	try {
		yield put({ type: 'RESET_APP' });
		yield put(AuthActions.setLocalSessionStatus(false));
		yield put(AuthActions.loginFailure());
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('verify', 'user session', e));
	}
}

function* sendPasswordChangeRequest({ userNameOrEmail }) {
	yield put(AuthActions.setPendingStatus(true));

	try {
		yield API.forgotPassword(userNameOrEmail);
		yield put(AuthActions.setAuthMessage(forgotPasswordMessages.success));

	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('send', 'request', e));
	}
	yield put(AuthActions.setPendingStatus(false));
}

function* changePassword({ username, token, password }) {
	yield put(AuthActions.setPendingStatus(true));

	try {
		yield API.changePassword(username, token, password);
		yield put(AuthActions.setAuthMessage(changePasswordMessages.success));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('change', 'password', e));
	}

	yield put(AuthActions.setPendingStatus(false));
}

function* register({ username, data }) {
	yield put(AuthActions.setPendingStatus(true));

	try {
		yield API.register(username, data);
		yield put(push('register-request'));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('register', 'user', e));
	}
	yield put(AuthActions.setPendingStatus(false));
}

function* verify({ username, token }) {
	yield put(AuthActions.setPendingStatus(true));

	try {
		yield API.verify(username, token);
		yield put(AuthActions.setAuthMessage(verificationMessages.success));
	} catch (e) {
		if (e.response.data.code === 'ALREADY_VERIFIED') {
			yield put(AuthActions.setAuthMessage(verificationMessages.alreadyVerified));
		} else {
			yield put(AuthActions.setAuthMessage(e.response.data.message));
		}
	}
	yield put(AuthActions.setPendingStatus(false));
}

function* onLoggedOut() {
	yield put(AuthActions.logout());
	yield take('RESET_APP');
	yield take('RESET_APP');
	yield put(DialogActions.showLoggedOutDialog());
}

export default function* AuthSaga() {
	yield takeLatest(AuthTypes.AUTHENTICATE, authenticate);
	yield takeLatest(AuthTypes.LOGIN, login);
	yield takeLatest(AuthTypes.LOGOUT, logout);
	yield takeLatest(AuthTypes.SESSION_EXPIRED, sessionExpired);
	yield takeLatest(AuthTypes.SEND_PASSWORD_CHANGE_REQUEST, sendPasswordChangeRequest);
	yield takeLatest(AuthTypes.CHANGE_PASSWORD, changePassword);
	yield takeLatest(AuthTypes.REGISTER, register);
	yield takeLatest(AuthTypes.VERIFY, verify);
	yield takeLatest(AuthTypes.ON_LOGGED_OUT, onLoggedOut);
}
