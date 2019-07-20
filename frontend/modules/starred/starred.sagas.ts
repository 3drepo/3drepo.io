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

import { put, select, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { StarredActions, StarredTypes } from './starred.redux';
import { selectStarredTeamspaceItems } from './starred.selectors';

export function* fetchStarredMeta() {
	try {
		const { data: starredMeta } = yield API.getStarredMeta();
		yield put(StarredActions.setStarredMeta(starredMeta));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'starred meta', error));
	}
}

export function* addToStarredMeta({ metaRecordKey }) {
	try {
		yield API.addStarredMeta(metaRecordKey);
		yield put(StarredActions.addToStarredMetaSuccess(metaRecordKey));
		yield put(SnackbarActions.show(`Meta key ${metaRecordKey} added to starred`));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('add', 'starred meta', error));
	}
}

export function* removeFromStarredMeta({ metaRecordKey }) {
	try {
		yield API.removeStarredMeta(metaRecordKey);
		yield put(StarredActions.removeFromStarredMetaSuccess(metaRecordKey));
		yield put(SnackbarActions.show(`Meta key ${metaRecordKey} removed from starred`));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'starred meta', error));
	}
}

export function* clearStarredMeta() {
	try {
		yield API.overrideStarredMeta([]);
		yield put(StarredActions.setStarredMeta([]));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('override', 'starred meta', error));
	}
}

//

export function* fetchStarredTeamspaceItems() {
	try {
		// const { data: starredTeamspaceItems } = yield API.getStarredTeamspaceItems();
		const starredTeamspaceItems = yield select(selectStarredTeamspaceItems);
		yield put(StarredActions.setStarredTeamspaceItems(starredTeamspaceItems));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'starred teamspace items', error));
	}
}

export function* addToStarredTeamspaceItems({ teamspaceItemKey }) {
	try {
		// yield API.addStarredTeamspaceItem(teamspaceItemKey);
		yield put(StarredActions.addToStarredTeamspaceItemsSuccess(teamspaceItemKey));
		yield put(SnackbarActions.show(`Teamspace item key ${teamspaceItemKey} added to starred`));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('add', 'starred teamspace items', error));
	}
}

export function* removeFromStarredTeamspaceItems({ teamspaceItemKey }) {
	try {
		// yield API.removeStarredTeamspaceItem(teamspaceItemKey);
		yield put(StarredActions.removeFromStarredTeamspaceItemsSuccess(teamspaceItemKey));
		yield put(SnackbarActions.show(`Teamspace item key ${teamspaceItemKey} removed from starred`));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'starred teamspace items', error));
	}
}

export function* clearStarredTeamspaceItems() {
	try {
		yield API.overrideStarredMeta([]);
		yield put(StarredActions.setStarredTeamspaceItems([]));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('override', 'starred teamspace items', error));
	}
}

export default function* StarredMetaSaga() {
	yield takeLatest(StarredTypes.FETCH_STARRED_META, fetchStarredMeta);
	yield takeLatest(StarredTypes.ADD_TO_STARRED_META, addToStarredMeta);
	yield takeLatest(StarredTypes.REMOVE_FROM_STARRED_META, removeFromStarredMeta);
	yield takeLatest(StarredTypes.CLEAR_STARRED_META, clearStarredMeta);

	yield takeLatest(StarredTypes.FETCH_STARRED_TEAMSPACE_ITEMS, fetchStarredTeamspaceItems);
	yield takeLatest(StarredTypes.ADD_TO_STARRED_TEAMSPACE_ITEMS, addToStarredTeamspaceItems);
	yield takeLatest(StarredTypes.REMOVE_FROM_STARRED_TEAMSPACE_ITEMS, removeFromStarredTeamspaceItems);
	yield takeLatest(StarredTypes.CLEAR_STARRED_TEAMSPACE_ITEMS, clearStarredTeamspaceItems);
}
