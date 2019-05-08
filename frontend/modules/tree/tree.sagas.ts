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
import { put, takeLatest, call, select, take, all } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { pick, uniq, flatten, values, cloneDeep } from 'lodash';

import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { VIEWER_EVENTS } from '../../constants/viewer';
import { dispatch, getAngularService, getState } from '../../helpers/migration';
import { GroupsActions } from '../groups';
import { DialogActions } from '../dialog';
import {
	selectSelectedNodes,
	selectIfcSpacesHidden,
	selectNodesIndexesMap,
	selectNodesVisibilityMap,
	selectNodesSelectionMap,
	selectNumberOfInvisibleChildrenMap,
	selectTreeNodesList,
	selectNodesBySharedIdsMap
} from './tree.selectors';
import { TreeTypes, TreeActions } from './tree.redux';
import { selectSettings, ModelTypes } from '../model';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { VISIBILITY_STATES, NODE_TYPES, SELECTION_STATES } from '../../constants/tree';
import { selectActiveMeta, BimActions } from '../bim';
import { ViewerActions } from '../viewer';

const setupWorker = (worker, onResponse) => {
	worker.addEventListener('message', (e) => {
		const data = JSON.parse(e.data);
		onResponse(data.result);
	}, false);

	worker.addEventListener('messageerror', (e) => {
		// tslint:disable-next-line
		console.error('Worker error', e);
	}, false);

	return worker;
};

const treeWorker = new TreeWorker();

function* getNodesByIds(nodesIds) {
	const treeNodesList = yield select(selectTreeNodesList);
	const nodesIndexesMap = yield select(selectNodesIndexesMap);
	return nodesIds.map((nodeId) => treeNodesList[nodesIndexesMap[nodeId]]);
}

function* getNodesIdsFromSharedIds(objects: any) {
	if (!objects || !objects.length) {
		return [];
	}
	const nodesBySharedIds = yield select(selectNodesBySharedIdsMap);

	const objectsSharedIds = objects.map(({ shared_ids }) => shared_ids);
	const sharedIds = flatten(objectsSharedIds) as string[];
	const nodesIdsBySharedIds = values(pick(nodesBySharedIds, sharedIds));
	return uniq(nodesIdsBySharedIds);
}

function* clearCurrentlySelected() {
	yield all([
		put(ViewerActions.clearHighlights()),
		put(ViewerActions.setMetadataVisibility(false)),
		put(BimActions.setActiveMeta(null))
	]);

	// TODO: Rewrite when selection map will contain only selected nodes
	const nodesSelectionMap = yield select(selectNodesSelectionMap);
	for (const id in nodesSelectionMap) {
		if (nodesSelectionMap[id] === SELECTION_STATES.UNSELECTED) {
			continue;
		}
		nodesSelectionMap[id] = SELECTION_STATES.UNSELECTED;
	}
	yield put(TreeActions.setNodesSelectionMap(nodesSelectionMap));
}

function* fetchFullTree({ teamspace, modelId, revision }) {
	yield put(TreeActions.setIsPending(true));

	try {
		const { data: fullTree } = yield API.getFullTree(teamspace, modelId, revision);
		yield take(ModelTypes.FETCH_SETTINGS_SUCCESS);

		const dataToProcessed = { mainTree: fullTree.mainTree.nodes, subTrees: [], subModels: [] };
		const modelSettings = yield select(selectSettings);
		dataToProcessed.mainTree.name = modelSettings.name;
		dataToProcessed.mainTree.isFederation = modelSettings.federate;
		dataToProcessed.subModels = modelSettings.subModels;
		const subTreesData = fullTree.subTrees.length
			? yield all(fullTree.subTrees.map(({ url }) => API.default.get(url)))
			: [];
		dataToProcessed.subTrees = subTreesData.map(({ data }) => data.mainTree);

		const worker = setupWorker(treeWorker, (result) => {
			const { nodesList, ...auxiliaryMaps } = result.data;
			dispatch(TreeActions.setAuxiliaryMaps(auxiliaryMaps));
			dispatch(TreeActions.setTreeNodesList(nodesList));
		});
		worker.postMessage(dataToProcessed);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('fetch', 'full tree', error));
	}

	yield put(TreeActions.setIsPending(false));
}

