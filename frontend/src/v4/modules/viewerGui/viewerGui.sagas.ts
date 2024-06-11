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

import { formatMessage } from '@/v5/services/intl';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { goBack } from 'connected-react-router';
import { all, put, select, take, takeLatest } from 'redux-saga/effects';

import { TicketsCardActions } from '@/v5/store/tickets/card/ticketsCard.redux';
import { TicketsActions } from '@/v5/store/tickets/tickets.redux';
import { INITIAL_HELICOPTER_SPEED, VIEWER_GIZMO_MODES, VIEWER_EVENTS, VIEWER_CLIP_MODES } from '../../constants/viewer';
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
import { selectCurrentRevisionId, selectSettings, ModelActions, ModelTypes, selectDefaultView } from '../model';
import { PresentationActions } from '../presentation';
import { selectRisksMap, RisksActions } from '../risks';
import { selectUrlParams } from '../router/router.selectors';
import { SequencesActions } from '../sequences';
import { StarredActions } from '../starred';
import { dispatch } from '../store';
import { TreeActions } from '../tree';
import { selectInitialView, selectViewpointsDomain, ViewpointsActions, ViewpointsTypes } from '../viewpoints';
import { ViewerGuiActions, ViewerGuiTypes } from './viewerGui.redux';
import {
	selectClippingMode,
	selectGizmoMode,
	selectHelicopterSpeed,
	selectIsClipEdit,
} from './viewerGui.selectors';

