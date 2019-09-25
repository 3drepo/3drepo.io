import { intersection, keys, memoize, pickBy, uniqBy } from 'lodash';
import { NODE_TYPES, SELECTION_STATES, VISIBILITY_STATES } from '../../../constants/tree';

export class Processing {
	// FIXME:
	public get selectedNodesIds() {
		return keys(pickBy(this.selectionMap, (selectionState) => {
			return selectionState !== SELECTION_STATES.UNSELECTED;
		}));
	}

	public get fullySelectedNodesIds() {
		return keys(pickBy(this.selectionMap, (selectionState) => {
			return selectionState === SELECTION_STATES.SELECTED;
		}));
	}

	public get hiddenNodesIds() {
		return keys(pickBy(this.visibilityMap, (selectionState) => {
			return selectionState === VISIBILITY_STATES.INVISIBLE;
		}));
	}
	public nodesList = [];
	public nodesIndexesMap = {};
	public defaultVisibilityMap = {};
	public meshesByNodeId = {};
	public nodesBySharedIdsMap = {};
	public selectionMap = {};
	public visibilityMap = {};
	public treePath = {} as any;

	public getDeepChildren = memoize((node) => {
		const nodeIndex = this.nodesIndexesMap[node._id];
		return this.nodesList.slice(nodeIndex + 1, nodeIndex + node.deepChildrenNumber + 1);
	}, (node) => node._id);

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

	public getChildren = memoize((node = {}) => {
		if (node.hasChildren) {
			return this.getNodesByIds(node.childrenIds);
		}

		return [];
	}, (node = {}) => node._id);

	constructor(data) {
		const {
			nodesList, nodesIndexesMap, defaultVisibilityMap,
			meshesByNodeId, nodesBySharedIdsMap, visibilityMap, selectionMap,
			treePath
		} = data;
		this.nodesList = nodesList;
		this.nodesIndexesMap = nodesIndexesMap;
		this.defaultVisibilityMap = defaultVisibilityMap;
		this.meshesByNodeId = meshesByNodeId;
		this.visibilityMap = visibilityMap;
		this.selectionMap = selectionMap;
		this.nodesBySharedIdsMap = nodesBySharedIdsMap;
		this.treePath = treePath;
	}

	public clearCurrentlySelected = () => {
		let index = 0;
		while (index < this.nodesList.length) {
			const node = this.nodesList[index];
			const id = node._id;
			if (this.selectionMap[id] !== SELECTION_STATES.UNSELECTED) {
				this.selectionMap[id] = SELECTION_STATES.UNSELECTED;
				++index;
			} else {
				index += node.deepChildrenNumber > 0 ? node.deepChildrenNumber : 1;
			}
		}
	}

	public selectNodes = ({ nodesIds = [], ...extraData }) => {
		console.log('@SelectNodes', nodesIds, extraData);

		console.time('[A] Select');
		const nodes = [];
		nodesIds.forEach((id) => {
			if (this.visibilityMap[id] !== VISIBILITY_STATES.INVISIBLE) {
				nodes.push(this.nodesList[this.nodesIndexesMap[id]]);
			}
		});

		if (!nodes.length) {
			return { highlightedObjects: [] };
		}

		console.timeEnd('[A] Select');
		console.time('[C] Select');
		const highlightedObjects = this.handleToSelect(nodes);
		console.timeEnd('[C] Select');
		this.selectionMap = { ...this.selectionMap };

		return { highlightedObjects };
	}

	public deselectNodes = ({ nodesIds = [] }) => {
		const filteredNodesIds = intersection(nodesIds, this.selectedNodesIds);
		let nodesWithChildren = [];
		for (let index = 0, size = filteredNodesIds.length; index < size; index++) {
			const nodeId = filteredNodesIds[index];
			const [node] = this.getNodesByIds([nodeId]);
			nodesWithChildren.push(node);
			this.selectionMap[nodeId] = SELECTION_STATES.UNSELECTED;

			if (node.hasChildren) {
				const deepChildren = (this.getDeepChildren(node) as any).flat();
				nodesWithChildren = nodesWithChildren.concat(deepChildren);
			}
		}

		this.handleToDeselect(nodesWithChildren);
		this.selectionMap = { ...this.selectionMap };

		const unhighlightedObjects = this.getMeshesByNodes(nodesWithChildren);
		return { unhighlightedObjects };
	}

