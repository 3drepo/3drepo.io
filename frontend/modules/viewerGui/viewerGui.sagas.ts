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
import { ModelActions, selectRevisions } from '../model';
import { TreeActions } from '../tree';
import { ViewpointsActions } from '../viewpoints';
import { IssuesActions, selectIssuesMap } from '../issues';
import { RisksActions, selectRisksMap } from '../risks';
import { GroupsActions } from '../groups';
import { ViewerActions } from '../viewer';
import { StarredMetaActions } from '../starredMeta';
import { JobsActions } from '../jobs';
import { CurrentUserActions, selectCurrentUser } from '../currentUser';
import { CompareActions } from '../compare';
import { selectIsMetadataVisible } from './viewerGui.selectors';
import { VIEWER_PANELS } from '../../constants/viewerGui';
import { BimActions } from '../bim';
import { MeasureActions } from '../measure';
import { DialogActions } from '../dialog';
import { dispatch } from '../../helpers/migration';
import { Viewer } from '../../services/viewer/viewer';
import { VIEWER_EVENTS } from '../../constants/viewer';
import { selectUrlParams } from '../router/router.selectors';

function* fetchData({ teamspace, model, revision }) {
	try {
		const { username } = yield select(selectCurrentUser);
		yield all([
			put(CurrentUserActions.fetchUser(username)),
			put(JobsActions.fetchJobs(teamspace)),
			put(JobsActions.getMyJob(teamspace)),
			put(TreeActions.startListenOnSelections()),
			put(ViewerGuiActions.startListenOnClickPin()),
			put(ViewerGuiActions.startListenOnModelLoaded()),
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

function* setMeasureVisibility({ visible }) {
	try {
		const metadataActive = yield select(selectIsMetadataVisible);

		if (visible && metadataActive) {
			yield put(BimActions.setIsActive(false));
		}

		yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.BIM, !visible));
		yield put(MeasureActions.setMeasureActive(visible));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'measure visibility', error));
	}
}

const setIsModelLoaded = () => {
	dispatch(ViewerGuiActions.setIsModelLoaded(true));
};

function* startListenOnModelLoaded() {
	try {
		Viewer.on(VIEWER_EVENTS.MODEL_LOADED, setIsModelLoaded);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('start listen on', 'model loaded', error));
	}
}

function* stopListenOnModelLoaded() {
	try {
		Viewer.off(VIEWER_EVENTS.MODEL_LOADED, setIsModelLoaded);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('stop listen on', 'model loaded', error));
	}
}

function* handlePinClick({ id }) {
	try {
		const risksMap = yield select(selectRisksMap);
		const issuesMap = yield select(selectIssuesMap);
		const revisions = yield select(selectRevisions);
		const defaultRevision = revisions[0].tag || revisions[0]._id;
		const { teamspace, model, revision = defaultRevision } = yield select(selectUrlParams);

		if (risksMap[id]) {
			yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.RISKS, true));
			yield put(RisksActions.showDetails(teamspace, model, revision, risksMap[id]));
		}

		if (issuesMap[id]) {
			yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.ISSUES, true));
			yield put(IssuesActions.showDetails(teamspace, model, revision, issuesMap[id]));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('handle', 'pin click', error));
	}
}

function* startListenOnClickPin() {
	try {
		Viewer.on(VIEWER_EVENTS.CLICK_PIN, ({ id }) => {
			dispatch(ViewerGuiActions.handlePinClick(id));
		});
	} catch (error) {
		yield put(DialogActions.showErrorDialog('start listen on', 'model loaded', error));
	}
}

function* stopListenOnClickPin() {
	try {
		Viewer.off(VIEWER_EVENTS.MODEL_LOADED, setIsModelLoaded);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('stop listen on', 'click pin', error));
	}
}

export default function* ViewerGuiSaga() {
	yield takeLatest(ViewerGuiTypes.FETCH_DATA, fetchData);
	yield takeLatest(ViewerGuiTypes.RESET_PANELS_STATES, resetPanelsStates);
	yield takeLatest(ViewerGuiTypes.SET_MEASURE_VISIBILITY, setMeasureVisibility);
	yield takeLatest(ViewerGuiTypes.START_LISTEN_ON_MODEL_LOADED, startListenOnModelLoaded);
	yield takeLatest(ViewerGuiTypes.STOP_LISTEN_ON_MODEL_LOADED, stopListenOnModelLoaded);
	yield takeLatest(ViewerGuiTypes.START_LISTEN_ON_CLICK_PIN, startListenOnClickPin);
	yield takeLatest(ViewerGuiTypes.STOP_LISTEN_ON_CLICK_PIN, stopListenOnClickPin);
	yield takeLatest(ViewerGuiTypes.HANDLE_PIN_CLICK, handlePinClick);
}
