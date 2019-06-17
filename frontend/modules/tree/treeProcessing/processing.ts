import { memoize, intersection, keys, pickBy, uniqBy } from 'lodash';
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
			return selectionState !== SELECTION_STATES.UNSELECTED;
		}));
	}

	public get highlightedNodesIds() {
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
		const selectedNodesIds = this.selectedNodesIds;
		for (let index = 0, size = selectedNodesIds.length; index < size; index++) {
			this.selectionMap[selectedNodesIds[index]] = SELECTION_STATES.UNSELECTED;
		}

		this.selectionMap = {...this.selectionMap};
	}

	public selectNodes = ({ nodesIds = [], ...extraData }) => {
		const visibleNodesIds = nodesIds.filter((nodeId) => this.visibilityMap[nodeId] !== VISIBILITY_STATES.INVISIBLE);

		if (!visibleNodesIds.length) {
			return { highlightedObjects: [] };
		}

		const { skipChildren } = extraData;
		let nodes = this.getNodesByIds(visibleNodesIds).filter((node) => {
			return this.visibilityMap[node._id] !== VISIBILITY_STATES.INVISIBLE;
		});

		if (!skipChildren) {
			const compactNodes = [];

			for (let index = 0, size = nodes.length; index < size; index++) {
				const node = nodes[index];
				const children = this.getDeepChildren(node);
				compactNodes.push(node, ...children);
			}

			nodes = compactNodes;
		}

		this.handleToSelect(nodes);
		const highlightedObjects = this.getMeshesByNodes(nodes);

		this.selectionMap = { ...this.selectionMap };
		return { highlightedObjects };
	}

	public deselectNodes = ({ nodesIds = [] }) => {
		const filteredNodesIds = intersection(nodesIds, this.selectedNodesIds);
		const nodes = this.getNodesByIds(filteredNodesIds);

		const children = nodes.map((node) => this.getDeepChildren(node)) as any;
		const nodesWithChildren = [...nodes, ...children.flat()];

		for (let index = 0; index < filteredNodesIds.length; index++) {
			this.selectionMap[filteredNodesIds[index]] = SELECTION_STATES.UNSELECTED;
		}

		this.handleToDeselect(nodesWithChildren);

		this.selectionMap = { ...this.selectionMap };

		const unhighlightedObjects = this.getMeshesByNodes(nodesWithChildren);
		return { unhighlightedObjects };
	}

	public isolateNodes = ({ nodesIds = [], ifcSpacesHidden = true }: any) => {
		const toUnhighlight = [];
		const toHighlight = [];
		const meshesToUpdate = [];

		for (let index = 0; index < this.nodesList.length; index++) {
			const node = this.nodesList[index];
			const shouldBeVisible = nodesIds.includes(node._id);
			if (shouldBeVisible) {
				if (ifcSpacesHidden) {
					this.visibilityMap[node._id] = ifcSpacesHidden ? this.defaultVisibilityMap[node._id] : VISIBILITY_STATES.VISIBLE;
				}

				if (this.isVisibleNode(node._id)) {
					toHighlight.push(node);
					if (node.type === NODE_TYPES.MESH) {
						meshesToUpdate.push(node);
					}
					this.selectionMap[node._id] = SELECTION_STATES.SELECTED;
				} else {
					this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
				}
			} else if (this.isVisibleNode(node._id)) {
				toUnhighlight.push(node);
				this.visibilityMap[node._id] = VISIBILITY_STATES.INVISIBLE;
				this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
				if (node.type === NODE_TYPES.MESH) {
					meshesToUpdate.push(node);
				}
			}
		}

		const unhighlightedObjects = this.getMeshesByNodes(toUnhighlight);
		const highlightedObjects = this.getMeshesByNodes(toHighlight);

		this.selectionMap = { ...this.selectionMap };
		this.visibilityMap = { ...this.visibilityMap };

		return {
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
			...this.getMeshesByNodes(nodes)
		];

		this.selectionMap = { ...this.selectionMap };
		this.visibilityMap = { ...this.visibilityMap };

		return { unhighlightedObjects, meshesToUpdate: result.meshesToUpdate };
	}

	private updateParentsVisibility = (nodes = [], extraData) => {
		const unhighlightedObjects = [];

		const processedNodes = [];

		while (nodes.length > 0) {
			const node = nodes.pop();
			processedNodes.push(node._id);

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
					unhighlightedObjects.push(...meshesData);
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
		const parents = [];

		for (let index = 0, size = toSelect.length; index < size; index++) {
			const node = toSelect[index];

			if (this.isVisibleNode(node._id)) {
				this.selectionMap[node._id] = SELECTION_STATES.SELECTED;
				const nodeParents = this.getParents(node);
				parents.push(...nodeParents);
			}
		}

		if (parents.length) {
			const uniqeParents = uniqBy(parents, ({ _id}) => _id);
			this.updateParentsSelection(uniqeParents);
		}
	}

	private handleToDeselect = (toDeselect) => {
		if (!toDeselect.length) {
			return;
		}

		const parents = [];
		for (let index = 0, size = toDeselect.length; index < size; index++) {
			const node = toDeselect[index];
			this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;

			const nodeParents = this.getParents(node);
			parents.push(...nodeParents);
		}

		if (parents.length) {
			const uniqeParents = uniqBy(parents, ({ _id }) => _id);
			this.updateParentsSelection(uniqeParents);
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

	public getDeepChildren = memoize((node) => {
		const nodeIndex = this.nodesIndexesMap[node._id];
		return this.nodesList.slice(nodeIndex + 1, nodeIndex + node.deepChildrenNumber + 1);
	}, (node) => node._id);

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

	private isVisibleNode = (nodeId) => {
		return this.visibilityMap[nodeId] !== VISIBILITY_STATES.INVISIBLE;
	}

	private isSelectedNode = (nodeId) => {
		return this.selectionMap[nodeId] !== SELECTION_STATES.UNSELECTED;
	}

	private getMeshesByNodes = (nodes = []) => {
		if (!nodes.length) {
			return [];
		}

		const meshesByNodesIndexes = {};
		const meshesByNodesList = [];

		for (let index = 0; index < nodes.length; index++) {
			const node = nodes[index];

			if (node) {
				if (meshesByNodesIndexes[node.namespacedId] === undefined) {
					meshesByNodesList.push({
						modelId: node.model,
						teamspace: node.teamspace,
						meshes: []
					});
					meshesByNodesIndexes[node.namespacedId] = meshesByNodesList.length - 1;
				}

				const meshes = node.type === NODE_TYPES.MESH
					? [node._id]
					: this.meshesByModelId[node._id];

				if (meshes) {
					const meshesByNodesIndex = meshesByNodesIndexes[node.namespacedId];
					meshesByNodesList[meshesByNodesIndex].meshes = meshesByNodesList[meshesByNodesIndex].meshes.concat(meshes);
				}
			}
		}

		return meshesByNodesList as any;
	}
}