	public isolateNodes = ({ nodesIds = [], ifcSpacesHidden = true, skipChildren = false }: any) => {
		const meshesToUpdate = [];
		const parentsMap = {};

		for (let index = 0; index < nodesIds.length; index++) {
			const [node] = this.getNodesByIds([nodesIds[index]]);
			parentsMap[node.parentId] = true;

			if (!skipChildren) {
				const deepChildren = this.getDeepChildren(node);
				const deepChildrenIds = deepChildren.map(({ _id }) => _id);
				nodesIds.push(...deepChildrenIds);
			}
		}

		for (let index = this.nodesList.length - 1; index >= 0; index--) {
			const node = this.nodesList[index];
			const shouldBeVisible = nodesIds.includes(node._id);
			let visibilityHasChanged = false;
			if (shouldBeVisible) {
				this.visibilityMap[node._id] = ifcSpacesHidden ? this.defaultVisibilityMap[node._id] : VISIBILITY_STATES.VISIBLE;
				visibilityHasChanged = true;
			} else if (this.isVisibleNode(node._id) && !parentsMap[node._id]) {
				this.visibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
				visibilityHasChanged = true;
			}

			if (visibilityHasChanged && node.type === NODE_TYPES.MESH) {
				meshesToUpdate.push(node);
			}
			this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
		}

		this.updateParentsVisibility(this.getNodesByIds(keys(parentsMap)), {
			visibility: VISIBILITY_STATES.PARENT_OF_INVISIBLE,
			ifcSpacesHidden
		});
		this.selectionMap = { ...this.selectionMap };
		this.visibilityMap = { ...this.visibilityMap };

		return meshesToUpdate;
	}

	public updateVisibility = ({ nodesIds = [], ...extraData }) => {
		const shouldBeInvisible = extraData.visibility === VISIBILITY_STATES.INVISIBLE;
		const nodes = this.getNodesByIds(nodesIds);

		if (shouldBeInvisible) {
			const filteredNodesIds = intersection(nodesIds, this.selectedNodesIds);

			for (let index = 0; index < filteredNodesIds.length; index++) {
				const nodeId = filteredNodesIds[index];
				this.selectionMap[nodeId] = SELECTION_STATES.UNSELECTED;
			}
		}

		const result = this.handleNodesVisibility(nodes, extraData);
		const unhighlightedObjects = [
			...result.unhighlightedObjects,
			...this.getMeshesByNodes(nodes)
		];

		this.selectionMap = { ...this.selectionMap };
		this.visibilityMap = { ...this.visibilityMap };

		return { unhighlightedObjects, meshesToUpdate: result.meshesToUpdate };
	}

