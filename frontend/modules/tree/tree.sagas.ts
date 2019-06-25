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
import { put, takeLatest, call, select, take, all, spawn } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import TreeProcessing from './treeProcessing/treeProcessing';
import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { VIEWER_EVENTS } from '../../constants/viewer';
import { dispatch } from '../../helpers/migration';
import { GroupsActions } from '../groups';
import { DialogActions } from '../dialog';
import {
	selectIfcSpacesHidden,
	selectNodesIndexesMap,
	selectTreeNodesList,
	selectSelectedNodesIds,
	selectExpandedNodesMap,
	getSelectNodesByIds,
	getNodesIdsFromSharedIds,
	selectInvisibleNodesIds,
	selectDefaultHiddenNodesIds,
	getDeepChildren,
	selectSelectionMap,
	selectVisibilityMap,
	selectHighlightedNodesIds,
	selectActiveNode
} from './tree.selectors';

import { TreeTypes, TreeActions } from './tree.redux';
import { selectSettings, ModelTypes } from '../model';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { VISIBILITY_STATES, SELECTION_STATES } from '../../constants/tree';
import { selectActiveMeta, BimActions, selectIsActive } from '../bim';
import { ViewerActions } from '../viewer';

const unhighlightObjects = (objects = []) => {
	for (let index = 0, size = objects.length; index < size; index++) {
		const { meshes, teamspace, modelId } = objects[index];

		Viewer.unhighlightObjects({
			account: teamspace,
			model: modelId,
			ids: meshes
		});
	}
};

const highlightObjects = (objects = [], nodesSelectionMap = {}, colour?) => {
	const promises = [];
	for (let index = 0, size = objects.length; index < size; index++) {
		const { meshes, teamspace, modelId } = objects[index];

		if (meshes.length) {
			const filterdMeshes = meshes.filter((mesh) => nodesSelectionMap[mesh] === SELECTION_STATES.SELECTED);
			if (meshes.length > 0) {
				promises.push(
					Viewer.highlightObjects({
						account: teamspace,
						ids: filterdMeshes,
						colour,
						model: modelId,
						multi: true,
						source: 'tree',
						forceReHighlight: true
					})
				);
			}
		}
	}
	return Promise.all(promises);
};

function* handleMetadata(node: any) {
	const isMetadataActive = yield select(selectIsActive);
	if (node && node.meta && isMetadataActive) {
		yield put(BimActions.fetchMetadata(node.teamspace, node.model, node.meta[0]));
		yield put(ViewerActions.setMetadataVisibility(true));
	}
}

function* expandToNode(nodeId: string) {
	if (nodeId) {
		const treeNodesList = yield select(selectTreeNodesList);
		const nodesIndexesMap = yield select(selectNodesIndexesMap);
		const expandedNodesMap = {...(yield select(selectExpandedNodesMap))};
		const node = treeNodesList[nodesIndexesMap[nodeId]];

		const parents = [node, ...TreeProcessing.getParents(node)];
		for (let index = 0, size = parents.length; index < size; index++) {
			expandedNodesMap[parents[index]._id] = true;
		}

		yield put(TreeActions.setExpanedNodesMap(expandedNodesMap));
	}
}

