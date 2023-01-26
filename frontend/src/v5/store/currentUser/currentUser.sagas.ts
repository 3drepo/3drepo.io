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

import { ViewerActions } from '@/v4/modules/viewer';
import * as API from '@/v5/services/api';
import { getUrl } from '@/v5/services/api/default';
import { formatMessage } from '@/v5/services/intl';
import { put, takeLatest } from 'redux-saga/effects';
import { DialogsActions } from '../dialogs/dialogs.redux';
import {
	CurrentUserActions,
	CurrentUserTypes,
	UpdatePersonalDataAction,
} from './currentUser.redux';

export function* fetchUser() {
	try {
		const userData = yield API.CurrentUser.fetchUser();
		const avatarUrl = getUrl(`user/avatar?${Date.now()}`);
		yield put(CurrentUserActions.fetchUserSuccess({
			...userData,
			avatarUrl,
		}));
		yield put(ViewerActions.fetchSettings());
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'currentUser.fetchUser.error', defaultMessage: 'trying to fetch current user details' }),
			error,
		}));
	}
}

export function* updatePersonalData({
	personalData: { avatarFile, ...restOfPersonalData },
	onSuccess,
	onError,
}: UpdatePersonalDataAction) {
	yield put(CurrentUserActions.setPersonalDataIsUpdating(true));
	try {
		yield API.CurrentUser.updateUser(restOfPersonalData);
		if (avatarFile) {
			const formData = new FormData();
			formData.append('file', avatarFile);
			yield API.CurrentUser.updateAvatar(formData);
			const avatarUrl = URL.createObjectURL(avatarFile);
			yield put(CurrentUserActions.updateUserSuccess({ avatarUrl, hasAvatar: true }));
		}
		yield put(CurrentUserActions.updateUserSuccess(restOfPersonalData));
		onSuccess();
	} catch (error) {
		onError(error);
	}
	yield put(CurrentUserActions.setPersonalDataIsUpdating(false));
}

export function* generateApiKey() {
	yield put(CurrentUserActions.setApiKeyIsUpdating(true));
	try {
		const apiKey = yield API.CurrentUser.generateApiKey();
		yield put(CurrentUserActions.updateUserSuccess(apiKey));
	} catch(error) { } // eslint-disable-line
	yield put(CurrentUserActions.setApiKeyIsUpdating(false));
}

export function* deleteApiKey() {
	yield put(CurrentUserActions.setApiKeyIsUpdating(true));
	try {
		yield API.CurrentUser.deleteApiKey();
		yield put(CurrentUserActions.updateUserSuccess({ apiKey: null }));
	} catch(error) { } // eslint-disable-line
	yield put(CurrentUserActions.setApiKeyIsUpdating(false));
}

export default function* CurrentUserSaga() {
	yield takeLatest(CurrentUserTypes.FETCH_USER, fetchUser);
	yield takeLatest(CurrentUserTypes.UPDATE_PERSONAL_DATA, updatePersonalData);
	yield takeLatest(CurrentUserTypes.GENERATE_API_KEY, generateApiKey);
	yield takeLatest(CurrentUserTypes.DELETE_API_KEY, deleteApiKey);
}
