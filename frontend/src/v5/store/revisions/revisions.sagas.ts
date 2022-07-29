/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { put, takeEvery, takeLatest } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers/revisionsActions.dispatchers';
import { CreateRevisionAction,
	FetchAction,
	RevisionsActions,
	RevisionsTypes,
	SetRevisionVoidStatusAction,
} from './revisions.redux';
import { ContainersActions } from '../containers/containers.redux';
import { UploadStatuses } from '../containers/containers.types';

export function* fetch({ teamspace, projectId, containerId }: FetchAction) {
	yield put(RevisionsActions.setIsPending(containerId, true));
	try {
		const { data: { revisions } } = yield API.Revisions.fetchRevisions(teamspace, projectId, containerId);

		yield put(RevisionsActions.fetchSuccess(containerId, revisions));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'revisions.fetch.error', defaultMessage: 'trying to fetch revisions' }),
			error,
		}));
	}
	yield put(RevisionsActions.setIsPending(containerId, false));
}

export function* setVoidStatus({ teamspace, projectId, containerId, revisionId, isVoid }: SetRevisionVoidStatusAction) {
	try {
		yield API.Revisions.setRevisionVoidStatus(teamspace, projectId, containerId, revisionId, isVoid);
		yield put(RevisionsActions.setVoidStatusSuccess(containerId, revisionId, isVoid));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'revisions.setVoid.error', defaultMessage: 'trying to set revision void status' }),
			error,
		}));
	}
}

export function* createRevision({ teamspace, projectId, uploadId, body }: CreateRevisionAction) {
	let { containerId } = body;
	const newContainer = {
		name: body.containerName,
		unit: body.containerUnit,
		type: body.containerType,
		code: body.containerCode || undefined,
		desc: body.containerDesc || undefined,
	};
	if (!containerId) {
		try {
			containerId = yield API.Containers.createContainer({ teamspace, projectId, newContainer });
			yield put(ContainersActions.createContainerSuccess(projectId, { _id: containerId, ...newContainer }));
		} catch (error) {
			yield put(DialogsActions.open('alert', {
				currentActions: formatMessage({ id: 'revision.containersCreation.error', defaultMessage: 'trying to create container' }),
				error,
			}));
		}
	}
	try {
		if (!containerId) {
			throw new Error(
				formatMessage({ id: 'revisions.error.noContainer', defaultMessage: 'Failed to create Container' }),
			);
		}
		const formData = new FormData();
		formData.append('file', body.file);
		formData.append('tag', body.revisionTag);
		formData.append('desc', body.revisionDesc || undefined);
		formData.append('importAnimations', body.importAnimations.toString());
		formData.append('timezone', body.timezone);

		yield put(RevisionsActions.setUploadComplete(uploadId, false));
		const updateProgress = (val: number) => {
			RevisionsActionsDispatchers.setUploadProgress(uploadId, val);
		};

		yield API.Revisions.createRevision(
			teamspace,
			projectId,
			containerId,
			(percent) => updateProgress(percent),
			formData,
		);
		yield put(ContainersActions.setContainerStatus(projectId, containerId, UploadStatuses.QUEUED));
		yield put(RevisionsActions.setUploadComplete(uploadId, true));
	} catch (error) {
		let errorMessage = '';
		if (Object.prototype.hasOwnProperty.call(error, 'response')) {
			const { response: { data: { message, status, code } } } = error;
			errorMessage = `${status} - ${code} (${message})`;
		} else errorMessage = error.message;
		yield put(RevisionsActions.setUploadComplete(uploadId, true, errorMessage));
	}
}

export default function* RevisionsSaga() {
	yield takeLatest(RevisionsTypes.FETCH, fetch);
	yield takeLatest(RevisionsTypes.SET_VOID_STATUS, setVoidStatus);
	yield takeEvery(RevisionsTypes.CREATE_REVISION, createRevision);
}
