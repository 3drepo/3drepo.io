/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { clientConfigService } from '@/v4/services/clientConfig';
import * as API from '@/v5/services/api';
import { generateV5ApiUrl } from '@/v5/services/api/default';
import { formatMessage } from '@/v5/services/intl';
import { put, takeLatest } from 'redux-saga/effects';
import { DialogsActions } from '../dialogs/dialogs.redux';
import { CurrentUserActions, CurrentUserTypes, UpdateUserAction, UpdateUserAvatarAction } from './currentUser.redux';

export function* fetchUser() {
	try {
		const userData = yield API.CurrentUser.fetchUser();
		const avatarUrl = generateV5ApiUrl(`user/avatar?${Date.now()}`, clientConfigService.GET_API);
		yield put(CurrentUserActions.fetchUserSuccess({
			...userData,
			avatarUrl,
		}));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'currentUser.fetchUser.error', defaultMessage: 'trying to fetch current user details' }),
			error,
		}));
	}
}

export function* updateUser({ userData }: UpdateUserAction) {
	yield put(CurrentUserActions.setIsPending(true));
	try {
		yield API.CurrentUser.updateUser(userData);
		yield put(CurrentUserActions.updateUserSuccess(userData));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'currentUser.updateUser.error',
				defaultMessage: 'trying to update current user details',
			}),
			error,
		}));
	}
	yield put(CurrentUserActions.setIsPending(false));
}

export function* updateUserAvatar({ avatarFile }: UpdateUserAvatarAction) {
	yield put(CurrentUserActions.setIsPending(true));
	try {
		const formData = new FormData();
		formData.append('file', avatarFile);
		yield API.CurrentUser.updateUserAvatar(formData);
		const avatarUrl = URL.createObjectURL(avatarFile);
		yield put(CurrentUserActions.updateUserAvatarSuccess(avatarUrl));
	} catch (error) {
		const message = error.response?.data.message;
		yield put(CurrentUserActions.updateUserAvatarFailure(message));
	}
	yield put(CurrentUserActions.setIsPending(false));
}

export function* updateUserPassword({ userData }: UpdateUserAction) {
	yield put(CurrentUserActions.setIsPending(true));
	try {
		yield API.CurrentUser.updateUser(userData);
	} catch (error) {
		const message = error.response?.data.message;
		yield put(CurrentUserActions.updateUserPasswordFailure(message));
	}
}

export function* generateApiKey() {
	yield put(CurrentUserActions.setIsPending(true));
	try {
		const apiKey = yield API.CurrentUser.generateApiKey();
		yield put(CurrentUserActions.updateUserSuccess(apiKey));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'currentUser.generateApiKey.error',
				defaultMessage: 'trying to generate API key',
			}),
			error,
		}));
	}
	yield put(CurrentUserActions.setIsPending(false));
}

export function* deleteApiKey() {
	yield put(CurrentUserActions.setIsPending(true));
	try {
		yield API.CurrentUser.deleteApiKey();
		yield put(CurrentUserActions.updateUserSuccess({ apiKey: null }));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'currentUser.deleteApiKey.error',
				defaultMessage: 'trying to delete API key',
			}),
			error,
		}));
	}
	yield put(CurrentUserActions.setIsPending(false));
}

export default function* AuthSaga() {
	yield takeLatest(CurrentUserTypes.FETCH_USER, fetchUser);
	yield takeLatest(CurrentUserTypes.UPDATE_USER, updateUser);
	// yield takeLatest(CurrentUserTypes.UPDATE_USER_PASSWORD, updateUserPassword);
	yield takeLatest(CurrentUserTypes.UPDATE_USER_AVATAR, updateUserAvatar);
	yield takeLatest(CurrentUserTypes.GENERATE_API_KEY, generateApiKey);
	yield takeLatest(CurrentUserTypes.DELETE_API_KEY, deleteApiKey);
}
