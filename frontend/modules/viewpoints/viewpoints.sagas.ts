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

import copy from 'copy-to-clipboard';
import { get } from 'lodash';
import { all, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';

import { selectSelectedViewpoint, selectViewpointsGroups, selectViewpointsGroupsBeingLoaded } from '.';
import { CHAT_CHANNELS } from '../../constants/chat';
import { ROUTES } from '../../constants/routes';
import { UnityUtil } from '../../globals/unity-util';
import { delay } from '../../helpers/aync';
import { createGroupsByColor, createGroupsByTransformations, prepareGroup } from '../../helpers/groups';
import { createGroupsFromViewpoint, groupsOfViewpoint,
	isViewpointLoaded,
	mergeGroupsDataFromViewpoint, setGroupData } from '../../helpers/viewpoints';
import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { ChatActions } from '../chat';
import { DialogActions } from '../dialog';
import { GroupsActions } from '../groups';
import { IssuesActions } from '../issues';
import { ModelActions } from '../model';
import { selectCurrentRevisionId } from '../model';
import { RisksActions } from '../risks';
import { SequencesActions } from '../sequences';
import { SnackbarActions } from '../snackbar';
import { dispatch } from '../store';
import { selectHiddenGeometryVisible, TreeActions } from '../tree';
import { waitForTreeToBeReady } from '../tree/tree.sagas';
import { selectColorOverrides, selectTransformations, ViewerGuiActions } from '../viewerGui';
import { PRESET_VIEW } from './viewpoints.constants';
import { ViewpointsActions, ViewpointsTypes } from './viewpoints.redux';

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
		yield put(DialogActions.showEndpointErrorDialog('get', 'model viewpoints', e.response));
	}
}

export function* generateViewpoint(teamspace, modelId, name, withScreenshot = false) {
	try {
		const hiddenGeometryVisible = yield select(selectHiddenGeometryVisible);

		const viewpoint = yield Viewer.getCurrentViewpoint({
			teamspace,
			model: modelId
		});

		const generatedObject = {
			name,
			viewpoint:  {
				...viewpoint,
				hideIfc: !hiddenGeometryVisible
			}
		} as any;

		if (withScreenshot) {
			generatedObject.viewpoint.screenshot = yield Viewer.getScreenshot();
		}

		const objectInfo = yield Viewer.getObjectsStatus();

		const colorOverrides = yield select(selectColorOverrides);
		const newOverrideGroups = yield createGroupsByColor(colorOverrides);

		const transformations = yield select(selectTransformations);
		const newTransformationsGroups = yield createGroupsByTransformations(transformations);

		if (newOverrideGroups.length) {
			generatedObject.viewpoint.override_groups = newOverrideGroups;
		}

		if (newTransformationsGroups.length) {
			generatedObject.viewpoint.transformation_groups = newTransformationsGroups;
		}

		if (objectInfo && (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0)) {
			const { highlightedNodes, hiddenNodes } = objectInfo;

			if (highlightedNodes.length > 0) {
				generatedObject.viewpoint.highlighted_group = {
					objects: highlightedNodes,
					color: UnityUtil.defaultHighlightColor.map((c) => c * 255)
				} ;
			}

			if (hiddenNodes.length > 0) {
				generatedObject.viewpoint.hidden_group = {
					objects: hiddenNodes
				};
			}

		}

		return generatedObject;
	} catch (error) {
		yield put(DialogActions.showErrorDialog('generate', 'viewpoint'));
	}
}

export function* createViewpoint({teamspace, modelId, viewpoint}) {
	try {
		const {data: updatedViewpoint} = yield API.createModelViewpoint(teamspace, modelId, viewpoint);
		yield put(ViewpointsActions.cacheGroupsFromViewpoint(updatedViewpoint.viewpoint, viewpoint.viewpoint));

		if (viewpoint.viewpoint.screenshot) {
			updatedViewpoint.viewpoint.screenshot = viewpoint.viewpoint.screenshot;
			delete updatedViewpoint.thumbnail;
			delete updatedViewpoint.screenshot;
		}

		yield put(ViewpointsActions.createViewpointSuccess(updatedViewpoint));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('create', 'viewpoint', error));
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
		yield put(ViewpointsActions.deleteViewpointSuccess(viewpointId));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('remove', 'viewpoint', error));
	}
}

const onUpdated = (updatedView) => dispatch(ViewpointsActions.updateViewpointSuccess(updatedView));

const onDeleted = (deletedView) => {
	dispatch(ViewpointsActions.showDeleteInfo(deletedView));

	setTimeout(() => {
		dispatch(ViewpointsActions.deleteViewpointSuccess(deletedView));
	}, 5000);
};

const onCreated = (createdView) => {
	if (createdView.screenshot.thumbnail) {
		createdView.screenshot.thumbnailUrl = getThumbnailUrl(createdView.screenshot.thumbnail);
	}
	dispatch(ViewpointsActions.createViewpointSuccess(createdView));
};

