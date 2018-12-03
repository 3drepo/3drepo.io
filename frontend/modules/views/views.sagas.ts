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

import { put, takeLatest, all } from 'redux-saga/effects';
import { getAngularService } from '../../helpers/migration';
import * as API from '../../services/api';
import { ViewsTypes, ViewsActions } from './views.redux';

function defer() {
	const deferred = {} as any;
	const promise = new Promise((resolve, reject) => {
			deferred.resolve = resolve;
			deferred.reject  = reject;
	});
	deferred.promise = promise;
	return deferred;
}

export function* generateViewpointObject(teamspace, modelId, viewName) {
	try {
		const viewportDefer = defer();
		const screenshotDefer = defer();

		const ViewerService = yield getAngularService('ViewerService') as any;
		yield ViewerService.getCurrentViewpoint({
			promise: viewportDefer,
			account: teamspace,
			model: modelId
		});
		yield ViewerService.getScreenshot(screenshotDefer);

		const result =  yield all([
			viewportDefer.promise,
			screenshotDefer.promise
		]);

		const generatedObject = {
			name: viewName,
			screenshot: {
				base64: result[1]
			},
			viewpoint: {
				position: result[0].position,
				up: result[0].up,
				look_at: result[0].look_at,
				view_dir: result[0].view_dir,
				right: result[0].right
			},
			clippingPlanes: result[0].clippingPlanes
		} as any;
		return generatedObject;
	} catch (error) {
		console.error(error);
	}
}

export function* createViewpoint({teamspace, modelId, viewName}) {
	try {
		console.log('saga:createViewpoint', teamspace, modelId, viewName);
		const generatedObject = yield generateViewpointObject(teamspace, modelId, viewName);
		console.log('Generated object ', generatedObject);
		//TODO: this.APIService.post and createViewpointSuccess
	} catch (error) {
		console.error(error);
	}
}

export default function* ViewsSaga() {
	yield takeLatest(ViewsTypes.CREATE_VIEWPOINT, createViewpoint);
}
