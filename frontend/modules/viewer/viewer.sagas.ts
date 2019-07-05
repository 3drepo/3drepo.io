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
import { pipe, keys, filter, map } from 'ramda';
import { ViewerTypes, ViewerActions } from './viewer.redux';
import { DialogActions } from '../dialog';
import { selectSettings } from './viewer.selectors';
import { Viewer } from '../../services/viewer/viewer';

const actionsMap = {
	farPlaneAlgorithm: (newFarPlaneAlgorithm) => {
		Viewer.setFarPlaneAlgorithm(newFarPlaneAlgorithm);
	},
	farPlaneSamplingPoints: (newFarPlaneSamplingPoints) => {
		Viewer.setFarPlaneSamplingPoints(newFarPlaneSamplingPoints);
	},
	nearPlane: (newNearPlane) => {
		Viewer.setNearPlane(newNearPlane);
	},
	shading: (newShading) => {
		Viewer.setShading(newShading);
	},
	shadows: (newShadows) => {
		Viewer.setShadows(newShadows);
	},
	statistics: (newStatistics) => {
		Viewer.setStats(newStatistics);
	},
	xray: (newXray) => {
		Viewer.setXray(newXray);
	}
};

const callAction = (key, value) => actionsMap[key](value);

const callActionsByDifferentKeys = (a, b) => pipe(
	keys,
	filter((key) => a[key] !== b[key]),
	map((key) => callAction(key, b[key]))
)(a);

function* updateSettings({ settings }) {
	try {
		const oldSettings = yield select(selectSettings);
		callActionsByDifferentKeys(oldSettings, settings);

		window.localStorage.setItem('visualSettings', JSON.stringify(settings));
		yield put(ViewerActions.updateSettingsSuccess(settings));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'viewer', error));
	}
}

export default function* ViewerSaga() {
	yield takeLatest(ViewerTypes.UPDATE_SETTINGS, updateSettings);
}
