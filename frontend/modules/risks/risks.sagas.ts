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
import { RisksTypes, RisksActions } from './risks.redux';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';

export function* fetchRisks({teamspace, modelId, revision}) {
	try {
		const {data} = yield API.getRisks(teamspace, modelId, revision);
		yield put(RisksActions.fetchRisksSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'risks', error));
	}
}

export function* saveRisk({ teamspace, modelId, riskData }) {
	try {
		const { data } = yield API.saveRisk(teamspace, modelId, riskData);
		yield put(RisksActions.saveRiskSuccess(data));
		yield put(SnackbarActions.show('Risk created'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('save', 'risk', error));
	}
}

export function* updateRisk({ teamspace, modelId, riskData }) {
	try {
		const { data } = yield API.updateRisk(teamspace, modelId, riskData);
		yield put(RisksActions.saveRiskSuccess(data));
		yield put(SnackbarActions.show('Risk updated'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'risk', error));
	}
}

export default function* RisksSaga() {
	yield takeLatest(RisksTypes.FETCH_RISKS, fetchRisks);
	yield takeLatest(RisksTypes.SAVE_RISK, saveRisk);
	yield takeLatest(RisksTypes.UPDATE_RISK, updateRisk);
}
