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

import { put, takeLatest, all, select } from 'redux-saga/effects';

import * as API from '../../services/api';
import { ViewerGuiTypes, ViewerGuiActions } from './viewerGui.redux';
import { ModelActions } from '../model';
import { TreeActions } from '../tree';
import { ViewpointsActions } from '../viewpoints';
import { IssuesActions } from '../issues';
import { RisksActions } from '../risks';
import { GroupsActions } from '../groups';
import { ViewerActions } from '../viewer';
import { StarredMetaActions } from '../starredMeta';
import { JobsActions } from '../jobs';
import { CurrentUserActions, selectCurrentUser } from '../currentUser';
import { CompareActions } from '../compare';
import { DialogActions } from '../dialog';

function* fetchData({ teamspace, model, revision }) {
	try {
		const { username } = yield select(selectCurrentUser);
		yield all([
			put(CurrentUserActions.fetchUser(username)),
			put(JobsActions.fetchJobs(teamspace)),
			put(JobsActions.getMyJob(teamspace)),
			put(TreeActions.startListenOnSelections()),
			put(ViewerActions.startListenOnModelLoaded()),
			put(ModelActions.fetchSettings(teamspace, model)),
			put(ModelActions.fetchMetaKeys(teamspace, model)),
			put(ModelActions.waitForSettingsAndFetchRevisions(teamspace, model)),
			put(TreeActions.fetchFullTree(teamspace, model, revision)),
			put(ViewpointsActions.fetchViewpoints(teamspace, model)),
			put(IssuesActions.fetchIssues(teamspace, model, revision)),
			put(RisksActions.fetchRisks(teamspace, model, revision)),
			put(GroupsActions.fetchGroups(teamspace, model, revision)),
			put(ViewerActions.getHelicopterSpeed(teamspace, model)),
			put(StarredMetaActions.fetchStarredMeta())
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('fetch', 'initial model data', error));
	}
}

function* resetPanelsStates() {
	try {
		yield all([
			put(IssuesActions.resetComponentState()),
			put(RisksActions.resetComponentState()),
			put(GroupsActions.resetComponentState()),
			put(CompareActions.resetComponentState())
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', 'panels data', error));
	}
}

export default function* ViewerGuiSaga() {
	yield takeLatest(ViewerGuiTypes.FETCH_DATA, fetchData);
	yield takeLatest(ViewerGuiTypes.RESET_PANELS_STATES, resetPanelsStates);
}
