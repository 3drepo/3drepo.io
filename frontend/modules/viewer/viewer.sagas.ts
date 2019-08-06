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

import { keys } from 'lodash';
import { put, select, takeLatest } from 'redux-saga/effects';
import { Viewer } from '../../services/viewer/viewer';
import { DialogActions } from '../dialog';
import { ViewerActions, ViewerTypes } from './viewer.redux';
import { selectSettings } from './viewer.selectors';

const updateHandlers = {
	farPlaneAlgorithm: Viewer.setFarPlaneAlgorithm,
	farPlaneSamplingPoints: Viewer.setFarPlaneSamplingPoints,
	nearPlane: Viewer.setNearPlane,
	shading: Viewer.setShading,
	shadows: Viewer.setShadows,
	statistics: Viewer.setStats,
	xray: Viewer.setXray
};

const callUpdateHandlers = (oldSettings, settings) => {
	keys(oldSettings).forEach((key) => {
		if (oldSettings[key] !== settings[key]) {
			const update = updateHandlers[key];
			update(settings[key]);
		}
	});
};

function* updateSettings({ settings }) {
	try {
		const oldSettings = yield select(selectSettings);
		callUpdateHandlers(oldSettings, settings);

		window.localStorage.setItem('visualSettings', JSON.stringify(settings));
		yield put(ViewerActions.updateSettingsSuccess(settings));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'viewer', error));
	}
}

export default function* ViewerSaga() {
	yield takeLatest(ViewerTypes.UPDATE_SETTINGS, updateSettings);
}
