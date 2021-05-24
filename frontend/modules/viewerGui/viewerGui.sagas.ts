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

import { push } from 'connected-react-router';
import { all, put, select, take, takeLatest } from 'redux-saga/effects';

import { ROUTES } from '../../constants/routes';
import { INITIAL_HELICOPTER_SPEED, NEW_PIN_ID, VIEWER_CLIP_MODES, VIEWER_EVENTS } from '../../constants/viewer';
import * as API from '../../services/api';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { Viewer } from '../../services/viewer/viewer';
import { BimActions } from '../bim';
import { CommentsActions } from '../comments';
import { CompareActions } from '../compare';
import { selectCurrentUser, CurrentUserActions } from '../currentUser';
import { DialogActions } from '../dialog';
import { GisActions } from '../gis';
import { GroupsActions } from '../groups';
import { selectIssuesMap, IssuesActions } from '../issues';
import { JobsActions } from '../jobs';
import { MeasurementsActions } from '../measurements';
import { selectCurrentRevisionId, selectSettings, ModelActions, ModelTypes } from '../model';
import { PresentationActions } from '../presentation';
import { selectRisksMap, RisksActions } from '../risks';
import { selectUrlParams } from '../router/router.selectors';
import { SequencesActions } from '../sequences';
import { StarredActions } from '../starred';
import { dispatch } from '../store';
import { TreeActions } from '../tree';
import { selectInitialView, ViewpointsActions, ViewpointsTypes } from '../viewpoints';
import { ViewerGuiActions, ViewerGuiTypes } from './viewerGui.redux';
import {
	selectClipNumber,
	selectHelicopterSpeed,
	selectIsClipEdit,
	selectIsMetadataVisible
} from './viewerGui.selectors';

function* fetchData({ teamspace, model }) {
	try {
		yield put(ModelActions.setPendingState(true));
		const { data: settings } = yield API.getModelSettings(teamspace, model);

		yield put(ModelActions.fetchSettingsSuccess(settings));
		yield put(ModelActions.setPendingState(false));
	} catch (error) {
		yield put(DialogActions.showRedirectToTeamspaceDialog(error));
		return;
	}

	try {
		const { username } = yield select(selectCurrentUser);

		yield all([
			put(ModelActions.fetchRevisions(teamspace, model, false)),
			put(CurrentUserActions.fetchUser(username)),
			put(JobsActions.fetchJobs(teamspace)),
			put(JobsActions.getMyJob(teamspace)),
			put(TreeActions.startListenOnSelections()),
			put(ViewerGuiActions.startListenOnClickPin()),
			put(ViewerGuiActions.startListenOnModelLoaded()),
			put(ModelActions.fetchMetaKeys(teamspace, model)),
			put(TreeActions.setIsTreeProcessed(false)),
			put(ViewpointsActions.fetchViewpoints(teamspace, model)),
			put(CommentsActions.fetchUsers(teamspace))
		]);

		yield all([
			take(ModelTypes.FETCH_REVISIONS_SUCCESS),
			take(ViewpointsTypes.FETCH_VIEWPOINTS_SUCCESS),
		]);

		const revision = yield select(selectCurrentRevisionId);

		yield all([
			put(ViewerGuiActions.loadModel()),
			put(TreeActions.fetchFullTree(teamspace, model, revision)),
			put(IssuesActions.fetchIssues(teamspace, model, revision)),
			put(RisksActions.fetchRisks(teamspace, model, revision)),
			put(GroupsActions.fetchGroups(teamspace, model, revision)),
			put(ViewerGuiActions.getHelicopterSpeed(teamspace, model)),
			put(SequencesActions.fetchSequenceList()),
			put(StarredActions.fetchStarredMeta())
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('fetch', 'initial model data', error));
	}
}

function* resetPanelsStates() {
	try {
		yield all([
			put(IssuesActions.reset()),
			put(RisksActions.reset()),
			put(GroupsActions.resetComponentState()),
			put(CompareActions.resetComponentState()),
			put(BimActions.resetBimState()),
			put(ViewerGuiActions.resetPanels()),
			put(SequencesActions.reset()),
			put(GisActions.resetLayers()),
			put(MeasurementsActions.resetMeasurementTool()),
			put(PresentationActions.reset())
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
		yield put(MeasurementsActions.setMeasureActive(visible));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'measure visibility', error));
	}
}

function* setCoordView({ visible }) {
	try {
		if (visible) {
			Viewer.showCoordView();
		} else {
			Viewer.hideCoordView();
		}

		yield put(ViewerGuiActions.setCoordViewSuccess(visible));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'coordinates visibility', error));
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
		const risk = risksMap[id];
		const issue = issuesMap[id];

		if (risk) {
			yield put(RisksActions.goToRisk(risk));
		}

		if (issue) {
			yield put(IssuesActions.goToIssue(issue));
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

const updateClipStateCallback = (clipNumber) => {
	dispatch(ViewerGuiActions.updateClipState(clipNumber));
};

function* initialiseToolbar() {
	try {
		yield put(ViewerGuiActions.startListenOnNumClip());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'toolbar', error));
	}
}