function* fetchFullTree({ teamspace, modelId, revision }) {
	yield put(TreeActions.setIsPending(true));

	try {
		yield take(ModelTypes.FETCH_SETTINGS_SUCCESS);

		const [{ data: fullTree }, { data: modelsWithMeshes }] = yield all([
			API.getFullTree(teamspace, modelId, revision),
			API.getIdToMeshesMap(teamspace, modelId, revision)
		]);

		const dataToProcessed = {
			mainTree: fullTree.mainTree.nodes,
			subTrees: [],
			subModels: [],
			modelsWithMeshes: modelsWithMeshes.subModels
		};
		const modelSettings = yield select(selectSettings);
		dataToProcessed.mainTree.name = modelSettings.name;
		dataToProcessed.mainTree.isFederation = modelSettings.federate;
		dataToProcessed.subModels = modelSettings.subModels;
		const subTreesData = fullTree.subTrees.length
			? yield all(fullTree.subTrees.map(({ url }) => API.default.get(url)))
			: [];
		dataToProcessed.subTrees = subTreesData.map(({ data }) => data.mainTree);

		yield TreeProcessing.transformData(dataToProcessed);
		yield put(TreeActions.updateDataRevision());
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
	const highlightedNodesIds = yield select(selectHighlightedNodesIds);
	const activeNode = yield select(selectActiveNode);

	if (highlightedNodesIds.length || activeNode) {
		yield all([
			clearCurrentlySelected(),
			put(GroupsActions.clearSelectionHighlights()),
			put(TreeActions.setActiveNode(null))
		]);
		yield put(TreeActions.updateDataRevision());
	}
	return false;
}

function* handleNodesClick({ nodesIds = [], skipExpand = false, skipChildren = false }) {
	const addGroup = MultiSelect.isAccumMode();
	const removeGroup = MultiSelect.isDecumMode();
	const isMultiSelectMode = addGroup || removeGroup;

	if (!isMultiSelectMode) {
		yield clearCurrentlySelected();
	}

	if (removeGroup) {
		const nodes = yield select(getSelectNodesByIds(nodesIds));
		const activeMeta = yield select(selectActiveMeta);
		const shouldCloseMeta = nodes.some(({ meta }) => meta.includes(activeMeta));
		if (shouldCloseMeta) {
			yield all([
				put(ViewerActions.setMetadataVisibility(false)),
				put(BimActions.setActiveMeta(null))
			]);
		}
		yield put(TreeActions.deselectNodes(nodesIds));
	} else {
		yield put(TreeActions.selectNodes(nodesIds, skipExpand, skipChildren));
	}
}

function* handleNodesClickBySharedIds({ objects = [] }) {
	const nodes = yield select(getNodesIdsFromSharedIds(objects));
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

function* clearCurrentlySelected() {
	Viewer.clearHighlights();
	yield all([
		put(TreeActions.setActiveNode(null)),
		call(TreeProcessing.clearSelected),
		put(ViewerActions.setMetadataVisibility(false)),
		put(BimActions.setActiveMeta(null))
	]);
	yield put(TreeActions.updateDataRevision());
}

/**
 * SHOW NODES
 */
function* showAllNodes() {
	try {
		const nodesIds = yield select(selectInvisibleNodesIds);
		yield showTreeNodes(nodesIds, true);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'all nodes', error));
	}
}

function* showNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield select(getNodesIdsFromSharedIds(objects));
	yield showTreeNodes(nodesIds);
}

function* showTreeNodes(nodesIds = [], skipNested = false) {
	try {
		yield put(TreeActions.setTreeNodesVisibility(nodesIds, VISIBILITY_STATES.VISIBLE, skipNested, skipNested));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'nodes', error));
	}
}

/**
 * HIDE NODES
 */
function* hideSelectedNodes() {
	const highlightedNodesIds = yield select(selectHighlightedNodesIds);
	yield hideTreeNodes(highlightedNodesIds);
}

function* hideNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield select(getNodesIdsFromSharedIds(objects));
	yield hideTreeNodes(nodesIds, true);
}

function* hideTreeNodes(nodesIds = [], skipNested = false) {
	try {
		yield put(TreeActions.setTreeNodesVisibility(nodesIds, VISIBILITY_STATES.INVISIBLE, skipNested, skipNested));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('hide', 'nodes', error));
	}
}

/**
 * ISOLATE NODES
 */
function* isolateNodes(nodesIds = []) {
	try {
		if (nodesIds.length) {
			const meshesToUpdate = yield TreeProcessing.isolateNodes({ nodesIds });
			const visibilityMap = yield select(selectVisibilityMap);

			yield put(ViewerActions.clearHighlights());
			yield put(TreeActions.updateDataRevision());
			yield updateMeshesVisibility(meshesToUpdate, visibilityMap);
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('isolate', 'selected nodes', error));
	}
}

function* isolateSelectedNodes({ nodeId = null }) {
	const highlightedNodesIds = yield select(selectHighlightedNodesIds);
	if (highlightedNodesIds.length) {
		yield isolateNodes(highlightedNodesIds);
	} else {
		const deepChildren = yield select(getDeepChildren(nodeId));
		const deepChildrenIds = deepChildren.map(({ _id }) => _id);
		yield isolateNodes([nodeId, ...deepChildrenIds]);
	}
}

function* isolateNodesBySharedIds({ objects = []}) {
	const nodesIds = yield select(getNodesIdsFromSharedIds(objects));
	yield isolateNodes(nodesIds);
}

