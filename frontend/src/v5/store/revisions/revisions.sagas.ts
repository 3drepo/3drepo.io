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
import { FetchAction, RevisionsActions, RevisionsTypes, SetRevisionVoidStatusAction, DownloadAction } from './revisions.redux';

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

export function* download({ teamspace, projectId, containerId, revisionId }: DownloadAction) {
	try {
		const url = API.Revisions.getRevisionFileUrl(teamspace, projectId, containerId, revisionId);
		window.open(url, '_blank');
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'revisions.download.error', defaultMessage: 'trying to download revision file' }),
			error,
		}));
	}
}

export default function* RevisionsSaga() {
	yield takeLatest(RevisionsTypes.FETCH, fetch);
	yield takeLatest(RevisionsTypes.SET_VOID_STATUS, setVoidStatus);
	yield takeEvery(RevisionsTypes.DOWNLOAD, download);
}
