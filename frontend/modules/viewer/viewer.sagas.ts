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

import { put, select, takeLatest } from 'redux-saga/effects';
import { push } from 'connected-react-router';

import { dispatch } from '../../helpers/migration';
import * as API from '../../services/api';
import { VIEWER_EVENTS, VIEWER_PANELS, INITIAL_HELICOPTER_SPEED, NEW_PIN_ID } from '../../constants/viewer';

import { ViewerTypes, ViewerActions } from './viewer.redux';
import { DialogActions } from '../dialog';
import {
	selectHelicopterSpeed,
	selectIsClipEdit,
	selectClipNumber,
	selectIsMetadataVisible
} from './viewer.selectors';
import { Viewer } from '../../services/viewer/viewer';
import { VIEWER_CLIP_MODES } from '../../constants/viewer';
import { MeasureActions } from '../measure';
import { BimActions } from '../bim';
import { selectUrlParams } from '../router/router.selectors';
import { selectSettings } from '../model';
import { ROUTES } from '../../constants/routes';

const getViewer = () => Viewer.viewer;

function* waitForViewer() {
	try {
		yield Viewer.isViewerReady();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'viewer'));
	}
}

function* mapInitialise({surveyPoints, sources = []}) {
	try {
		yield put(ViewerActions.waitForViewer());

		const viewer = getViewer();
		viewer.mapInitialise(surveyPoints);
		sources.map(viewer.addMapSource);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'map'));
	}
}

const updateClipStateCallback = (clipNumber) => {
	dispatch(ViewerActions.updateClipState(clipNumber));
};

function* initialiseToolbar() {
	try {
		yield put(ViewerActions.startListenOnNumClip());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'toolbar'));
	}
}

const setIsModelLoaded = () => {
	dispatch(ViewerActions.setIsModelLoaded(true));
};

function* startListenOnModelLoaded() {
	try {
		Viewer.on(VIEWER_EVENTS.MODEL_LOADED, setIsModelLoaded);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('start listen on', 'model loaded'));
	}
}

function* stopListenOnModelLoaded() {
	try {
		Viewer.off(VIEWER_EVENTS.MODEL_LOADED, setIsModelLoaded);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('stop listen on', 'model loaded'));
	}
}

function* startListenOnNumClip() {
	try {
		Viewer.on(VIEWER_EVENTS.UPDATE_NUM_CLIP, updateClipStateCallback);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('start listen on', 'num clip'));
	}
}

function* stopListenOnNumClip() {
	try {
		Viewer.off(VIEWER_EVENTS.UPDATE_NUM_CLIP, updateClipStateCallback);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('stop listen on', 'num clip'));
	}
}

function* updateClipState({clipNumber}) {
	try {
		const isClipEdit = yield select(selectIsClipEdit);
		const currentClipNumber = yield select(selectClipNumber);

		if (currentClipNumber !== clipNumber) {
			yield put(ViewerActions.setClipNumber(clipNumber));
		}

		if (clipNumber === 0 && isClipEdit) {
			yield put(ViewerActions.setClipEdit(false));
			yield put(ViewerActions.setClippingMode(null));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'clip state'));
	}
}

function* resetMapSources({source}) {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().resetMapSources(source);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', 'map sources'));
	}
}

function* addMapSource({source}) {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().addMapSource(source);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('add', 'map source'));
	}
}

function* removeMapSource({source}) {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().removeMapSource(source);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('remove', 'map source'));
	}
}

function* mapStart() {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().mapStart();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('start', 'map rendering'));
	}
}

function* mapStop() {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().mapStop();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('stop', 'map rendering'));
	}
}

function* getScreenshot() {
	try {
		yield put(ViewerActions.waitForViewer());
		return yield getViewer().getScreenshot();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'screenshot'));
	}
}

function* goToExtent() {
	try {
		yield Viewer.goToExtent();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('go', 'to extent'));
	}
}

function* setNavigationMode({mode}) {
	try {
		yield Viewer.setNavigationMode(mode);
		yield put(ViewerActions.setNavigationModeSuccess(mode));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'navigation mode'));
	}
}

function* resetHelicopterSpeed({teamspace, modelId, updateDefaultSpeed}) {
	try {
		yield Viewer.helicopterSpeedReset();
		if (updateDefaultSpeed) {
			yield API.editHelicopterSpeed(teamspace, modelId, INITIAL_HELICOPTER_SPEED);
		}
		yield put(ViewerActions.setHelicopterSpeed(INITIAL_HELICOPTER_SPEED));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', 'helicopter speed'));
	}
}

function* getHelicopterSpeed({teamspace, modelId}) {
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

		yield put(ViewerActions.setHelicopterSpeed(heliSpeed));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'helicopter speed'));
	}
}

function* increaseHelicopterSpeed({teamspace, modelId}) {
	try {
		const helicopterSpeed = yield select(selectHelicopterSpeed);
		const speed = helicopterSpeed + 1;

		yield Viewer.helicopterSpeedUp();
		yield API.editHelicopterSpeed(teamspace, modelId, speed);
		yield put(ViewerActions.setHelicopterSpeed(speed));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('increase', 'helicopter speed'));
	}
}

function* decreaseHelicopterSpeed({teamspace, modelId}) {
	try {
		const helicopterSpeed = yield select(selectHelicopterSpeed);
		const speed = helicopterSpeed - 1;

		yield Viewer.helicopterSpeedDown();
		yield API.editHelicopterSpeed(teamspace, modelId, speed);
		yield put(ViewerActions.setHelicopterSpeed(speed));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('decrease', 'helicopter speed'));
	}
}