function* hideIfcSpaces() {
	try {
		const ifcSpacesHidden = yield select(selectIfcSpacesHidden);
		yield put(TreeActions.setIfcSpacesHidden(!ifcSpacesHidden));

		const ifcSpacesNodesIds = yield select(selectDefaultHiddenNodesIds);
		const visibility = !ifcSpacesHidden ? VISIBILITY_STATES.INVISIBLE : VISIBILITY_STATES.VISIBLE;
		yield put(TreeActions.setTreeNodesVisibility(ifcSpacesNodesIds, visibility, true));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('hide', 'IFC spaces', error));
	}
}

/**
 * DESELECT NODES
 */
function* deselectNodes({ nodesIds = [] }) {
	try {
		const result = yield TreeProcessing.deselectNodes({ nodesIds });
		unhighlightObjects(result.unhighlightedObjects);

		yield put(TreeActions.updateDataRevision());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('deselect', 'node', error));
	}
}

function* deselectNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield select(getNodesIdsFromSharedIds(objects));
	yield put(TreeActions.deselectNodes(nodesIds));
}

/**
 * SELECT NODES
 */
function* selectNode({ id }) {
	try {
		yield put(TreeActions.handleNodesClick([id], true));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'node', error));
	}
}

function* selectNodes({ nodesIds = [], skipExpand = false, skipChildren = false, colour }) {
	try {
		const lastNodeId = nodesIds[nodesIds.length - 1];
		const [lastNode] = yield select(getSelectNodesByIds([lastNodeId]));

		const [result] = yield all([
			call(TreeProcessing.selectNodes, { nodesIds, skipChildren }),
			call(handleMetadata, lastNode)
		]);

		const selectionMap = yield select(selectSelectionMap);
		yield highlightObjects(result.highlightedObjects, selectionMap, colour);

		if (!skipExpand) {
			yield expandToNode(lastNodeId);
		}
		if (nodesIds.length === 1) {
			yield put(TreeActions.setActiveNode(nodesIds[0]));
		}
		yield put(TreeActions.updateDataRevision());
		yield zoomToHighlightedNodes();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'nodes', error));
	}
}

function* selectNodesBySharedIds({ objects = [], colour }: { objects: any[], colour?: number[]}) {
	const nodesIds = yield select(getNodesIdsFromSharedIds(objects));
	yield put(TreeActions.selectNodes(nodesIds, false, true, colour));
}

/**
 * SET VISIBILITY
 */
function* setTreeNodesVisibility({ nodesIds, visibility, skipChildren = false, skipParents = false }) {
	try {
		if (nodesIds.length) {
			const ifcSpacesHidden = yield select(selectIfcSpacesHidden);

			const result = yield TreeProcessing.updateVisibility({
				nodesIds,
				visibility,
				ifcSpacesHidden,
				skipChildren,
				skipParents
			});

			unhighlightObjects(result.unhighlightedObjects);
			const visibilityMap = yield select(selectVisibilityMap);

			yield updateMeshesVisibility(result.meshesToUpdate, visibilityMap);
			yield put(TreeActions.updateDataRevision());
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'tree node visibility', error));
	}
}

function* setSelectedNodesVisibility({ nodeId, visibility }) {
	const highlightedNodesIds = yield select(selectHighlightedNodesIds);
	const hasSelectedNodes = !!highlightedNodesIds.length;
	const nodesIds = hasSelectedNodes ? highlightedNodesIds : [nodeId];
	yield put(TreeActions.setTreeNodesVisibility(nodesIds, visibility, hasSelectedNodes));
}

function* updateMeshesVisibility(meshes, nodesVisibilityMap) {
	try {
		const hiddenMeshes = [];
		const shownMeshes = [];

		for (let i = 0; i < meshes.length; i++) {
			const mesh = meshes[i];

			if (nodesVisibilityMap[mesh._id] === VISIBILITY_STATES.INVISIBLE) {
				hiddenMeshes.push(mesh);
			} else {
				shownMeshes.push(mesh);
			}
		}

		yield handleMeshesVisibility(hiddenMeshes, false);
		yield handleMeshesVisibility(shownMeshes, true);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'meshes visibility', error));
	}
}

