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
		const selectedNodesIds = this.selectedNodesIds;
		for (let index = 0, size = selectedNodesIds.length; index < size; index++) {
			this.selectionMap[selectedNodesIds[index]] = SELECTION_STATES.UNSELECTED;
		}
	}

	public selectNodes = ({ nodesIds = [], ...extraData }) => {
		if (!nodesIds.length) {
			return { highlightedObjects: [] };
		}

		const { skipChildren } = extraData;
		console.time('selectNodes getNodesByIds');
		let nodes = this.getNodesByIds(nodesIds);
		console.timeEnd('selectNodes getNodesByIds');

		if (!skipChildren) {
			console.time('selectNodes skipChildren');
			const compactNodes = [];

			for (let index = 0, size = nodes.length; index < size; index++) {
				const node = nodes[index];
				const children = this.getDeepChildren(node);
				compactNodes.push(node, ...children);
			}

			nodes = compactNodes;
			console.timeEnd('selectNodes skipChildren');
		}

		console.time('selectNodes handleToSelect');
		this.handleToSelect(nodes);
		console.timeEnd('selectNodes handleToSelect');

		console.time('selectNodes getMeshesByNodes');
		const highlightedObjects = this.getMeshesByNodes(nodes);
		console.timeEnd('selectNodes getMeshesByNodes');

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

		const unhighlightedObjects = this.getMeshesByNodes(nodesWithChildren);
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
					const meshesByNodes = this.getMeshesByNodes([node]);
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

		return { unhighlightedObjects };
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
			unhighlightedObjects: []
		};

		if (!skipParents) {
			const parentsResult = this.updateParentsVisibility(parents, extraData);
			result.unhighlightedObjects = parentsResult.unhighlightedObjects;
		}

		return result;
	}

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

	private handleToDeselect = (toDeselect) => {
		for (let index = 0, size = toDeselect.length; index < size; index++) {
			const node = toDeselect[index];
			this.selectionMap[node._id] = SELECTION_STATES.UNSELECTED;
		}
		const clickedNode = toDeselect[0];
		const parents = this.getParents(clickedNode);

		if (clickedNode.hasChildren || toDeselect.length === 1) {
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
