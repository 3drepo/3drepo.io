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
import { DialogActions } from '../dialog';
import { ModelTypes, ModelActions } from './model.redux';
import { SnackbarActions } from './../snackbar';

export function* fetchSettings({ teamspace, modelId }) {
	try {
		const { data: settings } = yield API.getModelSettings(
			teamspace,
			modelId
		);
		yield put(ModelActions.fetchSettingsSuccess(settings));
	} catch (e) {
		put(DialogActions.showErrorDialog('fetch', 'model settings', e.response));
	}
}

export function* updateSettings({ teamspace, modelId, settings }) {
	try {
		const response = yield API.editModelSettings(
			teamspace,
			modelId,
			settings
		);

		if (response.status === 200) {
			yield put(SnackbarActions.show("Updated model settings"));
		}

	} catch (e) {
		put(DialogActions.showErrorDialog('update', 'model settings', e.response));
	}
}

export default function* ModelSaga() {
	yield takeLatest(ModelTypes.FETCH_SETTINGS, fetchSettings);
	yield takeLatest(ModelTypes.UPDATE_SETTINGS, updateSettings);
}