function* handleMeshesVisibility(meshes, visibility) {
	try {
		const objectIds = {};
		const alreadyProcessed = {};

		for (let index = 0; index < meshes.length; index++) {
			const node = meshes[index];
			const { namespacedId, _id, teamspace, model } = node;
			if (!objectIds[namespacedId]) {
				objectIds[namespacedId] = [];
			}

			objectIds[namespacedId].push(_id);

			if (!alreadyProcessed[namespacedId]) {
				Viewer.switchObjectVisibility(
					teamspace,
					model,
					objectIds[namespacedId],
					visibility
				);
				alreadyProcessed[namespacedId] = true;
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('handle', 'meshes visibility', error));
	}
}

function* collapseNodes({ nodesIds }) {
	const expandedNodesMap = {... (yield select(selectExpandedNodesMap))};
	const nodesIndexesMap = yield select(selectNodesIndexesMap);
	const nodesList = yield select(selectTreeNodesList);

	for (let index = 0; index < nodesIds.length; index++) {
		const nodeId = nodesIds[index];
		const nodeIndex = nodesIndexesMap[nodeId];
		const node = nodesList[nodeIndex];

		if (node.deepChildrenNumber) {
			for (let i = nodeIndex; i < nodeIndex + node.deepChildrenNumber; i++) {
				if (expandedNodesMap[nodesList[i]._id]) {
					expandedNodesMap[nodesList[i]._id] = false;
				}
			}
		} else {
			expandedNodesMap[nodeId] = false;
		}
	}

	yield put(TreeActions.setExpanedNodesMap(expandedNodesMap));
}

function* goToParentNode({ nodeId }) {
	const nodesIndexesMap = yield select(selectNodesIndexesMap);
	const nodesList = yield select(selectTreeNodesList);
	const level = nodesList[nodesIndexesMap[nodeId]].level;

	const nodesToCollapse = [];
	const nodesToExpand = [];

	let currentNodeIndex = 0;
	while (currentNodeIndex <= nodesList.length - 1) {
		const node = nodesList[currentNodeIndex];
		if (node.level === level) {
			nodesToExpand.push(node._id);
			nodesToCollapse.push(...node.childrenIds);
			currentNodeIndex += node.deepChildrenNumber;
		} else {
			currentNodeIndex++;
		}
	}

	yield put(TreeActions.collapseNodes(nodesToCollapse));
	yield put(TreeActions.expandNodes(nodesToExpand));
}

function* zoomToHighlightedNodes() {
	try {
		//yield take(TreeTypes.UPDATE_DATA_REVISION);
		requestAnimationFrame(() => {
			dispatch(ViewerActions.zoomToHighlightedMeshes());
		});
	} catch (error) {
		yield put(DialogActions.showErrorDialog('zoom', 'highlighted nodes', error));
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
	yield takeLatest(TreeTypes.SET_SELECTED_NODES_VISIBILITY, setSelectedNodesVisibility);
	yield takeLatest(TreeTypes.HANDLE_NODES_CLICK, handleNodesClick);
	yield takeLatest(TreeTypes.HANDLE_NODES_CLICK_BY_SHARED_IDS, handleNodesClickBySharedIds);
	yield takeLatest(TreeTypes.HANDLE_BACKGROUND_CLICK, handleBackgroundClick);
	yield takeLatest(TreeTypes.SHOW_NODES_BY_SHARED_IDS, showNodesBySharedIds);
	yield takeLatest(TreeTypes.SELECT_NODES, selectNodes);
	yield takeLatest(TreeTypes.SELECT_NODES_BY_SHARED_IDS, selectNodesBySharedIds);
	yield takeLatest(TreeTypes.DESELECT_NODES_BY_SHARED_IDS, deselectNodesBySharedIds);
	yield takeLatest(TreeTypes.DESELECT_NODES, deselectNodes);
	yield takeLatest(TreeTypes.ISOLATE_NODES_BY_SHARED_IDS, isolateNodesBySharedIds);
	yield takeLatest(TreeTypes.HIDE_NODES_BY_SHARED_IDS, hideNodesBySharedIds);
	yield takeLatest(TreeTypes.CLEAR_CURRENTLY_SELECTED, clearCurrentlySelected);
	yield takeLatest(TreeTypes.COLLAPSE_NODES, collapseNodes);
	yield takeLatest(TreeTypes.GO_TO_PARENT_NODE, goToParentNode);
	yield takeLatest(TreeTypes.ZOOM_TO_HIGHLIGHTED_NODES, zoomToHighlightedNodes);
}
