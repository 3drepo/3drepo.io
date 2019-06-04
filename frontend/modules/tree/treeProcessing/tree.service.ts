import { memoize, values, intersection, keys, pickBy } from 'lodash';
import { SELECTION_STATES, VISIBILITY_STATES, NODE_TYPES } from '../../../constants/tree';

export class Processing {
	public nodesList = [];
	public nodesIndexesMap = {};
	public defaultVisibilityMap = {};
	public meshesByModelId = {};
	public nodesBySharedIdsMap = {};
	public selectionMap = {};
	public visibilityMap = {};

	constructor(data) {
		const {
			nodesList, nodesIndexesMap, defaultVisibilityMap,
			meshesByModelId, nodesBySharedIdsMap, visibilityMap, selectionMap
		} = data;
		this.nodesList = nodesList;
		this.nodesIndexesMap = nodesIndexesMap;
		this.defaultVisibilityMap = defaultVisibilityMap;
		this.meshesByModelId = meshesByModelId;
		this.visibilityMap = visibilityMap;
		this.selectionMap = selectionMap;
		this.nodesBySharedIdsMap = nodesBySharedIdsMap;
	}

	public get selectedNodesIds() {
		return keys(pickBy(this.selectionMap, (selectionState) => {
			return selectionState === SELECTION_STATES.SELECTED;
		}));
	}

	public get invisibleNodesIds() {
		return keys(pickBy(this.visibilityMap, (selectionState) => {
			return selectionState === VISIBILITY_STATES.INVISIBLE;
		}));
	}

	public clearCurrentlySelected = () => {
		for (let index = 0, size = this.nodesList.length; index < size; index++) {
			const node = this.nodesList[index];
			this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
		}
	}

	public selectNodes = ({ nodesIds = [], ...extraData }) => {
		const { skipChildren } = extraData;
		let nodes = this.getNodesByIds(nodesIds);

		if (!skipChildren) {
			const children = nodes.map((node) => this.getDeepChildren(node)) as any;
			nodes = [...nodes, ...children.flat()];
		}

		this.handleToSelect(nodes);

		const highlightedObjects = this.getSelectMeshesByNodes(nodes);
		return {
			highlightedObjects,
			nodesSelectionMap: {...this.selectionMap}
		};
	}

	public deselectNodes = ({ nodesIds = [] }) => {
		const filteredNodesIds = intersection(nodesIds, this.selectedNodesIds);
		const nodes = this.getNodesByIds(filteredNodesIds);

		for (let index = 0; index < filteredNodesIds.length; index++) {
			this.selectionMap[filteredNodesIds[index]] = SELECTION_STATES.UNSELECTED;
		}

		const unhighlightedObjects = this.getSelectMeshesByNodes(nodes);
		return { unhighlightedObjects };
	}

	public isolateNodes = ({ nodesIds = [] }: any) => {
		const toUnhighlight = [];
		const toHighlight = [];
		const meshesToUpdate = [];

		for (let index = 0; index < this.nodesList.length; index++) {
			const node = this.nodesList[index];
			const shouldBeVisible = nodesIds.includes(node._id);
			if (shouldBeVisible) {
				this.selectionMap[node._id] = SELECTION_STATES.SELECTED;
				this.visibilityMap[node._id] = VISIBILITY_STATES.VISIBLE;
				toHighlight.push(node);
				if (node.type === NODE_TYPES.MESH) {
					meshesToUpdate.push(node);
				}
			} else if (this.visibilityMap[node._id] !== VISIBILITY_STATES.INVISIBLE) {
				toUnhighlight.push(node);
				this.visibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
				this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
				if (node.type === NODE_TYPES.MESH) {
					meshesToUpdate.push(node);
				}
			}
		}

		const unhighlightedObjects = this.getSelectMeshesByNodes(toUnhighlight);
		const highlightedObjects = this.getSelectMeshesByNodes(toHighlight);

		return {
			nodesSelectionMap: {...this.selectionMap},
			nodesVisibilityMap: {...this.visibilityMap},
			unhighlightedObjects,
			highlightedObjects,
			meshesToUpdate
		};
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
			...this.getSelectMeshesByNodes(nodes)
		];

