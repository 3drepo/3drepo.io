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
const TreeLoaderWorker = require('worker-loader?inline!./workers/tree.worker');

import { put, takeLatest, call, select, take, all, spawn } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { pick, uniq, flatten, values } from 'lodash';

import TreeProcessing from './treeProcessing';
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
	selectExpandedNodesMap,
	getSelectNodesByIds,
	getSelectNodesIdsFromSharedIds,
	getSelectDeepChildren
} from './tree.selectors';

import { TreeTypes, TreeActions } from './tree.redux';
import { selectSettings, ModelTypes } from '../model';
import { MultiSelect } from '../../services/viewer/multiSelect';
import { VISIBILITY_STATES, SELECTION_STATES } from '../../constants/tree';
import { selectActiveMeta, BimActions, selectIsActive } from '../bim';
import { ViewerActions } from '../viewer';

const TreeProcessor = new TreeProcessing();

const bindToWorker = (worker, onResponse = Function.prototype, onError = Function.prototype) => {
	worker.addEventListener('message', (e) => {
		const data = JSON.parse(e.data);
		onResponse(data.result);
	}, false);

	worker.addEventListener('messageerror', (e) => {
		// tslint:disable-next-line
		console.error('Worker error', e);
		onError(e);
	}, false);

	return worker;
};

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

		const worker = bindToWorker(new TreeLoaderWorker(), (result) => {
			const { nodesList, ...auxiliaryMaps } = result.data;
			dispatch(TreeActions.setAuxiliaryMaps(auxiliaryMaps));
			dispatch(TreeActions.setTreeNodesList(nodesList));
			worker.terminate();
			TreeProcessor.callAction('SET_DATA', {
				nodesList,
				nodesIndexesMap: auxiliaryMaps.nodesIndexesMap,
				defaultVisibilityMap: auxiliaryMaps.nodesDefaultVisibilityMap,
				meshesByModelId: auxiliaryMaps.meshesByModelId
			});
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
	const nodes = yield select(getSelectNodesByIds(nodesIds));
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
	const nodesIds = yield select(getSelectNodesIdsFromSharedIds(objects));
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
	const nodesIds = yield select(getSelectNodesIdsFromSharedIds(objects));
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
	yield put(TreeActions.selectNodes([id]));
	yield take(TreeTypes.SELECT_NODES_SUCCESS);
	yield put(TreeActions.isolateSelectedNodes());
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
		const { nodesSelectionMap, unhighlightedObjects } = yield TreeProcessor.deselectNodes({
			nodesIds,
			selectedNodesIds
		});

		for (let index = 0; index < unhighlightedObjects.length; index++) {
			const { meshes, teamspace, modelId } = unhighlightedObjects[index];
			Viewer.unhighlightObjects({
				account: teamspace,
				model: modelId,
				ids: meshes
			});
		}

		yield put(TreeActions.updateNodesSelectionMap(nodesSelectionMap));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('deselect', 'node', error));
	}
}

function* selectNodes({ nodesIds = [], skipExpand = false, skipChildren = false, colour }) {
	try {
		const nodesVisibilityMap = yield select(selectNodesVisibilityMap);
		const nodes = yield select(getSelectNodesByIds(nodesIds));
		const lastNode = nodes[nodes.length - 1];
		yield handleMetadata(lastNode);

		if (!skipExpand) {
			yield expandToNode(lastNode._id);
		}

		const { nodesSelectionMap, highlightedObjects } = yield TreeProcessor.selectNodes({
			nodes,
			skipChildren,
			nodesVisibilityMap
		});

		for (let index = 0; index < highlightedObjects.length; index++) {
			const { meshes, teamspace, modelId } = highlightedObjects[index];

			if (meshes.length) {
				const filterdMeshes = meshes.filter((mesh) => nodesSelectionMap[mesh] === SELECTION_STATES.SELECTED);
				if (meshes.length > 0) {
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
		}

		yield put(TreeActions.updateNodesSelectionMap(nodesSelectionMap));
		yield put(TreeActions.selectNodesSuccess());
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'nodes', error));
	}
}

function* selectNodesBySharedIds({ objects = [], colour }: { objects: any[], colour?: number[]}) {
	const nodesIds = yield select(getSelectNodesIdsFromSharedIds(objects));
	yield put(TreeActions.selectNodes(nodesIds, false, true, colour));
}

function* deselectNodesBySharedIds({ objects = [] }) {
	const nodesIds = yield select(getSelectNodesIdsFromSharedIds(objects));
	yield put(TreeActions.deselectNodes(nodesIds));
}

function* setTreeNodesVisibility({ nodesIds, visibility, skipChildren = false, skipParents = false }) {
	try {
		const nodesVisibilityMap = {...(yield select(selectNodesVisibilityMap))};
		const nodesSelectionMap = yield select(selectNodesSelectionMap);
		const ifcSpacesHidden = yield select(selectIfcSpacesHidden);

		console.time('Worker setTreeNodesVisibility');
		const result = yield TreeProcessor.updateVisibility({
			nodesIds,
			visibility,
			ifcSpacesHidden,
			nodesVisibilityMap,
			nodesSelectionMap,
			skipChildren,
			skipParents
		});
		console.timeEnd('Worker setTreeNodesVisibility');

		for (let j = 0; j < result.unhighlightedObjects.length; j++) {
			const { meshes, teamspace, modelId } = result.unhighlightedObjects[j];
			Viewer.unhighlightObjects({
				account: teamspace,
				model: modelId,
				ids: meshes
			});
		}

		yield put(TreeActions.setAuxiliaryMaps({
			nodesVisibilityMap: result.nodesVisibilityMap,
			nodesSelectionMap: result.nodesSelectionMap
		}));

		yield put(TreeActions.updateMeshesVisibility(result.meshesToUpdate));
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
