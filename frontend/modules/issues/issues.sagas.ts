/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { put, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { IssuesTypes, IssuesActions } from './issues.redux';
import { DialogActions } from '../dialog';

export function* fetchIssues({teamspace, modelId, revision}) {
	try {
		const {data} = yield API.getIssues(teamspace, modelId, revision);
		yield put(IssuesActions.fetchIssuesSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'issues', error));
	}
}

export function* fetchIssue({teamspace, modelId, issueId}) {
	try {
		const {data} = yield API.getIssue(teamspace, modelId, issueId);

		yield put(IssuesActions.fetchIssueSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'issue', error));
	}
}

export default function* IssuesSaga() {
	yield takeLatest(IssuesTypes.FETCH_ISSUES, fetchIssues);
	yield takeLatest(IssuesTypes.FETCH_ISSUE, fetchIssue);
}
