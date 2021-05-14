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
import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { DialogActions } from '../dialog';
import { GroupsActions } from '../groups';
import { dispatch } from '../store';
import {
	selectActiveNode,
	selectDefaultHiddenNodesIds,
	selectExpandedNodesMap,
	selectFullySelectedNodesIds,
	selectGetNodesByIds,
	selectGetNodesIdsFromSharedIds,
	selectHiddenGeometryVisible,
	selectIsTreeProcessed,
	selectNodesIndexesMap,
	selectSelectionMap,
	selectSubModelsRootNodes,
	selectTreeNodesList,
	selectVisibilityMap
} from './tree.selectors';
import TreeProcessing from './treeProcessing/treeProcessing';

import { SELECTION_STATES, VISIBILITY_STATES } from '../../constants/tree';
import { VIEWER_PANELS } from '../../constants/viewerGui';

import {
	addTransparencyOverrides,
	overridesTransparencyDiff,
	removeTransparencyOverrides,
} from '../../helpers/colorOverrides';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { selectActiveMeta, selectIsActive, BimActions } from '../bim';
import { selectSettings, ModelTypes } from '../model';
import { selectIsMetadataVisible, ViewerGuiActions } from '../viewerGui';
import { TreeActions, TreeTypes } from './tree.redux';

const unhighlightObjects = (objects = []) => {
	for (let index = 0, size = objects.length; index < size; index++) {
		const { meshes, teamspace, modelId } = objects[index];

		Viewer.unhighlightObjects(teamspace, modelId, meshes);
	}
};

const highlightObjects = (objects = [], nodesSelectionMap = {}, colour?) => {
	const promises = [];

	for (let index = 0, size = objects.length; index < size; index++) {
		const { meshes, teamspace, modelId } = objects[index];
		const filteredMeshes = meshes.filter((mesh) => nodesSelectionMap[mesh] === SELECTION_STATES.SELECTED);
		if (filteredMeshes.length) {
			promises.push(Viewer.highlightObjects(teamspace, modelId, colour, true, true, filteredMeshes));
		}
	}
	return Promise.all(promises);
};

const toggleMeshesVisibility = (meshes, visibility) => {
	if (meshes && meshes.length > 0) {
		meshes.forEach((entry) => {
			if (entry.meshes && entry.meshes.length) {
				Viewer.switchObjectVisibility(
					entry.teamspace,
					entry.modelId,
					entry.meshes,
					visibility
				);
			}
		});
	}
};

function* handleMetadata(node: any) {
	const isMetadataActive = yield select(selectIsActive);
	if (node && node.meta && isMetadataActive) {
		yield put(BimActions.fetchMetadata(node.teamspace, node.model, node.meta[0]));
		yield put(ViewerGuiActions.setPanelVisibility(VIEWER_PANELS.BIM, true));
	}
}

export function* waitForTreeToBeReady() {
	const isReady = yield select(selectIsTreeProcessed);

	if (!isReady) {
		yield take(TreeTypes.SET_IS_TREE_PROCESSED);
	}
}

function* expandToNode(node: any) {
	yield waitForTreeToBeReady();

	if (node) {
		const expandedNodesMap = yield select(selectExpandedNodesMap);
		if (expandedNodesMap[node.parentId]) {
			// already expanded
			return;
		}

		const parents = TreeProcessing.getParentsID(node);
		for (let index = parents.length - 1; index >= 0; --index) {
			if (expandedNodesMap[parents[index]]) {
				break;
			}
			expandedNodesMap[parents[index]] = true;
		}
		yield put(TreeActions.setExpandedNodesMap(expandedNodesMap));
		yield put(TreeActions.updateDataRevision());
	}
}

function* getAllTrees(teamspace, modelId, revision) {
	yield put(TreeActions.resetComponentState());
	const fullTree = yield API.getFullTree(teamspace, modelId, revision);

	const proms = [];
	for (let i = 0; i < fullTree.data.subTrees.length; ++i) {
		proms.push(
			API.default.get(fullTree.data.subTrees[i].url)
				.then(({data}) => data.mainTree)
				.catch(() => {})
		);
	}

	const subTrees = yield all(proms);
	return { fullTree: fullTree.data, subTrees: subTrees.filter((data) => !!data)};
}

