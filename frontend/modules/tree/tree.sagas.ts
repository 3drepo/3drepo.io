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
import { delay } from 'redux-saga';
import { all, call, put, select, take, takeLatest } from 'redux-saga/effects';

import { VIEWER_EVENTS } from '../../constants/viewer';
import { dispatch } from '../../modules/store';
import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { DialogActions } from '../dialog';
import { GroupsActions } from '../groups';
import {
	selectActiveNode,
	selectDefaultHiddenNodesIds,
	selectExpandedNodesMap,
	selectFullySelectedNodesIds,
	selectGetNodesByIds,
	selectGetNodesIdsFromSharedIds,
	selectHiddenNodesIds,
	selectIfcSpacesHidden,
	selectNodesIndexesMap,
	selectSelectedNodesIds,
	selectSelectionMap,
	selectTreeNodesList,
	selectVisibilityMap
} from './tree.selectors';
import TreeProcessing from './treeProcessing/treeProcessing';

import { SELECTION_STATES, VISIBILITY_STATES } from '../../constants/tree';
import { VIEWER_PANELS } from '../../constants/viewerGui';
import { addColorOverrides, overridesDiff, removeColorOverrides } from '../../helpers/colorOverrides';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { selectActiveMeta, selectIsActive, BimActions } from '../bim';
import { selectSettings, ModelTypes } from '../model';
import { selectIsMetadataVisible, ViewerGuiActions } from '../viewerGui';
import { TreeActions, TreeTypes } from './tree.redux';

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
	let promises = [];

	for (let index = 0, size = objects.length; index < size; index++) {
		const { meshes, teamspace, modelId } = objects[index];
		const filteredMeshes = meshes.filter((mesh) => nodesSelectionMap[mesh] === SELECTION_STATES.SELECTED);
		if (filteredMeshes.length) {
			promises = promises.concat(Viewer.highlightObjects({
				account: teamspace,
				ids: filteredMeshes,
				colour,
				model: modelId,
				multi: true,
				source: 'tree',
				forceReHighlight: true
			}));
		}
	}
	return Promise.all(promises);
};

function* handleMetadata(node: any) {
	const isMetadataActive = yield select(selectIsActive);
	if (node && node.meta && isMetadataActive) {
		yield put(BimActions.fetchMetadata(node.teamspace, node.model, node.meta[0]));
		yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.BIM, true));
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

		yield put(TreeActions.setExpandedNodesMap(expandedNodesMap));
	}
}

function* getAllTrees(teamspace, modelId, revision) {
	const fullTree = yield API.getFullTree(teamspace, modelId, revision);

	const subTreesData = fullTree.data.subTrees.length
		? yield all(fullTree.data.subTrees.map(({ url }) => API.default.get(url)))
		: [];
	const subTrees = subTreesData.map(({ data }) => data.mainTree);
	return { fullTree: fullTree.data, subTrees};
}

function* fetchFullTree({ teamspace, modelId, revision }) {
	yield put(TreeActions.setIsPending(true));

	try {
		let modelSettings = yield select(selectSettings);

		if (!modelSettings || !modelSettings.name) { // In case the model settings didnt load yet
			yield take(ModelTypes.FETCH_SETTINGS_SUCCESS);
			modelSettings = yield select(selectSettings);
		}

		const [{ fullTree, subTrees }, { data: modelsWithMeshes }, { data: treePath }] = yield all([
			getAllTrees(teamspace, modelId, revision),
			API.getIdToMeshesMap(teamspace, modelId, revision),
			API.getTreePath(teamspace, modelId, revision),
		]);

		const dataToProcessed = {
			mainTree: fullTree.mainTree.nodes,
			subTrees,
			subModels: [],
			modelsWithMeshes: modelsWithMeshes.subModels,
			treePath: {}
		};

		dataToProcessed.mainTree.name = modelSettings.name;
		dataToProcessed.mainTree.isFederation = modelSettings.federate;
		dataToProcessed.subModels = modelSettings.subModels;
		dataToProcessed.treePath = treePath;
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
	const fullySelectedNodes = yield select(selectFullySelectedNodesIds);

	if (fullySelectedNodes.length) {
		yield all([
			clearCurrentlySelected(),
			put(GroupsActions.clearSelectionHighlights(false))
		]);
	}

	const activeNode = yield select(selectActiveNode);

	if (activeNode) {
		yield put(TreeActions.setActiveNode(null));
	}

	if (fullySelectedNodes.length || activeNode) {
		yield put(TreeActions.updateDataRevision());
	}
}

function* handleNodesClick({ nodesIds = [], skipExpand = false, skipChildren = false }) {
	const addGroup = MultiSelect.isAccumMode();
	const removeGroup = MultiSelect.isDecumMode();
	const isMultiSelectMode = addGroup || removeGroup;

	if (!isMultiSelectMode) {
		yield put(TreeActions.clearCurrentlySelected());
		yield take(TreeTypes.UPDATE_DATA_REVISION);
	}

	if (removeGroup) {
		yield put(TreeActions.deselectNodes(nodesIds));
	} else {
		yield put(TreeActions.selectNodes(nodesIds, skipExpand, skipChildren));
	}
}

function* handleNodesClickBySharedIds({ objects = [] }) {
	const nodes = yield select(selectGetNodesIdsFromSharedIds(objects));
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
	const selectedNodesIds = yield select(selectSelectedNodesIds);

	if (selectedNodesIds.length) {
		yield TreeProcessing.clearSelected();
	}
	yield put(TreeActions.updateDataRevision());

	const isBimVisible = yield select(selectIsMetadataVisible);
	const activeMeta = yield select(selectActiveMeta);
	const activeNode = yield select(selectActiveNode);

	if (isBimVisible) {
		yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.BIM, false));
	}

	if (activeMeta) {
		yield put(BimActions.setActiveMeta(null));
	}

	if (activeNode) {
		yield put(TreeActions.setActiveNode(null));
	}
}

