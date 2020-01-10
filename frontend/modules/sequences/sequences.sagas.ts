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

import { all, put, select, takeLatest } from 'redux-saga/effects';

import { selectSelectedSequenceId, selectSelectedStatesIds, selectStateDefinitions,
	SequencesActions, SequencesTypes } from '.';
import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { selectCurrentModel, selectCurrentModelTeamspace, selectCurrentRevisionId } from '../model/model.selectors';

export function* fetchSequences() {
	try {
		yield put(SequencesActions.setSequencesPending(true));
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectCurrentModel);

		const response = yield API.getSequences(teamspace, model, revision);
		yield put(SequencesActions.fetchSequencesSuccess(response.data));

		// Mock up thingy, this should be deleted
		yield put(SequencesActions.setSelectedSequence(response.data[0]._id));

		yield put(SequencesActions.setSequencesPending(false));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'sequences', error));
		yield put(SequencesActions.setSequencesPending(false));
	}
}

export function* setSelectedFrame({date}) {
	try {
		yield put(SequencesActions.setSelectedDate(date));
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectCurrentModel);
		const sequenceId =  yield select(selectSelectedSequenceId);

		let statesIds = yield select(selectSelectedStatesIds);
		const loadedStates = yield select(selectStateDefinitions);

		statesIds = statesIds.filter((s) => ! loadedStates[s] );

		if (statesIds.length) {
			const responses = yield all(statesIds.map((stateId) =>
				API.getSequenceState(teamspace, model, revision, sequenceId, stateId)));

			yield all(statesIds.map((stateId, i) => put(SequencesActions.setStateDefinition(stateId, responses[i].data))));
		}

	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('select frame', 'sequences', error));
		yield put(SequencesActions.statesPending(false));
	}
}

export default function* SequencesSaga() {
	yield takeLatest(SequencesTypes.FETCH_SEQUENCES, fetchSequences);
	yield takeLatest(SequencesTypes.SET_SELECTED_FRAME, setSelectedFrame);
}
