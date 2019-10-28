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
import { mapValues, values } from 'lodash';
import { put, takeEvery, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { SnackbarActions } from '../snackbar';
import { getStarredModelKey } from './starred.contants';
import { StarredActions, StarredTypes } from './starred.redux';

export function* fetchStarredMeta() {
	try {
		const { data: starredMeta } = yield API.getStarredMeta();
		yield put(StarredActions.setStarredMeta(starredMeta));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'starred meta', error));
	}
}

export function* addToStarredMeta({ recordKey }) {
	try {
		yield API.addStarredMeta(recordKey);
		yield put(StarredActions.addToStarredMetaSuccess(recordKey));
		yield put(SnackbarActions.show(`Meta key ${recordKey} added to starred`));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('add', 'starred meta', error));
	}
}

export function* removeFromStarredMeta({ recordKey }) {
	try {
		yield API.removeStarredMeta(recordKey);
		yield put(StarredActions.removeFromStarredMetaSuccess(recordKey));
		yield put(SnackbarActions.show(`Meta key ${recordKey} removed from starred`));
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

export function* fetchStarredModels() {
	try {
		const { data: starredModels } = yield API.getStarredModels();
		const starredItems = (values(mapValues(starredModels, (models, teamspace) => {
			return models.map((model) => getStarredModelKey({ teamspace, model }));
		})) as any).flat();

		yield put(StarredActions.setStarredModels(starredItems));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'starred teamspace items', error));
	}
}

export function* addToStarredModels({ modelData }) {
	try {
		const starredEntity = { teamspace: modelData.teamspace, model: modelData.model };
		yield API.addStarredModel(starredEntity);

		yield put(StarredActions.addToStarredModelsSuccess(getStarredModelKey(starredEntity)));
		yield put(SnackbarActions.show(`${modelData.name} added to starred`));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('add', 'starred teamspace items', error));
	}
}

export function* removeFromStarredModels({ modelData }) {
	try {
		const starredEntity = { teamspace: modelData.teamspace, model: modelData.model };
		yield API.removeStarredModel(starredEntity);

		yield put(StarredActions.removeFromStarredModelsSuccess(getStarredModelKey(starredEntity)));
		yield put(SnackbarActions.show(`${modelData.name} removed from starred`));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'starred teamspace items', error));
	}
}

export default function* StarredMetaSaga() {
	yield takeLatest(StarredTypes.FETCH_STARRED_META, fetchStarredMeta);
	yield takeLatest(StarredTypes.ADD_TO_STARRED_META, addToStarredMeta);
	yield takeLatest(StarredTypes.REMOVE_FROM_STARRED_META, removeFromStarredMeta);
	yield takeLatest(StarredTypes.CLEAR_STARRED_META, clearStarredMeta);

	yield takeLatest(StarredTypes.FETCH_STARRED_MODELS, fetchStarredModels);
	yield takeLatest(StarredTypes.ADD_TO_STARRED_MODELS, addToStarredModels);
	yield takeEvery(StarredTypes.REMOVE_FROM_STARRED_MODELS, removeFromStarredModels);
}