function* startListenOnNumClip() {
	try {
		Viewer.on(VIEWER_EVENTS.UPDATE_NUM_CLIP, updateClipStateCallback);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('start listen on', 'num clip', error));
	}
}

function* stopListenOnNumClip() {
	try {
		Viewer.off(VIEWER_EVENTS.UPDATE_NUM_CLIP, updateClipStateCallback);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('stop listen on', 'num clip', error));
	}
}

function* updateClipState({clipNumber}) {
	try {
		const isClipEdit = yield select(selectIsClipEdit);
		const currentClipNumber = yield select(selectClipNumber);

		if (currentClipNumber !== clipNumber) {
			yield put(ViewerGuiActions.setClipNumber(clipNumber));

			if (clipNumber === 0 && isClipEdit) {
				yield put(ViewerGuiActions.setClipEdit(false));
				yield put(ViewerGuiActions.setClippingMode(null));
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'clip state', error));
	}
}

function* goToExtent() {
	try {
		yield Viewer.goToExtent();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('go', 'to extent', error));
	}
}

function* setProjectionMode({mode}) {
	try {
		yield Viewer.setProjectionMode(mode);
		yield put(ViewerGuiActions.setProjectionModeSuccess(mode));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'projection mode', error));
	}
}

function* setNavigationMode({mode}) {
	try {
		yield Viewer.setNavigationMode(mode);
		yield put(ViewerGuiActions.setNavigationModeSuccess(mode));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'navigation mode', error));
	}
}

function* resetHelicopterSpeed({teamspace, modelId, updateDefaultSpeed}) {
	try {
		yield Viewer.helicopterSpeedReset();
		if (updateDefaultSpeed) {
			yield API.editHelicopterSpeed(teamspace, modelId, INITIAL_HELICOPTER_SPEED);
		}
		yield put(ViewerGuiActions.setHelicopterSpeed(INITIAL_HELICOPTER_SPEED));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', 'helicopter speed', error));
	}
}

function* getHelicopterSpeed({ teamspace, modelId }) {
	try {
		yield Viewer.isViewerReady();
		const { data: { heliSpeed } } = yield API.getHelicopterSpeed(teamspace, modelId);
		const currentHeliSpeed = yield select(selectHelicopterSpeed);
		const diff = heliSpeed - currentHeliSpeed;
		const slower = diff > 0;

		for (let i = 0; i < Math.abs(diff); ++i) {
			if (slower) {
				yield Viewer.helicopterSpeedUp();
			} else {
				yield Viewer.helicopterSpeedDown();
			}
		}

		yield put(ViewerGuiActions.setHelicopterSpeed(heliSpeed));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'helicopter speed', error));
	}
}

function* increaseHelicopterSpeed({ teamspace, modelId }) {
	try {
		const helicopterSpeed = yield select(selectHelicopterSpeed);
		const speed = helicopterSpeed + 1;

		yield Viewer.helicopterSpeedUp();
		yield API.editHelicopterSpeed(teamspace, modelId, speed);
		yield put(ViewerGuiActions.setHelicopterSpeed(speed));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('increase', 'helicopter speed', error));
	}
}

function* decreaseHelicopterSpeed({ teamspace, modelId }) {
	try {
		const helicopterSpeed = yield select(selectHelicopterSpeed);
		const speed = helicopterSpeed - 1;

		yield Viewer.helicopterSpeedDown();
		yield API.editHelicopterSpeed(teamspace, modelId, speed);
		yield put(ViewerGuiActions.setHelicopterSpeed(speed));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('decrease', 'helicopter speed', error));
	}
}

function* setClippingMode({mode}) {
	try {
		if (mode) {
			const isSingle = mode === VIEWER_CLIP_MODES.SINGLE;
			yield Viewer.startClip(isSingle);
		}
		yield put(ViewerGuiActions.setClippingModeSuccess(mode));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'clipping mode', error));
	}
}

function* setClipEdit({isClipEdit}) {
	try {
		if (isClipEdit) {
			yield Viewer.startClipEdit();
		} else {
			yield Viewer.stopClipEdit();
		}
		yield put(ViewerGuiActions.setClipEditSuccess(isClipEdit));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'clip edit', error));
	}
}

