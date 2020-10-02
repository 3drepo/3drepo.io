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

import { put, select, take, takeLatest } from 'redux-saga/effects';

import { selectSelectedSequenceId, selectSelectedStateId, selectStateDefinitions,
	SequencesActions, SequencesTypes } from '.';
import { VIEWER_PANELS } from '../../constants/viewerGui';

import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { selectCurrentModel, selectCurrentModelTeamspace,
	selectCurrentRevisionId, selectSettings } from '../model/model.selectors';
import { dispatch } from '../store';
import { selectIfcSpacesHidden, TreeActions } from '../tree';
import { selectLeftPanels, ViewerGuiActions } from '../viewerGui';
import { getSelectedFrame } from './sequences.helper';
import { selectFrames, selectIfcSpacesHiddenSaved,
	selectSelectedEndingDate, selectSelectedSequence, selectSelectedStartingDate,
	selectSequences,
	selectSequenceModel, selectTasksDefinitions} from './sequences.selectors';

const areSequencesFromModel = (modelSettings, sequences) => (sequences || [])
.some((s) => s.model === modelSettings._id || (modelSettings.subModels || []).some((sm) => sm.model === s.model) );

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

export function* fetchTasksDefinitions({sequenceId}) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectCurrentModel);
		const tasksDefinitions = yield select(selectTasksDefinitions);

		if (!tasksDefinitions && sequenceId) {
			// API CALL TO GET TASKS
			const {data} = yield API.getSequenceActivities(teamspace, model, revision, sequenceId);
			yield put(SequencesActions.fetchTasksDefinitionsSuccess(sequenceId, data.tasks));
		}

	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'sequences', error));
		yield put(SequencesActions.fetchTasksDefinitionsSuccess(sequenceId, []));
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
	const endingDate = yield select(selectSelectedEndingDate);
	yield put(SequencesActions.fetchFrame(endingDate));
}

export function* setSelectedFrame({date}) {
	try {
		yield put(SequencesActions.setSelectedDate(date));
		yield put(SequencesActions.fetchSelectedFrame());
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('select frame', 'sequences', error));
	}
}

export function* initializeSequences() {
	const ifcSpacesHidden = yield select(selectIfcSpacesHidden);
	if (ifcSpacesHidden) {
		yield put(TreeActions.hideIfcSpaces());
	}

	yield put(SequencesActions.setIfcSpacesHidden(ifcSpacesHidden));
}

export function* restoreIfcSpacesHidden() {
	const ifcSpacesHidden = yield select(selectIfcSpacesHidden);
	const ifcSpacesHiddenSaved =  yield select(selectIfcSpacesHiddenSaved);

	if (ifcSpacesHiddenSaved !== ifcSpacesHidden) {
		yield put(TreeActions.hideIfcSpaces());
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
	yield put(SequencesActions.fetchTasksDefinitions(sequenceId));
}

export function* showSequenceDate({ date }) {
	// 1 - if sequence panel is closed, open it
	const sequencePanelVisible = (yield select(selectLeftPanels))[VIEWER_PANELS.SEQUENCES];

	if (!sequencePanelVisible) {
		yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.SEQUENCES, true));
	}

	// 2 - if sequence has not been selected, select it
	const selectedSequence = yield select(selectSelectedSequence);
	if (!selectedSequence) {
		const sequences = yield select(selectSequences);
		yield put(SequencesActions.setSelectedSequence(sequences[0]._id));
	}

	// 3 - if the date has not been selected, select it
	yield put(SequencesActions.setSelectedFrame(date));
}

export default function* SequencesSaga() {
	yield takeLatest(SequencesTypes.FETCH_SEQUENCES, fetchSequences);
	yield takeLatest(SequencesTypes.SET_SELECTED_FRAME, setSelectedFrame);
	yield takeLatest(SequencesTypes.INITIALIZE_SEQUENCES, initializeSequences);
	yield takeLatest(SequencesTypes.FETCH_FRAME, fetchFrame);
	yield takeLatest(SequencesTypes.RESTORE_IFC_SPACES_HIDDEN, restoreIfcSpacesHidden);
	yield takeLatest(SequencesTypes.FETCH_TASKS_DEFINITIONS, fetchTasksDefinitions);
	yield takeLatest(SequencesTypes.SET_SELECTED_SEQUENCE, setSelectedSequence);
	yield takeLatest(SequencesTypes.FETCH_SELECTED_FRAME, fetchSelectedFrame);
	yield takeLatest(SequencesTypes.SHOW_SEQUENCE_DATE, showSequenceDate);
}
