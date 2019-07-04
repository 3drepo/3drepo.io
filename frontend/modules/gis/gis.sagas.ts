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

import { put, takeLatest, select } from 'redux-saga/effects';

import { GisTypes, GisActions } from './gis.redux';
import { selectVisibleSources } from './gis.selectors';
import { DialogActions } from '../dialog';
import { Viewer } from '../../services/viewer/viewer';

export function* initialiseMap({params}) {
	try {
		Viewer.mapInitialise(params);
		yield put(GisActions.initialiseMapSuccess(true));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'map', error));
	}
}

export function* addSource({source}) {
	try {
		const visibleSources = yield select(selectVisibleSources);

		if (!visibleSources.includes(source)) {
			Viewer.addMapSource(source);
		}

		if (!visibleSources.length) {
			Viewer.mapStart();
		}
		yield put(GisActions.addSourceSuccess(source));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('add', 'source', error));
	}
}

export function* removeSource({source}) {
	try {
		Viewer.removeMapSource(source);
		const visibleSources = yield select(selectVisibleSources);

		if (visibleSources.length === 1) {
			Viewer.mapStop();
		}

		yield put(GisActions.removeSourceSuccess(source));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('remove', 'source', error));
	}
}

export function* resetSources() {
	try {
		yield put(GisActions.resetMap());
		yield put(GisActions.resetSourcesSuccess());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', 'sources', error));
	}
}

export function* resetMap() {
	try {
		Viewer.resetMapSources();
		Viewer.mapStop();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('reset', 'map', error));
	}
}

export default function* GisSaga() {
	yield takeLatest(GisTypes.INITIALISE_MAP, initialiseMap);
	yield takeLatest(GisTypes.ADD_SOURCE, addSource);
	yield takeLatest(GisTypes.REMOVE_SOURCE, removeSource);
	yield takeLatest(GisTypes.RESET_SOURCES, resetSources);
	yield takeLatest(GisTypes.RESET_MAP, resetMap);
}
