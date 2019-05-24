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
import { put, takeLatest, call, select, take, all, spawn } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { pick, uniq, flatten, values, intersection } from 'lodash';

import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { VIEWER_EVENTS } from '../../constants/viewer';
import { dispatch } from '../../helpers/migration';
import { GroupsActions } from '../groups';
import { DialogActions } from '../dialog';
import {
	selectIfcSpacesHidden,
	selectNodesIndexesMap,
	selectNodesVisibilityMap,
	selectNodesSelectionMap,
	selectTreeNodesList,
	selectNodesBySharedIdsMap,
	selectTreeNodesIds,
	selectSelectedNodesIds,
	selectUnselectedNodesIds,
	selectMeshesByModelId,
	selectExpandedNodesMap,
	selectNodesDefaultVisibilityMap,
	getSelectNodesByIds,
	getSelectChildren,
	getSelectDeepChildren,
	getSelectParents,
	getSelectMeshesByNodes
} from './tree.selectors';

import { TreeTypes, TreeActions } from './tree.redux';
import { selectSettings, ModelTypes } from '../model';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { VISIBILITY_STATES, NODE_TYPES, SELECTION_STATES } from '../../constants/tree';
import { selectActiveMeta, BimActions, selectIsActive } from '../bim';
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

function* getNodesIdsFromSharedIds(objects = []) {
	if (!objects.length) {
		return [];
	}
	const nodesBySharedIds = yield select(selectNodesBySharedIdsMap);

	const objectsSharedIds = objects.map(({ shared_ids }) => shared_ids);
	const sharedIds = flatten(objectsSharedIds) as string[];
	const nodesIdsBySharedIds = values(pick(nodesBySharedIds, sharedIds));
	return uniq(nodesIdsBySharedIds);
}

function* expandToNode(nodeId: string) {
	if (nodeId) {
		const treeNodesList = yield select(selectTreeNodesList);
		const nodesIndexesMap = yield select(selectNodesIndexesMap);
		const expandedNodesMap = {...(yield select(selectExpandedNodesMap))};

		let { parentId: nextParentId } = treeNodesList[nodesIndexesMap[nodeId]] || { parentId: null };
		expandedNodesMap[nodeId] = true;

		while (nextParentId) {
			const { parentId, _id } = treeNodesList[nodesIndexesMap[nextParentId]];
			expandedNodesMap[_id] = true;
			nextParentId = parentId;
		}

		yield put(TreeActions.setComponentState({ expandedNodesMap }));
	}
}

function* setNodesSelection(nodes = [], selection: any) {
	const nodesVisibilityMap = yield select(selectNodesVisibilityMap);
	const shouldSelect = selection === SELECTION_STATES.SELECTED;
	const newNodesSelectionMap = {};

	while (nodes.length > 0) {
		const node = nodes.pop();
		const currentVisibility = nodesVisibilityMap[node._id];

		if (currentVisibility !== VISIBILITY_STATES.INVISIBLE) {
			if (!shouldSelect || currentVisibility === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
				newNodesSelectionMap[node._id] = SELECTION_STATES.UNSELECTED;
			} else {
				newNodesSelectionMap[node._id] = SELECTION_STATES.SELECTED;
			}
		}
		/*
		// Set parent nodes selection
		let currentNode = {...initialNode};
		for (let i = currentNode.level - 1; i > 0; i--) {
			const parentNodeIndex = nodesIndexesMap[currentNode.parentId];
			const parentNode = treeNodesList[parentNodeIndex];

			let hasChildrenWithDifferentState = false;
			for (let childIndex = parentNodeIndex; childIndex <= parentNodeIndex + parentNode.deepChildrenNumber; childIndex++) {
				const childNode = treeNodesList[childIndex];
				const hasSameState = nodesSelectionMap[childNode._id] === selection;
				if (!hasSameState) {
					hasChildrenWithDifferentState = true;
					break;
				}
			}

			if (hasChildrenWithDifferentState) {
				newNodesSelectionMap[parentNode._id] = SELECTION_STATES.PARENT_OF_UNSELECTED;
			} else {
				newNodesSelectionMap[parentNode._id] = selection;
			}

			currentNode = parentNode;
		} */
	}

	yield put(TreeActions.updateNodesSelectionMap(newNodesSelectionMap));
}

function* clear() {
	yield all([
		put(ViewerActions.clearHighlights()),
		put(ViewerActions.setMetadataVisibility(false)),
		put(BimActions.setActiveMeta(null))
	]);
}

