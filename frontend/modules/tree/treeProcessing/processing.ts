import { intersection, keys, memoize, pickBy, uniqBy } from 'lodash';
import { NODE_TYPES, SELECTION_STATES, VISIBILITY_STATES } from '../../../constants/tree';
import { mergeArrays } from '../../../helpers/arrays';

export class Processing {
	public get fullySelectedNodesIds() {
		const res = [];
		let nodeIdx = 0;
		while (nodeIdx < this.nodesList.length) {
			const node = this.nodesList[nodeIdx];
			const nodeID = node._id;
			if (this.selectionMap[nodeID] === SELECTION_STATES.SELECTED) {
				res.push(nodeID);
				nodeIdx += node.deepChildrenNumber;
			} else if (this.selectionMap[nodeID] === SELECTION_STATES.UNSELECTED) {
				nodeIdx += node.deepChildrenNumber;
			}
			++nodeIdx;
		}
		return res;
	}

	public nodesList = [];
	public nodesIndexesMap = {};
	public defaultVisibilityMap = {};
	public meshesByNodeId = {};
	public nodesBySharedIdsMap = {};
	public selectionMap = {};
	public visibilityMap = {};
	public treePath = {} as any;
	public subModelsRootNodes = {};

	public getParentsByPath = memoize((node = {}) => {
		const parents = [];
		const subModel = this.treePath.subModels.find((s) => s.model === node.model);
		const idToPath = subModel ? subModel.idToPath : this.treePath.mainTree.idToPath;
		let path = idToPath[node._id];
		const parentsIds = path.split('__');
		const lastParentId = this.nodesList[this.nodesIndexesMap[parentsIds[0]]].parentId;
		const rootPath = this.treePath.mainTree.idToPath[lastParentId];
		path = rootPath ? `${rootPath}__${path}` : path;
		const parentsPath = path.split('__');

		for (let j = 0; j < parentsPath.length; j++) {
			const parentIndex = this.nodesIndexesMap[parentsPath[j]];
			if (this.nodesList[parentIndex].type !== 'mesh') {
				parents.push(this.nodesList[parentIndex]);
			}
		}

		return parents.reverse();
	}, (node = {}) => node._id);

	public getParentsID = memoize((node = {}) => {
		const subModel = this.treePath.subModels.find((s) => s.model === node.model);
		const idToPath = subModel ? subModel.idToPath : this.treePath.mainTree.idToPath;
		let parentsIds = idToPath[node._id].split('__');
		if (subModel) {
			const lastParentId = this.nodesList[this.nodesIndexesMap[parentsIds[0]]].parentId;
			const rootPath = this.treePath.mainTree.idToPath[lastParentId];
			parentsIds = [...rootPath.split('__'), ...parentsIds];
		}
		return parentsIds;
	}, (node = {}) => node._id);

	constructor(data) {
		const {
			nodesList, nodesIndexesMap, defaultVisibilityMap,
			meshesByNodeId, nodesBySharedIdsMap, visibilityMap, selectionMap,
			treePath, subModelsRootNodes
		} = data;
		this.nodesList = nodesList;
		this.nodesIndexesMap = nodesIndexesMap;
		this.defaultVisibilityMap = defaultVisibilityMap;
		this.meshesByNodeId = meshesByNodeId;
		this.visibilityMap = visibilityMap;
		this.selectionMap = selectionMap;
		this.nodesBySharedIdsMap = nodesBySharedIdsMap;
		this.treePath = treePath;
		this.subModelsRootNodes = subModelsRootNodes;
	}

	public clearCurrentlySelected = () => {
		let index = 0;
		while (index < this.nodesList.length) {
			const node = this.nodesList[index];
			const id = node._id;
			if (this.selectionMap[id] !== SELECTION_STATES.UNSELECTED) {
				this.selectionMap[id] = SELECTION_STATES.UNSELECTED;
			} else {
				index += node.deepChildrenNumber;
			}
			++index;
		}
	}

	public selectNodes = ({ nodesIds = [], ...extraData }) => {
		const nodes = new Set();
		nodesIds.forEach((id) => {
			if (this.visibilityMap[id] !== VISIBILITY_STATES.INVISIBLE) {
				const node = this.nodesList[this.nodesIndexesMap[id]];
				if (node) {
					if (node.type === 'mesh' && !node.name) {
						nodes.add(this.nodesList[this.nodesIndexesMap[node.parentId]]);
					} else {
						nodes.add(node);
					}
				}
			}
		});

		if (!nodes.size) {
			return { highlightedObjects: [] };
		}

		const highlightedObjects = this.handleSelection(Array.from(nodes), SELECTION_STATES.SELECTED);

		return { highlightedObjects };
	}

