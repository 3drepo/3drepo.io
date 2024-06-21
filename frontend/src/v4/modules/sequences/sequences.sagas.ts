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

import { all, call, put, select, take, takeLatest } from 'redux-saga/effects';
import { DialogsActionsDispatchers } from '@/v5/services/actionsDispatchers';

import { VIEWER_PANELS } from '../../constants/viewerGui';

import * as API from '../../services/api';
import { DataCache, STORE_NAME } from '../../services/dataCache';
import { DialogActions } from '../dialog';
import { selectCurrentModel, selectCurrentModelTeamspace, selectCurrentRevisionId } from '../model';
import { dispatch } from '../store';
import { TreeActions } from '../tree';

import { selectCacheSetting } from '../viewer';
import { selectLeftPanels, ViewerGuiActions } from '../viewerGui';
import { ViewpointsActions } from '../viewpoints';
import { convertStateDefToViewpoint, getDateWithinBoundaries, getSelectedFrame, MODAL_DATE_NOT_AVAILABLE_BODY, MODAL_TODAY_NOT_AVAILABLE_BODY } from './sequences.helper';
import {
	selectActivitiesDefinitions, selectFrames, selectNextKeyFramesDates, selectSelectedDate, selectSelectedFrameViewpoint,
	selectSelectedSequence, selectSequences, selectSequenceModel, selectOpenOnToday,
} from './sequences.selectors';
import { selectSelectedSequenceId, SequencesActions, SequencesTypes } from '.';

function* getSequenceModel(sequenceId) {
	const sequences = yield select(selectSequences);
	return ((sequences || []).find((s) => s._id === sequenceId) || {}).model;
}

export function* fetchSequence({sequenceId}) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const model = yield getSequenceModel(sequenceId);
		const response = yield API.getSequence(teamspace, model, sequenceId);
		yield put(SequencesActions.fetchActivitiesDefinitions(sequenceId));
		yield put(SequencesActions.fetchSequenceSuccess(response.data));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'sequences', error));
	}
}

export function* fetchSequenceList() {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectCurrentModel);

		const response = yield API.getSequenceList(teamspace, model, revision);
		yield put(SequencesActions.fetchSequenceListSuccess(response.data));

	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'sequences', error));
	}
}

export function* updateSequence({ sequenceId, newName }) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const model = yield select(selectSequenceModel);

		if (sequenceId) {
			yield API.patchSequence(teamspace, model, sequenceId, newName);
			yield put(SequencesActions.updateSequenceSuccess(sequenceId, newName));
		}

	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'sequence', error));
	}
}

export function* fetchActivitiesDefinitions({ sequenceId }) {
	try {
		yield put(SequencesActions.setActivitiesPending(true));
		const teamspace = yield select(selectCurrentModelTeamspace);
		const model = yield getSequenceModel(sequenceId);
		const activitiesDefinitions = yield select(selectActivitiesDefinitions);

		if (!activitiesDefinitions && sequenceId) {
			// API CALL TO GET TASKS
			const {data} = yield API.getSequenceActivities(teamspace, model, sequenceId);
			yield put(SequencesActions.fetchActivitiesDefinitionsSuccess(sequenceId, data.activities));
		}
		yield put(SequencesActions.setActivitiesPending(false));

	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'sequences', error));
		yield put(SequencesActions.fetchActivitiesDefinitionsSuccess(sequenceId, []));
	}
}

export function* fetchFrame({ date }) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const model = yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);
		const frames = yield select(selectFrames);
		const selectedDate = yield select(selectSelectedDate);
		const dateIsSelectedDate = selectedDate.valueOf() === date.valueOf()
		const { state: stateId, viewpoint } = getSelectedFrame(frames, date);

		if (stateId) {
			const cacheEnabled = yield select(selectCacheSetting);
			const iDBKey = `${teamspace}.${model}.${stateId}.3DRepo`;

			const cachedDataPromise = cacheEnabled ? DataCache.getValue(STORE_NAME.FRAMES, iDBKey) : Promise.resolve();
			// Using directly the promise and 'then' to dispatch the rest of the actions
			// because with yield it would sometimes stop there forever even though the promise resolved
			cachedDataPromise.then((cachedData) => {
				const fetchPromise = cachedData ? Promise.resolve({ data: cachedData })
					: API.getSequenceState(teamspace, model, sequenceId, stateId);
				fetchPromise.then((response) => {
					const viewpointFromState = convertStateDefToViewpoint(response.data);
					dispatch(SequencesActions.updateFrameWithViewpoint(sequenceId, stateId, viewpointFromState));
					if (dateIsSelectedDate) {
						put(ViewpointsActions.fetchViewpointGroups(teamspace, model, viewpointFromState));
						dispatch(SequencesActions.setFramePending(false));
					}
					if (cacheEnabled && !cachedData) {
						DataCache.putValue(STORE_NAME.FRAMES, iDBKey, response.data);
					}
				});
			}).catch(() => {
				dispatch(SequencesActions.updateFrameWithViewpoint(sequenceId, stateId, {}));
			});
		} else {
			// This is to avoid fetching the groups twice.
			// When showViewpoint is called in showFrameViewpoint it fetches the groups
			if (dateIsSelectedDate) {
				yield put(ViewpointsActions.fetchViewpointGroups(teamspace, model, { viewpoint }));
				yield put(SequencesActions.setFramePending(false));
			}
		}
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('fetch frame', 'sequences', error));
	}
}

