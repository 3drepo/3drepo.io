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
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { orderBy } from 'lodash';
import { CreateRevisionAction,
	FetchAction,
	RevisionsActions,
	RevisionsTypes,
	SetRevisionVoidStatusAction,
} from './revisions.redux';
import { ContainersActions } from '../containers/containers.redux';
import { UploadStatuses } from '../containers/containers.types';
import { createContainerFromRevisionBody, createFormDataFromRevisionBody } from './revisions.helpers';
import { selectRevisions } from './revisions.selectors';

export function* fetch({ teamspace, projectId, containerId, onSuccess }: FetchAction) {
	yield put(RevisionsActions.setIsPending(containerId, true));
	try {
		const { data: { revisions } } = yield API.Revisions.fetchRevisions(teamspace, projectId, containerId);
		onSuccess?.();
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
			yield put(RevisionsActions.setUploadComplete(uploadId, true,
				formatMessage({ id: 'revisions.error.noContainer', defaultMessage: 'Failed to create Container' })));
			return;
		}
		yield put(RevisionsActions.setUploadComplete(uploadId, false));
		yield API.Revisions.createRevision(
			teamspace,
			projectId,
			containerId,
			(percent) => RevisionsActionsDispatchers.setUploadProgress(uploadId, percent),
			createFormDataFromRevisionBody(body),
		);
		yield put(ContainersActions.setContainerStatus(projectId, containerId, UploadStatuses.QUEUED));
		yield put(RevisionsActions.setUploadComplete(uploadId, true));
	} catch (error) {
		let errorMessage = error.message;
		if (error.response) {
			const { message, status, code } = error.response.data;
			errorMessage = `${status} - ${code} (${message})`;
		}
		yield put(RevisionsActions.setUploadComplete(uploadId, true, errorMessage));
	}
}

export default function* RevisionsSaga() {
	yield takeLatest(RevisionsTypes.FETCH, fetch);
	yield takeLatest(RevisionsTypes.SET_VOID_STATUS, setVoidStatus);
	yield takeEvery(RevisionsTypes.CREATE_REVISION, createRevision);
}