function* clearCurrentlySelected() {
	yield spawn(clear);

	const selectedNodesIds = yield select(selectSelectedNodesIds);
	const newNodesSelectionMap = {};

	for (let index = 0; index < selectedNodesIds.length; index++) {
		const nodeId = selectedNodesIds[index];
		newNodesSelectionMap[nodeId] = SELECTION_STATES.UNSELECTED;
	}

	yield put(TreeActions.updateNodesSelectionMap(newNodesSelectionMap));
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
		dispatch(TreeActions.handleNodesClickBySharedIds(object.selectedNodes, false, true));
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
	const selectedNodesIds = yield select(selectSelectedNodesIds);
	if (selectedNodesIds.length) {
		yield all([
			clearCurrentlySelected(),
			put(GroupsActions.clearSelectionHighlights())
		]);
	}
	return false;
}

function* handleNodesClick({ nodesIds = [], skipExpand = false, skipChildren = false }) {
	const nodes = yield select(getSelectNodesByIds(nodesIds));
	const addGroup = MultiSelect.isAccumMode();
	const removeGroup = MultiSelect.isDecumMode();
	const isMultiSelectMode = addGroup || removeGroup;

	if (!isMultiSelectMode) {
		yield clearCurrentlySelected();
	}

	if (removeGroup) {
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

	yield TreeActions.getSelectedNodes();
}

function* handleNodesClickBySharedIds({ nodesIds }) {
	const nodes = yield getNodesIdsFromSharedIds(nodesIds);
	yield put(TreeActions.handleNodesClick(nodes));
}

function* getSelectedNodes() {
	try {
		// TODO: We need to remove this delay and check if calling of viewer method is necessary
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
		const nodesIds = yield select(selectTreeNodesIds);
		yield showTreeNodes(nodesIds, true);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'all nodes', error));
	}
}

function* showNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield getNodesIdsFromSharedIds(objects);
	yield showTreeNodes(nodesIds);
}

function* showTreeNodes(nodesIds = [], skipNested = false) {
	try {
		yield put(
			TreeActions.setTreeNodesVisibility(nodesIds, VISIBILITY_STATES.VISIBLE, skipNested, skipNested)
		);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'nodes', error));
	}
}

function* hideSelectedNodes() {
	const selectedNodesIds = yield select(selectSelectedNodesIds);
	yield hideTreeNodes(selectedNodesIds);
}

function* hideNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield getNodesIdsFromSharedIds(objects);
	yield hideTreeNodes(nodesIds, true);
}

function* hideTreeNodes(nodesIds = [], skipNested = false) {
	try {
		yield put(TreeActions.setTreeNodesVisibility(nodesIds, VISIBILITY_STATES.INVISIBLE, skipNested, skipNested));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('hide', 'nodes', error));
	}
}

function* isolateSelectedNodes() {
	try {
		const selectedNodesIds = yield select(selectSelectedNodesIds);
		const unselectedNodesIds = yield select(selectUnselectedNodesIds);

		yield hideTreeNodes(unselectedNodesIds, true);
		yield take(TreeTypes.SET_TREE_NODES_VISIBILITY_SUCCESS);
		yield showTreeNodes(selectedNodesIds, true);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('isolate', 'selected nodes', error));
	}
}

function* isolateNodesBySharedIds({ objects = []}) {
	yield put(TreeActions.selectNodesBySharedIds(objects));
	yield take(TreeTypes.SELECT_NODES_SUCCESS);
	yield put(TreeActions.isolateSelectedNodes());
}

function* isolateNode({ id }) {
	const [node] = yield select(getSelectNodesByIds([id]));
	yield put(TreeActions.isolateNodesBySharedIds(node.shared_ids));
}

function* hideIfcSpaces() {
	try {
		const ifcSpacesHidden = yield select(selectIfcSpacesHidden);
		yield put(TreeActions.setIfcSpacesHidden(!ifcSpacesHidden));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('hide', 'IFC spaces', error));
	}
}

function* selectNode({ id }) {
	try {
		yield put(TreeActions.handleNodesClick([id], true));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'node', error));
	}
}

function* deselectNodes({ nodesIds = [] }) {
	try {
		const selectedNodesIds = yield select(selectSelectedNodesIds);
		const filteredNodesIds = intersection(nodesIds, selectedNodesIds);
		const nodes = yield select(getSelectNodesByIds(filteredNodesIds));
		yield setNodesSelection(nodes, SELECTION_STATES.UNSELECTED);
		const meshesByNodes = yield select(getSelectMeshesByNodes(nodes));
		for (let index = 0; index < meshesByNodes.length; index++) {
			const { meshes, teamspace, modelId } = meshesByNodes[index];
			Viewer.unhighlightObjects({
				account: teamspace,
				model: modelId,
				ids: meshes
			});
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('deselect', 'node', error));
	}
}

