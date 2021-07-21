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
import { selectCurrentModelTeamspace, ModelActions } from '../model';
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
		const model =  yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);

		const { data } = yield API.getSequenceLegend(teamspace, model, sequenceId);

		const legend = transformLegend(data);

		yield put(LegendActions.togglePendingState(false));
		yield put(LegendActions.fetchSuccess(legend));
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
		yield put(LegendActions.toggleUpdatePendingState(true));
		const teamspace = yield select(selectCurrentModelTeamspace);
		const model =  yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);

		const updatedLegend = [...legend];
		const legendObj = transformToLegendObj(legend);

		const response = yield API.putSequenceLegend(teamspace, model, sequenceId, legendObj);

		if (response.status === 200) {
			yield put(LegendActions.toggleUpdatePendingState(false));
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
		const model =  yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);

		yield API.deleteSequenceLegend(teamspace, model, sequenceId);
		yield put(LegendActions.fetch());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'legend', error));
	}
}

function* updateLegendItem({ legendItem: { oldName, name, color } }) {
	try {
		const legend = yield select(selectLegend);
		const valueToCompare = oldName || name;
		const index = legend.findIndex((item) => item.name === valueToCompare);

		if (!legend[index]) {
			legend.push({
				name,
				color,
			});
		} else {
			legend[index] = {
				name,
				color,
			};
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
		const modelId =  yield select(selectSequenceModel);
		const defaultLegend =  yield select(selectSelectedSequenceId);

		yield API.editModelSettings(teamspace, modelId, { defaultLegend });
		yield put(ModelActions.updateSettingsSuccess({ defaultLegend }));
		yield put(SnackbarActions.show('Legend set as default'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set default', 'legend', error));
	}
}

function* resetPanel() {
	try {
		yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.LEGEND, false));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'legend', error));
	}
}

export function* prepareNewLegendItem({ legendItem }) {
	try {
		yield put(LegendActions.setComponentState({ ...legendItem, editMode: true }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('prepare', 'new legend'));
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
	yield takeLatest(LegendTypes.PREPARE_NEW_LEGEND_ITEM, prepareNewLegendItem);
	yield takeLatest(LegendTypes.RESET_PANEL, resetPanel);
}