	public deselectNodes = ({ nodesIds = [] }) => {
		const nodes = new Set();
		for (let index = 0, size = nodesIds.length; index < size; index++) {
			const nodeId = nodesIds[index];
			if (this.selectionMap[nodeId] !== SELECTION_STATES.UNSELECTED) {
				this.selectionMap[nodeId] = SELECTION_STATES.UNSELECTED;
				const [node] = this.getNodesByIds([nodeId]);
				if (node.type === 'mesh' && !node.name) {
					nodes.add(this.nodesList[this.nodesIndexesMap[node.parentId]]);
				} else {
					nodes.add(node);
				}
			}
		}

		if (!nodes.size) {
			return { unhighlightedObjects: [] };
		}

		const unhighlightedObjects = this.handleSelection(Array.from(nodes), SELECTION_STATES.UNSELECTED);
		return { unhighlightedObjects };
	}

	public getMeshesByNodeIds = (nodeIds = []) => {
		const nodes = this.getNodesByIds(nodeIds);
		return this.getMeshesByNodes(nodes);
	}

	public isolateNodes = ({ nodesIds = [], ifcSpacesHidden = true}: any) => {
		const parentNodesByLevel = [];
		const toIsolate = {};
		const isParent = {};
		const toShow = [];
		const toHide = [];

		nodesIds.forEach((id) => {
			const [node] = this.getNodesByIds([id]);
			toIsolate[id] = 1;

			if (this.visibilityMap[id] !== VISIBILITY_STATES.VISIBLE) {
				toShow.push(id);
			} else {
				const parents = this.getParentsByPath(node);
				for (let index = 0; index < parents.length ; ++index) {
					const parentLevel = parents.length - index - 1;
					if (parentNodesByLevel[parentLevel]) {
						parentNodesByLevel[parentLevel].add(parents[index]);
					} else {
						parentNodesByLevel[parentLevel] = new Set([parents[index]]);
					}
					isParent[parents[index]._id] = 1;
				}
			}
		});

		let nodeIdx = 0;

		while (nodeIdx < this.nodesList.length) {
			const node = this.nodesList[nodeIdx];
			const nodeID = node._id;
			if (toIsolate[nodeID]) {
				// We hit a node we want to isolate skip its children
				nodeIdx += node.deepChildrenNumber;
			} else if (!isParent[nodeID]) {
				if (this.visibilityMap[nodeID] !== VISIBILITY_STATES.INVISIBLE) {
					toHide.push(nodeID);
				}
				// We hit a branch that we wish to hide. Skip its children
				nodeIdx += node.deepChildrenNumber;
			}
			++nodeIdx;
		}

		const { unhighlightedObjects, meshesToHide } = this.hideNodes(toHide, true);
		const { meshesToShow, meshesToHide: extraMeshesToHide }  = this.showNodes(toShow, ifcSpacesHidden);
		mergeArrays(meshesToHide, extraMeshesToHide);

		for (let i =  parentNodesByLevel.length - 1 ; i >= 0; --i) {
			this.updateParentsVisibility(parentNodesByLevel[i]);
			this.updateParentsSelection(parentNodesByLevel[i]);
		}

		return { unhighlightedObjects, meshesToHide, meshesToShow};
	}

	private hideNodes = (nodesId, skipParent = false) => {
		const toDeselect = [];
		const toGetMeshes = [];
		const parentNodesByLevel = [];
		for (let nodeIdx = 0; nodeIdx < nodesId.length; ++nodeIdx) {
			const nodeID = nodesId[nodeIdx];
			const currentState = this.visibilityMap[nodeID];
			let idxToList = this.nodesIndexesMap[nodeID];
			const node = this.nodesList[idxToList];
			if (currentState && currentState !== VISIBILITY_STATES.INVISIBLE) {
				if (SELECTION_STATES.UNSELECTED !== this.selectionMap[nodeID]) {
					this.selectionMap[nodeID] = SELECTION_STATES.UNSELECTED;
					toDeselect.push(node);
				}

				toGetMeshes.push(node);

				this.visibilityMap[nodeID] = VISIBILITY_STATES.INVISIBLE;

				if (node.hasChildren) {
					const lastIdx = idxToList + node.deepChildrenNumber + 1;
					// Hide all children
					while  (++idxToList < lastIdx) {
						const descendent = this.nodesList[idxToList];
						if (this.visibilityMap[descendent._id] === VISIBILITY_STATES.INVISIBLE) {
							// Already hidden, skip its children
							idxToList += descendent.deepChildrenNumber;
						} else {
							this.selectionMap[descendent._id] = SELECTION_STATES.UNSELECTED;
							this.visibilityMap[descendent._id] = VISIBILITY_STATES.INVISIBLE;
						}
					}
				}

				if (!skipParent) {
					const parents = this.getParentsByPath(node);
					for (let index = 0; index < parents.length ; ++index) {
						const parentLevel = parents.length - index - 1;
						if (parentNodesByLevel[parentLevel]) {
							parentNodesByLevel[parentLevel].add(parents[index]);
						} else {
							parentNodesByLevel[parentLevel] = new Set([parents[index]]);
						}
					}
				}
			}
		}

		for (let i =  parentNodesByLevel.length - 1 ; i >= 0; --i) {
			this.updateParentsVisibility(parentNodesByLevel[i]);
			this.updateParentsSelection(parentNodesByLevel[i]);
		}

		const unhighlightedObjects = this.handleSelection(toDeselect, SELECTION_STATES.UNSELECTED);
		const meshesToHide = this.getMeshesByNodes(toGetMeshes);

		return { unhighlightedObjects, meshesToHide };

	}

