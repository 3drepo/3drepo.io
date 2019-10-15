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

import { all, put, select, takeLatest } from 'redux-saga/effects';

import { selectCurrentTeamspace } from '../currentUser';
import { DialogActions } from '../dialog';
import { IssuesActions } from '../issues';
import { RisksActions } from '../risks';
import { selectTeamspaces, TeamspacesActions } from '../teamspaces';
import { BoardActions, BoardTypes } from './board.redux';

function* fetchData({ type, teamspace, project, modelId }) {
	try {
		console.log('fetchData', type, teamspace, project, modelId);
		const teamspaces = yield select(selectTeamspaces);
		const currentTeamspace = yield select(selectCurrentTeamspace);

		if (!teamspaces.length) {
			yield put(TeamspacesActions.fetchTeamspaces(currentTeamspace));
		}

		if (teamspace && project && modelId) {
			if (type === 'issues') {
				yield put(IssuesActions.fetchIssues(teamspace, modelId));
			} else {
				yield put(RisksActions.fetchRisks(teamspace, modelId));
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('fetch', 'board data', error));
	}
}

export default function* BoardSaga() {
	yield takeLatest(BoardTypes.FETCH_DATA, fetchData);
}
