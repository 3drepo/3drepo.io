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

import { all, put, select, take, takeLatest } from 'redux-saga/effects';

import { selectSelectedSequenceId, selectSelectedStateId, selectStateDefinitions,
	SequencesActions, SequencesTypes } from '.';
import { VIEWER_PANELS } from '../../constants/viewerGui';

import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { selectCurrentModel, selectCurrentModelTeamspace, selectCurrentRevisionId, selectIsFederation } from '../model';
import { dispatch } from '../store';
import { selectHiddenGeometryVisible, TreeActions } from '../tree';
import { selectLeftPanels, ViewerGuiActions } from '../viewerGui';
import { getSelectedFrame } from './sequences.helper';
import { selectActivitiesDefinitions, selectFrames,
	selectIfcSpacesHiddenSaved, selectNextKeyFramesDates,
	selectSelectedSequence, selectSequences, selectSequenceModel} from './sequences.selectors';

export function* fetchSequences() {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectCurrentModel);

		const response = yield API.getSequences(teamspace, model, revision);
		yield put(SequencesActions.fetchSequencesSuccess(response.data));

	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'sequences', error));
	}
}

export function* fetchActivitiesDefinitions({sequenceId}) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const isFederation = yield select(selectIsFederation);
		const revision = isFederation ? null : yield select(selectCurrentRevisionId);
		const model = yield select(selectSequenceModel);
		const activitiesDefinitions = yield select(selectActivitiesDefinitions);

		if (!activitiesDefinitions && sequenceId) {
			// API CALL TO GET TASKS
			const {data} = yield API.getSequenceActivities(teamspace, model, revision, sequenceId);
			yield put(SequencesActions.fetchActivitiesDefinitionsSuccess(sequenceId, data.tasks));
		}

	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'sequences', error));
		yield put(SequencesActions.fetchActivitiesDefinitionsSuccess(sequenceId, []));
	}
}

export function* fetchFrame({date}) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);

		const loadedStates = yield select(selectStateDefinitions);
		const frames = yield select(selectFrames);
		const frame = getSelectedFrame(frames, date);

		const stateId = frame.state;

		if (!loadedStates[stateId]) {
			// Using directly the promise and 'then' to dispatch the rest of the actions
			// because with yield it would sometimes stop there forever even though the promise resolved
			API.getSequenceState(teamspace, model, revision, sequenceId, stateId).then((response) => {
				dispatch(SequencesActions.setStateDefinition(stateId, response.data));
				dispatch(SequencesActions.setLastLoadedSuccesfullState(stateId));
			}).catch((e) => {
				dispatch(SequencesActions.setStateDefinition(stateId, {}));
				dispatch(SequencesActions.setLastLoadedSuccesfullState(stateId));
			});

		}
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('fetch frame', 'sequences', error));
	}
}

function * fetchSelectedFrame() {
	const keyframes = yield select(selectNextKeyFramesDates);
	yield all(keyframes.map((d) => put(SequencesActions.fetchFrame(d))));
}

export function* setSelectedDate({date}) {
	try {
		const selectedSequence = yield select(selectSelectedSequence);

		if (selectedSequence) {
			yield put(SequencesActions.setSelectedDateSuccess(date));
			yield put(SequencesActions.fetchSelectedFrame());
		}

	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('select frame', 'sequences', error));
	}
}

export function* initializeSequences() {
	const hiddenGeometryVisible = yield select(selectHiddenGeometryVisible);
	if (!hiddenGeometryVisible) {
		yield put(TreeActions.showHiddenGeometry());
	}

	yield put(SequencesActions.setIfcSpacesHidden(!hiddenGeometryVisible));
}

export function* restoreIfcSpacesHidden() {
	const hiddenGeometryVisible = yield select(selectHiddenGeometryVisible);
	const ifcSpacesHiddenSaved =  yield select(selectIfcSpacesHiddenSaved);

	if (ifcSpacesHiddenSaved !== !hiddenGeometryVisible) {
		yield put(TreeActions.showHiddenGeometry());
	}
}

export function* setSelectedSequence({ sequenceId }) {
	if (sequenceId) {
		yield put(SequencesActions.initializeSequences());
	} else {
		yield put(SequencesActions.setStateDefinition(undefined, {}));
		yield put(SequencesActions.restoreIfcSpacesHidden());
	}
	yield put(SequencesActions.setSelectedSequenceSuccess(sequenceId));
	yield put(SequencesActions.fetchActivitiesDefinitions(sequenceId));
}

export function* showSequenceDate({ date }) {
	// 1 - if sequence panel is closed, open it
	const sequencePanelVisible = (yield select(selectLeftPanels))[VIEWER_PANELS.SEQUENCES];

	if (!sequencePanelVisible) {
		yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.SEQUENCES, true));
	}

	// 2 - Select the date
	yield put(SequencesActions.setSelectedDate(date));
}

export default function* SequencesSaga() {
	yield takeLatest(SequencesTypes.FETCH_SEQUENCES, fetchSequences);
	yield takeLatest(SequencesTypes.SET_SELECTED_DATE, setSelectedDate);
	yield takeLatest(SequencesTypes.INITIALIZE_SEQUENCES, initializeSequences);
	yield takeLatest(SequencesTypes.FETCH_FRAME, fetchFrame);
	yield takeLatest(SequencesTypes.RESTORE_IFC_SPACES_HIDDEN, restoreIfcSpacesHidden);
	yield takeLatest(SequencesTypes.FETCH_ACTIVITIES_DEFINITIONS, fetchActivitiesDefinitions);
	yield takeLatest(SequencesTypes.SET_SELECTED_SEQUENCE, setSelectedSequence);
	yield takeLatest(SequencesTypes.FETCH_SELECTED_FRAME, fetchSelectedFrame);
	yield takeLatest(SequencesTypes.SHOW_SEQUENCE_DATE, showSequenceDate);
}