const setIsTreeProcessed = (isProcessed) => {
	dispatch(TreeActions.setIsTreeProcessed(isProcessed));
};

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

		modelsWithMeshes.mainTree.account = teamspace;
		modelsWithMeshes.mainTree.model = modelId;

		const meshMap = modelsWithMeshes.subModels.length ? modelsWithMeshes.subModels :
			[ modelsWithMeshes.mainTree];

		const dataToProcessed = {
			mainTree: fullTree.mainTree.nodes,
			subTrees,
			subModels: [],
			meshMap,
			treePath: {}
		};

		dataToProcessed.mainTree.name = modelSettings.name;
		dataToProcessed.mainTree.isFederation = modelSettings.federate;
		dataToProcessed.subModels = modelSettings.subModels;
		dataToProcessed.treePath = treePath;

		yield TreeProcessing.transformData(dataToProcessed, setIsTreeProcessed);
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
	yield waitForTreeToBeReady();

	if (MultiSelect.isAccumMode()) {
		return;
	}

	yield all([
		clearCurrentlySelected(),
		put(GroupsActions.clearSelectionHighlights(false))
	]);

	const activeNode = yield select(selectActiveNode);

	if (activeNode) {
		yield put(TreeActions.setActiveNode(null));
		yield put(TreeActions.updateDataRevision());
	}

}

function* handleNodesClick({ nodesIds = [], skipExpand = false}) {
	yield waitForTreeToBeReady();

	const addGroup = MultiSelect.isAccumMode();
	const removeGroup = MultiSelect.isDecumMode();
	const isMultiSelectMode = addGroup || removeGroup;

	if (!isMultiSelectMode) {
		yield put(TreeActions.clearCurrentlySelected(false));
		yield take(TreeTypes.UPDATE_DATA_REVISION);
	}
	if (removeGroup) {
		yield put(TreeActions.deselectNodes(nodesIds));
	} else {
		yield put(TreeActions.selectNodes(nodesIds, skipExpand));
	}
}

function* handleNodesClickBySharedIds({ objects = [] }) {
	yield waitForTreeToBeReady();

	const nodes = yield select(selectGetNodesIdsFromSharedIds(objects));
	yield put(TreeActions.handleNodesClick(nodes));
}

function* getSelectedNodes() {
	yield waitForTreeToBeReady();

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

function* clearCurrentlySelected(keepMetadataOpen = false) {
	yield waitForTreeToBeReady();

	Viewer.clearHighlights();

	yield TreeProcessing.clearSelected();
	yield put(TreeActions.updateDataRevision());

	const isBimVisible = yield select(selectIsMetadataVisible);
	const activeMeta = yield select(selectActiveMeta);
	const activeNode = yield select(selectActiveNode);

	if (!keepMetadataOpen) {
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

	yield put(TreeActions.getSelectedNodes());
}

/**
 * SHOW NODES
 */
function* showAllNodes() {
	yield waitForTreeToBeReady();
	try {
		yield showAllExceptMeshIDs();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'all nodes', error));
	}
}

function* showAllExceptMeshIDs(meshes = []) {
	yield waitForTreeToBeReady();

	try {
		const hiddenGeometryVisible = yield select(selectHiddenGeometryVisible);
		const {meshesToShow, meshesToHide } = yield TreeProcessing.showAllExceptMeshIDs(!hiddenGeometryVisible, meshes);
		toggleMeshesVisibility(meshesToShow, true);
		toggleMeshesVisibility(meshesToHide, false);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'all except nodes', error));
	}
}

function* showNodesBySharedIds({ objects = [] }) {
	yield waitForTreeToBeReady();

	const nodesIds = yield select(selectGetNodesIdsFromSharedIds(objects));
	yield showTreeNodes(nodesIds);
}

function* showTreeNodes(nodesIds = [], skipNested = false) {
	yield waitForTreeToBeReady();

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
	yield waitForTreeToBeReady();

	const fullySelectedNodes = yield select(selectFullySelectedNodesIds);
	yield hideTreeNodes(fullySelectedNodes);
}

function* hideNodesBySharedIds({ objects = [], resetTree = false }) {
	yield waitForTreeToBeReady();

	const nodesIds: any[] = yield select(selectGetNodesIdsFromSharedIds(objects));

	if (resetTree) {
		yield showAllExceptMeshIDs(nodesIds);
	} else {
		yield hideTreeNodes(nodesIds, true);
	}
}

function* hideTreeNodes(nodesIds = [], skipNested = false) {
	yield waitForTreeToBeReady();

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
	yield waitForTreeToBeReady();

	try {
		if (nodesIds.length) {
			const hiddenGeometryVisible = yield select(selectHiddenGeometryVisible);
			const result = yield TreeProcessing.isolateNodes({ nodesIds, ifcSpacesHidden: !hiddenGeometryVisible });

			if (result.unhighlightedObjects && result.unhighlightedObjects.length) {
				unhighlightObjects(result.unhighlightedObjects);
			}

			toggleMeshesVisibility(result.meshesToHide, false);
			toggleMeshesVisibility(result.meshesToShow, true);

			yield put(TreeActions.updateDataRevision());
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('isolate', 'selected nodes', error));
	}
}

