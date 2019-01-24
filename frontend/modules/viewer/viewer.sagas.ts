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
import { getAngularService } from '../../helpers/migration';

import { ViewerTypes, ViewerActions } from './viewer.redux';

const getViewer = () => {
	const ViewerService = getAngularService('ViewerService') as any;
	return ViewerService.getViewer();
};

export function* waitForViewer() {
	try {
		const ViewerService = yield getAngularService('ViewerService') as any;
		yield ViewerService.initialised.promise;
	} catch (error) {
		console.error(error);
	}
}

export function* mapInitialise({surveyPoints, sources = []}) {
	try {
		yield put(ViewerActions.waitForViewer());

		const viewer = getViewer();
		viewer.mapInitialise(surveyPoints);
		sources.map(viewer.addMapSource);
	} catch (error) {
		console.error(error);
	}
}

export function* resetMapSources({source}) {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().resetMapSources(source);
	} catch (error) {
		console.error(error);
	}
}

export function* addMapSource({source}) {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().addMapSource(source);
	} catch (error) {
		console.error(error);
	}
}

export function* removeMapSource({source}) {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().removeMapSource(source);
	} catch (error) {
		console.error(error);
	}
}

export function* mapStart() {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().mapStart();
	} catch (error) {
		console.error(error);
	}
}

export function* mapStop() {
	try {
		yield put(ViewerActions.waitForViewer());
		getViewer().mapStop();
	} catch (error) {
		console.error(error);
	}
}

export default function* ViewerSaga() {
	yield takeLatest(ViewerTypes.WAIT_FOR_VIEWER, waitForViewer);
	yield takeLatest(ViewerTypes.MAP_INITIALISE, mapInitialise);
	yield takeLatest(ViewerTypes.RESET_MAP_SOURCES, resetMapSources);
	yield takeLatest(ViewerTypes.ADD_MAP_SOURCE, addMapSource);
	yield takeLatest(ViewerTypes.REMOVE_MAP_SOURCE, removeMapSource);
	yield takeLatest(ViewerTypes.MAP_START, mapStart);
	yield takeLatest(ViewerTypes.MAP_STOP, mapStop);
}
