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
import { pick, uniq, flatten, values, cloneDeep, pickBy } from 'lodash';

import * as API from '../../services/api';
import { Viewer } from '../../services/viewer/viewer';
import { VIEWER_EVENTS } from '../../constants/viewer';
import { dispatch, getAngularService } from '../../helpers/migration';
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
	selectNodesBySharedIdsMap,
	selectTreeNodesIds,
	selectSelectedNodesIds,
	selectUnselectedNodesIds,
	selectMeshesByModelId
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

function* getNodesByIds(nodesIds) {
	const treeNodesList = yield select(selectTreeNodesList);
	const nodesIndexesMap = yield select(selectNodesIndexesMap);
	return nodesIds.map((nodeId) => treeNodesList[nodesIndexesMap[nodeId]]);
}

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

function* getMeshesByNodes(nodes = []) {
	if (!nodes.length) {
		return [];
	}

	const treeNodesList = yield select(selectTreeNodesList);
	const nodesIndexesMap = yield select(selectNodesIndexesMap);
	const idToMeshes = yield select(selectMeshesByModelId);
	const meshesByNodes = {};

	const stack = nodes;
	while (stack.length > 0) {
		const node = stack.pop();

		if (!meshesByNodes[node.namespacedId]) {
			meshesByNodes[node.namespacedId] = {
				modelId: node.model,
				teamspace: node.teamspace,
				meshes: []
			};
		}

		// Check top level and then check if sub model of fed
		let meshes = node.type === NODE_TYPES.MESH
			? [node._id]
			: idToMeshes[node._id];

		if (!meshes && idToMeshes[node.namespacedId]) {
			meshes = idToMeshes[node.namespacedId][node._id];
		}

		if (meshes) {
			meshesByNodes[node.namespacedId].meshes.push(...meshes);
		} else if (node.hasChildren) {
			// This should only happen in federations.
			// Traverse down the tree to find submodel nodes
			const nodeIndex = nodesIndexesMap[node._id];
			for (let childIndex = nodeIndex; childIndex <= nodeIndex + node.childrenNumber; childIndex++) {
				stack.push(treeNodesList[childIndex]);
			}
		}
	}

	return Object.values(meshesByNodes);
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
		// console.log('TODO should deselect nodes');
		TreeService.deselectNodes(nodes);
	} else {
		yield put(TreeActions.selectNodes(nodesIds, skipExpand));
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

function* showAllNodes({ shouldUpdateModel = false }) {
	try {
		const nodesIds = yield select(selectTreeNodesIds);
		yield showTreeNodes(nodesIds, shouldUpdateModel);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'all nodes'));
	}
}

function* showNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield getNodesIdsFromSharedIds(objects);
	yield showTreeNodes(nodesIds);
}

function* showTreeNodes(nodesIds = [], shouldUpdateModel = true) {
	try {
		if (nodesIds.length) {
			yield put(TreeActions.setTreeNodesVisibility(nodesIds, VISIBILITY_STATES.VISIBLE));

			if (shouldUpdateModel) {
				// TODO
				const TreeService = getAngularService('TreeService') as any;
				TreeService.updateModelVisibility();
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'nodes'));
	}
}

function* hideSelectedNodes() {
	const selectedNodesIds = yield select(selectSelectedNodesIds);
	yield hideTreeNodes(selectedNodesIds);
}

function* hideNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield getNodesIdsFromSharedIds(objects);
	yield hideTreeNodes(nodesIds);
}

function* hideTreeNodes(nodesIds = []) {
	try {
		if (nodesIds.length) {
			// TODO: pass proper nodesIds
			yield put(TreeActions.setTreeNodesVisibility(nodesIds, VISIBILITY_STATES.INVISIBLE));

			// TODO
			const TreeService = getAngularService('TreeService') as any;
			TreeService.updateModelVisibility();
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('hide', 'nodes'));
	}
}

function* isolateSelectedNodes() {
	try {
		const selectedNodesIds = yield select(selectSelectedNodesIds);
		const unselectedNodesIds = yield select(selectUnselectedNodesIds);

		yield hideTreeNodes(unselectedNodesIds);
		yield showTreeNodes(selectedNodesIds);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('isolate', 'selected nodes'));
	}
}

