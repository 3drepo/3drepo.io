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

import { cloneDeep } from 'lodash';
import { put, takeLatest, select } from 'redux-saga/effects';

import * as API from '../../services/api';
import { getAngularService, dispatch } from './../../helpers/migration';
import { uploadFileStatuses } from './model.helpers';
import { DialogActions } from '../dialog';
import { ModelTypes, ModelActions } from './model.redux';
import { TeamspacesActions } from '../teamspaces';
import { SnackbarActions } from './../snackbar';
import { selectCurrentUser } from '../currentUser';

export function* fetchSettings({ teamspace, modelId }) {
	try {
		yield put(ModelActions.setPendingState(true));
		const { data: settings } = yield API.getModelSettings(teamspace, modelId);

		yield put(ModelActions.fetchSettingsSuccess(settings));
		yield put(ModelActions.setPendingState(false));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'model settings', e));
	}
}

export function* updateSettings({ modelData: { teamspace, project, modelId }, settings }) {
	try {
		const modifiedSettings = cloneDeep(settings);

		yield API.editModelSettings(teamspace, modelId, modifiedSettings);

		if (project && settings.name) {
			yield put(
				TeamspacesActions.updateModelSuccess(teamspace, modelId, { project, model: modelId, name: settings.name } )
			);
		}
		yield put(ModelActions.updateSettingsSuccess(settings));
		yield put(SnackbarActions.show('Updated model settings'));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'model settings', e));
	}
}

export function* fetchRevisions({ teamspace, modelId }) {
	try {
		yield put(ModelActions.setPendingState(true));

		const { data: revisions } = yield API.getModelRevisions(teamspace, modelId);

		yield put(ModelActions.fetchRevisionsSuccess(revisions));
		yield put(ModelActions.setPendingState(false));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'model revisions', e));
	}
}

export function* downloadModel({ teamspace, modelId }) {
	try {
		const url = yield API.getAPIUrl(`${teamspace}/${modelId}/download/latest`);
		window.open(url, '_blank');
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('download', 'model', e));
	}
}

export function* onModelStatusChanged({ modelData, teamspace, project, modelId, modelName }) {
	yield put(TeamspacesActions.setModelUploadStatus(teamspace, project, modelId, modelData));

	const currentUser = yield select(selectCurrentUser);
	if (modelData.user !== currentUser.username) {
		return;
	}

	if (modelData.status === uploadFileStatuses.ok) {
		yield put(SnackbarActions.show(`Model ${modelName} uploaded successfully`));
	}
	if (modelData.status === uploadFileStatuses.failed) {
		if (modelData.hasOwnProperty('errorReason') && modelData.errorReason.message) {
			yield put(SnackbarActions.show(`Failed to import ${modelName} model: ${modelData.errorReason.message}`));
		} else {
			yield put(SnackbarActions.show(`Failed to import ${modelName} model`));
		}
	}
}

export function* subscribeOnStatusChange({ teamspace, project, modelData }) {
	const { modelId, modelName } = modelData;
	const notificationService = yield getAngularService('ChatService');
	const modelNotifications = yield notificationService.getChannel(teamspace, modelId).model;

	const onChanged = (changedModelData) =>
		dispatch(ModelActions.onModelStatusChanged(changedModelData, teamspace, project, modelId, modelName));
	modelNotifications.subscribeToStatusChanged(onChanged, this);
}

export function* unsubscribeOnStatusChange({ teamspace, project, modelData }) {
	const { modelId, modelName } = modelData;
	const notificationService = yield getAngularService('ChatService');
	const modelNotifications = yield notificationService.getChannel(teamspace, modelId).model;

	const onChanged = (changedModelData) =>
		dispatch(ModelActions.onModelStatusChanged(changedModelData, teamspace, project,  modelId, modelName));
	modelNotifications.unsubscribeFromStatusChanged(onChanged, this);
}

export function* uploadModelFile({ teamspace, project, modelData, fileData }) {
	try {
		const formData = new FormData();
		formData.append('file', fileData.file);
		formData.append('tag', fileData.tag);
		formData.append('desc', fileData.desc);

		const { modelId, modelName } = modelData;
		const { data: { status }, data } = yield API.uploadModelFile(teamspace, modelId, formData);

		if (status === uploadFileStatuses.ok) {
			if (data.hasOwnProperty('errorReason') && data.errorReason.message) {
				yield put(SnackbarActions.show(data.errorReason.message));
			} else {
				yield put(SnackbarActions.show(`Model ${modelName} uploaded successfully`));
			}
		}
		if (status === uploadFileStatuses.failed) {
			if (data.hasOwnProperty('errorReason') && data.errorReason.message) {
				yield put(SnackbarActions.show(`Failed to import ${modelName} model: ${data.errorReason.message}`));
			} else {
				yield put(SnackbarActions.show(`Failed to import ${modelName} model`));
			}
		}
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('upload', 'model', e));
		yield put(TeamspacesActions.setModelUploadStatus(teamspace, project, modelData.modelId, uploadFileStatuses.failed));
	}
}

export function* fetchMaps({ teamspace, modelId }) {
	try {
		const response = yield API.getModelMaps(teamspace, modelId);

		yield put(ModelActions.fetchMapsSuccess(response.data.maps));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'model maps', e));
	}
}

export const getThumbnailUrl = (thumbnail) => API.getAPIUrl(thumbnail);

export function* fetchViewpoints({ teamspace, modelId }) {
	try {
		const { data: viewpoints } = yield API.getModelViewpoints(teamspace, modelId);
		viewpoints.forEach((viewpoint) => {
			if (viewpoint.screenshot && viewpoint.screenshot.thumbnail) {
				viewpoint.screenshot.thumbnailUrl = getThumbnailUrl(viewpoint.screenshot.thumbnail);
			}
		});

		yield put(ModelActions.fetchViewpointsSuccess(viewpoints));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('get', 'model viewpoints', e.response));
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
	yield takeLatest(ModelTypes.FETCH_MAPS, fetchMaps);
	yield takeLatest(ModelTypes.FETCH_VIEWPOINTS, fetchViewpoints);
}
