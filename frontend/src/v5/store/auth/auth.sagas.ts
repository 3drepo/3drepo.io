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
import { AuthActions, AuthenticateTeamspaceAction, AuthTypes, SetAuthenticatedTeamspaceAction } from './auth.redux';
import { DialogsActions } from '../dialogs/dialogs.redux';
import { CurrentUserActions } from '../currentUser/currentUser.redux';
import { cookies } from '@/v5/helpers/cookie.helper';
import axios from 'axios';
import { setPermissionModalSuppressed } from '@components/shared/updatePermissionModal/updatePermissionModal.helpers';
import { authBroadcastChannel } from './authBrodcastChannel';
import { ssoAuthTeamspace } from '@/v5/services/api/sso';

const CSRF_TOKEN = 'csrf_token';
const TOKEN_HEADER = 'X-CSRF-TOKEN';

function* authenticateTeamspace({ redirectUri, teamspace, onError }: AuthenticateTeamspaceAction) {
	try {
		const { data } = yield ssoAuthTeamspace(redirectUri, teamspace);
		window.location.replace(data.link);
	} catch (error) {
		onError?.(error);
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'auth.authenticate.error', defaultMessage: 'trying to authenticate teamspace' }),
			error,
		}));
	}
}

function* setAuthenticatedTeamspace({ teamspace }: SetAuthenticatedTeamspaceAction) {
	yield put(AuthActions.setAuthenticatedTeamspaceSuccess(teamspace));
	yield put(AuthActions.setSessionAuthenticatedTeamspaceSuccess(teamspace));
	authBroadcastChannel.postMessage(teamspace);
}

function* authenticate() {
	yield put(AuthActions.setIsAuthenticationPending(true));

	try {
		axios.defaults.headers[TOKEN_HEADER] = cookies(CSRF_TOKEN);
		const { data: { authenticatedTeamspace } } = yield API.Auth.authenticate();
		yield put(AuthActions.setAuthenticatedTeamspace(authenticatedTeamspace));
		yield put(CurrentUserActions.fetchUser());
		yield put(AuthActions.setIsAuthenticated(true));
		setPermissionModalSuppressed(false);
	} catch (error) {
		if (error.response?.status !== 401) {
			yield put(DialogsActions.open('alert', {
				currentActions: formatMessage({ id: 'auth.authenticate.error', defaultMessage: 'trying to authenticate' }),
				error,
			}));
		}
		yield put(AuthActions.setIsAuthenticated(false));
	}
	yield put(AuthActions.setIsAuthenticationPending(false));
}

function* logout() {
	yield put(AuthActions.setIsAuthenticationPending(true));
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
	yield put(AuthActions.setIsAuthenticated(false));
	yield put(AuthActions.setIsAuthenticationPending(false));
	yield put(AuthActions.setAuthenticatedTeamspace(null));
}

function* kickedOut() {
	yield put({ type: 'RESET_APP' });
	yield put(DialogsActions.open('warning', {
		title: formatMessage({
			id: 'auth.logout.kickedOutTitle',
			defaultMessage: 'You\'ve been logged out',
		}),
		message: formatMessage({
			id: 'auth.logout.kickedOutMessage',
			defaultMessage: 'Your account is being used in a different browser',
		}),
	}));
}

export default function* AuthSaga() {
	yield takeLatest(AuthTypes.SET_AUTHENTICATED_TEAMSPACE, setAuthenticatedTeamspace);
	yield takeLatest(AuthTypes.AUTHENTICATE_TEAMSPACE, authenticateTeamspace);
	yield takeLatest(AuthTypes.AUTHENTICATE, authenticate);
	yield takeLatest(AuthTypes.LOGOUT, logout);
	yield takeLatest(AuthTypes.KICKED_OUT, kickedOut);
}