function* clearHighlights() {
	try {
		Viewer.clearHighlights();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('clear', 'highlights', error));
	}
}

function* setCamera({ params }) {
	try {
		Viewer.setCamera(params);
		yield put(ViewerGuiActions.setProjectionModeSuccess(params.type));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'camera', error));
	}
}

function* loadModel() {
	try {
		yield Viewer.isViewerReady();

		const { teamspace, model } = yield select(selectUrlParams);
		const revision = yield select(selectCurrentRevisionId);
		const modelSettings = yield select(selectSettings);
		const selectedViewpoint = yield select(selectInitialView);

		yield Viewer.loadViewerModel(teamspace, model, 'master', revision || 'head', selectedViewpoint?.viewpoint);
		yield Viewer.updateViewerSettings(modelSettings);

		if (selectedViewpoint) { // This is to have the viewpoint state in redux the same as in unity
			yield put(ViewpointsActions.showViewpoint(teamspace, model, selectedViewpoint, true));
		}

	} catch (error) {
		const content = 'The model was either not found, failed to load correctly ' +
			'or you are not authorized to view it. ' +
			' You will now be redirected to the teamspace page.';
		yield put(DialogActions.showDialog({ title: 'Model Error', content }));
		yield put(push(ROUTES.TEAMSPACES));
	}
}

function* setIsPinDropMode({ mode }: { mode: boolean }) {
	try {
		yield put(ViewerGuiActions.setIsPinDropModeSuccess(mode));

		if (mode) {
			MultiSelect.toggleAreaSelect(false);
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'pin drop mode', error));
	}
}

export default function* ViewerGuiSaga() {
	yield takeLatest(ViewerGuiTypes.FETCH_DATA, fetchData);
	yield takeLatest(ViewerGuiTypes.RESET_PANELS_STATES, resetPanelsStates);
	yield takeLatest(ViewerGuiTypes.SET_MEASURE_VISIBILITY, setMeasureVisibility);
	yield takeLatest(ViewerGuiTypes.SET_COORD_VIEW, setCoordView);
	yield takeLatest(ViewerGuiTypes.START_LISTEN_ON_MODEL_LOADED, startListenOnModelLoaded);
	yield takeLatest(ViewerGuiTypes.STOP_LISTEN_ON_MODEL_LOADED, stopListenOnModelLoaded);
	yield takeLatest(ViewerGuiTypes.START_LISTEN_ON_CLICK_PIN, startListenOnClickPin);
	yield takeLatest(ViewerGuiTypes.STOP_LISTEN_ON_CLICK_PIN, stopListenOnClickPin);
	yield takeLatest(ViewerGuiTypes.HANDLE_PIN_CLICK, handlePinClick);
	yield takeLatest(ViewerGuiTypes.INITIALISE_TOOLBAR, initialiseToolbar);
	yield takeLatest(ViewerGuiTypes.SET_NAVIGATION_MODE, setNavigationMode);
	yield takeLatest(ViewerGuiTypes.RESET_HELICOPTER_SPEED, resetHelicopterSpeed);
	yield takeLatest(ViewerGuiTypes.GET_HELICOPTER_SPEED, getHelicopterSpeed);
	yield takeLatest(ViewerGuiTypes.INCREASE_HELICOPTER_SPEED, increaseHelicopterSpeed);
	yield takeLatest(ViewerGuiTypes.DECREASE_HELICOPTER_SPEED, decreaseHelicopterSpeed);
	yield takeLatest(ViewerGuiTypes.GO_TO_EXTENT, goToExtent);
	yield takeLatest(ViewerGuiTypes.SET_CLIPPING_MODE, setClippingMode);
	yield takeLatest(ViewerGuiTypes.UPDATE_CLIP_STATE, updateClipState);
	yield takeLatest(ViewerGuiTypes.SET_CLIP_EDIT, setClipEdit);
	yield takeLatest(ViewerGuiTypes.START_LISTEN_ON_NUM_CLIP, startListenOnNumClip);
	yield takeLatest(ViewerGuiTypes.STOP_LISTEN_ON_NUM_CLIP, stopListenOnNumClip);
	yield takeLatest(ViewerGuiTypes.CLEAR_HIGHLIGHTS, clearHighlights);
	yield takeLatest(ViewerGuiTypes.SET_CAMERA, setCamera);
	yield takeLatest(ViewerGuiTypes.SET_PROJECTION_MODE, setProjectionMode);
	yield takeLatest(ViewerGuiTypes.LOAD_MODEL, loadModel);
	yield takeLatest(ViewerGuiTypes.SET_IS_PIN_DROP_MODE, setIsPinDropMode);
}
