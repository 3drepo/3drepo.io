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

import { all, put, select, takeLatest } from 'redux-saga/effects';
import { differenceBy, isEmpty, omit, pick, map } from 'lodash';

import * as API from '../../services/api';
import { getAngularService, dispatch, getState, runAngularViewerTransition } from '../../helpers/migration';
import { getIssuePinColor, prepareIssue } from '../../helpers/issues';
import { Cache } from '../../services/cache';
import { Viewer } from '../../services/viewer/viewer';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { IssuesTypes, IssuesActions } from './issues.redux';
import {
	selectActiveIssueId,
	selectIssues,
	selectShowPins,
	selectIssuesMap,
	selectActiveIssueDetails,
	selectFilteredIssues
} from './issues.selectors';
import { selectJobsList } from '../jobs';
import { selectCurrentUser } from '../currentUser';

export function* fetchIssues({teamspace, modelId, revision}) {
	yield put(IssuesActions.togglePendingState(true));
	try {
		const { data } = yield API.getIssues(teamspace, modelId, revision);
		const jobs = yield select(selectJobsList);

		const preparedIssues = data.map((issue) => prepareIssue(issue, jobs));

		yield put(IssuesActions.fetchIssuesSuccess(preparedIssues));
		// yield put(IssuesActions.renderPins(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'issues', error));
	}
	yield put(IssuesActions.togglePendingState(false));
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