	private showNodes = (nodesIds, ifcSpacesHidden) => {
		return this.showNodesExceptMeshIDs(nodesIds, ifcSpacesHidden, []);
	}

	private showNodesExceptMeshIDs = (nodesIds, ifcSpacesHidden, meshes = []) => {
		const meshToHide = {};
		meshes.forEach((mesh) => meshToHide[mesh] = true);

		const filteredNodes = [];
		if (meshes.length === 0) {
			for (let nodeIdx = 0; nodeIdx < nodesIds.length; ++nodeIdx) {
				const nodeID = nodesIds[nodeIdx];
				const currentState = this.visibilityMap[nodeID];

				if (currentState !== VISIBILITY_STATES.VISIBLE) {
					const node = this.nodesList[this.nodesIndexesMap[nodeID]];
					filteredNodes.push(node);
				}
			}
		} else {
			for (let nodeIdx = 0; nodeIdx < nodesIds.length; ++nodeIdx) {
				const nodeID = nodesIds[nodeIdx];
				const node = this.nodesList[this.nodesIndexesMap[nodeID]];
				filteredNodes.push(node);
			}
		}

		const meshesToCheck = this.getMeshesByNodes(filteredNodes);
		const meshesToShow = [];
		const meshesToHide = [];
		const parentNodesByLevel = [];

		for (const ns in meshesToCheck) {
			const toShowEntry = {...meshesToCheck[ns]};
			const toHideEntry = {...meshesToCheck[ns]};
			toShowEntry.meshes = [];
			toHideEntry.meshes = [];

			meshesToCheck[ns].meshes.forEach((meshId) => {
				const currentState = this.visibilityMap[meshId];
				const shouldHide = meshToHide[meshId];

				const desiredState = shouldHide ? VISIBILITY_STATES.INVISIBLE
					: (ifcSpacesHidden ?  this.defaultVisibilityMap[meshId] : VISIBILITY_STATES.VISIBLE);

				if (currentState !== desiredState) {
					this.visibilityMap[meshId] = desiredState;
					if (shouldHide) {
						toHideEntry.meshes.push(meshId);
					} else {
						toShowEntry.meshes.push(meshId);
					}

					const [meshNode] = this.getNodesByIds([meshId]);
					const parents = this.getParentsByPath(meshNode);
					for (let index = 0; index < parents.length ; ++index) {
						const parentLevel = parents.length - index - 1;
						if (parentNodesByLevel[parentLevel]) {
							parentNodesByLevel[parentLevel].add(parents[index]);
						} else {
							parentNodesByLevel[parentLevel] = new Set([parents[index]]);
						}
					}
				}
			});

			meshesToShow.push(toShowEntry);
			meshesToHide.push(toHideEntry);
		}

		for (let i =  parentNodesByLevel.length - 1 ; i >= 0; --i) {
			this.updateParentsVisibility(parentNodesByLevel[i]);
		}

		return { meshesToShow, meshesToHide };
	}

	public showAllExceptMeshIDs = (ifcSpacesHidden, meshes) => {
		const nodes = this.nodesList[0].childrenIds;
		return this.showNodesExceptMeshIDs(nodes, ifcSpacesHidden, meshes);

	}

	public updateVisibility = ({ nodesIds = [], ifcSpacesHidden, visibility}) => {

		if (visibility === VISIBILITY_STATES.INVISIBLE) {
			return this.hideNodes(nodesIds);
		} else {
			return this.showNodes(nodesIds, ifcSpacesHidden);
		}
	}

