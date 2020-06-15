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

import { put, select, takeLatest} from 'redux-saga/effects';

import { CHAT_CHANNELS } from '../../constants/chat';

import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { ChatActions } from '../chat';
import { selectCurrentModel, selectCurrentModelTeamspace } from '../model';
import { dispatch, getState } from '../store';
import {  selectIsPaused, selectSessionCode, PresentationActions, PresentationTypes } from './index';

let intervalId = 0;

const streamPresentation = async (teamspace, model, code) => {
	const viewpoint = await Viewer.getCurrentViewpoint({ teamspace, model });
	await API.streamPresentation(teamspace, model, code, viewpoint);
};

function* startPresenting() {
	yield put(PresentationActions.setPresenting(true));
	const teamspace = yield select(selectCurrentModelTeamspace);
	const model = yield select(selectCurrentModel);
	const code = yield select(selectSessionCode);

	intervalId = window.setInterval(streamPresentation, 1000, teamspace, model, code);
}

const onStreamPresentationEvent = (viewpoint) => {
	const paused = selectIsPaused(getState());

	if (paused) {
		return;
	}

	const account = selectCurrentModelTeamspace(getState());
	const model = selectCurrentModel(getState());

	Viewer.setCamera({ ...viewpoint, account, model });
	Viewer.updateClippingPlanes(viewpoint.clippingPlanes, account, model);
};

const onEndPresentationEvent = () => {
	dispatch(PresentationActions.leavePresentation());
};

function* joinPresentation({ sessionCode }) {
	const teamspace = yield select(selectCurrentModelTeamspace);
	const currentModel = yield select(selectCurrentModel);

	yield put(PresentationActions.setJoinPresentation(true, sessionCode));

	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.PRESENTATION, teamspace, currentModel, {
		subscribeToStream: [sessionCode, onStreamPresentationEvent],
		subscribeToEnd: [sessionCode, onEndPresentationEvent]
	}));

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

	yield API.endPresentation(teamspace, model, code);
	yield put(PresentationActions.setPresenting(false));
	clearInterval(intervalId);
}

function* togglePause() {
	const paused = !(yield select(selectIsPaused));
	yield put(PresentationActions.setPaused(paused));
}

export default function* PresentationSaga() {
	yield takeLatest(PresentationTypes.START_PRESENTING, startPresenting);
	yield takeLatest(PresentationTypes.STOP_PRESENTING, stopPresenting);
	yield takeLatest(PresentationTypes.JOIN_PRESENTATION, joinPresentation);
	yield takeLatest(PresentationTypes.LEAVE_PRESENTATION, leavePresentation);
	yield takeLatest(PresentationTypes.TOGGLE_PAUSE, togglePause);
}
