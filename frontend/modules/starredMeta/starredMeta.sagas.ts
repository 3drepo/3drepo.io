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

import { put, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { StarredMetaTypes, StarredMetaActions } from './starredMeta.redux';

export function* fetchStarredMeta() {
	try {
		const { data: starredMeta } = yield API.getStarredMeta();
		yield put(StarredMetaActions.setStarredMeta(starredMeta));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'starred meta', error));
	}
}

export function* addToStarredMeta({ metaRecordKey }) {
	try {
		yield API.addStarredMeta(metaRecordKey);
		yield put(StarredMetaActions.addToStarredMetaSuccess(metaRecordKey));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('add', 'starred meta', error));
	}
}

export function* removeFromStarredMeta({ metaRecordKey }) {
	try {
		yield API.removeStarredMeta(metaRecordKey);
		yield put(StarredMetaActions.removeFromStarredMetaSuccess(metaRecordKey));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('add', 'starred meta', error));
	}
}

export function* clearStarredMeta() {
	try {
		yield API.overrideStarredMeta([]);
		yield put(StarredMetaActions.setStarredMeta([]));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('override', 'starred meta', error));
	}
}

export default function* StarredMetaSaga() {
	yield takeLatest(StarredMetaTypes.FETCH_STARRED_META, fetchStarredMeta);
	yield takeLatest(StarredMetaTypes.ADD_TO_STARRED_META, addToStarredMeta);
	yield takeLatest(StarredMetaTypes.REMOVE_FROM_STARRED_META, removeFromStarredMeta);
	yield takeLatest(StarredMetaTypes.CLEAR_STARRED_META, clearStarredMeta);
}