/**
 * SHOW NODES
 */
function* showAllNodes() {
	try {
		const nodesIds = yield select(selectHiddenNodesIds);
		yield showTreeNodes(nodesIds, true);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'all nodes', error));
	}
}

function* showNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield select(selectGetNodesIdsFromSharedIds(objects));
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
	const fullySelectedNodes = yield select(selectFullySelectedNodesIds);
	yield hideTreeNodes(fullySelectedNodes);
}

function* hideNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield select(selectGetNodesIdsFromSharedIds(objects));
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
function* isolateNodes(nodesIds = [], skipChildren = false) {
	try {
		if (nodesIds.length) {
			const ifcSpacesHidden = yield select(selectIfcSpacesHidden);
			const meshesToUpdate = yield TreeProcessing.isolateNodes({ nodesIds, skipChildren, ifcSpacesHidden });
			const visibilityMap = yield select(selectVisibilityMap);

			Viewer.clearHighlights();
			yield put(TreeActions.updateDataRevision());
			yield updateMeshesVisibility(meshesToUpdate, visibilityMap);
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('isolate', 'selected nodes', error));
	}
}

function* isolateSelectedNodes({ nodeId = null }) {
	const fullySelectedNodes = yield select(selectFullySelectedNodesIds);
	if (fullySelectedNodes.length) {
		yield isolateNodes(fullySelectedNodes, true);
	} else {
		yield isolateNodes([nodeId]);
	}
}

function* isolateNodesBySharedIds({ objects = []}) {
	const nodesIds = yield select(selectGetNodesIdsFromSharedIds(objects));
	yield isolateNodes(nodesIds);
}

function* hideIfcSpaces() {
	try {
		const ifcSpacesHidden = yield select(selectIfcSpacesHidden);
		yield put(TreeActions.setIfcSpacesHidden(!ifcSpacesHidden));

		const ifcSpacesNodesIds = yield select(selectDefaultHiddenNodesIds);
		const visibility = ifcSpacesHidden ? VISIBILITY_STATES.VISIBLE : VISIBILITY_STATES.INVISIBLE;
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
		const isBimVisible = yield select(selectIsMetadataVisible);
		const activeMeta = yield select(selectActiveMeta);

		if (isBimVisible) {
			yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.BIM, false));
		}

		if (activeMeta) {
			yield put(BimActions.setActiveMeta(null));
		}

		yield put(TreeActions.updateDataRevision());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('deselect', 'node', error));
	}
}

function* deselectNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield select(selectGetNodesIdsFromSharedIds(objects));
	yield put(TreeActions.deselectNodes(nodesIds));
}

/**
 * SELECT NODES
 */
function* selectNodes({ nodesIds = [], skipExpand = false, skipChildren = false, colour }) {
	try {
		console.time('selectNodes');
		const lastNodeId = nodesIds[nodesIds.length - 1];
		const [lastNode] = yield select(selectGetNodesByIds([lastNodeId]));

		const [result] = yield all([
			call(TreeProcessing.selectNodes, { nodesIds, skipChildren }),
			call(handleMetadata, lastNode)
		]);

		const selectionMap = yield select(selectSelectionMap);
		yield call(highlightObjects, result.highlightedObjects, selectionMap, colour);

		if (!skipExpand) {
			yield call(expandToNode, lastNodeId);
		}

		yield put(TreeActions.setActiveNode(lastNodeId));
		yield put(TreeActions.updateDataRevision());
		console.timeEnd('selectNodes');
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'nodes', error));
	}
}

function* selectNodesBySharedIds({ objects = [], colour }: { objects: any[], colour?: number[]}) {
	const nodesIds = yield select(selectGetNodesIdsFromSharedIds(objects));
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
	const fullySelectedNodes = yield select(selectFullySelectedNodesIds);
	const hasSelectedNodes = !!fullySelectedNodes.length;
	const nodesIds = hasSelectedNodes ? fullySelectedNodes : [nodeId];
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

	yield put(TreeActions.setExpandedNodesMap(expandedNodesMap));
}

function* goToRootNode({ nodeId }) {
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
		yield call(delay, 100);
		Viewer.zoomToHighlightedMeshes();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('zoom', 'highlighted nodes', error));
	}
}

function* handleColorOverridesChange({ currentOverrides, previousOverrides }) {
	const toAdd = overridesDiff(currentOverrides, previousOverrides);
	const toRemove = overridesDiff(previousOverrides, currentOverrides);

	yield removeColorOverrides(toRemove);
	yield addColorOverrides(toAdd);
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
	yield takeLatest(TreeTypes.GO_TO_ROOT_NODE, goToRootNode);
	yield takeLatest(TreeTypes.ZOOM_TO_HIGHLIGHTED_NODES, zoomToHighlightedNodes);
	yield takeLatest(TreeTypes.HANDLE_COLOR_OVERRIDES_CHANGE, handleColorOverridesChange);
}