	private updateParentsVisibility = (nodes) => {
		nodes.forEach((node) => {
			const hasVisibleChildren = node.childrenIds.every((id) => this.visibilityMap[id] === VISIBILITY_STATES.VISIBLE);
			const hasInvisibleChildren = node.childrenIds.every((id) => this.visibilityMap[id] === VISIBILITY_STATES.INVISIBLE);

			if (hasVisibleChildren) {
				this.visibilityMap[node._id] = VISIBILITY_STATES.VISIBLE;
			} else if (hasInvisibleChildren) {
				this.visibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
				this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
			} else {
				this.visibilityMap[node._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
			}
		});
	}

	private handleSelection = (toSelect, desiredState) => {
		const meshes = this.getMeshesByNodes(toSelect);
		const parentNodesByLevel = [];
		for (const ns in meshes) {
			meshes[ns].meshes.forEach((meshId) => {
				const meshNode = this.nodesList[this.nodesIndexesMap[meshId]];
				if (this.isVisibleNode(meshId) && this.selectionMap[meshId] !== desiredState) {
					this.selectionMap[meshId] = desiredState;
					const parents = this.getParentsByPath(meshNode);
					for (let index = 0; index < parents.length ; ++index) {
						const parentLevel = parents.length - index - 1;
						if (parentNodesByLevel[parentLevel]) {
							parentNodesByLevel[parentLevel].add(parents[index]);
						} else {
							parentNodesByLevel[parentLevel] = new Set([parents[index]]);
						}
					}
				}
			});
		}

		for (let i =  parentNodesByLevel.length - 1 ; i >= 0; --i) {
			this.updateParentsSelection(parentNodesByLevel[i]);
		}
		return meshes;
	}

	private updateParentsSelection = (parents) => {
		parents.forEach((parentNode) => {
			const parentId = parentNode._id;
			const everyChildrenSelected =
				parentNode.childrenIds.every((childId) => this.selectionMap[childId] === SELECTION_STATES.SELECTED);

			const everyChildrenUnselected =
				parentNode.childrenIds.every((childId) => this.selectionMap[childId] === SELECTION_STATES.UNSELECTED);

			if (everyChildrenSelected) {
				this.selectionMap[parentId] = SELECTION_STATES.SELECTED;
			} else if (everyChildrenUnselected) {
				this.selectionMap[parentId] = SELECTION_STATES.UNSELECTED;
			} else {
				this.selectionMap[parentId] = SELECTION_STATES.PARENT_OF_UNSELECTED;
			}
		});
	}

	private getNodesByIds = (nodesIds) => {
		return nodesIds.map((nodeId) => {
			return this.nodesList[this.nodesIndexesMap[nodeId]];
		});
	}

	private isVisibleNode = (nodeId) => this.visibilityMap[nodeId] !== VISIBILITY_STATES.INVISIBLE;

	private isSelectedNode = (nodeId) => this.selectionMap[nodeId] !== SELECTION_STATES.UNSELECTED;

	private getMeshesByNodes = (nodes = []) => {
		if (!nodes.length) {
			return [];
		}

		const meshList = {};
		for (let index = 0; index < nodes.length; ++index) {
			const node = nodes[index];
			if (node.subTreeRoots.length) {
				// This is a fed node
				node.subTreeRoots.forEach((subTreeRootID) => {
					const stRoot = this.nodesList[this.nodesIndexesMap[subTreeRootID]];
					const meshes = this.meshesByNodeId[stRoot.namespacedId][stRoot._id];
					if (meshes && meshes.length) {
						if (!meshList[stRoot.namespacedId]) {
							meshList[stRoot.namespacedId] = {
								modelId: stRoot.model,
								teamspace: stRoot.teamspace,
								meshes : [...meshes]
							};
						} else {
							mergeArrays(meshList[stRoot.namespacedId].meshes, meshes);
						}
					}
				});
			} else {
				const meshes = this.meshesByNodeId[node.namespacedId] ? this.meshesByNodeId[node.namespacedId][node._id] : [];
				if (meshes && meshes.length) {
					if (!meshList[node.namespacedId]) {
						meshList[node.namespacedId] = {
							modelId: node.model,
							teamspace: node.teamspace,
							meshes:  [...meshes]
						};
					} else {
						mergeArrays(meshList[node.namespacedId].meshes, meshes);
					}
				}
			}
		}

		const results = [];
		for (const key in meshList) {
			results.push(meshList[key]);
		}
		return results;
	}
}
