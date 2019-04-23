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

// tslint:disable-next-line
const TreeWorker = require('worker-loader?inline!./tree.worker');
import { keyBy, mapValues } from 'lodash';
import { put, takeLatest, call, select, take, all } from 'redux-saga/effects';

import { delay } from 'redux-saga';

import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { VIEWER_EVENTS } from '../../constants/viewer';
import { dispatch, getAngularService, getState } from '../../helpers/migration';
import { GroupsActions } from '../groups';
import { DialogActions } from '../dialog';
import { selectSelectedNodes, selectIfcSpacesHidden } from './tree.selectors';
import { TreeTypes, TreeActions } from './tree.redux';
import { selectSettings, ModelActions, ModelTypes } from '../model';

const setupWorker = (worker, onResponse) => {
	worker.addEventListener('message', (e) => {
		const data = JSON.parse(e.data);
		onResponse(data.result);
	}, false);

	worker.addEventListener('messageerror', (e) => {
		// tslint:disable-next-line
		console.error('TWorker error', e);
	}, false);

	return worker;
};

const treeWorker = new TreeWorker();

export function* fetchFullTree({ teamspace, modelId, revision }) {
	try {
		const { data: fullTree } = yield API.getFullTree(teamspace, modelId, revision);
		yield take(ModelTypes.FETCH_SETTINGS_SUCCESS);

		const dataToProcessed = { mainTree: fullTree.mainTree.nodes };
		const modelSettings = yield select(selectSettings);
		dataToProcessed.mainTree.name = modelSettings.name;
		dataToProcessed.mainTree.isFederation = modelSettings.federate;

		const subTreesData = fullTree.subTrees.length
			? yield all(fullTree.subTrees.map(({ url }) => API.default.get(url)))
			: [];

		for (let index = 0; index < dataToProcessed.mainTree.children.length; index++) {
			const child = dataToProcessed.mainTree.children[index];
			const [modelTeamspace, model] = child.name.split(':');
			const subModel = modelSettings.subModels.find((m) => m.model === model);

			if (subModel) {
				child.name = [modelTeamspace, subModel.name].join(':');
			}

			if (subModel && child.children && child.children[0]) {
				child.children[0].name = subModel.name;
			}

			if (fullTree.subTrees.length) {
				const subTree = subTreesData.find(({ data }) => data.mainTree.nodes.project === model);
				child.children[0].children = [subTree.data.mainTree.nodes];
			}
		}

		const worker = setupWorker(treeWorker, (result) => {
			const nodesIndexesMap = mapValues(keyBy(result.data, '_id'), (node) => node.index);
			dispatch(TreeActions.setTreeNodesList(result.data));
			dispatch(TreeActions.setComponentState({ nodesIndexesMap }));
		});
		worker.postMessage(dataToProcessed);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('fetch', 'full tree'));
	}
}

export function* startListenOnSelections() {
	try {
		const TreeService = getAngularService('TreeService') as any;

		Viewer.on(VIEWER_EVENTS.OBJECT_SELECTED, (object) => {
			TreeService.nodesClickedByIds([object.id]);
			dispatch(TreeActions.getSelectedNodes());
		});

		Viewer.on(VIEWER_EVENTS.MULTI_OBJECTS_SELECTED, (object) => {
			TreeService.nodesClickedBySharedIds(object.selectedNodes);
			dispatch(TreeActions.getSelectedNodes());
		});

		Viewer.on(VIEWER_EVENTS.BACKGROUND_SELECTED, () => {
			dispatch(TreeActions.clearSelectedNodes());
			dispatch(GroupsActions.clearSelectionHighlights());
		});
	} catch (error) {
		console.error(error);
	}
}

export function* getSelectedNodes() {
	try {
		yield call(delay, 100);
		const objectsStatus = yield Viewer.getObjectsStatus();

		if (objectsStatus && objectsStatus.highlightedNodes) {
			yield put(TreeActions.getSelectedNodesSuccess(objectsStatus.highlightedNodes));
		}
	} catch (error) {
		console.error(error);
	}
}

export function* stopListenOnSelections() {
	try {
		Viewer.off(VIEWER_EVENTS.OBJECT_SELECTED);
		Viewer.off(VIEWER_EVENTS.MULTI_OBJECTS_SELECTED);
		Viewer.off(VIEWER_EVENTS.BACKGROUND_SELECTED);
	} catch (error) {
		console.error(error);
	}
}

export function* showAllNodes() {
	try {
		const TreeService = getAngularService('TreeService') as any;
		yield TreeService.showAllTreeNodes(true);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'all nodes'));
	}
}

export function* hideSelectedNodes() {
	try {
		const TreeService = getAngularService('TreeService') as any;
		yield TreeService.hideSelected();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('hide', 'selected nodes'));
	}
}

export function* isolateSelectedNodes() {
	try {
		const TreeService = getAngularService('TreeService') as any;
		yield TreeService.isolateSelected();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('isolate', 'selected nodes'));
	}
}

export function* hideIfcSpaces() {
	try {
		const ifcSpacesHidden = yield select(selectIfcSpacesHidden);
		yield put(TreeActions.setIfcSpacesHidden(!ifcSpacesHidden));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('hide', 'IFC spaces'));
	}
}

export default function* TreeSaga() {
	yield takeLatest(TreeTypes.FETCH_FULL_TREE, fetchFullTree);
	yield takeLatest(TreeTypes.START_LISTEN_ON_SELECTIONS, startListenOnSelections);
	yield takeLatest(TreeTypes.STOP_LISTEN_ON_SELECTIONS, stopListenOnSelections);
	yield takeLatest(TreeTypes.GET_SELECTED_NODES, getSelectedNodes);
	yield takeLatest(TreeTypes.SHOW_ALL_NODES, showAllNodes);
	yield takeLatest(TreeTypes.HIDE_SELECTED_NODES, hideSelectedNodes);
	yield takeLatest(TreeTypes.ISOLATE_SELECTED_NODES, isolateSelectedNodes);
	yield takeLatest(TreeTypes.HIDE_IFC_SPACES, hideIfcSpaces);
}