function* fetchData({ teamspace, model }) {
	try {
		yield put(ModelActions.setPendingState(true));
		const { data: settings } = yield API.getModelSettings(teamspace, model);

		yield put(ModelActions.fetchSettingsSuccess(settings));
		yield put(ModelActions.setPendingState(false));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'viewer.error.resource', defaultMessage: 'trying to fetch resource' }),
			error,
		}));
		return;
	}

	try {
		const { username } = yield select(selectCurrentUser);

		yield put(ViewpointsActions.reset());

		yield all([
			put(TicketsActions.clearGroups()),
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
			put(GroupsActions.fetchGroups(teamspace, model, revision)),
			put(TreeActions.fetchFullTree(teamspace, model, revision)),
			put(IssuesActions.fetchIssues(teamspace, model, revision)),
			put(RisksActions.fetchRisks(teamspace, model, revision)),
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

function* goToHomeView() {
	try {
		const defaultView = yield select(selectDefaultView);
		if (defaultView) {
			const { teamspace, model } = yield select(selectUrlParams);
			const { viewpointsMap } = yield select(selectViewpointsDomain);
			yield put(ViewpointsActions.showViewpoint(teamspace, model, viewpointsMap[defaultView.id], false));
		} else {
			yield Viewer.goToExtent();
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('go', 'to home view', error));
	}
}

function* setProjectionMode({mode}) {
	try {
		yield Viewer.setProjectionMode(mode);
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

function* resetHelicopterSpeed({teamspace, modelId }) {
	try {
		yield Viewer.helicopterSpeedReset();
		yield API.editHelicopterSpeed(teamspace, modelId, INITIAL_HELICOPTER_SPEED);
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

function* setClippingMode({ mode }) {
	try {
		const currentClipMode = yield select(selectClippingMode);
		if (currentClipMode !== mode) {
			yield put(ViewerGuiActions.setClipModeSuccess(mode));
			if (!mode) {
				yield Viewer.clipToolDelete();
				yield put(ViewerGuiActions.setClipEdit(false));
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'clip mode', error));
	}
}

function* setGizmoMode({ mode }) {
	try {
		switch (mode) {
			case VIEWER_GIZMO_MODES.ROTATE:
				Viewer.clipToolRotate()
				break;
			case VIEWER_GIZMO_MODES.SCALE:
				Viewer.clipToolScale()
				break
			default:
				Viewer.clipToolTranslate();
				break;
		}
		yield put(ViewerGuiActions.setGizmoModeSuccess(mode));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'gizmo mode', error));
	}
}

function* setClipEdit({ isClipEdit }) {
	try {
		const currentClipEdit = yield select(selectIsClipEdit);
		const clippingMode = yield select(selectClippingMode);
		const gizmoMode = yield select(selectGizmoMode);
		if (currentClipEdit !== isClipEdit) {
			yield all([
				isClipEdit ? Viewer.startClip(clippingMode === VIEWER_CLIP_MODES.SINGLE) : Viewer.stopClipEdit(),
				put(ViewerGuiActions.setClipEditSuccess(isClipEdit)),
			])
		}
		if (isClipEdit && (clippingMode === VIEWER_CLIP_MODES.SINGLE) && (gizmoMode === VIEWER_GIZMO_MODES.SCALE)) {
			yield put(ViewerGuiActions.setGizmoMode(VIEWER_GIZMO_MODES.TRANSLATE));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'clip edit', error));
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
	const { teamspace, model } = yield select(selectUrlParams);

	try {
		yield Viewer.isViewerReady();

		const revision = yield select(selectCurrentRevisionId);
		const modelSettings = yield select(selectSettings);
		const selectedViewpoint = yield select(selectInitialView);

		yield Viewer.loadViewerModel(teamspace, model, 'master', revision || 'head', selectedViewpoint?.viewpoint);
		yield Viewer.updateViewerSettings(modelSettings);

		if (selectedViewpoint) { // This is to have the viewpoint state in redux the same as in unity
			yield put(ViewpointsActions.showViewpoint(teamspace, model, selectedViewpoint, true));
		}

	} catch (error) {
		const content = formatMessage({
				id: 'viewerGui.loadModel.error.content',
				defaultMessage: 'The model was either not found, failed to load correctly ' +
					'or you are not authorized to view it. ' +
					' You will now be redirected to the previous page.'
			})
		yield put(DialogActions.showDialog({ title: formatMessage({id: 'viewerGui.loadModel.error.title', defaultMessage: 'Model Error'}), content }));
		yield put(goBack());
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

export function * clearColorOverrides() {
	yield put(GroupsActions.clearColorOverridesSuccess());
	yield put(ViewpointsActions.clearColorOverrides());
	yield put(TicketsCardActions.setOverrides(null));
	yield put(SequencesActions.clearColorOverrides());
}

export function* clearTransformations() {
	yield put(SequencesActions.clearTransformations());
	yield put(ViewpointsActions.clearTransformations());
}

export default function* ViewerGuiSaga() {
	yield takeLatest(ViewerGuiTypes.FETCH_DATA, fetchData);
	yield takeLatest(ViewerGuiTypes.RESET_PANELS_STATES, resetPanelsStates);
	yield takeLatest(ViewerGuiTypes.SET_COORD_VIEW, setCoordView);
	yield takeLatest(ViewerGuiTypes.START_LISTEN_ON_MODEL_LOADED, startListenOnModelLoaded);
	yield takeLatest(ViewerGuiTypes.STOP_LISTEN_ON_MODEL_LOADED, stopListenOnModelLoaded);
	yield takeLatest(ViewerGuiTypes.START_LISTEN_ON_CLICK_PIN, startListenOnClickPin);
	yield takeLatest(ViewerGuiTypes.STOP_LISTEN_ON_CLICK_PIN, stopListenOnClickPin);
	yield takeLatest(ViewerGuiTypes.HANDLE_PIN_CLICK, handlePinClick);
	yield takeLatest(ViewerGuiTypes.SET_NAVIGATION_MODE, setNavigationMode);
	yield takeLatest(ViewerGuiTypes.RESET_HELICOPTER_SPEED, resetHelicopterSpeed);
	yield takeLatest(ViewerGuiTypes.GET_HELICOPTER_SPEED, getHelicopterSpeed);
	yield takeLatest(ViewerGuiTypes.INCREASE_HELICOPTER_SPEED, increaseHelicopterSpeed);
	yield takeLatest(ViewerGuiTypes.DECREASE_HELICOPTER_SPEED, decreaseHelicopterSpeed);
	yield takeLatest(ViewerGuiTypes.GO_TO_HOME_VIEW, goToHomeView);
	yield takeLatest(ViewerGuiTypes.SET_CLIPPING_MODE, setClippingMode);
	yield takeLatest(ViewerGuiTypes.SET_GIZMO_MODE, setGizmoMode);
	yield takeLatest(ViewerGuiTypes.SET_CLIP_EDIT, setClipEdit);
	yield takeLatest(ViewerGuiTypes.CLEAR_HIGHLIGHTS, clearHighlights);
	yield takeLatest(ViewerGuiTypes.SET_CAMERA, setCamera);
	yield takeLatest(ViewerGuiTypes.SET_PROJECTION_MODE, setProjectionMode);
	yield takeLatest(ViewerGuiTypes.LOAD_MODEL, loadModel);
	yield takeLatest(ViewerGuiTypes.SET_IS_PIN_DROP_MODE, setIsPinDropMode);
	yield takeLatest(ViewerGuiTypes.CLEAR_COLOR_OVERRIDES, clearColorOverrides);
	yield takeLatest(ViewerGuiTypes.CLEAR_TRANSFORMATIONS, clearTransformations);
}
