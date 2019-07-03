import { put, select, takeLatest } from 'redux-saga/effects';

import { Viewer } from '../../services/viewer/viewer';
import { DialogActions } from '../dialog';

export function* getCurrentViewpoint(params) {
	try {
		return yield Viewer.getCurrentViewpoint(params);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'current viewpoint'));
		return {};
	}
}

export function* getObjectsStatus() {
	try {
		return yield Viewer.getObjectsStatus();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'objects status'));
		return {};
	}
}

export function* getScreenshot() {
	try {
		return yield Viewer.getScreenshot();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'screenshot'));
		return {};
	}
}
