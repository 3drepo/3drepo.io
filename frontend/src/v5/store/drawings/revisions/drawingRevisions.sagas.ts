/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { put, select, takeEvery, delay } from 'redux-saga/effects';
import * as API from '@/v5/services/api';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { DrawingRevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { orderBy } from 'lodash';
import { CreateRevisionAction,
	FetchAction,
	DrawingRevisionsActions,
	DrawingRevisionsTypes,
	SetRevisionVoidStatusAction,
} from './drawingRevisions.redux';
import { DrawingsActions } from '../drawings.redux';
import { DrawingUploadStatus } from '../drawings.types';
import { createDrawingFromRevisionBody, createFormDataFromRevisionBody } from './drawingRevisions.helpers';
import { selectIsPending, selectRevisions } from './drawingRevisions.selectors';
import { uuid } from '@/v4/helpers/uuid';
import { selectUsername } from '../../currentUser/currentUser.selectors';
import { selectDrawingById } from '../drawings.selectors';

export function* fetch({ teamspace, projectId, drawingId, onSuccess }: FetchAction) {
	if (yield select(selectIsPending, drawingId)) return;

	// TODO - remove next line after backend is wired in
	if ((yield select(selectRevisions, drawingId)).length) return;

	yield put(DrawingRevisionsActions.setIsPending(drawingId, true));
	try {
		// TODO - delete next line and remove last param of API.DrawingRevisions.fetchRevisions, it's for demo
		const drawing = yield select(selectDrawingById, drawingId);
		const { data: { revisions } } = yield API.DrawingRevisions.fetchRevisions(teamspace, projectId, drawingId, drawing.revisionsCount);
		onSuccess?.();
		yield put(DrawingRevisionsActions.fetchSuccess(drawingId, revisions));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'revisions.fetch.error', defaultMessage: 'trying to fetch revisions' }),
			error,
		}));
	}
	yield put(DrawingRevisionsActions.setIsPending(drawingId, false));
}

export function* setVoidStatus({ teamspace, projectId, drawingId, revisionId, isVoid }: SetRevisionVoidStatusAction) {
	try {
		yield API.DrawingRevisions.setRevisionVoidStatus(teamspace, projectId, drawingId, revisionId, isVoid);
		yield put(DrawingRevisionsActions.setVoidStatusSuccess(drawingId, revisionId, isVoid));
		const revisions = yield select(selectRevisions, drawingId);
		const activeRevisions = revisions.filter((rev) => !rev.void);
		const revisionsCount = activeRevisions.length;
		const latestRevision = revisionsCount ? orderBy(activeRevisions, 'timestamp')[0].tag : null;
		const updates = {
			revisionsCount,
			lastUpdated: new Date(),
			latestRevision,
		};
		yield put(DrawingsActions.updateDrawingSuccess(projectId, drawingId, updates));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'drawingRevisions.setVoid.error', defaultMessage: 'trying to set revision void status' }),
			error,
		}));
	}
}

export function* createRevision({ teamspace, projectId, uploadId, body }: CreateRevisionAction) {
	let { drawingId } = body;
	if (!drawingId) {
		try {
			const newDrawing = createDrawingFromRevisionBody(body);
			drawingId = yield API.Drawings.createDrawing(teamspace, projectId, newDrawing);
			yield put(DrawingsActions.createDrawingSuccess(projectId, { _id: drawingId, ...newDrawing }));
		} catch (error) {
			yield put(DialogsActions.open('alert', {
				currentActions: formatMessage({ id: 'revision.drawingsCreation.error', defaultMessage: 'trying to create drawing' }),
				error,
			}));
		}
	}
	try {
		if (!drawingId) {
			yield put(DrawingRevisionsActions.setUploadComplete(uploadId, true,
				formatMessage({ id: 'revisions.error.noDrawing', defaultMessage: 'Failed to create Drawing' })));
			return;
		}
		yield put(DrawingRevisionsActions.setUploadComplete(uploadId, false));
		yield API.DrawingRevisions.createRevision(
			teamspace,
			projectId,
			drawingId,
			(percent) => DrawingRevisionsActionsDispatchers.setUploadProgress(uploadId, percent),
			createFormDataFromRevisionBody(body),
		);
		yield put(DrawingsActions.setDrawingStatus(projectId, drawingId, DrawingUploadStatus.QUEUED));
		yield put(DrawingRevisionsActions.setUploadComplete(uploadId, true));
		// TODO - remove until catch bock after backend is wired in
		yield delay(Math.random() * 1000);
		yield put(DrawingsActions.setDrawingStatus(projectId, drawingId, DrawingUploadStatus.OK));
		const revisions = yield select(selectRevisions, drawingId);
		const author = yield select(selectUsername);
		const newRevisions = [...revisions, {
			_id: uuid(),
			name: body.drawingName,
			timestamp: new Date(),
			desc: body.drawingDesc,
			author,
			format: body.file.name.split('.').slice(-1)[0],
			statusCode: body.statusCode,
			revisionCode: body.revisionCode,
			void: false,
		}];
		yield put(DrawingRevisionsActions.fetchSuccess(drawingId, newRevisions));
		yield put(DrawingsActions.updateDrawingSuccess(projectId, drawingId, { latestRevision: body.revisionCode, revisionsCount: newRevisions.length }));
	} catch (error) {
		let errorMessage = error.message;
		if (error.response) {
			const { message, status, code } = error.response.data;
			errorMessage = `${status} - ${code} (${message})`;
		}
		yield put(DrawingRevisionsActions.setUploadComplete(uploadId, true, errorMessage));
	}
}

export default function* RevisionsSaga() {
	yield takeEvery(DrawingRevisionsTypes.FETCH, fetch);
	yield takeEvery(DrawingRevisionsTypes.SET_VOID_STATUS, setVoidStatus);
	yield takeEvery(DrawingRevisionsTypes.CREATE_REVISION, createRevision);
}
