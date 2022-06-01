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

import {
	CurrentUserActions,
	CurrentUserTypes,
	UpdatePersonalDataAction,
} from './currentUser.redux';

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

export function* updatePersonalData({ personalData: { avatarFile, ...restOfPersonalData } }: UpdatePersonalDataAction) {
	yield put(CurrentUserActions.setPersonalDataIsUpdating(true));
	try {
		yield API.CurrentUser.updateUser(restOfPersonalData);
		if (avatarFile) {
			const formData = new FormData();
			formData.append('file', avatarFile);
			yield API.CurrentUser.updateAvatar(formData);
			const avatarUrl = URL.createObjectURL(avatarFile);
			yield put(CurrentUserActions.updateUserSuccess({ avatarUrl }));
		}
		yield put(CurrentUserActions.updateUserSuccess(restOfPersonalData));
		yield put(CurrentUserActions.setPersonalError(''));
	} catch (error) {
		yield put(CurrentUserActions.setPersonalError(error?.response?.data));
	}
	yield put(CurrentUserActions.setPersonalDataIsUpdating(false));
}

export function* generateApiKey() {
	yield put(CurrentUserActions.setApiKeyIsUpdating(true));
	try {
		const apiKey = yield API.CurrentUser.generateApiKey();
		yield put(CurrentUserActions.updateUserSuccess(apiKey));
		yield put(CurrentUserActions.setApiKeyError(''));
	} catch (error) {
		yield put(CurrentUserActions.setApiKeyError(error?.response?.data));
	}
	yield put(CurrentUserActions.setApiKeyIsUpdating(false));
}

export function* deleteApiKey() {
	yield put(CurrentUserActions.setApiKeyIsUpdating(true));
	try {
		yield API.CurrentUser.deleteApiKey();
		yield put(CurrentUserActions.updateUserSuccess({ apiKey: null }));
		yield put(CurrentUserActions.setApiKeyError(''));
	} catch (error) {
		yield put(CurrentUserActions.setApiKeyError(error?.response?.data));
	}
	yield put(CurrentUserActions.setApiKeyIsUpdating(false));
}

export default function* AuthSaga() {
	yield takeLatest(CurrentUserTypes.FETCH_USER, fetchUser);
	yield takeLatest(CurrentUserTypes.UPDATE_PERSONAL_DATA, updatePersonalData);
	yield takeLatest(CurrentUserTypes.GENERATE_API_KEY, generateApiKey);
	yield takeLatest(CurrentUserTypes.DELETE_API_KEY, deleteApiKey);
}