function* isolateSelectedNodes({ nodeId }) {
	yield waitForTreeToBeReady();

	if (nodeId) {
		yield isolateNodes([nodeId]);
		const meshes = yield TreeProcessing.getMeshesByNodeIds([nodeId]);
		Viewer.zoomToObjects({entries: meshes});
	} else {
		const fullySelectedNodes = yield select(selectFullySelectedNodesIds);
		yield isolateNodes(fullySelectedNodes);
	}
}

function* isolateNodesBySharedIds({ objects = []}) {
	yield waitForTreeToBeReady();

	const nodesIds = yield select(selectGetNodesIdsFromSharedIds(objects));
	yield isolateNodes(nodesIds);
}

function* showHiddenGeometry() {
	yield waitForTreeToBeReady();
	try {
		const hiddenGeometryVisible = yield select(selectHiddenGeometryVisible);
		yield put(TreeActions.setHiddenGeometryVisible(!hiddenGeometryVisible));

		const geometryNodesIds = yield select(selectDefaultHiddenNodesIds);
		const visibility = !hiddenGeometryVisible ? VISIBILITY_STATES.VISIBLE : VISIBILITY_STATES.INVISIBLE;
		yield put(TreeActions.setTreeNodesVisibility(geometryNodesIds, visibility, true));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'hidden geometry', error));
	}
}

/**
 * DESELECT NODES
 */
function* deselectNodes({ nodesIds = [] }) {
	yield waitForTreeToBeReady();

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
		yield put(TreeActions.getSelectedNodes());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('deselect', 'node', error));
	}
}

function* deselectNodesBySharedIds({ objects = [] }) {
	yield waitForTreeToBeReady();

	const nodesIds = yield select(selectGetNodesIdsFromSharedIds(objects));
	yield put(TreeActions.deselectNodes(nodesIds));
}

/**
 * SELECT NODES
 */
function* selectNodes({ nodesIds = [], skipExpand = false, skipSelecting = false, colour }) {
	try {
		yield waitForTreeToBeReady();

		const isTreeProcessed = yield select(selectIsTreeProcessed);

		if (!isTreeProcessed) {
			return;
		}

		if (!skipSelecting) {
			let lastNodeId = nodesIds[nodesIds.length - 1];
			let [lastNode] = yield select(selectGetNodesByIds([lastNodeId]));

			if (lastNode && lastNode.type === 'mesh' && !lastNode.name) {
				lastNodeId = lastNode.parentId;
				[lastNode] = yield select(selectGetNodesByIds([lastNodeId]));
			}

			const [result] = yield all([
				call(TreeProcessing.selectNodes, { nodesIds }),
				call(handleMetadata, lastNode)
			]);

			if (!skipExpand) {
				yield call(expandToNode, lastNode);
			}

			const selectionMap = yield select(selectSelectionMap);
			highlightObjects(result.highlightedObjects, selectionMap, colour);

			yield put(TreeActions.setActiveNode(lastNodeId));
		} else {
			const [result] = yield all([
				call(TreeProcessing.selectNodes, { nodesIds }),
			]);

			const selectionMap = yield select(selectSelectionMap);
			highlightObjects(result.highlightedObjects, selectionMap, colour);
		}

		yield put(TreeActions.updateDataRevision());
		yield put(TreeActions.getSelectedNodes());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'nodes', error));
	}
}

function* selectNodesBySharedIds({ objects = [], colour }: { objects: any[], colour?: number[]}) {
	yield waitForTreeToBeReady();

	const nodesIds = yield select(selectGetNodesIdsFromSharedIds(objects));
	yield put(TreeActions.selectNodes(nodesIds, false, true, true, colour));
}

function* setSubmodelsVisibility({ models, visibility}) {
	try {
		yield waitForTreeToBeReady();

		const submodelsRootNodes = yield select(selectSubModelsRootNodes);
		const rootNodes =  models.map(({teamspace, _id }) => submodelsRootNodes[teamspace + ':' + _id]);

		if (rootNodes.length) {
			yield put(TreeActions.setTreeNodesVisibility(rootNodes, visibility));
		}

	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'tree node visibility', error));
	}
}

/**
 * SET VISIBILITY
 */
