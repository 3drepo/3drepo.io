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
import { DEFAULT_SETTINGS } from '../../constants/viewer';
import { Viewer } from '../../services/viewer/viewer';
import { selectCurrentUser } from '../currentUser';
import { DialogActions } from '../dialog';
import { ViewerActions, ViewerTypes } from './viewer.redux';
import { selectSettings } from './viewer.selectors';

const BUNDLE_FADE_PREFIX = "phBundleFade";
const updateHandlers = {
	farPlaneAlgorithm: Viewer.setFarPlaneAlgorithm,
	farPlaneSamplingPoints: Viewer.setFarPlaneSamplingPoints,
	nearPlane: Viewer.setNearPlane,
	viewerBackgroundColor: Viewer.setViewerBackgroundColor,
	shadows: Viewer.setShadows,
	statistics: Viewer.setStats,
	caching: Viewer.setModelCache,
	maxShadowDistance: Viewer.setMaxShadowDistance,
	xray: Viewer.setXray,
	clipPlaneBorderWidth: Viewer.setPlaneBorderWidth,
	clipPlaneBorderColor: Viewer.setPlaneBorderColor,
	memoryThreshold: Viewer.setStreamingMemoryThreshold,
	unityMemory: Viewer.setUnityMemory,
	meshFactor: Viewer.setStreamingMeshFactor,
	phBundleColor: Viewer.setStreamingBundlesColor,
	maxNearPlane: Viewer.setMaxNearPlane,
	maxFarPlane: Viewer.setMaxFarPlane,
	fovWeight: Viewer.setStreamingFovWeight,
	[BUNDLE_FADE_PREFIX]: Viewer.setStreamingBundlesFade,
	phBundleFaceAlpha: Viewer.setStreamingBundlesFacesAlpha,
	phBundleLineAlpha: Viewer.setStreamingBundlesLinesAlpha,
	phElementColor: Viewer.setStreamingElementsColor,
	phElementRenderingRadius: Viewer.setStreamingElementsRenderingRadius,
	phElementFaceAlpha: Viewer.setStreamingElementsFacesAlpha,
	phElementLineAlpha: Viewer.setStreamingElementsLinesAlpha,
};

const callUpdateHandlers = (oldSettings, settings) => {
	let bundleFadeDone = false;
	keys(settings).forEach((key) => {
		if (oldSettings[key] !== settings[key]) {
			if (key.startsWith(BUNDLE_FADE_PREFIX)) {
				if (!bundleFadeDone) {
					const update = updateHandlers[BUNDLE_FADE_PREFIX];
					if (!update) {
						return;
					}

					update(
						settings[`${BUNDLE_FADE_PREFIX}Distance`],
						settings[`${BUNDLE_FADE_PREFIX}Bias`],
						settings[`${BUNDLE_FADE_PREFIX}Power`]
					);
					bundleFadeDone = true;
				}
			} else {
				const update = updateHandlers[key];
				if (!update) {
					return;
				}

				update(settings[key]);
			}
		}
	});
};

function* updateSettings({username, settings}) {
	try {
		const oldSettings = yield select(selectSettings);
		callUpdateHandlers(oldSettings, settings);

		window.localStorage.setItem(`${username}.visualSettings`, JSON.stringify(settings));

		yield put(ViewerActions.updateSettingsSuccess(settings));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('initialise', 'viewer', error));
	}
}

export function* fetchSettings() {
	const { username } = yield select(selectCurrentUser);

	// This function may be called prior to username is available.
	const storedUserSettings = username ? window.localStorage.getItem(`${username}.visualSettings`) : null;
	const legacyStoredSettings = window.localStorage.getItem('visualSettings');

	const currentSettings  = {
		...DEFAULT_SETTINGS,
		...JSON.parse(
			storedUserSettings || legacyStoredSettings || '{}',
		),
	};

	// We have our settings ready to be saved to the new user local storage settings key, so we get rid of the old setting
	window.localStorage.setItem('visualSettings', null);

	yield put(ViewerActions.updateSettings(username, currentSettings));
}

export default function* ViewerSaga() {
	yield takeLatest(ViewerTypes.UPDATE_SETTINGS, updateSettings);
	yield takeLatest(ViewerTypes.FETCH_SETTINGS, fetchSettings);
}
