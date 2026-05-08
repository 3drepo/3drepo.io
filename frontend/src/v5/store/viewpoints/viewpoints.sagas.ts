/**
 *  Copyright (C) 2026 3D Repo Ltd
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
import { all, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { generatePath } from 'react-router-dom';

import { prefixBaseDomain } from '@/v5/helpers/url.helper';
import { CHAT_CHANNELS } from '@/v4/constants/chat';
import { dispatch } from '@/v5/helpers/redux.helpers';
import { VIEWER_CLIP_MODES } from '@/v4/constants/viewer';
import { getViewpointWithGroups } from '@/v5/helpers/viewpoint.helpers';
import { ROUTES } from '@/v4/constants/routes';
import { createGroupsFromViewpoint, generateViewpoint, mergeGroupsDataFromViewpoint } from '@/v4/helpers/viewpoints';
import * as API from '@/v4/services/api';
import { Viewer } from '@/v4/services/viewer/viewer';
import { ModelActions } from '@/v4/modules/model';
import { SnackbarActions } from '@/v4/modules/snackbar';
import { TreeActions } from '@/v4/modules/tree';
import { waitForTreeToBeReady } from '@/v4/modules/tree/tree.sagas';
import { ViewerGuiActions } from '@/v4/modules/viewerGui';
import { ChatActions } from '@/v4/modules/chat/chat.redux';
import {
	ViewpointsActions,
	ViewpointsTypes,
	CacheGroupsFromViewpointAction,
	CreateViewpointAction,
	DeleteViewpointAction,
	FetchViewpointGroupsAction,
	FetchViewpointsAction,
	PrepareNewViewpointAction,
	SetDefaultViewpointAction,
	ClearDefaultViewpointAction,
	ShareViewpointLinkAction,
	ShowPresetAction,
	ShowViewpointAction,
	SubscribeOnViewpointChangesAction,
	UnsubscribeOnViewpointChangesAction,
	UpdateViewpointAction,
} from './viewpoints.redux';
import { selectSelectedViewpoint } from './viewpoints.selectors';
import { getThumbnailUrl } from '@/v4/modules/viewpoints/viewpoints.sagas';
import { formatMessage } from '@/v5/services/intl';
import { DialogsActions } from '../dialogs/dialogs.redux';
import { PRESET_VIEW } from '@/v5/ui/routes/viewer/views/viewsCardFooter/presetViews/presetViews.component';

export function* fetchViewpoints({ teamspace, modelId }: FetchViewpointsAction) {
	try {
		yield put(ViewpointsActions.setPendingState(true));
		const { data: viewpoints } = yield API.getModelViewpoints(teamspace, modelId);
		viewpoints.forEach((viewpoint) => {
			if (viewpoint.screenshot?.thumbnail) {
				viewpoint.screenshot.thumbnailUrl = getThumbnailUrl(viewpoint.screenshot.thumbnail);
			}
		});
		yield put(ViewpointsActions.fetchViewpointsSuccess(viewpoints));
		yield put(ViewpointsActions.setPendingState(false));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'views.fetchViewpoints.error', defaultMessage: 'trying to fetch viewpoints' }),
			error,
		}));
	}
}

export function* createViewpoint({ teamspace, modelId, viewpoint }: CreateViewpointAction) {
	try {
		const { data: updatedViewpoint } = yield API.createModelViewpoint(teamspace, modelId, viewpoint);
		yield put(ViewpointsActions.cacheGroupsFromViewpoint(updatedViewpoint.viewpoint, viewpoint.viewpoint));

		if (viewpoint.viewpoint.screenshot) {
			updatedViewpoint.viewpoint.screenshot = viewpoint.viewpoint.screenshot;
			delete updatedViewpoint.thumbnail;
			delete updatedViewpoint.screenshot;
		}

		yield put(ViewpointsActions.createViewpointSuccess(updatedViewpoint));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'views.createViewpoint.error', defaultMessage: 'trying to create viewpoint' }),
			error,
		}));
	}
}

export function* updateViewpoint({ teamspace, modelId, viewpointId, newName }: UpdateViewpointAction) {
	try {
		yield API.updateModelViewpoint(teamspace, modelId, viewpointId, newName);
		yield put(ViewpointsActions.updateViewpointSuccess({ _id: viewpointId, name: newName }));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'views.updateViewpoint.error', defaultMessage: 'trying to update viewpoint' }),
			error,
		}));
	}
}

export function* deleteViewpoint({ teamspace, modelId, viewpointId }: DeleteViewpointAction) {
	try {
		yield API.deleteModelViewpoint(teamspace, modelId, viewpointId);
		yield put(ViewpointsActions.deleteViewpointSuccess(viewpointId));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'views.deleteViewpoint.error', defaultMessage: 'trying to delete viewpoint' }),
			error,
		}));
	}
}

const onUpdated = (updatedView) => dispatch(ViewpointsActions.updateViewpointSuccess(updatedView));

const onDeleted = (deletedView) => dispatch(ViewpointsActions.deleteViewpointSuccess(deletedView));

const onCreated = (createdView) => {
	if (createdView.screenshot?.thumbnail) {
		createdView.screenshot.thumbnailUrl = getThumbnailUrl(createdView.screenshot.thumbnail);
	}
	dispatch(ViewpointsActions.createViewpointSuccess(createdView));
};

export function* subscribeOnViewpointChanges({ teamspace, modelId }: SubscribeOnViewpointChangesAction) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.VIEWS, teamspace, modelId, {
		subscribeToUpdated: onUpdated,
		subscribeToCreated: onCreated,
		subscribeToDeleted: onDeleted,
	}));
}

export function* unsubscribeOnViewpointChanges({ teamspace, modelId }: UnsubscribeOnViewpointChangesAction) {
	yield put(ChatActions.callChannelActions(CHAT_CHANNELS.VIEWS, teamspace, modelId, {
		unsubscribeToUpdated: onUpdated,
		unsubscribeToCreated: onCreated,
		unsubscribeToDeleted: onDeleted,
	}));
}

export function* showPreset({ preset }: ShowPresetAction) {
	yield Viewer.isViewerReady();
	switch (preset) {
		case PRESET_VIEW.TOP: yield Viewer.topView(); break;
		case PRESET_VIEW.BOTTOM: yield Viewer.bottomView(); break;
		case PRESET_VIEW.FRONT: yield Viewer.frontView(); break;
		case PRESET_VIEW.BACK: yield Viewer.backView(); break;
		case PRESET_VIEW.LEFT: yield Viewer.leftView(); break;
		case PRESET_VIEW.RIGHT: yield Viewer.rightView(); break;
	}
}

export function* showViewpoint({ teamspace, modelId, view, ignoreCamera }: ShowViewpointAction) {
	if (!view) return;

	yield Viewer.isViewerReady();
	const viewpoint = view.viewpoint;
	if (!viewpoint) return;

	if (viewpoint.up && !ignoreCamera) {
		yield put(ViewerGuiActions.setCamera(viewpoint));
	} else {
		yield put(ViewerGuiActions.setProjectionModeSuccess(viewpoint.type));
	}

	const clippingPlanes = view.clippingPlanes || get(view, 'viewpoint.clippingPlanes');
	yield put(TreeActions.setHiddenGeometryVisible(viewpoint.hideIfc === false));
	yield Viewer.updateClippingPlanes(clippingPlanes, teamspace, modelId);

	if (!viewpoint.clippingPlanes?.length) {
		yield put(ViewerGuiActions.setClippingMode(null));
	} else {
		yield put(ViewerGuiActions.setClippingMode(
			viewpoint.clippingPlanes.length === 1 ? VIEWER_CLIP_MODES.SINGLE : VIEWER_CLIP_MODES.BOX,
		));
	}

	yield put(ViewerGuiActions.setClipEdit(false));
	yield waitForTreeToBeReady();
	yield put(ViewpointsActions.fetchViewpointGroups(teamspace, modelId, view));
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

export function* fetchViewpointGroups({ teamspace, modelId, view }: FetchViewpointGroupsAction) {
	try {
		const groupsObject = yield getViewpointWithGroups({ teamspace, modelId, view });
		mergeGroupsDataFromViewpoint(view.viewpoint, groupsObject);
		yield put(ViewpointsActions.viewpointReady());
	} catch {
		// groups don't exist, still continue
	}
}

export function* cacheGroupsFromViewpoint({ viewpoint, groupsData }: CacheGroupsFromViewpointAction) {
	const groups = createGroupsFromViewpoint(viewpoint, groupsData);
	yield all(groups.map((group) => put(ViewpointsActions.fetchGroupSuccess(group))));
}

export function* clearColorOverrides() {
	const viewpoint = yield select(selectSelectedViewpoint);
	if (viewpoint?.override_groups?.length) {
		yield put(ViewpointsActions.setSelectedViewpoint({
			...viewpoint,
			override_groups: [],
		}));
	}
}

export function* clearTransformations() {
	const viewpoint = yield select(selectSelectedViewpoint);
	if (!viewpoint?.transformation_groups?.length) return;
	yield put(ViewpointsActions.setSelectedViewpoint({
		...viewpoint,
		transformation_groups: [],
	}));
}

export function* prepareNewViewpoint({ viewpointName }: PrepareNewViewpointAction) {
	try {
		const newViewpoint = yield generateViewpoint(viewpointName, true);
		yield put(ViewpointsActions.setNewViewpoint(newViewpoint));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'views.prepareNewViewpoint.error', defaultMessage: 'trying to prepare new viewpoint' }),
			error,
		}));
	}
}

export function* shareViewpointLink({ teamspace, modelId, viewpointId, project, revision }: ShareViewpointLinkAction) {
	const basePath = generatePath(ROUTES.V5_MODEL_VIEWER, { teamspace, project, model: modelId, revision });
	const url = prefixBaseDomain(`${basePath}?viewId=${viewpointId}`);
	copy(url);
	yield put(SnackbarActions.show('Share link copied to clipboard'));
}

export function* setDefaultViewpoint({ teamspace, modelId, view }: SetDefaultViewpointAction) {
	try {
		yield API.editModelSettings(teamspace, modelId, { defaultView: view._id });
		yield put(ModelActions.updateSettingsSuccess({ defaultView: { id: view._id, name: view.name } }));
		yield put(SnackbarActions.show('View set as home view'));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'views.setDefaultViewpoint.error', defaultMessage: 'trying to set the home viewpoint' }),
			error,
		}));
	}
}

export function* clearDefaultViewpoint({ teamspace, modelId }: ClearDefaultViewpointAction) {
	try {
		yield API.editModelSettings(teamspace, modelId, { defaultView: null });
		yield put(ModelActions.updateSettingsSuccess({ defaultView: null }));
		yield put(SnackbarActions.show('View unset as home view'));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({ id: 'views.clearDefaultViewpoint.error', defaultMessage: 'trying to unset the home viewpoint' }),
			error,
		}));
	}
}

export default function* ViewpointsSaga() {
	yield takeEvery(ViewpointsTypes.FETCH_VIEWPOINTS, fetchViewpoints);
	yield takeEvery(ViewpointsTypes.CREATE_VIEWPOINT, createViewpoint);
	yield takeEvery(ViewpointsTypes.UPDATE_VIEWPOINT, updateViewpoint);
	yield takeEvery(ViewpointsTypes.DELETE_VIEWPOINT, deleteViewpoint);
	yield takeEvery(ViewpointsTypes.SUBSCRIBE_ON_VIEWPOINT_CHANGES, subscribeOnViewpointChanges);
	yield takeEvery(ViewpointsTypes.UNSUBSCRIBE_ON_VIEWPOINT_CHANGES, unsubscribeOnViewpointChanges);
	yield takeEvery(ViewpointsTypes.PREPARE_NEW_VIEWPOINT, prepareNewViewpoint);
	yield takeLatest(ViewpointsTypes.SHOW_VIEWPOINT, showViewpoint);
	yield takeEvery(ViewpointsTypes.SHARE_VIEWPOINT_LINK, shareViewpointLink);
	yield takeEvery(ViewpointsTypes.SET_DEFAULT_VIEWPOINT, setDefaultViewpoint);
	yield takeEvery(ViewpointsTypes.CLEAR_DEFAULT_VIEWPOINT, clearDefaultViewpoint);
	yield takeEvery(ViewpointsTypes.CACHE_GROUPS_FROM_VIEWPOINT, cacheGroupsFromViewpoint);
	yield takeEvery(ViewpointsTypes.SHOW_PRESET, showPreset);
	yield takeEvery(ViewpointsTypes.FETCH_VIEWPOINT_GROUPS, fetchViewpointGroups);
	yield takeEvery(ViewpointsTypes.CLEAR_COLOR_OVERRIDES, clearColorOverrides);
	yield takeEvery(ViewpointsTypes.CLEAR_TRANSFORMATIONS, clearTransformations);
}
