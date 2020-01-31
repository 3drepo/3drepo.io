/**
 *  Copyright (C) 2020 3D Repo Ltd
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
import { SnackbarActions } from '../snackbar';
import { TeamspaceActions, TeamspaceTypes } from './';

export function* fetchSettings({ teamspace }) {
	try {
		yield put(TeamspaceActions.setPendingState(true));
		const { data } = yield API.fetchTeamspaceSettings(teamspace);

		yield put(TeamspaceActions.fetchSettingsSuccess(data));
		yield put(TeamspaceActions.setPendingState(false));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'teamspace settings', e));
	}
}

export function* updateSettings({ teamspace, settings }) {
	try {
		const { data } = yield API.editTeamspaceSettings(teamspace, settings);
		yield put(TeamspaceActions.fetchSettingsSuccess(data));
		yield put(SnackbarActions.show('Updated teamspace settings'));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'teamspace settings', e));
	}
}

export default function* TeamspaceSaga() {
	yield takeLatest(TeamspaceTypes.FETCH_SETTINGS, fetchSettings);
	yield takeLatest(TeamspaceTypes.UPDATE_SETTINGS, updateSettings);
}