function* setClippingMode({mode}) {
	try {
		if (mode) {
			const isSingle = mode === VIEWER_CLIP_MODES.SINGLE;
			yield Viewer.startClip(isSingle);
		}
		yield put(ViewerActions.setClippingModeSuccess(mode));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'clipping mode'));
	}
}

function* setClipEdit({isClipEdit}) {
	try {
		if (isClipEdit) {
			yield Viewer.startClipEdit();
		} else {
			yield Viewer.stopClipEdit();
		}
		yield put(ViewerActions.setClipEditSuccess(isClipEdit));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'clip edit'));
	}
}

function* setMetadataVisibility({ visible }) {
	try {
		yield put(ViewerActions.setPanelVisibility(VIEWER_PANELS.METADATA, visible));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'metadata visibility'));
	}
}

function* setMeasureVisibility({ visible }) {
	try {
		const metadataActive = yield select(selectIsMetadataVisible);
		if (visible && metadataActive) {
			yield put(ViewerActions.setMetadataVisibility(false));
			yield put(BimActions.setIsActive(false));
		}

		yield put(MeasureActions.setMeasureActive(visible));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'measure visibility'));
	}
}

function* clearHighlights() {
	try {
		Viewer.clearHighlights();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('clear', 'highlights'));
	}
}

function* setCamera({ params }) {
	try {
		Viewer.setCamera(params);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'camera'));
	}
}

function* changePinColor({ params }) {
	try {
		const { id, colours } = params;
		Viewer.changePinColor({ id, colours });
	} catch (error) {
		yield put(DialogActions.showErrorDialog('change', 'pin colour'));
	}
}

function* removeUnsavedPin() {
	try {
		Viewer.removePin({ id: NEW_PIN_ID });
		Viewer.setPin(null);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('remove', 'unsaved pin'));
	}
}

function* loadModel() {
	try {
		const { teamspace, model, revision } = yield select(selectUrlParams);
		const modelSettings = yield select(selectSettings);

		yield Viewer.loadViewerModel(teamspace, model, 'master', revision || 'head');
		yield Viewer.updateViewerSettings(modelSettings);
	} catch (error) {
		const content = 'The model was either not found, failed to load correctly ' +
			'or you are not authorized to view it. ' +
			' You will now be redirected to the teamspace page.';
		yield put(DialogActions.showDialog({
			title: 'Model Error',
			content
		})
		yield put(push(ROUTES.TEAMSPACES));
	}
}

export default function* ViewerSaga() {
	yield takeLatest(ViewerTypes.WAIT_FOR_VIEWER, waitForViewer);
	yield takeLatest(ViewerTypes.MAP_INITIALISE, mapInitialise);
	yield takeLatest(ViewerTypes.RESET_MAP_SOURCES, resetMapSources);
	yield takeLatest(ViewerTypes.ADD_MAP_SOURCE, addMapSource);
	yield takeLatest(ViewerTypes.REMOVE_MAP_SOURCE, removeMapSource);
	yield takeLatest(ViewerTypes.MAP_START, mapStart);
	yield takeLatest(ViewerTypes.MAP_STOP, mapStop);
	yield takeLatest(ViewerTypes.GET_SCREENSHOT, getScreenshot);
	yield takeLatest(ViewerTypes.INITIALISE_TOOLBAR, initialiseToolbar);
	yield takeLatest(ViewerTypes.SET_NAVIGATION_MODE, setNavigationMode);
	yield takeLatest(ViewerTypes.RESET_HELICOPTER_SPEED, resetHelicopterSpeed);
	yield takeLatest(ViewerTypes.GET_HELICOPTER_SPEED, getHelicopterSpeed);
	yield takeLatest(ViewerTypes.INCREASE_HELICOPTER_SPEED, increaseHelicopterSpeed);
	yield takeLatest(ViewerTypes.DECREASE_HELICOPTER_SPEED, decreaseHelicopterSpeed);
	yield takeLatest(ViewerTypes.GO_TO_EXTENT, goToExtent);
	yield takeLatest(ViewerTypes.SET_CLIPPING_MODE, setClippingMode);
	yield takeLatest(ViewerTypes.SET_METADATA_VISIBILITY, setMetadataVisibility);
	yield takeLatest(ViewerTypes.SET_MEASURE_VISIBILITY, setMeasureVisibility);
	yield takeLatest(ViewerTypes.UPDATE_CLIP_STATE, updateClipState);
	yield takeLatest(ViewerTypes.SET_CLIP_EDIT, setClipEdit);
	yield takeLatest(ViewerTypes.START_LISTEN_ON_NUM_CLIP, startListenOnNumClip);
	yield takeLatest(ViewerTypes.STOP_LISTEN_ON_NUM_CLIP, stopListenOnNumClip);
	yield takeLatest(ViewerTypes.START_LISTEN_ON_MODEL_LOADED, startListenOnModelLoaded);
	yield takeLatest(ViewerTypes.STOP_LISTEN_ON_MODEL_LOADED, stopListenOnModelLoaded);
	yield takeLatest(ViewerTypes.CLEAR_HIGHLIGHTS, clearHighlights);
	yield takeLatest(ViewerTypes.SET_CAMERA, setCamera);
	yield takeLatest(ViewerTypes.CHANGE_PIN_COLOR, changePinColor);
	yield takeLatest(ViewerTypes.REMOVE_UNSAVED_PIN, removeUnsavedPin);
	yield takeLatest(ViewerTypes.LOAD_MODEL, loadModel);
}
