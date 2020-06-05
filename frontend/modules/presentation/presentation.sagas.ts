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
import { selectCurrentTeamspace } from '../currentUser';
import { selectCurrentModel } from '../model';
import {  selectSessionCode, PresentationActions, PresentationTypes } from './index';

let intervalId = 0;

const streamPresentation = async (teamspace, model, code) => {
	const viewpoint  =  await Viewer.getCurrentViewpoint({ teamspace, model });
	await API.streamPresentation(teamspace, model, code, viewpoint);
};

function* startPresenting() {
	yield put(PresentationActions.setPresenting(true));
	const currentTeamspace = yield select(selectCurrentTeamspace);
	const currentModel = yield select(selectCurrentModel);
	const sessionCode = yield select(selectSessionCode);

	intervalId = window.setInterval(streamPresentation, 1000, currentTeamspace, currentModel, sessionCode);
}

function* stopPresenting() {
	yield put(PresentationActions.setPresenting(false));
	clearInterval(intervalId);
}

export default function* PresentationSaga() {
	yield takeLatest(PresentationTypes.START_PRESENTING, startPresenting);
	yield takeLatest(PresentationTypes.STOP_PRESENTING, stopPresenting);
}
