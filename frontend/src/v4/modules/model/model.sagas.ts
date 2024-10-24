/**
 *  Copyright (C) 2020 3D Repo Ltd
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
import { put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';

import { getAPIUrl } from '@/v4/services/api/default';
import { dispatch } from '@/v5/helpers/redux.helpers';
import { CHAT_CHANNELS } from '../../constants/chat';
import * as API from '../../services/api';
import { clientConfigService } from '../../services/clientConfig';
import { ChatActions } from '../chat';
import { selectCurrentUser } from '../currentUser';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { TeamspacesActions } from '../teamspaces';
import { uploadFileStatuses } from './model.helpers';
import { ModelActions, ModelTypes } from './model.redux';
import { selectRevisions } from './model.selectors';

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

export function* fetchMetaKeys({ teamspace, modelId }) {
	try {
		const { data: metaKeys } = yield API.getMetaKeys(teamspace, modelId);
		yield put(ModelActions.fetchMetaKeysSuccess(metaKeys));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'meta keys', e));
	}
}

export function* updateSettings({ modelData: { teamspace, project, modelId }, settings }) {
	try {
		const modifiedSettings = cloneDeep(settings);

		yield API.editModelSettings(teamspace, modelId, modifiedSettings);
		yield put(
			TeamspacesActions.updateModelSuccess(
				teamspace, modelId, { project, model: modelId, name: modifiedSettings.name, code: modifiedSettings.code }
			)
		);

		yield put(ModelActions.updateSettingsSuccess(settings));
		yield put(SnackbarActions.show('Updated model settings'));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'model settings', e));
	}
}

export function* fetchRevisions({ teamspace, modelId, showVoid = false }) {
	try {
		yield put(ModelActions.setPendingState(true));

		const { data: revisions } = yield API.getModelRevisions(teamspace, modelId, showVoid);

		yield put(ModelActions.fetchRevisionsSuccess(revisions));
		yield put(ModelActions.setPendingState(false));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'model revisions', e));
	}
}

export function* setModelRevisionState({ teamspace, modelId, revision, isVoid }) {
	try {
		yield put(ModelActions.setPendingRevision(revision));
		const revisions = yield select(selectRevisions);
		const changedRevision = revisions.find((rev) => rev._id === revision);

		if (Boolean(changedRevision.void) !== isVoid) {
			yield API.setModelRevisionState(teamspace, modelId, revision, isVoid);
			yield put(ModelActions.setModelRevisionStateSuccess(revision, isVoid));
		}
		yield put(ModelActions.setPendingRevision(null));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('set', 'model revision state', e));
	}
}

export function* waitForSettingsAndFetchRevisions({ teamspace, modelId }) {
	try {
		yield take(ModelTypes.FETCH_SETTINGS_SUCCESS);
		yield put(ModelActions.fetchRevisions(teamspace, modelId, false));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'model revisions', e));
	}
}

export function* downloadModel({ teamspace, modelId }) {
	try {
		const url = yield getAPIUrl(`${teamspace}/${modelId}/download/latest`);
		window.open(url, '_blank');
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('download', 'model', e));
	}
}

export function* onModelStatusChanged({ modelData, teamspace, project, modelId, modelName}) {
	yield put(TeamspacesActions.setModelUploadStatus(teamspace, project, modelId, modelData));
	/* FIXME: this is hacky. At the moment there's no way to differentiate a model
	 * change triggered by chat and a model changed because model settings data got modified...
	 * If the modelData doesnt' have an id, we know it came from chat... very hacky. */

	const currentUser = yield select(selectCurrentUser);
	if (modelData.user !== currentUser.username) {
		return;
	}

	if (modelData.status === uploadFileStatuses.ok) {
		yield put(SnackbarActions.show(`Model ${modelName} uploaded successfully`));
	} else if (modelData.status === uploadFileStatuses.failed) {
		if (modelData.hasOwnProperty('errorReason') && modelData.errorReason.message) {
			yield put(SnackbarActions.show(`Failed to import ${modelName} model: ${modelData.errorReason.message}`));
		} else {
			yield put(SnackbarActions.show(`Failed to import ${modelName} model`));
		}
	}
}

