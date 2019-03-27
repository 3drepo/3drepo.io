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

import { put, takeLatest, select } from 'redux-saga/effects';
import { getAngularService, dispatch, getState } from '../../helpers/migration';
import * as API from '../../services/api';
import { VIEWER_EVENTS, VIEWER_PANELS } from '../../constants/viewer';
import { Measure } from '../../services/viewer/measure';

import { ViewerTypes, ViewerActions } from './viewer.redux';
import { DialogActions } from '../dialog';
import {
	selectHelicopterSpeed, selectIsClipEdit, selectClipNumber, selectIsMetadataVisible, selectMeasureState
} from './viewer.selectors';
import { Viewer, INITIAL_HELICOPTER_SPEED } from '../../services/viewer/viewer';
import { VIEWER_CLIP_MODES } from '../../constants/viewer';

export const getViewer = () => {
	const ViewerService = getAngularService('ViewerService') as any;
	return ViewerService.getViewer();
};

export function* waitForViewer() {
	try {
		const ViewerService = yield getAngularService('ViewerService') as any;
		yield ViewerService.initialised.promise;
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'viewer'));
	}
}

export function* mapInitialise({surveyPoints, sources = []}) {
	try {
		yield put(ViewerActions.waitForViewer());

		const viewer = getViewer();
		viewer.mapInitialise(surveyPoints);
		sources.map(viewer.addMapSource);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'map'));
	}
}

export function* initialiseToolbar() {
	try {
		Viewer.on(VIEWER_EVENTS.UPDATE_NUM_CLIP, (clipNumber) => {
			const isClipEdit = selectIsClipEdit(getState());
			const currentClipNumber = selectClipNumber(getState());
			if (currentClipNumber !== clipNumber) {
				dispatch(ViewerActions.setClipNumber(clipNumber));
			}

			if (clipNumber === 0 && isClipEdit) {
				dispatch(ViewerActions.toggleClipEdit());
				dispatch(ViewerActions.setClippingMode(null));
			}
		});

		const helicopterSpeed = yield Viewer.getHelicopterSpeed();
		yield put(ViewerActions.setHelicopterSpeed(helicopterSpeed));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'toolbar'));
	}
}

export function* resetMapSources({source}) {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().resetMapSources(source);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', 'map sources'));
	}
}

export function* addMapSource({source}) {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().addMapSource(source);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('add', 'map source'));
	}
}

export function* removeMapSource({source}) {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().removeMapSource(source);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('remove', 'map source'));
	}
}

export function* mapStart() {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().mapStart();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('start', 'map rendering'));
	}
}

export function* mapStop() {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().mapStop();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('stop', 'map rendering'));
	}
}

export function* getScreenshot() {
	try {
		yield put(ViewerActions.waitForViewer());
		return yield getViewer().getScreenshot();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'screenshot'));
	}
}

export function* showViewpoint(teamspace, modelId, item) {
	try {
		const ViewerService = yield getAngularService('ViewerService') as any;

		if (item) {
			if (item.viewpoint) {
				item.viewpoint.account = teamspace;
				item.viewpoint.model = modelId;

				yield ViewerService.setCamera(item.viewpoint);
			}

			if (item.clippingPlanes) {
				const clipData = {
					clippingPlanes: item.clippingPlanes,
					account: teamspace,
					modelId
				};

				yield ViewerService.updateClippingPlanes(clipData);
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'viewpoint', error));
	}
}

export function* goToExtent() {
	try {
		yield Viewer.goToExtent();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('go', 'to extent'));
	}
}

export function* setNavigationMode({mode}) {
	try {
		yield Viewer.setNavigationMode(mode);
		yield put(ViewerActions.setNavigationModeSuccess(mode));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'navigation mode'));
	}
}

export function* resetHelicopterSpeed({teamspace, modelId, updateDefaultSpeed}) {
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

export function* increaseHelicopterSpeed({teamspace, modelId}) {
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

export function* decreaseHelicopterSpeed({teamspace, modelId}) {
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

export function* setClippingMode({mode}) {
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

export function* toggleClipEdit() {
	try {
		const isClipEdit = yield select(selectIsClipEdit);

		if (!isClipEdit) {
			yield Viewer.startClipEdit();
		} else {
			yield Viewer.stopClipEdit();
		}

		yield put(ViewerActions.setIsClipEdit(!isClipEdit));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'clip edit'));
	}
}

export function* toggleMetadata() {
	try {
		const metadataActive = yield select(selectIsMetadataVisible);
		const measureState = yield select(selectMeasureState);

		if (measureState.active && !metadataActive) {
			yield put(ViewerActions.toggleMeasure());
		}

		const PanelService = getAngularService('PanelService') as any;

		if (!metadataActive) {
			PanelService.showPanelsByType('docs');
		} else {
			PanelService.hidePanelsByType('docs');
		}

		yield put(ViewerActions.setPanelVisibility(VIEWER_PANELS.METADATA, !metadataActive));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'metadata'));
	}
}

export function* toggleMeasure() {
	try {
		const metadataActive = yield select(selectIsMetadataVisible);
		const measureState = yield select(selectMeasureState);

		if (!measureState.active && metadataActive) {
			yield put(ViewerActions.toggleMetadata());
		}

		if (measureState.active) {
			yield Viewer.disableMeasure();
		} else {
			yield Viewer.activateMeasure();
		}

		yield put(ViewerActions.setMeasureState({active: !measureState.active}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'measure'));
	}
}

export function* deactivateMeasure() {
	try {
		yield Viewer.disableMeasure();
		yield put(ViewerActions.setMeasureState({active: false}));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('deactivate', 'measure'));
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
	yield takeLatest(ViewerTypes.INCREASE_HELICOPTER_SPEED, increaseHelicopterSpeed);
	yield takeLatest(ViewerTypes.DECREASE_HELICOPTER_SPEED, decreaseHelicopterSpeed);
	yield takeLatest(ViewerTypes.GO_TO_EXTENT, goToExtent);
	yield takeLatest(ViewerTypes.SET_CLIPPING_MODE, setClippingMode);
	yield takeLatest(ViewerTypes.TOGGLE_CLIP_EDIT, toggleClipEdit);
	yield takeLatest(ViewerTypes.TOGGLE_METADATA, toggleMetadata);
	yield takeLatest(ViewerTypes.TOGGLE_MEASURE, toggleMeasure);
	yield takeLatest(ViewerTypes.DEACTIVATE_MEASURE, deactivateMeasure);
}
