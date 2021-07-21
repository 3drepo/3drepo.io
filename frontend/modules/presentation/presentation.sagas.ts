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

import { CHAT_CHANNELS } from '../../constants/chat';

import * as API from '../../services/api';
import { ChatActions } from '../chat';
import { DialogActions } from '../dialog';
import { selectCurrentModel, selectCurrentModelTeamspace } from '../model';
import { selectUrlParams } from '../router/router.selectors';
import { dispatch, getState } from '../store';
import { ViewpointsActions } from '../viewpoints';
import { generateViewpoint } from '../viewpoints/viewpoints.sagas';
import {  selectIsPaused, selectIsPresenting, selectJoinedPresentation,
	selectSessionCode, PresentationActions, PresentationTypes } from './index';

let intervalId = 0;

const streamPresentation = () => {
	dispatch(PresentationActions.streamViewpoint());
};

function * streamViewpoint() {
	const teamspace = yield select(selectCurrentModelTeamspace);
	const model = yield select(selectCurrentModel);
	const code = yield select(selectSessionCode);

	const view = yield generateViewpoint(teamspace, model, 'stream');

	try {
		yield API.streamPresentation(teamspace, model, code, view);
	} catch (error) {
		yield put(PresentationActions.setPresenting(false));
		clearInterval(intervalId);
		yield put(DialogActions.showEndpointErrorDialog('stream', 'presentation', error));
	}
}

function* startPresenting() {
	const teamspace = yield select(selectCurrentModelTeamspace);
	const model = yield select(selectCurrentModel);
	try {
		yield put(PresentationActions.setLoading(true));
		const { data: {code} } = yield API.startPresentation(teamspace, model);
		yield put(PresentationActions.setPresenting(true, code));
		intervalId = window.setInterval(streamPresentation, 1000);
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('start', 'presentation', error));
	}
	yield put(PresentationActions.setLoading(false));
}

const onStreamPresentationEvent = (viewpoint) => {
	const paused = selectIsPaused(getState());

	if (paused) {
		return;
	}

	const account = selectCurrentModelTeamspace(getState());
	const model = selectCurrentModel(getState());

	dispatch(ViewpointsActions.showViewpoint(account, model,  viewpoint ));
};

const onEndPresentationEvent = () => {
	dispatch(PresentationActions.leavePresentation());
};

function* joinPresentation({ sessionCode }) {
	const {teamspace, model} = yield select(selectUrlParams);

	const { data: {exists} } = yield API.existsPresentation(teamspace, model, sessionCode);

	if (exists) {
		yield put(PresentationActions.setJoinPresentation(true, sessionCode));
		yield put(ChatActions.callChannelActions(CHAT_CHANNELS.PRESENTATION, teamspace, model, {
			subscribeToStream: [sessionCode, onStreamPresentationEvent],
			subscribeToEnd: [sessionCode, onEndPresentationEvent]
		}));
	} else {
		yield put(DialogActions.showErrorDialog('join', 'presentation', 'The presentation doesnt exist.'));
	}

}

function* leavePresentation() {
	const teamspace = yield select(selectCurrentModelTeamspace);
	const model = yield select(selectCurrentModel);

	yield put(PresentationActions.setJoinPresentation(false));
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.PRESENTATION, teamspace, model, {
		unsubscribeFromStream: onStreamPresentationEvent,
		unsubscribeFromEnd: onEndPresentationEvent
	}));
}

function* stopPresenting() {
	const teamspace = yield select(selectCurrentModelTeamspace);
	const model = yield select(selectCurrentModel);
	const code = yield select(selectSessionCode);
	clearInterval(intervalId);

	yield API.endPresentation(teamspace, model, code);
	yield put(PresentationActions.setPresenting(false));
}

function* togglePause() {
	const paused = !(yield select(selectIsPaused));
	yield put(PresentationActions.setPaused(paused));
}

function* reset() {
	const isPresenting = yield select(selectIsPresenting);
	const isPaused = yield select(selectIsPaused);
	const hasjoinedPresentation = yield select(selectJoinedPresentation);

	if (isPresenting) {
		yield put(PresentationActions.stopPresenting());
	}

	if (isPaused) {
		yield put(PresentationActions.setPaused(false));
	}

	if (hasjoinedPresentation) {
		yield put(PresentationActions.leavePresentation());
	}
}

export default function* PresentationSaga() {
	yield takeLatest(PresentationTypes.START_PRESENTING, startPresenting);
	yield takeLatest(PresentationTypes.STOP_PRESENTING, stopPresenting);
	yield takeLatest(PresentationTypes.JOIN_PRESENTATION, joinPresentation);
	yield takeLatest(PresentationTypes.LEAVE_PRESENTATION, leavePresentation);
	yield takeLatest(PresentationTypes.TOGGLE_PAUSE, togglePause);
	yield takeLatest(PresentationTypes.STREAM_VIEWPOINT, streamViewpoint);
	yield takeLatest(PresentationTypes.RESET, reset);
}