function* selectNodes({ nodesIds = [], skipExpand = false, skipChildren = false, colour }) {
	try {
		let nodes = yield select(getSelectNodesByIds(nodesIds));

		if (nodes.length === 0) {
			return Promise.resolve('No nodes specified');
		}

		if (!skipChildren) {
			const children = yield all(nodes.map((node) => select(getSelectDeepChildren(node))));
			nodes = [...nodes, ...children.flat()];
		}

		yield setNodesSelection([...nodes], SELECTION_STATES.SELECTED);

		const lastNode = nodes[nodes.length - 1];
		yield handleMetadata(lastNode);

		if (!skipExpand) {
			yield expandToNode(lastNode._id);
		}

		const meshesByNodes = yield select(getSelectMeshesByNodes(nodes));
		const nodesSelectionMap = yield select(selectNodesSelectionMap);

		for (let index = 0; index < meshesByNodes.length; index++) {
			const { meshes, teamspace, modelId } = meshesByNodes[index];

			const filterdMeshes = meshes.filter((mesh) => {
				return nodesSelectionMap[mesh] === SELECTION_STATES.SELECTED;
			});

			if (meshes.length > 0) {
				// Separately highlight the children
				// but only for multipart meshes
				Viewer.highlightObjects({
					account: teamspace,
					ids: filterdMeshes,
					colour,
					model: modelId,
					multi: true,
					source: 'tree',
					forceReHighlight: true
				});
			}
		}
		yield put(TreeActions.selectNodesSuccess());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'nodes', error));
	}
}

function* selectNodesBySharedIds({ objects = [], colour }: { objects: any[], colour?: number[]}) {
	const nodesIds = yield getNodesIdsFromSharedIds(objects);
	yield put(TreeActions.selectNodes(nodesIds, false, true, colour));
}

function* deselectNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield getNodesIdsFromSharedIds(objects);
	yield put(TreeActions.deselectNodes(nodesIds));
}

