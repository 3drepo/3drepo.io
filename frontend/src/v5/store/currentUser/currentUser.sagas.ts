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
import { CurrentUserActions, CurrentUserTypes } from './currentUser.redux';

export function* getProfile() {
	try {
		const userData = yield API.CurrentUser.getProfile();
		const avatarUrl = generateV5ApiUrl(`user/avatar?${Date.now()}`, clientConfigService.GET_API);
		yield put(CurrentUserActions.getProfileSuccess({
			...userData,
			avatarUrl,
		}));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'currentUser.getProfile.error', defaultMessage: 'trying to fetch current user details' }),
			error,
		}));
	}
}

export default function* AuthSaga() {
	yield takeLatest(CurrentUserTypes.GET_PROFILE, getProfile);
}