const onChanged = (teamspace, project, modelId, modelName) => (changedModelData) =>
	dispatch(ModelActions.onModelStatusChanged(changedModelData, teamspace, project, modelId, modelName));

export function* subscribeOnStatusChange({ teamspace, project, modelData }) {
	const { modelId, modelName } = modelData;

	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.MODEL, teamspace, modelId, {
		subscribeToStatusChanged: onChanged(teamspace, project, modelId, modelName)
	}));
}

export function* unsubscribeOnStatusChange({ teamspace, project, modelData }) {
	const { modelId, modelName } = modelData;

	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.MODEL, teamspace, modelId, {
		unsubscribeToStatusChanged: onChanged(teamspace, project, modelId, modelName)
	}));
}

const isTagFormatInValid = (tag) => {
	return tag && !tag.match(clientConfigService.tagRegExp);
};

export function* uploadModelFile({ teamspace, project, modelData, fileData, handleClose }) {
	try {
		const isInvalidTag = isTagFormatInValid(fileData.tag);
		yield put(ModelActions.setModelUploadingState(true));

		if (isInvalidTag) {
			const INVALID_TAG_MESSAGE =
				`Invalid revision name;
				check length is between 1 and 20 and uses alphanumeric characters
			`;

			yield put(SnackbarActions.show(INVALID_TAG_MESSAGE));
		} else if (fileData.file.size > clientConfigService.uploadSizeLimit) {
			const size = clientConfigService.uploadSizeLimit / 1048576 as any;
			const maxSize = parseInt(size, 10).toFixed(0);
			const MAX_SIZE_MESSAGE = `File exceeds size limit of ${maxSize}mb`;

			yield put(SnackbarActions.show(MAX_SIZE_MESSAGE));
		} else {
			const formData = new FormData();
			formData.append('file', fileData.file);
			formData.append('tag', fileData.tag);
			if (fileData.desc) {
				formData.append('desc', fileData.desc);
			}
			if (fileData.importAnimations !== undefined) {
				formData.append('importAnimations', fileData.importAnimations);
			}
			if (fileData.timezone !== undefined) {
				formData.append('timezone', fileData.timezone);
			}

			const { modelId, modelName } = modelData;
			const { data: { status }, data } = yield API.uploadModelFile(teamspace, modelId, formData);
			handleClose();

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
		}
		yield put(ModelActions.setModelUploadingState(false));
	} catch (e) {
		handleClose();
		yield put(ModelActions.setModelUploadingState(false));
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

export default function* ModelSaga() {
	yield takeLatest(ModelTypes.FETCH_SETTINGS, fetchSettings);
	yield takeLatest(ModelTypes.FETCH_META_KEYS, fetchMetaKeys);
	yield takeLatest(ModelTypes.UPDATE_SETTINGS, updateSettings);
	yield takeLatest(ModelTypes.FETCH_REVISIONS, fetchRevisions);
	yield takeLatest(ModelTypes.DOWNLOAD_MODEL, downloadModel);
	yield takeLatest(ModelTypes.UPLOAD_MODEL_FILE, uploadModelFile);
	yield takeLatest(ModelTypes.ON_MODEL_STATUS_CHANGED, onModelStatusChanged);
	yield takeLatest(ModelTypes.SUBSCRIBE_ON_STATUS_CHANGE, subscribeOnStatusChange);
	yield takeLatest(ModelTypes.UNSUBSCRIBE_ON_STATUS_CHANGE, unsubscribeOnStatusChange);
	yield takeLatest(ModelTypes.FETCH_MAPS, fetchMaps);
	yield takeLatest(ModelTypes.WAIT_FOR_SETTINGS_AND_FETCH_REVISIONS, waitForSettingsAndFetchRevisions);
	yield takeEvery(ModelTypes.SET_MODEL_REVISION_STATE, setModelRevisionState);
}
