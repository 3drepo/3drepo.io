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

import { put, select, takeLatest } from 'redux-saga/effects';

import { VIEWER_PANELS } from '../../constants/viewerGui';
import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { selectCurrentModelTeamspace, selectCurrentRevisionId, ModelActions } from '../model';
import { selectSelectedSequenceId, selectSequenceModel } from '../sequences';
import { SnackbarActions } from '../snackbar';
import { ViewerGuiActions} from '../viewerGui';
import { transformLegend, transformToLegendObj } from './legend.helpers';
import { LegendActions, LegendTypes } from './legend.redux';
import { selectLegend } from './legend.selectors';

function* fetch() {
	try {
		yield put(LegendActions.togglePendingState(true));
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model =  yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);

		const { data } = yield API.getSequenceLegend(teamspace, model, revision, sequenceId);

		const legend = transformLegend(data);

		if (legend.length) {
			yield put(LegendActions.togglePendingState(false));
			yield put(LegendActions.fetchSuccess(legend));
		}

	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'legend', error));
	}
}

function* toggleLegendPanel() {
	try {
		yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.LEGEND));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'legend', error));
	}
}

function* update({ legend }) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model =  yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);

		const updatedLegend = [...legend];
		const legendObj = transformToLegendObj(legend);

		const response = yield API.putSequenceLegend(teamspace, model, revision, sequenceId, legendObj);

		if (response.status === 200) {
			yield put(LegendActions.fetchSuccess(updatedLegend));
			yield put(SnackbarActions.show('Legend updated'));
		}

	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'legend', error));
	}
}

function* reset() {
	try {
		yield put(LegendActions.togglePendingState(true));
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model =  yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);

		const { data } = yield API.deleteSequenceLegend(teamspace, model, revision, sequenceId);

		const legend = transformLegend(data);

		if (legend.length) {
			yield put(LegendActions.togglePendingState(false));
			yield put(LegendActions.fetchSuccess(legend));
			yield put(SnackbarActions.show('Legend reset to default'));
		}

	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'legend', error));
	}
}

function* updateLegendItem({ legendItem }) {
	try {
		const legend = yield select(selectLegend);
		const index = legend.findIndex(({ name }) => name === legendItem.name);

		if (!legend[index]) {
			legend.push(legendItem);
		} else {
			legend[index] = legendItem;
		}

		yield put(LegendActions.update(legend));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update item', 'legend', error));
	}
}

function* deleteLegendItem({ legendItem }) {
	try {
		const legend = yield select(selectLegend);
		const index = legend.findIndex(({ name }) => name === legendItem.name);

		if (index > -1) {
			legend.splice(index, 1);
		}

		yield put(LegendActions.update(legend));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update item', 'legend', error));
	}
}

function* setDefaultLegend() {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const model =  yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);
		const modelData = { teamspace, model };

		yield put(ModelActions.updateSettings(modelData, {
			defaultLegend: sequenceId,
		}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set default', 'legend', error));
	}
}

export default function* LegendSaga() {
	yield takeLatest(LegendTypes.FETCH, fetch);
	yield takeLatest(LegendTypes.TOGGLE_PANEL, toggleLegendPanel);
	yield takeLatest(LegendTypes.UPDATE, update);
	yield takeLatest(LegendTypes.RESET, reset);
	yield takeLatest(LegendTypes.SET_DEFAULT, setDefaultLegend);
	yield takeLatest(LegendTypes.UPDATE_LEGEND_ITEM, updateLegendItem);
	yield takeLatest(LegendTypes.DELETE_LEGEND_ITEM, deleteLegendItem);
}
