/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import { selectCurrentTeamspace } from '../currentUser';
import { DialogActions } from '../dialog';
import { IssuesActions, IssuesTypes } from '../issues';
import { selectCurrentModel, ModelActions } from '../model';
import { RisksActions, RisksTypes } from '../risks';
import { selectTeamspaces, TeamspacesActions } from '../teamspaces';
import { BoardActions, BoardTypes } from './board.redux';

function* fetchData({ boardType, teamspace, project, modelId }) {
	try {
		yield put(BoardActions.setIsPending(true));
		const teamspaces = yield select(selectTeamspaces);
		const currentTeamspace = yield select(selectCurrentTeamspace);
		const currentModel = yield select(selectCurrentModel);

		if (modelId && modelId !== currentModel) {
			yield put(ModelActions.fetchSettings(teamspace, modelId));
		}

		if (!teamspaces.length) {
			yield put(TeamspacesActions.fetchTeamspaces(currentTeamspace));
		}

		if (teamspace && project && modelId) {
			if (boardType === 'issues') {
				yield put(IssuesActions.fetchIssues(teamspace, modelId));
				yield take(IssuesTypes.FETCH_ISSUES_SUCCESS);
			} else {
				yield put(RisksActions.fetchRisks(teamspace, modelId));
				yield take(RisksTypes.FETCH_RISKS_SUCCESS);
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('fetch', 'board data', error));
	}
	yield put(BoardActions.setIsPending(false));
}

function* fetchCardData({ boardType, teamspace, modelId, cardId }) {
	try {
		const getCardData = boardType === 'issues' ? IssuesActions.setActiveIssue : RisksActions.setActiveRisk;
		const cardData = { account: teamspace, model: modelId, _id: cardId };

		yield put(getCardData(cardData, null, true));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('fetch', 'card data', error));
	}
}

export default function* BoardSaga() {
	yield takeLatest(BoardTypes.FETCH_DATA, fetchData);
	yield takeLatest(BoardTypes.FETCH_CARD_DATA, fetchCardData);
}