export function* subscribeOnViewpointChanges({ teamspace, modelId }) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.VIEWS, teamspace, modelId, {
		subscribeToUpdated: onUpdated,
		subscribeToCreated: onCreated,
		subscribeToDeleted: onDeleted
	}));
}

export function* unsubscribeOnViewpointChanges({ teamspace, modelId }) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.VIEWS, teamspace, modelId, {
		unsubscribeToUpdated: onUpdated,
		unsubscribeToCreated: onCreated,
		unsubscribeToDeleted: onDeleted
	}));
}

export function* showPreset({preset}) {
	yield Viewer.isViewerReady();

	switch (preset) {
		case PRESET_VIEW.TOP:
			yield Viewer.topView();
			break;
		case PRESET_VIEW.BOTTOM:
			yield Viewer.bottomView();
			break;
		case PRESET_VIEW.FRONT:
			yield Viewer.frontView();
			break;
		case PRESET_VIEW.BACK:
			yield Viewer.backView();
			break;
		case PRESET_VIEW.LEFT:
			yield Viewer.leftView();
			break;
		case PRESET_VIEW.RIGHT:
			yield Viewer.rightView();
			break;
	}
}

export function* showViewpoint({teamspace, modelId, view, ignoreCamera}) {
	if (view) {
		yield Viewer.isViewerReady();

		const viewpoint = view.viewpoint;
		if (!viewpoint) {
			return;
		}

		if (viewpoint.up && !ignoreCamera) {
			yield put(ViewerGuiActions.setCamera(viewpoint));
		} else {
			// If we're not moving the camera, ensure the projection mode icon ion the gui matches the viewpoint
			yield put(ViewerGuiActions.setProjectionModeSuccess(viewpoint.type));
		}

		const clippingPlanes = view.clippingPlanes || get(view, 'viewpoint.clippingPlanes');

		// The default value for hideIfc if it doesnt exists is 'false'
		yield put(TreeActions.setHiddenGeometryVisible(viewpoint.hideIfc === false));

		yield Viewer.updateClippingPlanes(clippingPlanes, teamspace, modelId);

		yield waitForTreeToBeReady();
		yield put(ViewpointsActions.fetchViewpointGroups(teamspace, modelId, view));

		let viewpointsGroups = yield select(selectViewpointsGroups);

		while (!isViewpointLoaded(viewpoint, viewpointsGroups)) {
			yield take(ViewpointsTypes.FETCH_GROUP_SUCCESS);
			viewpointsGroups = yield select(selectViewpointsGroups);
		}

		if (viewpoint.override_groups) {
			yield put(GroupsActions.clearColorOverrides());
		}

		yield put(TreeActions.clearCurrentlySelected());

		if (viewpoint.hidden_group?.objects?.length > 0) {
			yield put(TreeActions.hideNodesBySharedIds(viewpoint.hidden_group.objects, true));
		} else if (viewpoint.shown_group?.objects?.length > 0) {
			yield put(TreeActions.isolateNodesBySharedIds(viewpoint.shown_group.objects));
		} else {
			yield put(TreeActions.showAllNodes());
		}

		if (viewpoint.highlighted_group?.objects?.length > 0) {
			yield put(TreeActions.selectNodesBySharedIds(viewpoint.highlighted_group.objects));
			window.dispatchEvent(new Event('resize'));
		}

		yield put(ViewpointsActions.setSelectedViewpoint(viewpoint));
	}

}

export function * deselectViewsAndLeaveClipping() {
	const selectedViewpoint  = yield select(selectSelectedViewpoint);
	yield put(IssuesActions.goToIssue(null));
	yield take('@@router/LOCATION_CHANGE');
	yield put(RisksActions.goToRisk(null));
	yield take('@@router/LOCATION_CHANGE');

	yield all([
			put(IssuesActions.setActiveIssue({}, null, true)),
			put(RisksActions.setActiveRisk({}, null, true)),
			put(ViewpointsActions.setActiveViewpoint(null))]);

	if (selectedViewpoint) {
		yield take(ViewpointsTypes.SHOW_VIEWPOINT);
		if (selectedViewpoint.clippingPlanes) {
			const viewpoint = {viewpoint: {clippingPlanes: selectedViewpoint.clippingPlanes }};
			yield put(ViewpointsActions.showViewpoint(null, null, viewpoint));
		}
	}
}