function* updateParentVisibility(nodes = []) {
	const meshesByNodes = yield select(getSelectMeshesByNodes([...nodes]));
	const nodesVisibilityMap = { ...(yield select(selectNodesVisibilityMap)) };

	while (nodes.length > 0) {
		const index = nodes.length - 1;
		const node = nodes.pop();
		const priorVisibility = nodesVisibilityMap;

		if (node.hasChildren) {
			const children = yield select(getSelectChildren(node));
			const meshesData = meshesByNodes[index];

			let visibleChildCount = 0;
			let hasParentOfInvisibleChild = false;

			for (let i = 0; i < children.length; i++) {
				if (nodesVisibilityMap[children[i]._id] === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
					hasParentOfInvisibleChild = true;
					break;
				} else if (nodesVisibilityMap[children[i]._id] === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
					break;
				} else if (nodesVisibilityMap[children[i]._id] === VISIBILITY_STATES.VISIBLE) {
					visibleChildCount++;
				}
			}

			if (hasParentOfInvisibleChild) {
				nodesVisibilityMap[node._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
			} else if (children.length && children.length === visibleChildCount) {
				nodesVisibilityMap[node._id] = VISIBILITY_STATES.VISIBLE;
			} else if (!visibleChildCount) {
				yield setNodesSelection([node], SELECTION_STATES.UNSELECTED);
				const { meshes, teamspace, modelId } = meshesData;

				Viewer.unhighlightObjects({
					account: teamspace,
					model: modelId,
					ids: meshes
				});

				nodesVisibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
			} else {
				nodesVisibilityMap[node._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
			}
		}

		if (priorVisibility !== nodesVisibilityMap[node._id] && node.parentId) {
			const parents = yield select(getSelectParents(node));

			if (VISIBILITY_STATES.PARENT_OF_INVISIBLE === nodesVisibilityMap[node._id]) {
				for (let j = 0; j < parents.length; j++) {
					const parentNode = parents[j];
					nodesVisibilityMap[parentNode._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
				}
			} else {
				nodes.push(parents[0]);
			}
		}
	}

	for (let index = 0; index < nodes.length; index++) {
		const node = nodes[index];
		const children = yield select(getSelectChildren(node));
		const meshesData = meshesByNodes[index];

		let visibleChildCount = 0;
		let hasParentOfInvisibleChild = false;

		for (let i = 0; i < children.length; i++) {
			if (nodesVisibilityMap[children[i]._id] === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
				hasParentOfInvisibleChild = true;
				break;
			} else if (nodesVisibilityMap[children[i]._id] === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
				break;
			} else if (nodesVisibilityMap[children[i]._id] === VISIBILITY_STATES.VISIBLE) {
				visibleChildCount++;
			}
		}

		if (hasParentOfInvisibleChild) {
			nodesVisibilityMap[node._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
		} else if (children.length === visibleChildCount) {
			nodesVisibilityMap[node._id] = VISIBILITY_STATES.VISIBLE;
		} else if (!visibleChildCount) {
			yield setNodesSelection([node], SELECTION_STATES.UNSELECTED);

			for (let j = 0; j < meshesData.length; j++) {
				const { meshes, teamspace, modelId } = meshesData[j];
				Viewer.unhighlightObjects({
					account: teamspace,
					model: modelId,
					ids: meshes
				});
			}
			nodesVisibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
		} else {
			nodesVisibilityMap[node._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
		}
	}

	yield put(TreeActions.setAuxiliaryMaps({ nodesVisibilityMap }));
}

function* setTreeNodesVisibility({ nodesIds, visibility, skipChildren = false, skipParents = false }) {
	try {
		const defaultVisibilityMap = yield select(selectNodesDefaultVisibilityMap);
		const nodesVisibilityMap = {...(yield select(selectNodesVisibilityMap))};
		const nodesIndexesMap = yield select(selectNodesIndexesMap);
		const treeNodesList = yield select(selectTreeNodesList);
		const ifcSpacesHidden = yield select(selectIfcSpacesHidden);

		if (nodesIds.length && visibility === VISIBILITY_STATES.INVISIBLE) {
			yield put(TreeActions.deselectNodes(nodesIds));
		}

		const meshesToUpdate = [];
		const parents = [];
		console.log('start setTreeNodesVisibility');
		console.time('setTreeNodesVisibility for');
		for (let nodeLoopIndex = 0; nodeLoopIndex < nodesIds.length; nodeLoopIndex++) {
			const nodeId = nodesIds[nodeLoopIndex];
			const nodeIndex = nodesIndexesMap[nodeId];
			const node = {...treeNodesList[nodeIndex]};
			const nodeVisibility = nodesVisibilityMap[nodeId];

			if (visibility === VISIBILITY_STATES.PARENT_OF_INVISIBLE || visibility !== nodeVisibility) {
				if (node.type === NODE_TYPES.MESH) {
					meshesToUpdate.push(node);
				}

				const children = node.hasChildren && !skipChildren ? (yield select(getSelectDeepChildren(node))) : [node];
				const childrenToUnselect = [];

				for (let index = 0; index < children.length; index++) {
					const child = children[index];
					if (nodeVisibility !== visibility && child.type === NODE_TYPES.MESH) {
						meshesToUpdate.push(child);
					}

					if (visibility === VISIBILITY_STATES.VISIBLE) {
						if (!(ifcSpacesHidden && defaultVisibilityMap[child._id] === VISIBILITY_STATES.INVISIBLE)) {
							nodesVisibilityMap[child._id] = VISIBILITY_STATES.VISIBLE;
						}
					} else {
						childrenToUnselect.push(child);
						nodesVisibilityMap[child._id] = VISIBILITY_STATES.INVISIBLE;
					}
				}

				if (childrenToUnselect.length) {
					yield setNodesSelection(childrenToUnselect, SELECTION_STATES.UNSELECTED);
				}
				parents.push(node);
			}
		}
		console.timeEnd('setTreeNodesVisibility for');

		yield put(TreeActions.setAuxiliaryMaps({ nodesVisibilityMap }));
		if (!skipParents) {
			yield updateParentVisibility(parents);
		}
		yield put(TreeActions.updateMeshesVisibility(meshesToUpdate));
		yield put(TreeActions.setTreeNodesVisibilitySuccess());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'tree node visibility', error));
	}
}

function* updateMeshesVisibility({ meshes }) {
	try {
		const nodesVisibilityMap = yield select(selectNodesVisibilityMap);
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

		yield put(TreeActions.handleMeshesVisibility(hiddenMeshes, false));
		yield put(TreeActions.handleMeshesVisibility(shownMeshes, true));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('update', 'meshes visibility', error));
	}
}

function* handleMeshesVisibility({ meshes, visibility }) {
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

function* handleMetadata(node: any) {
	const isMetadataActive = yield select(selectIsActive);
	if (node && node.meta && isMetadataActive) {
		yield put(BimActions.fetchMetadata(node.teamspace, node.model, node.meta[0]));
		yield put(ViewerActions.setMetadataVisibility(true));
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
	yield takeLatest(TreeTypes.UPDATE_MESHES_VISIBILITY, updateMeshesVisibility);
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
	yield takeLatest(TreeTypes.HANDLE_MESHES_VISIBILITY, handleMeshesVisibility);
	yield takeLatest(TreeTypes.ISOLATE_NODE, isolateNode);
	yield takeLatest(TreeTypes.CLEAR_CURRENTLY_SELECTED, clearCurrentlySelected);
}