function* startListenOnSelections() {
	Viewer.on(VIEWER_EVENTS.OBJECT_SELECTED, (object) => {
		dispatch(TreeActions.handleNodesClick([object.id]));
	});

	Viewer.on(VIEWER_EVENTS.MULTI_OBJECTS_SELECTED, (object) => {
		dispatch(TreeActions.handleNodesClickBySharedIds(object.selectedNodes));
	});

	Viewer.on(VIEWER_EVENTS.BACKGROUND_SELECTED, () => {
		dispatch(TreeActions.handleBackgroundClick());
	});
}

function* stopListenOnSelections() {
	try {
		Viewer.off(VIEWER_EVENTS.OBJECT_SELECTED);
		Viewer.off(VIEWER_EVENTS.MULTI_OBJECTS_SELECTED);
		Viewer.off(VIEWER_EVENTS.BACKGROUND_SELECTED);
	} catch (error) {
		console.error(error);
	}
}

function* handleBackgroundClick() {
	const selectedNodes = yield select(selectSelectedNodes);
	if (selectedNodes.length) {
		yield all([
			put(TreeActions.clearSelectedNodes()),
			put(GroupsActions.clearSelectionHighlights())
		]);
	}
}

function* handleNodesClick({ nodesIds = [], skipExpand = false }) {
	const TreeService = getAngularService('TreeService') as any;
	const nodes = yield getNodesByIds(nodesIds);

	const addGroup = MultiSelect.isAccumMode();
	const removeGroup = MultiSelect.isDecumMode();
	const isMultiSelectMode = addGroup || removeGroup;

	if (!isMultiSelectMode) {
		yield clearCurrentlySelected();
	}

	if (removeGroup) {
		const activeMeta = yield select(selectActiveMeta);
		const shouldCloseMeta = nodes.some(({ data: { meta } }) => meta.includes(activeMeta));

		if (shouldCloseMeta) {
			yield all([
				put(ViewerActions.setMetadataVisibility(false)),
				put(BimActions.setActiveMeta(null))
			]);
		}
		// TODO
		TreeService.deselectNodes(nodes);
	} else {
		// TODO
		TreeService.selectNodes(nodes, skipExpand);
	}

	yield TreeActions.getSelectedNodes();
}

function* handleNodesClickBySharedIds({ nodesIds }) {
	const nodes = yield getNodesIdsFromSharedIds(nodesIds);
	yield put(TreeActions.handleNodesClick(nodes));
}

function* getSelectedNodes() {
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

function* showAllNodes() {
	try {
		const TreeService = getAngularService('TreeService') as any;
		yield TreeService.showAllTreeNodes(true);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'all nodes'));
	}
}

function* hideSelectedNodes() {
	try {
		const TreeService = getAngularService('TreeService') as any;
		yield TreeService.hideSelected();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('hide', 'selected nodes'));
	}
}

function* isolateSelectedNodes() {
	try {
		const TreeService = getAngularService('TreeService') as any;
		yield TreeService.isolateSelected();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('isolate', 'selected nodes'));
	}
}

function* hideIfcSpaces() {
	try {
		const ifcSpacesHidden = yield select(selectIfcSpacesHidden);
		yield put(TreeActions.setIfcSpacesHidden(!ifcSpacesHidden));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('hide', 'IFC spaces'));
	}
}

function* selectNode({ id }) {
	try {
		const accumMode = MultiSelect.isAccumMode();
		const decumMode = MultiSelect.isDecumMode();
		const nodesIndexesMap = yield select(selectNodesIndexesMap);

		const treeNodesList = yield select(selectTreeNodesList);
		const nodeIndex = nodesIndexesMap[id];
		const node = treeNodesList[nodeIndex];

		if (!node.hasChildren) {
			yield put(TreeActions.addToSelected(id));

			if (accumMode) {
				yield put(TreeActions.addToSelected(id));
			} else if (decumMode) {
				yield put(TreeActions.removeFromSelected(id));
			} else {
				yield put(TreeActions.removeAllSelected());
				yield put(TreeActions.addToSelected(id));
			}
		} else {
			if (accumMode) {
				yield put(TreeActions.addGroupToSelected(nodeIndex, node.childrenNumber + nodeIndex + 1));
			} else if (decumMode) {
				yield put(TreeActions.removeGroupFromSelected(nodeIndex, node.childrenNumber + nodeIndex + 1));
			} else {
				yield put(TreeActions.removeAllSelected());
				yield put(TreeActions.addGroupToSelected(nodeIndex, node.childrenNumber + nodeIndex + 1));
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'node'));
	}
}

