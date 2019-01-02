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
import { ViewerActions } from '../viewer';
import { selectVisibleSources } from './gis.selectors';

export function* initializeMap({params}) {
	try {
		yield put(ViewerActions.mapInitialise(params));
		yield put(GisActions.initializeMapSuccess(true));

	} catch (error) {}
}

export function* addSource({source}) {
	try {
		const visibleSources = yield select(selectVisibleSources);

		if (!visibleSources.includes(source)) {
			yield put(ViewerActions.addMapSource(source));
		}

		if (!visibleSources.length) {
			yield put(ViewerActions.mapStart());
		}
		yield put(GisActions.addSourceSuccess(source));
	} catch (error) {}
}

export function* removeSource({source}) {
	try {
		yield put(ViewerActions.removeMapSource(source));
		const visibleSources = yield select(selectVisibleSources);

		if (visibleSources.length === 1) {
			yield put(ViewerActions.mapStop());
		}

		yield put(GisActions.removeSourceSuccess(source));
	} catch (error) {}
}

export function* resetSources() {
	try {
		yield put(GisActions.resetMap());
		yield put(GisActions.resetSourcesSuccess());
	} catch (error) {}
}

export function* resetMap() {
	try {
		yield put(ViewerActions.resetMapSources());
		yield put(ViewerActions.mapStop());
	} catch (error) { }
}

export default function* GisSaga() {
	yield takeLatest(GisTypes.INITIALIZE_MAP, initializeMap);
	yield takeLatest(GisTypes.ADD_SOURCE, addSource);
	yield takeLatest(GisTypes.REMOVE_SOURCE, removeSource);
	yield takeLatest(GisTypes.RESET_SOURCES, resetSources);
	yield takeLatest(GisTypes.RESET_MAP, resetMap);
}
