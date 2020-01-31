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

import { all, put, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { TeamspaceActions, TeamspaceTypes } from './';
import { teamspace as teamspaceResponse } from './teamspace.helper';

export function* fetchSettings({ teamspace }) {
	try {
		yield put(TeamspaceActions.setPendingState(true));
		const { data } = yield API.fetchTeamspaceSettings(teamspace);

		yield put(TeamspaceActions.fetchSettingsSuccess(data));
		yield put(TeamspaceActions.setPendingState(false));
	} catch (e) {
		yield put(TeamspaceActions.fetchSettingsSuccess(teamspaceResponse));
		yield put(TeamspaceActions.setPendingState(false));
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'teamspace settings', e));
	}
}

// export function* activateTeamspace() {
// 	try {
// 		yield all([
// 			put(TeamspaceActions.setActiveSuccess(true))
// 		]);
// 	} catch (error) {
// 		DialogActions.showErrorDialog('activate', 'measure', error);
// 	}
// }
//
// export function* deactivateTeamspace() {
// 	try {
// 		yield all([
// 			put(TeamspaceActions.setActiveSuccess(false))
// 		]);
// 	} catch (error) {
// 		DialogActions.showErrorDialog('deactivate', 'measure', error);
// 	}
// }
//
// export function* setTeamspaceActive({ isActive }) {
// 	try {
// 		if (isActive) {
// 			yield put(TeamspaceActions.activateTeamspace());
// 		} else {
// 			yield put(TeamspaceActions.deactivateTeamspace());
// 		}
// 	} catch (error) {
// 		DialogActions.showErrorDialog('toggle', 'measure', error);
// 	}
// }
//
// export function* setDisabled({ isDisabled }) {
// 	try {
// 		yield put(TeamspaceActions.setDisabledSuccess(isDisabled));
//
// 		if (isDisabled) {
// 			yield put(TeamspaceActions.setActiveSuccess(false));
// 		}
// 	} catch (error) {
// 		DialogActions.showErrorDialog('deactivate', 'measure', error);
// 	}
// }

export default function* TeamspaceSaga() {
	yield takeLatest(TeamspaceTypes.FETCH_SETTINGS, fetchSettings);
	// yield takeLatest(TeamspaceTypes.ACTIVATE_MEASURE, activateTeamspace);
	// yield takeLatest(TeamspaceTypes.DEACTIVATE_MEASURE, deactivateTeamspace);
	// yield takeLatest(TeamspaceTypes.SET_MEASURE_ACTIVE, setTeamspaceActive);
	// yield takeLatest(TeamspaceTypes.SET_DISABLED, setDisabled);
}