function* isolateNodesBySharedIds({ objects = []}) {
	yield put(TreeActions.selectNodesBySharedIds(objects));
	yield put(TreeActions.isolateSelected());
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

function* selectNodes({ nodesIds = [], skipExpand = false, colour }) {
	console.time('SELECT NODES');
	try {
		const nodes = yield getNodesByIds(nodesIds);
		if (nodes.length === 0) {
			return Promise.resolve('No nodes specified');
		}

		const TreeService = getAngularService('TreeService') as any;

		for (let i = 0; i < nodes.length; i++) {
			// TODO
			TreeService.setNodeSelection(nodes[i], TreeService.SELECTION_STATES.selected);
		}

		const lastNode = nodes[nodes.length - 1];
		yield handleMetadata(lastNode);

		if (!skipExpand) {
			// TODO
			TreeService.expandToNode(lastNode);
		}
		// TODO
		const meshesByNodes = yield getMeshesByNodes(nodes);
		const nodesSelectionMap = select(selectNodesSelectionMap);

		for (let index = 0; index < meshesByNodes.length; index++) {
			const { meshes, teamspace, modelId } = meshesByNodes[index];
			// TODO: Uncomment when setNodeSelection will be migrated

			// const filterdMeshes = meshes.filter((mesh) => {
			// 	return nodesSelectionMap[mesh] === SELECTION_STATES.SELECTED;
			// });
			if (meshes.length > 0) {
				// Separately highlight the children
				// but only for multipart meshes
				Viewer.highlightObjects({
					account: teamspace,
					ids: meshes, // filterdMeshes,
					colour,
					model: modelId,
					multi: true,
					source: 'tree',
					forceReHighlight: true
				});
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'nodes'));
	}
	console.timeEnd('SELECT NODES');
}

function* selectNodesBySharedIds({ objects = [], colour }: { objects: any[], colour?: number[]}) {
	const nodesIds = yield getNodesIdsFromSharedIds(objects);
	yield put(TreeActions.selectNodes(nodesIds, false, colour));
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
			// console.log('TODO should deselect nodes');
		}

		const newVisibilityMap = cloneDeep(nodesVisibilityMap);
		const newNumberOfInvisibleChildrenMap = cloneDeep(numberOfInvisibleChildrenMap);

		for (let nodeLoopIndex = 0; nodeLoopIndex < nodes.length ; nodeLoopIndex++) {

			const nodeId = nodes[nodeLoopIndex];
			const nodeIndex = nodesIndexesMap[nodeId];
			const node = treeNodesList[nodeIndex];
			const meshesToUpdate = [];

			if (node && (visibility === VISIBILITY_STATES.PARENT_OF_VISIBLE || visibility !== nodesVisibilityMap[nodeId])) {

				if (node.type === NODE_TYPES.MESH) {
					meshesToUpdate.push(node);
				}

				if (node.hasChildren) {
					for (let childIndex = nodeIndex; childIndex <= nodeIndex + node.childrenNumber; childIndex++) {
						const child = treeNodesList[childIndex];

						if (child.data.type === NODE_TYPES.MESH && nodesVisibilityMap[child._id] !== visibility) {
							meshesToUpdate.push(child);
						}

						if (visibility === VISIBILITY_STATES.VISIBLE) {

							newVisibilityMap[child._id] = VISIBILITY_STATES.VISIBLE;
						} else {
							// TODO
							// TreeService.setNodeSelection(child, this.SELECTION_STATES.unselected);
							newVisibilityMap[child._id] = VISIBILITY_STATES.INVISIBLE;
						}
					}

					if (visibility === VISIBILITY_STATES.INVISIBLE) {
						newNumberOfInvisibleChildrenMap[node._id] = node.childrenNumber;
					} else {
						newNumberOfInvisibleChildrenMap[node._id] = 0;
					}
				} else {
					if (visibility === VISIBILITY_STATES.VISIBLE) {
						newVisibilityMap[node._id] = VISIBILITY_STATES.VISIBLE;
					} else {
						// TODO
						// TreeService.setNodeSelection(child, this.SELECTION_STATES.unselected);
						newVisibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
					}
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
					} else {
						// newVisibilityMap[currentNode._id] = VISIBILITY_STATES.VISIBLE;
					}

					// if == 0 to set parent as INVISIBLE
					parents.push(currentNode);
				}

				yield put(TreeActions.setAuxiliaryMaps({
					nodesVisibilityMap: newVisibilityMap
				}));

				yield put(TreeActions.setComponentState({
					numberOfInvisibleChildrenMap: newNumberOfInvisibleChildrenMap
				}));

				yield put(TreeActions.updateMeshesVisibility(meshesToUpdate));
			}
		}

	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'tree node visibility'));
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
		yield put(DialogActions.showErrorDialog('update', 'meshes visibility'));
	}
}

function* handleMeshesVisibility({ meshes, visibility }) {
	try {
		console.log('handleMeshesVisibility');

		const objectIds = {};
		const alreadyProcessed = {};

		for (let index = 0; index < meshes.length; index++) {
			const node = meshes[index];
			const { namespacedId, _id, teamspace, model } = node;
			if (!objectIds[namespacedId]) {
				objectIds[namespacedId] = [];
			}

			objectIds[namespacedId].push(_id);
			console.log('switchObjectVisibility')

			if (!alreadyProcessed[namespacedId]) {
				yield Viewer.switchObjectVisibility(
					teamspace,
					model,
					objectIds[namespacedId],
					visibility
				);
				alreadyProcessed[namespacedId] = node;
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('handle', 'meshes visibility'));
	}
}

function* handleMetadata(node: any) {
	const isMetadataActive = select(selectIsActive);
	if (node && node.meta) {
		if (isMetadataActive) {
			yield put(BimActions.fetchMetadata(node.account, node.model || node.project, node.meta[0]));
			yield put(ViewerActions.setMetadataVisibility(true));
		}
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
	yield takeLatest(TreeTypes.ISOLATE_NODES_BY_SHARED_IDS, isolateNodesBySharedIds);
	yield takeLatest(TreeTypes.HIDE_NODES_BY_SHARED_IDS, hideNodesBySharedIds);
	yield takeLatest(TreeTypes.HANDLE_MESHES_VISIBILITY, handleMeshesVisibility);
}