function * showFrameViewpoint() {
	const teamspace = yield select(selectCurrentModelTeamspace);
	const model = yield select(selectSequenceModel);
	const viewpoint = yield select(selectSelectedFrameViewpoint);
	if (viewpoint) {
		yield put(ViewpointsActions.showViewpoint(teamspace, model, { viewpoint }));
	}
}

function * prefetchFrames() {
	const keyframes = yield select(selectNextKeyFramesDates);
	yield all(keyframes.map((date) => call(fetchFrame, { date })));
}

export function* setSelectedDate({ date }) {
	try {
		const selectedSequence = yield select(selectSelectedSequence);
		const openOnToday = yield select(selectOpenOnToday);
		yield put(SequencesActions.setFramePending(true));

		if (selectedSequence) {
			// bound date by sequence start/end date
			const { startDate, endDate } = yield select(selectSelectedSequence);
			let dateToSelect;

			if (date) {
				dateToSelect = getDateWithinBoundaries(date, startDate, endDate);

				if (dateToSelect.getTime() !== new Date(date).getTime()) {
					DialogsActionsDispatchers.open('info', MODAL_DATE_NOT_AVAILABLE_BODY);
				}
			} else {
				// if no date is passed, use today or the sequence start date (depening on openOnToday)
				const defaultDate = openOnToday ? new Date() : new Date(startDate);
				dateToSelect = getDateWithinBoundaries(defaultDate, startDate, endDate);

				if (dateToSelect.getTime() !== defaultDate.getTime()) {
					DialogsActionsDispatchers.open('info', MODAL_TODAY_NOT_AVAILABLE_BODY);
				}
			}
			yield put(SequencesActions.setSelectedDateSuccess(dateToSelect));
			yield put(SequencesActions.prefetchFrames());
			yield take(SequencesTypes.SET_FRAME_PENDING)
			yield showFrameViewpoint();
		}
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('select frame', 'sequences', error));
	}
}

export function* restoreModelDefaultVisibility() {
	yield put(ViewerGuiActions.clearColorOverrides());
	yield put(TreeActions.showAllNodes());
	yield put(TreeActions.showHiddenGeometry());
}

export function* setSelectedSequence({ sequenceId }) {
	if (sequenceId) {
		yield put(SequencesActions.fetchSequence(sequenceId));
		yield take(SequencesTypes.FETCH_SEQUENCE_SUCCESS);
		yield put(SequencesActions.setSelectedSequenceSuccess(sequenceId));
	} else {
		const selectedSequence = yield select(selectSelectedSequence);
		if (selectedSequence) {
			yield put(SequencesActions.setSelectedDateSuccess(null));
			yield put(SequencesActions.restoreModelDefaultVisibility());
		}
		yield put(SequencesActions.setSelectedSequenceSuccess(sequenceId));
		yield put(SequencesActions.fetchActivitiesDefinitions(sequenceId));
	}
}

export function* showSequenceDate({ date }) {
	const sequences = yield select(selectSequences);
	if (!sequences.length) {
		return;
	}

	const selectedSequenceId = yield select(selectSelectedSequenceId);
	if (!selectedSequenceId) {
		// if there is no selected sequence, select the first one
		yield put(SequencesActions.setSelectedSequence(sequences[0]._id));
		yield take(SequencesTypes.SET_SELECTED_SEQUENCE_SUCCESS);
	}

	yield put(SequencesActions.setSelectedDate(date));

	const sequencePanelVisible = (yield select(selectLeftPanels)).includes[VIEWER_PANELS.SEQUENCES];
	if (!sequencePanelVisible) {
		// if sequence panel is closed, open it
		yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.SEQUENCES, true));
	}
}

export default function* SequencesSaga() {
	yield takeLatest(SequencesTypes.FETCH_SEQUENCE, fetchSequence);
	yield takeLatest(SequencesTypes.FETCH_SEQUENCE_LIST, fetchSequenceList);
	yield takeLatest(SequencesTypes.UPDATE_SEQUENCE, updateSequence);
	yield takeLatest(SequencesTypes.SET_SELECTED_DATE, setSelectedDate);
	yield takeLatest(SequencesTypes.FETCH_FRAME, fetchFrame);
	yield takeLatest(SequencesTypes.RESTORE_MODEL_DEFAULT_VISIBILITY, restoreModelDefaultVisibility);
	yield takeLatest(SequencesTypes.FETCH_ACTIVITIES_DEFINITIONS, fetchActivitiesDefinitions);
	yield takeLatest(SequencesTypes.SET_SELECTED_SEQUENCE, setSelectedSequence);
	yield takeLatest(SequencesTypes.PREFETCH_FRAMES, prefetchFrames);
	yield takeLatest(SequencesTypes.SHOW_SEQUENCE_DATE, showSequenceDate);
}