function* setTreeNodesVisibility({ nodes, visibility }) {
	try {
		const nodesVisibilityMap = yield select(selectNodesVisibilityMap);
		const nodesSelectionMap = yield select(selectNodesSelectionMap);
		const nodesIndexesMap = yield select(selectNodesIndexesMap);
		const treeNodesList = yield select(selectTreeNodesList);
		const numberOfInvisibleChildrenMap = yield select(selectNumberOfInvisibleChildrenMap);

		const TreeService = getAngularService('TreeService') as any;

		if (nodes.length && visibility === VISIBILITY_STATES.INVISIBLE) {
			// TreeService.deselectNodes(nodes);
		}

		const newVisibilityMap = cloneDeep(nodesVisibilityMap);
		const newNumberOfInvisibleChildrenMap = cloneDeep(numberOfInvisibleChildrenMap);

		for (let nodeLoopIndex = 0; nodeLoopIndex < nodes.length ; nodeLoopIndex++) {
			const nodeId = nodes[nodeLoopIndex];
			const nodeIndex = nodesIndexesMap[nodeId];
			const node = treeNodesList[nodeIndex];

			if (node && (visibility === VISIBILITY_STATES.PARENT_OF_VISIBLE || visibility !== nodesVisibilityMap[nodeId])) {
				if (node.type === NODE_TYPES.MESH) {
					// this.meshesToUpdate.add(node);
				}

				if (node.hasChildren) {
					for (let childIndex = nodeIndex; childIndex <= nodeIndex + node.childrenNumber; childIndex++) {
						const child = treeNodesList[childIndex];
						if (visibility === VISIBILITY_STATES.VISIBLE) {
							newVisibilityMap[child._id] = VISIBILITY_STATES.VISIBLE;
						} else {
							// TreeService.setNodeSelection(child, this.SELECTION_STATES.unselected);
							newVisibilityMap[child._id] = VISIBILITY_STATES.INVISIBLE;
						}
					}

					if (visibility === VISIBILITY_STATES.INVISIBLE) {
						newNumberOfInvisibleChildrenMap[node._id] = node.childrenNumber;
					} else {
						newNumberOfInvisibleChildrenMap[node._id] = 0;
					}

					let currentNode = node;
					const parents = [];

					for (let i = currentNode.level - 1; i > 0; i--) {
						const newParentIndex = nodesIndexesMap[currentNode.parentId];
						const newParentNode = treeNodesList[newParentIndex];
						currentNode = newParentNode;
						newNumberOfInvisibleChildrenMap[currentNode._id] = node.childrenNumber + i;

						if (currentNode.childrenNumber > newNumberOfInvisibleChildrenMap[currentNode._id]) {
							newVisibilityMap[currentNode._id] = VISIBILITY_STATES.PARENT_OF_VISIBLE;
						}
						parents.push(currentNode);
					}
				}

				yield put(TreeActions.setComponentState({
					nodesVisibilityMap: newVisibilityMap,
					numberOfInvisibleChildrenMap: newNumberOfInvisibleChildrenMap
				}));
			}
		}

	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'tree node visibility'));
	}
}

function* updateParentVisibility({ parentNode }) {
	try {
		const nodesIndexesMap = yield select(selectNodesIndexesMap);
		const treeNodesList = yield select(selectTreeNodesList);
		const nodesVisibilityMap = yield select(selectNodesVisibilityMap);

		let currentNode = parentNode;
		const nodes = [parentNode];

		for (let i = parentNode.level; i > 1; i--) {
			const newParentIndex = nodesIndexesMap[currentNode.parentId];
			const newParentNode = treeNodesList[newParentIndex];
			currentNode = newParentNode;
			nodes.push(currentNode);
		}

	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'parent node visibility'));
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
	yield takeLatest(TreeTypes.SELECT_NODE, selectNode);
	yield takeLatest(TreeTypes.SET_TREE_NODES_VISIBILITY, setTreeNodesVisibility);
	yield takeLatest(TreeTypes.UPDATE_PARENT_VISIBILITY, updateParentVisibility);
	yield takeLatest(TreeTypes.HANDLE_NODES_CLICK, handleNodesClick);
	yield takeLatest(TreeTypes.HANDLE_NODES_CLICK_BY_SHARED_IDS, handleNodesClickBySharedIds);
	yield takeLatest(TreeTypes.HANDLE_BACKGROUND_CLICK, handleBackgroundClick);
}