export function* fetchViewpointGroups({teamspace, modelId, view}) {
	try  {
		if (!view.viewpoint) {
			return;
		}

		const revision = yield select(selectCurrentRevisionId);
		const viewpointsGroups = yield select(selectViewpointsGroups);
		const viewpointsGroupsBeingLoaded: Set<string> = yield select(selectViewpointsGroupsBeingLoaded);

		const viewpoint = view.viewpoint;

		const groupsToFetch = [];

		// This part discriminates which groups hasnt been loaded yet and add their ids to
		// the groupsToFetch array
		const ids = [];
		for (const id of groupsOfViewpoint(viewpoint)) {
			ids.push(id);
			if (!viewpointsGroups[id] && !viewpointsGroupsBeingLoaded.has(id)) {
				groupsToFetch.push(id);
			}
		}

		if (groupsToFetch.length > 0) {

			yield put(ViewpointsActions.addViewpointGroupsBeingLoaded(groupsToFetch));
			const fetchedGroups =  (yield all(groupsToFetch.map((groupId) =>
				API.getGroup(teamspace, modelId, groupId, revision))))
				.map(({data}) => prepareGroup(data));

			yield all(fetchedGroups.map((group) => put(ViewpointsActions.fetchGroupSuccess(group))));
		}

		const groupsMap = yield select(selectViewpointsGroups);
		const groupsObject = setGroupData(viewpoint, groupsMap);
		mergeGroupsDataFromViewpoint(viewpoint, groupsObject);
	} catch {
		// groups doesnt exists, still continue
	}
}

export function* cacheGroupsFromViewpoint({ viewpoint,  groupsData }) {
	const groups = createGroupsFromViewpoint(viewpoint, groupsData);
	yield all(groups.map((group) => put(ViewpointsActions.fetchGroupSuccess(group))));
}

export function* setActiveViewpoint({ teamspace, modelId, view }) {
	try {
		if (view) {
			yield put(SequencesActions.setSelectedSequence(null));
			yield put(ViewpointsActions.showViewpoint(teamspace, modelId, view));
		} else {
			yield put(ViewpointsActions.setSelectedViewpoint(null));
		}

		yield put(ViewpointsActions.setComponentState({ activeViewpoint: view }));
	} catch (error) {
		yield put(ViewpointsActions.setComponentState({ activeViewpoint: null }));
		yield put(DialogActions.showErrorDialog('show', 'viewpoint'));
	}
}

export function* prepareNewViewpoint({teamspace, modelId, viewpointName}) {
	try {
		const newViewpoint = yield generateViewpoint(teamspace, modelId, viewpointName, true);
		yield put(ViewpointsActions.setComponentState({ newViewpoint, activeViewpoint: null, editMode: false }));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('prepare', 'new viewpoint'));
	}
}

export function* shareViewpointLink({ teamspace, modelId, viewpointId }) {
	const url = `${location.hostname}${ROUTES.VIEWER}/${teamspace}/${modelId}?viewId=${viewpointId}`;
	copy(url);
	yield put(SnackbarActions.show('Share link copied to clipboard'));
}

export function* setDefaultViewpoint({ teamspace, modelId, view }) {
	try {
		yield API.editModelSettings(teamspace, modelId, {defaultView: view._id});
		yield put(ModelActions.updateSettingsSuccess({defaultView: {id: view._id, name: view.name}}));
		yield put(SnackbarActions.show('View set as default'));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set the default viewpoint', ''));
	}
}

export default function* ViewpointsSaga() {
	yield takeEvery(ViewpointsTypes.FETCH_VIEWPOINTS, fetchViewpoints);
	yield takeEvery(ViewpointsTypes.CREATE_VIEWPOINT, createViewpoint);
	yield takeEvery(ViewpointsTypes.UPDATE_VIEWPOINT, updateViewpoint);
	yield takeEvery(ViewpointsTypes.DELETE_VIEWPOINT, deleteViewpoint);
	yield takeEvery(ViewpointsTypes.SET_ACTIVE_VIEWPOINT, setActiveViewpoint);
	yield takeEvery(ViewpointsTypes.SUBSCRIBE_ON_VIEWPOINT_CHANGES, subscribeOnViewpointChanges);
	yield takeEvery(ViewpointsTypes.UNSUBSCRIBE_ON_VIEWPOINT_CHANGES, unsubscribeOnViewpointChanges);
	yield takeEvery(ViewpointsTypes.PREPARE_NEW_VIEWPOINT, prepareNewViewpoint);
	yield takeLatest(ViewpointsTypes.SHOW_VIEWPOINT, showViewpoint);
	yield takeEvery(ViewpointsTypes.SHARE_VIEWPOINT_LINK, shareViewpointLink);
	yield takeEvery(ViewpointsTypes.SET_DEFAULT_VIEWPOINT, setDefaultViewpoint);
	yield takeEvery(ViewpointsTypes.DESELECT_VIEWS_AND_LEAVE_CLIPPING, deselectViewsAndLeaveClipping);
	yield takeEvery(ViewpointsTypes.CACHE_GROUPS_FROM_VIEWPOINT, cacheGroupsFromViewpoint);
	yield takeEvery(ViewpointsTypes.SHOW_PRESET, showPreset);
	yield takeEvery(ViewpointsTypes.FETCH_VIEWPOINT_GROUPS, fetchViewpointGroups);
}
