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

import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { selectCurrentModel, selectCurrentModelTeamspace, selectCurrentRevisionId } from '../model';
import { ActivitiesActions, ActivitiesTypes } from './activities.redux';

export function* fetchActivities() {
	try {
		yield put(ActivitiesActions.setPendingState(true));

		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectCurrentModel);

		const { data: activities } = yield API.getSequenceActivities(teamspace, model, revision);

		yield put(ActivitiesActions.fetchActivitiesSuccess(activities));
		yield put(ActivitiesActions.setPendingState(false));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'model activities', e.response));
	}
}

function* fetchDetails({ activityId }) {
	try {
		yield put(ActivitiesActions.setComponentState({ showDetails: true, isPending: true }));

		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectCurrentModel);

		console.error('fetchDetails activityId:', activityId);

		const { data: activity } = yield API.getSequenceActivityDetail(teamspace, model, revision, activityId);

		yield put(ActivitiesActions.setComponentState({ isPending: false, details: activity }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('display', 'activity details', error));
	}
}

export default function* ActivitiesSaga() {
	yield takeLatest(ActivitiesTypes.FETCH_ACTIVITIES, fetchActivities);
	yield takeLatest(ActivitiesTypes.FETCH_DETAILS, fetchDetails);
}