	private updateParentsVisibility = (nodes = [], extraData) => {
		const unhighlightedObjects = [];

		while (nodes.length > 0) {
			const node = nodes.pop();

			if (node.hasChildren) {
				const children = this.getChildren(node);
				let visibleChildCount = 0;
				let hasParentOfInvisibleChild = false;

				for (let i = 0, size = node.childrenIds.length; i < size; i++) {
					const childId = node.childrenIds[i];
					if (this.visibilityMap[childId] === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
						hasParentOfInvisibleChild = true;
						break;
					}

					if (this.isVisibleNode(childId)) {
						visibleChildCount++;
					}
				}

				if (children.length && children.length === visibleChildCount) {
					// All children are visible
					this.visibilityMap[node._id] = VISIBILITY_STATES.VISIBLE;
				} else if (!hasParentOfInvisibleChild && !visibleChildCount) {
					// All children are invisible
					this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
					this.visibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
					const meshesByNodes = this.getMeshesByNodes([node]);
					const meshesData = meshesByNodes[0];
					unhighlightedObjects.push({ ...meshesData });
				} else {
					// Part of children is invisible
					const hasSelectedChildren = node.childrenIds.some(this.isSelectedNode);
					this.visibilityMap[node._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;

					if (!hasSelectedChildren) {
						this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
					}
				}
			} else {
					this.visibilityMap[node._id] = extraData.ifcSpacesHidden && extraData.visibility === VISIBILITY_STATES.VISIBLE
						? this.defaultVisibilityMap[node._id]
						: extraData.visibility;
			}

			if (node.parentId) {
				const parentNode = this.nodesList[this.nodesIndexesMap[node.parentId]];
				nodes.push(parentNode);
			}
		}

		return { unhighlightedObjects };
	}

	private handleNodesVisibility = (nodes, extraData) => {
		const { ifcSpacesHidden, skipChildren, visibility, skipParents } = extraData;
		const parents = [];
		const meshesToUpdate = [];

		for (let nodeLoopIndex = 0; nodeLoopIndex < nodes.length; nodeLoopIndex++) {
			const node = nodes[nodeLoopIndex];

			if (node) {
				if (visibility === VISIBILITY_STATES.PARENT_OF_INVISIBLE || visibility !== this.visibilityMap[node._id]) {
					if (node.type === NODE_TYPES.MESH) {
						meshesToUpdate.push(node);
					}

					const children = node.hasChildren && !skipChildren ? this.getDeepChildren(node) : [];

					if (skipChildren && skipParents) {
						children.push(node);
					}

					for (let index = 0; index < children.length; index++) {
						const child = children[index];

						if (this.visibilityMap[node._id] !== visibility && child.type === NODE_TYPES.MESH) {
							meshesToUpdate.push(child);
						}

						if (visibility === VISIBILITY_STATES.VISIBLE) {
							this.visibilityMap[child._id] = ifcSpacesHidden
								? this.defaultVisibilityMap[child._id]
								: VISIBILITY_STATES.VISIBLE;
						} else {
							this.selectionMap[child._id] = SELECTION_STATES.UNSELECTED;
							this.visibilityMap[child._id] = VISIBILITY_STATES.INVISIBLE;
						}
					}

					if (!skipParents) {
						parents.push(node);
					}
				}
			}
		}

		const result = {
			meshesToUpdate,
			unhighlightedObjects: []
		};

		if (!skipParents) {
			const parentsResult = this.updateParentsVisibility(parents, extraData);
			result.unhighlightedObjects = parentsResult.unhighlightedObjects;
		}

		return result;
	}

	private handleToSelect = (toSelect) => {
		const meshes = this.getMeshesByNodes(toSelect);
		const parentNodesByLevel = [];
		for (const ns in meshes) {
			meshes[ns].meshes.forEach((meshId) => {
				const meshNode = this.nodesList[this.nodesIndexesMap[meshId]];
				if (this.isVisibleNode(meshId) && this.selectionMap[meshId] !== SELECTION_STATES.SELECTED) {
					this.selectionMap[meshId] = SELECTION_STATES.SELECTED;
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

	private handleToDeselect = (toDeselect) => {
		if (!toDeselect.length) {
			return;
		}

		for (let index = 0, size = toDeselect.length; index < size; index++) {
			const node = toDeselect[index];
			this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
		}

		const parents = this.getParentsByPath(toDeselect[0]);

		if (parents.length) {
			this.updateParentsSelection(parents);
		}
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
								meshes
							};
						} else {
							meshList[stRoot.namespacedId].meshes = meshList[stRoot.namespacedId].meshes.concat(meshes);
						}
					}
				});
			} else {
				const meshes = this.meshesByNodeId[node.namespacedId][node._id];
				if (meshes && meshes.length) {
					if (!meshList[node.namespacedId]) {
						meshList[node.namespacedId] = {
							modelId: node.model,
							teamspace: node.teamspace,
							meshes
						};
					} else {
						meshList[node.namespacedId].meshes = meshList[node.namespacedId].meshes.concat(meshes);
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