function* setTreeNodesVisibility({ nodesIds, visibility }) {
	try {
		yield waitForTreeToBeReady();

		if (nodesIds.length) {
			const hiddenGeometryVisible = yield select(selectHiddenGeometryVisible);

			const result = yield TreeProcessing.updateVisibility({
				nodesIds,
				visibility,
				ifcSpacesHidden: !hiddenGeometryVisible,
			});

			if (result.unhighlightedObjects && result.unhighlightedObjects.length) {
				unhighlightObjects(result.unhighlightedObjects);
			}

			toggleMeshesVisibility(result.meshesToShow, true);
			toggleMeshesVisibility(result.meshesToHide, false);
			yield put(TreeActions.updateDataRevision());
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'tree node visibility', error));
	}
}

function* setSelectedNodesVisibility({ nodeId, visibility }) {
	yield waitForTreeToBeReady();

	const fullySelectedNodes = yield select(selectFullySelectedNodesIds);
	const hasSelectedNodes = !!fullySelectedNodes.length;
	const nodesIds = hasSelectedNodes ? fullySelectedNodes : [nodeId];
	yield put(TreeActions.setTreeNodesVisibility(nodesIds, visibility, hasSelectedNodes));
}

function* collapseNodes({ nodesIds }) {
	yield waitForTreeToBeReady();

	const expandedNodesMap = {... (yield select(selectExpandedNodesMap))};
	const nodesIndexesMap = yield select(selectNodesIndexesMap);
	const nodesList = yield select(selectTreeNodesList);

	for (let index = 0; index < nodesIds.length; index++) {
		const nodeId = nodesIds[index];
		const nodeIndex = nodesIndexesMap[nodeId];
		const node = nodesList[nodeIndex];

		if (node.deepChildrenNumber) {
			let i = nodeIndex;
			while (i < nodeIndex + node.deepChildrenNumber + 1) {
				const currentNode = nodesList[i];
				if (expandedNodesMap[currentNode._id]) {
					expandedNodesMap[currentNode._id] = false;
				} else {
					// This node is already collapsed, skip its children.
					i += currentNode.deepChildrenNumber;
				}
				++i;
			}
		} else {
			expandedNodesMap[nodeId] = false;
		}
	}

	yield put(TreeActions.setExpandedNodesMap(expandedNodesMap));
}

function* goToRootNode({ nodeId }) {
	yield waitForTreeToBeReady();

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
	yield waitForTreeToBeReady();

	try {
		yield call(delay, 100);
		Viewer.zoomToHighlightedMeshes();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('zoom', 'highlighted nodes', error));
	}
}

function* handleTransparencyOverridesChange({ currentOverrides, previousOverrides }) {
	const toAdd = overridesTransparencyDiff(currentOverrides, previousOverrides);
	const toRemove = overridesTransparencyDiff(previousOverrides, currentOverrides);

	yield waitForTreeToBeReady();
	yield all([
		removeTransparencyOverrides(toRemove),
		addTransparencyOverrides(toAdd)
	]);
}

function* handleTransparenciesVisibility({ transparencies }) {
	// 1. get node ids for the hidden nodes
	// tslint:disable-next-line:variable-name
	const meshesToHide: any[] = yield select(selectGetNodesIdsFromSharedIds(([{shared_ids: transparencies}])));

	// This function is used by sequences, it will always want to show all hidden geometry.
	yield put(TreeActions.setHiddenGeometryVisible(true));
	yield showAllExceptMeshIDs(meshesToHide);
}

export default function* TreeSaga() {
	yield takeLatest(TreeTypes.FETCH_FULL_TREE, fetchFullTree);
	yield takeLatest(TreeTypes.START_LISTEN_ON_SELECTIONS, startListenOnSelections);
	yield takeLatest(TreeTypes.STOP_LISTEN_ON_SELECTIONS, stopListenOnSelections);
	yield takeLatest(TreeTypes.GET_SELECTED_NODES, getSelectedNodes);
	yield takeLatest(TreeTypes.SHOW_ALL_NODES, showAllNodes);
	yield takeLatest(TreeTypes.HIDE_SELECTED_NODES, hideSelectedNodes);
	yield takeLatest(TreeTypes.ISOLATE_SELECTED_NODES, isolateSelectedNodes);
	yield takeLatest(TreeTypes.SHOW_HIDDEN_GEOMETRY, showHiddenGeometry);
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
	yield takeLatest(TreeTypes.HANDLE_TRANSPARENCY_OVERRIDES_CHANGE, handleTransparencyOverridesChange);
	yield takeLatest(TreeTypes.SET_SUBMODELS_VISIBILITY, setSubmodelsVisibility);
	yield takeLatest(TreeTypes.HANDLE_TRANSPARENCIES_VISIBILITY, handleTransparenciesVisibility);
}
