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

import { all, put, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { getAngularService, dispatch } from './../../helpers/migration';
import { modelStatusesMap, uploadFileStatuses } from './model.helpers';
import { DialogActions } from '../dialog';
import { ModelTypes, ModelActions } from './model.redux';
import { TeamspacesActions } from '../teamspaces';
import { SnackbarActions } from './../snackbar';

export function* fetchSettings({ teamspace, modelId }) {
	try {
		yield put(ModelActions.setPendingState(true));

		const { data: settings } = yield API.getModelSettings(teamspace, modelId);

		yield put(ModelActions.fetchSettingsSuccess(settings));
		yield put(ModelActions.setPendingState(false));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('fetch', 'model settings', e.response));
	}
}

export function* updateSettings({ modelData: { teamspace, project, modelId }, settings }) {
	try {
		yield API.editModelSettings(teamspace, modelId, settings);

		yield put(TeamspacesActions.updateModelSuccess(
			teamspace, modelId, { project, model: modelId, name: settings.name } ));
		yield put(SnackbarActions.show('Updated model settings'));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('update', 'model settings', e.response));
	}
}

export function* fetchRevisions({ teamspace, modelId }) {
	try {
		yield put(ModelActions.setPendingState(true));

		const { data: revisions } = yield API.getModelRevisions(teamspace, modelId);

		yield put(ModelActions.fetchRevisionsSuccess(revisions));
		yield put(ModelActions.setPendingState(false));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('fetch', 'model revisions', e.response));
	}
}

export function* downloadModel({ teamspace, modelId }) {
	try {
		const url = yield API.getAPIUrl(`${teamspace}/${modelId}/download/latest`);
		window.open(url, '_blank');
	} catch (e) {
		yield put(DialogActions.showErrorDialog('download', 'model', e.response));
	}
}

export function* onModelStatusChanged({ modelData: { status }, teamspace, project, modelId }) {
	yield put(TeamspacesActions.setModelUploadStatus(teamspace, project, modelId, modelStatusesMap[status]));
}

export function* subscribeOnStatusChange({ teamspace, project, modelId }) {
	const notificationService = yield getAngularService('NotificationService');
	const modelNotifications = yield notificationService.getChannel(teamspace, modelId).model;

	const onChanged = (modelData) => dispatch(ModelActions.onModelStatusChanged(modelData, teamspace, project, modelId));
	modelNotifications.subscribeToStatusChanged(onChanged, this);
}

export function* unsubscribeOnStatusChange({ teamspace, project, modelId }) {
	const notificationService = yield getAngularService('NotificationService');
	const modelNotifications = yield notificationService.getChannel(teamspace, modelId).model;

	const onChanged = (modelData) => dispatch(ModelActions.onModelStatusChanged(modelData, teamspace, project, modelId));
	modelNotifications.unsubscribeFromStatusChanged(onChanged, this);
}

export function* uploadModelFile({ teamspace, project, modelId, fileData }) {
	try {
		const formData = new FormData();
		formData.append('file', fileData.file);
		formData.append('tag', fileData.tag);
		formData.append('desc', fileData.desc);

		const { data: { status }, data } = yield API.uploadModelFile(teamspace, modelId, formData);

		if (status === uploadFileStatuses.OK) {
			if (data.hasOwnProperty('errorReason') && data.errorReason.message) {
				yield put(SnackbarActions.show(data.errorReason.message));
			} else {
				yield put(SnackbarActions.show('Model uploaded succesfully'));
			}
		}
		if (status === uploadFileStatuses.FAILED) {
			yield put(SnackbarActions.show('Failed to import model'));
		}
	} catch (e) {
		yield put(DialogActions.showErrorDialog('download', 'model', e.response));
	}
}

export default function* ModelSaga() {
	yield takeLatest(ModelTypes.FETCH_SETTINGS, fetchSettings);
	yield takeLatest(ModelTypes.UPDATE_SETTINGS, updateSettings);
	yield takeLatest(ModelTypes.FETCH_REVISIONS, fetchRevisions);
	yield takeLatest(ModelTypes.DOWNLOAD_MODEL, downloadModel);
	yield takeLatest(ModelTypes.UPLOAD_MODEL_FILE, uploadModelFile);
	yield takeLatest(ModelTypes.ON_MODEL_STATUS_CHANGED, onModelStatusChanged);
	yield takeLatest(ModelTypes.SUBSCRIBE_ON_STATUS_CHANGE, subscribeOnStatusChange);
	yield takeLatest(ModelTypes.UNSUBSCRIBE_ON_STATUS_CHANGE, unsubscribeOnStatusChange);
}
