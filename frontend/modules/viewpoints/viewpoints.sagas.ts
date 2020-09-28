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
import { get, groupBy, over } from 'lodash';
import { all, put, select, takeLatest } from 'redux-saga/effects';
import { selectOverrides as selectViewsOverrides } from '.';
import { CHAT_CHANNELS } from '../../constants/chat';
import { ROUTES } from '../../constants/routes';
import { UnityUtil } from '../../globals/unity-util';
import { hexToArray } from '../../helpers/colors';
import { prepareGroup } from '../../helpers/groups';
import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { ChatActions } from '../chat';
import { DialogActions } from '../dialog';
import {  selectAllOverridesDict, GroupsActions } from '../groups';
import { ModelActions } from '../model';
import { selectCurrentRevisionId } from '../model';
import { SnackbarActions } from '../snackbar';
import { dispatch } from '../store';
import { selectGetMeshesByIds, selectGetNodesIdsFromSharedIds, selectIfcSpacesHidden, TreeActions } from '../tree';
import { ViewerGuiActions } from '../viewerGui';
import { PRESET_VIEW } from './viewpoints.constants';
import { ViewpointsActions, ViewpointsTypes } from './viewpoints.redux';

function* groupByColor(overrides) {
	const sharedIdnodes = Object.keys(overrides);
	const nodes = yield select(selectGetNodesIdsFromSharedIds([{shared_ids: sharedIdnodes}]));

	const modelsDict = (yield select(selectGetMeshesByIds(nodes))).reduce((dict, meshesByModel) => {
		const { teamspace, modelId } = meshesByModel;
		const model = { teamspace, modelId};
		return meshesByModel.meshes.reduce((d, mesh) => {
			const index = nodes.indexOf(mesh);
			d[sharedIdnodes[index]] = model;
			return d;
		}, dict);
	}, {});

	return sharedIdnodes.reduce((arr, objectId, i) =>  {
		const { teamspace, modelId } = modelsDict[objectId];
		let colorItem = arr.find(({color}) => color.join(',') === hexToArray(overrides[objectId]).join(','));

		if (!colorItem) {
			colorItem = { color: hexToArray(overrides[objectId]), objects: [] , totalSavedMeshes: 0};

			arr.push(colorItem);
		}

		let sharedIdsItem =  colorItem.objects.find(({model, account}) => model === modelId && account === teamspace);

		if (!sharedIdsItem) {
			sharedIdsItem = { shared_ids: [], account: teamspace, model: modelId};
			colorItem.objects.push(sharedIdsItem);
			colorItem.totalSavedMeshes ++;
		}

		sharedIdsItem.shared_ids.push(objectId);
		return arr;
	}, []);
}

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
		const hideIfc = yield select(selectIfcSpacesHidden);

		const viewpoint = yield Viewer.getCurrentViewpoint({
			teamspace,
			model: modelId
		});

		const generatedObject = {
			name,
			viewpoint:  {
				...viewpoint,
				hideIfc
			}
		} as any;

		if (withScreenshot) {
			generatedObject.viewpoint.screenshot = yield Viewer.getScreenshot();
		}

		const objectInfo = yield Viewer.getObjectsStatus();

		let overrides = (yield select(selectAllOverridesDict)).colors;
		const viewsOverrides =  (yield select(selectViewsOverrides));
		overrides = {...overrides, ...viewsOverrides };
		const newOverrideGroups = yield groupByColor(overrides);

		if (newOverrideGroups.length) {
			generatedObject.viewpoint.override_groups = newOverrideGroups;
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
		const {data: {_id, viewpoint: viewpointData}} = yield API.createModelViewpoint(teamspace, modelId, viewpoint);
		viewpoint._id = _id;
		viewpoint.viewpoint = { ...viewpointData, screenshot: viewpoint.viewpoint.screenshot} ;

		yield put(ViewpointsActions.createViewpointSuccess(viewpoint));
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

export function* showViewpoint({teamspace, modelId, view, ignoreCamera}) {
	if (view) {

		if (view.preset) {
			switch (view.preset) {
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
		} else {
			yield Viewer.isViewerReady();

			const viewpoint = view.viewpoint;
			if (!viewpoint) {
				return;
			}

			if (viewpoint?.up && !ignoreCamera) {
				yield put(ViewerGuiActions.setCamera(viewpoint));
			}

			const clippingPlanes = view.clippingPlanes || get(view, 'viewpoint.clippingPlanes');

			yield put(TreeActions.setIfcSpacesHidden(viewpoint.hideIfc !== false));

			yield Viewer.updateClippingPlanes( clippingPlanes, teamspace, modelId);

			yield prepareGroupsIfNecessary(teamspace, modelId, view.viewpoint);

			if (viewpoint?.override_groups) {
				yield put(GroupsActions.clearColorOverrides());
			}

			yield put(TreeActions.showAllNodes());

			yield put(TreeActions.clearCurrentlySelected());

			if (viewpoint?.hidden_group?.objects?.length > 0) {
				yield put(TreeActions.hideNodesBySharedIds(viewpoint.hidden_group.objects));
			} else if (viewpoint?.shown?.objects?.length > 0) {
				yield put(TreeActions.isolateNodesBySharedIds(viewpoint.shown.objects.length));
			}

			if (viewpoint?.highlighted_group?.objects?.length > 0) {
				yield put(TreeActions.selectNodesBySharedIds(viewpoint.highlighted_group.objects));
				window.dispatchEvent(new Event('resize'));
			}

			yield put(ViewpointsActions.setSelectedViewpoint(viewpoint));
		}
	}
}

export function* prepareGroupsIfNecessary( teamspace, modelId, viewpoint) {
	try  {
		const revision = yield select(selectCurrentRevisionId);

		if (viewpoint?.override_group_ids) {
			viewpoint.override_groups =  (yield all(viewpoint.override_group_ids.map((groupId) =>
				API.getGroup(teamspace, modelId, groupId, revision))))
				.map(({data}) => prepareGroup(data));

			delete viewpoint.override_group_ids;
		}

		if (viewpoint?.highlighted_group_id) {
			const highlightedGroup = (yield API.getGroup(teamspace, modelId, viewpoint?.highlighted_group_id, revision)).data;
			viewpoint.highlighted_group = prepareGroup(highlightedGroup);
			delete viewpoint.highlighted_group_id;
		}

		if (viewpoint?.hidden_group_id) {
			const hiddenGroup = (yield API.getGroup(teamspace, modelId, viewpoint?.hidden_group_id, revision)).data;
			viewpoint.hidden_group = prepareGroup(hiddenGroup);
			delete viewpoint.hidden_group_id;
		}
	} catch {
		// groups doesnt exists, still continue
	}
}

export function* setActiveViewpoint({ teamspace, modelId, view }) {
	try {
		yield put(ViewpointsActions.showViewpoint(teamspace, modelId, view));
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
	yield takeLatest(ViewpointsTypes.FETCH_VIEWPOINTS, fetchViewpoints);
	yield takeLatest(ViewpointsTypes.CREATE_VIEWPOINT, createViewpoint);
	yield takeLatest(ViewpointsTypes.UPDATE_VIEWPOINT, updateViewpoint);
	yield takeLatest(ViewpointsTypes.DELETE_VIEWPOINT, deleteViewpoint);
	yield takeLatest(ViewpointsTypes.SET_ACTIVE_VIEWPOINT, setActiveViewpoint);
	yield takeLatest(ViewpointsTypes.SUBSCRIBE_ON_VIEWPOINT_CHANGES, subscribeOnViewpointChanges);
	yield takeLatest(ViewpointsTypes.UNSUBSCRIBE_ON_VIEWPOINT_CHANGES, unsubscribeOnViewpointChanges);
	yield takeLatest(ViewpointsTypes.PREPARE_NEW_VIEWPOINT, prepareNewViewpoint);
	yield takeLatest(ViewpointsTypes.SHOW_VIEWPOINT, showViewpoint);
	yield takeLatest(ViewpointsTypes.SHARE_VIEWPOINT_LINK, shareViewpointLink);
	yield takeLatest(ViewpointsTypes.SET_DEFAULT_VIEWPOINT, setDefaultViewpoint);
}
