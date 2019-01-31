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
import { getAngularService, dispatch } from '../../helpers/migration';
import * as API from '../../services/api';
import { ViewpointsTypes, ViewpointsActions } from './viewpoints.redux';
import { DialogActions } from '../dialog';
import { getScreenshot } from '../viewer/viewer.sagas';

export const getThumbnailUrl = (thumbnail) => API.getAPIUrl(thumbnail);

export function* fetchViewpoints({ teamspace, modelId }) {
	try {
		yield put(ViewpointsActions.setPendingState(true));
		const { data: viewpoints } = yield API.getModelViewpoints(teamspace, modelId);
		viewpoints.forEach((viewpoint) => {
			if (viewpoint.screenshot && viewpoint.screenshot.thumbnail) {
				viewpoint.screenshot.thumbnailUrl = getThumbnailUrl(viewpoint.screenshot.thumbnail);
			}
		});

		yield put(ViewpointsActions.fetchViewpointsSuccess(viewpoints));
		yield put(ViewpointsActions.setPendingState(false));
	} catch (e) {
		yield put(ViewpointsActions.showEndpointErrorDialog('get', 'model viewpoints', e.response));
	}
}

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
		const screenshot = yield getScreenshot();
		const viewpointDefer = defer();

		const ViewerService = yield getAngularService('ViewerService') as any;
		yield ViewerService.getCurrentViewpoint({
			promise: viewpointDefer,
			account: teamspace,
			model: modelId
		});

		const {clippingPlanes, ...viewpoint} = yield viewpointDefer.promise;

		const generatedObject = {
			name: viewName,
			screenshot: {
				base64: screenshot,
				thumbnailUrl: screenshot
			},
			viewpoint,
			clippingPlanes
		} as any;

		return generatedObject;
	} catch (error) {
		yield put(DialogActions.showErrorDialog('generate', 'new viewpoint'));
	}
}

export function* createViewpoint({teamspace, modelId, viewpoint}) {
	try {
		const {data: {_id}} = yield API.createModelViewpoint(teamspace, modelId, viewpoint);
		viewpoint._id = _id;

		yield put(ViewpointsActions.createViewpointSuccess(viewpoint));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('create', 'new viewpoint', error));
	}
}

export function* updateViewpoint({teamspace, modelId, viewpointId, newName}) {
	try {
		yield API.updateModelViewpoint(teamspace, modelId, viewpointId, newName);

		const updatedView = { _id: viewpointId, name: newName };
		yield put(ViewpointsActions.updateViewpointSuccess(updatedView));
		yield put(ViewpointsActions.setComponentState({ editMode: false }));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('update', 'viewpoint', error));
	}
}

export function* deleteViewpoint({teamspace, modelId, viewpointId}) {
	try {
		yield API.deleteModelViewpoint(teamspace, modelId, viewpointId);
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'viewpoint', error));
	}
}

export function* subscribeOnViewpointChanges({ teamspace, modelId }) {
	const ChatService = yield getAngularService('ChatService');
	const viewsNotifications = yield ChatService.getChannel(teamspace, modelId).views;

	const onUpdated = (updatedView) => dispatch(ViewpointsActions.updateViewpointSuccess(updatedView));
	const onCreated = (createdView) => dispatch(ViewpointsActions.createViewpointSuccess(createdView));
	const onDeleted = (deletedView) => dispatch(ViewpointsActions.deleteViewpointSuccess(deletedView));

	viewsNotifications.subscribeToUpdated(onUpdated, this);
	viewsNotifications.subscribeToCreated(onCreated, this);
	viewsNotifications.subscribeToDeleted(onDeleted, this);
}

export function* unsubscribeOnViewpointChanges({ teamspace, modelId }) {
	const ChatService = yield getAngularService('ChatService');
	const viewsNotifications = yield ChatService.getChannel(teamspace, modelId).views;

	const onUpdated = (updatedView) => dispatch(ViewpointsActions.updateViewpointSuccess(updatedView));
	const onCreated = (createdView) => dispatch(ViewpointsActions.createViewpointSuccess(createdView));
	const onDeleted = (deletedView) => dispatch(ViewpointsActions.deleteViewpointSuccess(deletedView));

	viewsNotifications.unsubscribeFromUpdated(onUpdated);
	viewsNotifications.unsubscribeFromCreated(onCreated);
	viewsNotifications.unsubscribeFromDeleted(onDeleted);
}

export function* showViewpoint({ teamspace, modelId, view }) {
	try {
		yield put(ViewpointsActions.setComponentState({ activeViewpointId: view._id }));

		const ViewerService = yield getAngularService('ViewerService') as any;

		if (view) {
			if (view.viewpoint) {
				view.viewpoint.account = teamspace;
				view.viewpoint.model = modelId;

				yield ViewerService.setCamera(view.viewpoint);
			}

			if (view.clippingPlanes) {
				const clipData = {
					clippingPlanes: view.clippingPlanes,
					account: teamspace,
					modelId
				};

				yield ViewerService.updateClippingPlanes(clipData);
			}
		}
	} catch (error) {
		yield put(ViewpointsActions.setComponentState({ activeViewpointId: null }));
		yield put(DialogActions.showErrorDialog('show', 'viewpoint'));
	}
}

export function* prepareNewViewpoint({teamspace, modelId, viewpointName}) {
	try {
		const newViewpoint = yield generateViewpointObject(teamspace, modelId, viewpointName);
		yield put(ViewpointsActions.setComponentState({ newViewpoint }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('prepare', 'new viewpoint'));
	}
}

export default function* ViewpointsSaga() {
	yield takeLatest(ViewpointsTypes.FETCH_VIEWPOINTS, fetchViewpoints);
	yield takeLatest(ViewpointsTypes.CREATE_VIEWPOINT, createViewpoint);
	yield takeLatest(ViewpointsTypes.UPDATE_VIEWPOINT, updateViewpoint);
	yield takeLatest(ViewpointsTypes.DELETE_VIEWPOINT, deleteViewpoint);
	yield takeLatest(ViewpointsTypes.SHOW_VIEWPOINT, showViewpoint);
	yield takeLatest(ViewpointsTypes.SUBSCRIBE_ON_VIEWPOINT_CHANGES, subscribeOnViewpointChanges);
	yield takeLatest(ViewpointsTypes.UNSUBSCRIBE_ON_VIEWPOINT_CHANGES, unsubscribeOnViewpointChanges);
	yield takeLatest(ViewpointsTypes.PREPARE_NEW_VIEWPOINT, prepareNewViewpoint);
}
