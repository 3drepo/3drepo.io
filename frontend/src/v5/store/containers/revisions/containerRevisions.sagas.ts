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

import { put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { ContainerRevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { orderBy } from 'lodash';
import { CreateRevisionAction,
	FetchAction,
	ContainerRevisionsActions,
	ContainerRevisionsTypes,
	SetRevisionVoidStatusAction,
} from './containerRevisions.redux';
import { ContainersActions } from '../containers.redux';
import { UploadStatus } from '../containers.types';
import { createContainerFromRevisionBody, createFormDataFromRevisionBody } from './containerRevisions.helpers';
import { selectRevisions } from './containerRevisions.selectors';

export function* fetch({ teamspace, projectId, containerId, onSuccess }: FetchAction) {
	yield put(ContainerRevisionsActions.setIsPending(containerId, true));
	try {
		const { data: { revisions } } = yield API.ContainerRevisions.fetchRevisions(teamspace, projectId, containerId);
		onSuccess?.();
		yield put(ContainerRevisionsActions.fetchSuccess(containerId, revisions));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'revisions.fetch.error', defaultMessage: 'trying to fetch revisions' }),
			error,
		}));
	}
	yield put(ContainerRevisionsActions.setIsPending(containerId, false));
}

export function* setVoidStatus({ teamspace, projectId, containerId, revisionId, isVoid }: SetRevisionVoidStatusAction) {
	try {
		yield API.ContainerRevisions.setRevisionVoidStatus(teamspace, projectId, containerId, revisionId, isVoid);
		yield put(ContainerRevisionsActions.setVoidStatusSuccess(containerId, revisionId, isVoid));
		const revisions = yield select(selectRevisions, containerId);
		const activeRevisions = revisions.filter((rev) => !rev.void);
		const revisionsCount = activeRevisions.length;
		const latestRevision = revisionsCount ? orderBy(activeRevisions, 'timestamp')[0].tag : null;
		const updates = {
			revisionsCount,
			lastUpdated: new Date(),
			latestRevision,
		};
		yield put(ContainersActions.updateContainerSuccess(projectId, containerId, updates));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'revisions.setVoid.error', defaultMessage: 'trying to set revision void status' }),
			error,
		}));
	}
}

export function* createRevision({ teamspace, projectId, uploadId, body }: CreateRevisionAction) {
	let { containerId } = body;
	if (!containerId) {
		try {
			const newContainer = createContainerFromRevisionBody(body);
			containerId = yield API.Containers.createContainer(teamspace, projectId, newContainer);
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
			yield put(ContainerRevisionsActions.setUploadComplete(uploadId, true,
				formatMessage({ id: 'revisions.error.noContainer', defaultMessage: 'Failed to create Container' })));
			return;
		}
		yield put(ContainerRevisionsActions.setUploadComplete(uploadId, false));
		yield API.ContainerRevisions.createRevision(
			teamspace,
			projectId,
			containerId,
			(percent) => ContainerRevisionsActionsDispatchers.setUploadProgress(uploadId, percent),
			createFormDataFromRevisionBody(body),
		);
		yield put(ContainersActions.setContainerStatus(projectId, containerId, UploadStatus.QUEUED));
		yield put(ContainerRevisionsActions.setUploadComplete(uploadId, true));
	} catch (error) {
		let errorMessage = error.message;
		if (error.response) {
			const { message, status, code } = error.response.data;
			errorMessage = `${status} - ${code} (${message})`;
		}
		yield put(ContainerRevisionsActions.setUploadComplete(uploadId, true, errorMessage));
	}
}

export default function* ContainerRevisionsSaga() {
	yield takeLatest(ContainerRevisionsTypes.FETCH, fetch);
	yield takeLatest(ContainerRevisionsTypes.SET_VOID_STATUS, setVoidStatus);
	yield takeEvery(ContainerRevisionsTypes.CREATE_REVISION, createRevision);
}
