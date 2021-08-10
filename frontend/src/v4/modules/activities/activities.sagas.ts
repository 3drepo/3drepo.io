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

import { put, select, takeLatest } from 'redux-saga/effects';

import { VIEWER_PANELS } from '../../constants/viewerGui';
import * as API from '../../services/api';
import { BimActions } from '../bim';
import { DialogActions } from '../dialog';
import { selectCurrentModelTeamspace, selectCurrentRevisionId } from '../model';
import { selectSelectedSequenceId, selectSequenceModel } from '../sequences';
import { selectRightPanels, ViewerGuiActions} from '../viewerGui';
import { ActivitiesActions, ActivitiesTypes } from './activities.redux';

function* fetchDetails({ activityId }) {
	try {
		const rightPanels = yield select(selectRightPanels);
		if (!rightPanels.includes(VIEWER_PANELS.ACTIVITIES)) {
			yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.ACTIVITIES, true));
		}

		if (rightPanels.includes(VIEWER_PANELS.BIM)) {
			yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.BIM, false));
			yield put(BimActions.setIsActive(false));
		}

		yield put(ActivitiesActions.setComponentState({ showDetails: true, isPending: true }));

		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model =  yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);

		const { data: activity } = yield API.getSequenceActivityDetail(teamspace, model, sequenceId, activityId);

		yield put(ActivitiesActions.setComponentState({ isPending: false, details: activity }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'activity details', error));
	}
}

function* toggleActivitiesPanel() {
	try {
		const rightPanels = yield select(selectRightPanels);

		if (rightPanels.includes(VIEWER_PANELS.BIM)) {
			yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.BIM, false));
			yield put(BimActions.setIsActive(false));
		}

		yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.ACTIVITIES));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'activities panel', error));
	}
}

export default function* ActivitiesSaga() {
	yield takeLatest(ActivitiesTypes.FETCH_DETAILS, fetchDetails);
	yield takeLatest(ActivitiesTypes.TOGGLE_ACTIVITIES_PANEL, toggleActivitiesPanel);
}