		return { unhighlightedObjects, meshesToUpdate: result.meshesToUpdate };
	}

	/* Helpers */

	private updateParentsVisibility = (nodes = [], extraData) => {
		const unhighlightedObjects = [];

		const processedNodes = [];

		while (nodes.length > 0) {
			const node = nodes.pop();
			processedNodes.push(node._id);
			const initialVisibility = this.visibilityMap[node._id];

			if (node.hasChildren) {
				const children = this.getChildren(node);
				let visibleChildCount = 0;
				let hasParentOfInvisibleChild = false;

				for (let i = 0; i < children.length; i++) {
					if (this.visibilityMap[children[i]._id] === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
						hasParentOfInvisibleChild = true;
						break;
					} else if (this.visibilityMap[children[i]._id] === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
						break;
					} else if (this.visibilityMap[children[i]._id] === VISIBILITY_STATES.VISIBLE) {
						visibleChildCount++;
					}
				}

				if (hasParentOfInvisibleChild) {
					this.visibilityMap[node._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
				} else if (children.length && children.length === visibleChildCount) {
					this.visibilityMap[node._id] = VISIBILITY_STATES.VISIBLE;
				} else if (!visibleChildCount) {
					this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
					this.visibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
					const meshesByNodes = this.getSelectMeshesByNodes([node]);
					const meshesData = meshesByNodes[0];
					unhighlightedObjects.push(...meshesData);
				} else {
					this.visibilityMap[node._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
				}
			} else {
				this.visibilityMap[node._id] = extraData.visibility;
			}

			if (initialVisibility !== this.visibilityMap[node._id] && node.parentId) {
				const parents = this.getParents(node);

				if (VISIBILITY_STATES.PARENT_OF_INVISIBLE === this.visibilityMap[node._id]) {
					for (let j = 0; j < parents.length; j++) {
						const parentNode = parents[j];
						this.visibilityMap[parentNode._id] = VISIBILITY_STATES.PARENT_OF_INVISIBLE;
						processedNodes.push(parentNode._id);
					}
				} else {
					nodes.push(parents[0]);
				}
			}
		}

		return { unhighlightedObjects	};
	};

	private handleNodesVisibility = (nodes, extraData) => {
		const { ifcSpacesHidden, skipChildren, visibility, skipParents } = extraData;

		const parents = [];
		const processedNodes = [];
		const meshesToUpdate = [];

		for (let nodeLoopIndex = 0; nodeLoopIndex < nodes.length; nodeLoopIndex++) {
			const node = nodes[nodeLoopIndex];

			if (node) {
				const nodeVisibility = this.visibilityMap[node._id];
				processedNodes.push(node._id);

				if (visibility === VISIBILITY_STATES.PARENT_OF_INVISIBLE || visibility !== nodeVisibility) {
					if (node.type === NODE_TYPES.MESH) {
						meshesToUpdate.push(node);
					}

					const children = node.hasChildren && !skipChildren ? this.getDeepChildren(node) : [];

					if (skipChildren && skipParents) {
						children.push(node);
					}

					for (let index = 0; index < children.length; index++) {
						const child = children[index];
						processedNodes.push(child._id);

						if (nodeVisibility !== visibility && child.type === NODE_TYPES.MESH) {
							meshesToUpdate.push(child);
						}

						if (visibility === VISIBILITY_STATES.VISIBLE) {
							if (!(ifcSpacesHidden && this.defaultVisibilityMap[child._id] === VISIBILITY_STATES.INVISIBLE)) {
								this.visibilityMap[child._id] = VISIBILITY_STATES.VISIBLE;
							}
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
			nodesVisibilityMap: { ...this.visibilityMap },
			nodesSelectionMap: { ...this.selectionMap },
			unhighlightedObjects: []
		};

		if (!skipParents) {
			const parentsResult = this.updateParentsVisibility(parents, extraData);
			result.unhighlightedObjects = parentsResult.unhighlightedObjects;
		}

		return result;
	};

	private handleToSelect = (toSelect) => {
		for (let index = 0, size = toSelect.length; index < size; index++) {
			const node = toSelect[index];
			const currentVisibility = this.visibilityMap[node._id];

			if (currentVisibility !== VISIBILITY_STATES.INVISIBLE) {
				if (currentVisibility === VISIBILITY_STATES.PARENT_OF_INVISIBLE) {
					this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
				} else {
					this.selectionMap[node._id] = SELECTION_STATES.SELECTED;
				}
			}
		}

		const clickedNode = toSelect[0];
		const parents = this.getParents(clickedNode);

		if (clickedNode.hasChildren || toSelect.length === 1) {
			this.updateParentsSelection(parents);
		}
	}

	private updateParentsSelection = (parents) => {
		for (let i = 0; i < parents.length; i++) {
			const parentId = parents[i]._id;

			const everyChildrenSelected =
				parents[i].childrenIds.every((childId) => this.selectionMap[childId] === SELECTION_STATES.SELECTED);

			const everyChildrenUnselected =
				parents[i].childrenIds.every((childId) => this.selectionMap[childId] === SELECTION_STATES.UNSELECTED);

			if (everyChildrenSelected) {
				this.selectionMap[parentId] = SELECTION_STATES.SELECTED;
			} else if (everyChildrenUnselected) {
				this.selectionMap[parentId] = SELECTION_STATES.UNSELECTED;
			} else {
				this.selectionMap[parentId] = SELECTION_STATES.PARENT_OF_UNSELECTED;
			}
		}
	}

	private _getDeepChildren = (node) => {
		const nodeIndex = this.nodesIndexesMap[node._id];
		return this.nodesList.slice(nodeIndex + 1, nodeIndex + node.deepChildrenNumber + 1);
	}

	private getDeepChildren = memoize(this._getDeepChildren, (node) => node._id);

	private getNodesByIds = (nodesIds) => {
		return nodesIds.map((nodeId) => {
			return this.nodesList[this.nodesIndexesMap[nodeId]];
		});
	}

	public getParents = memoize((node = {}) => {
		const parents = [];
		let nextParentId = node.parentId;

		while (!!nextParentId) {
			const parentNodeIndex = this.nodesIndexesMap[nextParentId];
			const parentNode = this.nodesList[parentNodeIndex];
			parents.push(parentNode);
			nextParentId = parentNode.parentId;
		}

		return parents;
	}, (node = {}) => node._id);

	public getChildren = memoize((node = {}) => {
		if (node.hasChildren) {
			return this.getNodesByIds(node.childrenIds);
		}

		return [];
	}, (node = {}) => node._id);

	private getSelectMeshesByNodes = (nodes = []) => {
		const treeNodesList = this.nodesList;
		const nodesIndexesMap = this.nodesIndexesMap;
		const idToMeshes = this.meshesByModelId;

		if (!nodes.length) {
			return [];
		}

		const childrenMap = {};
		const meshesByNodes = {};

		let stack = [...nodes];
		while (stack.length > 0) {
			const node = stack.pop();

			if (node) {
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
					meshesByNodes[node.namespacedId].meshes = meshesByNodes[node.namespacedId].meshes.concat(meshes);
				} else if (!childrenMap[node._id] && node.hasChildren) {
					// This should only happen in federations.
					// Traverse down the tree to find submodel nodes
					const nodeIndex = nodesIndexesMap[node._id];
					for (let childNumber = 1; childNumber <= node.deepChildrenNumber; childNumber++) {
						const childNode = treeNodesList[nodeIndex + childNumber];
						childrenMap[childNode._id] = true;
						stack = stack.concat([childNode]);
					}
				}
			}
		}

		return values(meshesByNodes) as any;
	};
}
