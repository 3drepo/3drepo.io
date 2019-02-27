/**
 *  Copyright (C) 2014 3D Repo Ltd
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

export class TreeService {

	public static $inject: string[] = [
		'$q',
		'APIService',
		'ViewerService',
		'DocsService',
		'MultiSelectService'
	];

	public highlightMap;
	public highlightMapUpdateTime;
	public selectionDataUpdateTime;
	public currentSelectedNodes;
	public visibilityUpdateTime;
	public selectedIndex;
	public treeReady;
	private allNodes;

	private state;
	private treeMap = null;
	private idToMeshes;
	private baseURL;

	private nodesToShow;
	private subTreesById;
	private subModelIdToPath;
	private idToNodeMap;
	private hiddenByDefaultNodes;
	private treeMapReady;
	private generatedMaps;
	private ready;
	private idToPath;
	private idToObjRef;
	private SELECTION_STATES;
	private VISIBILITY_STATES;
	private meshesToUpdate; // Set of meshes that are pending a visibility update in unity.

	constructor(
		private $q: ng.IQService,
		private APIService,
		private ViewerService,
		private DocsService,
		private MultiSelectService
	) {
		this.reset();
	}

	public reset() {

		this.ready = this.$q.defer();
		this.treeReady = this.$q.defer();
		this.treeMapReady = this.$q.defer();
		this.generatedMaps = null;

		this.meshesToUpdate = new Set();
		this.state = {};
		this.state.hideIfc = true;
		this.allNodes = undefined;
		this.idToPath = {};
		this.currentSelectedNodes = {};
		this.nodesToShow = [];
		this.subTreesById = {};
		this.subModelIdToPath = {};
		this.idToObjRef = {};
		this.highlightMapUpdateTime = Date.now();

		this.SELECTION_STATES = {
			parentOfUnselected : 0,
			selected : 1,
			unselected : 2
		};

		this.VISIBILITY_STATES = {
			parentOfInvisible : 'parentOfInvisible',
			visible : 'visible',
			invisible : 'invisible'
		};

	}

	public onReady() {
		return this.ready.promise;
	}

	public genIdToObjRef(tree: any, map: any) {

		if (!map) {
			map = {};
		}

		map[tree._id] = tree;

		if (tree.children) {
			tree.children.forEach((child) => {
				this.genIdToObjRef(child, map);
			});
		}

		return map;
	}

	public init(account: string, model: string, branch: string, revision: string, setting: any) {
		this.treeMap = null;
		branch = branch ? branch : 'master';

		// revision = revision ? revision : "head";

		if (!revision) {
			this.baseURL = account + '/' + model + '/revision/master/head/';
		} else {
			this.baseURL = account + '/' + model + '/revision/' + revision + '/';
		}

		const url = this.baseURL + 'fulltree.json';

		const meshesAndTrees = [
			this.getIdToMeshes(),
			this.getTrees(url, setting)
		];

		return Promise.all(meshesAndTrees)
			.then((meshAndTreeData) => {
				const tree = meshAndTreeData[1];
				this.setAllNodes(tree.nodes);
				this.setSubTreesById(tree.subTreesById);
				this.setCachedIdToPath(tree.idToPath);
				this.setSubModelIdToPath(tree.subModelIdToPath);
				return this.getMap().then(() => {
					this.ready.resolve(tree);
					return tree;
				});
			})
			.catch((error) => {
				console.error('Error resolving tree(s): ', error);
			});

	}

	public getIdToMeshes() {

		const url = this.baseURL + 'idToMeshes.json';
		const options = {
			headers: {
				'Content-Type': 'application/json'
			}
		};

		return this.APIService.get(url, options)
			.then((json) => {
				const result = json.data;
				if (result.subModels.length) {
					// federation - construct the mapping
					this.idToMeshes = {};
					result.subModels.forEach((entry) => {
						const ts = entry.account;
						const modelId = entry.model;
						delete entry.account;
						delete entry.model;
						this.idToMeshes[`${ts}@${modelId}`] = entry;
					});
				} else {
					this.idToMeshes = result.mainTree;
				}
			})
			.catch((error) => {
				console.error('Failed to get Id to Meshes:', error);
			});

	}

	public getTrees(url: string, setting: any) {

		return this.APIService.get(url, {
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((json) => {

				const mainTree = json.data.mainTree;

				// TODO: This needs sorting out.

				// replace model id with model name in the tree if it is a federate model
				if (setting.federate) {

					mainTree.nodes.name = setting.name;
					mainTree.nodes.children.forEach((child) => {
						const name = child.name.split(':');
						const subModel = setting.subModels.find((m) => {
							return m.model === name[1];
						});

						if (subModel) {
							name[1] = subModel.name;
							child.name = name.join(':');
						}

						if (subModel && child.children && child.children[0]) {
							child.children[0].name = subModel.name;
						}
					});

				}

				const subTrees = json.data.subTrees;
				const subTreesById = {};

				return this.handleIdToPath(mainTree, subTrees, subTreesById);
			})
			.catch((error) => {
				console.error('Tree Init Error:', error);
				this.reset();
			});
	}

	public handleIdToPath(mainTree, subTrees, subTreesById) {
		return this.getIdToPath()
				.then((idToPath) => {

					const awaitedSubTrees = [];

					if (idToPath && idToPath.mainTree) {

						mainTree.idToPath = idToPath.mainTree.idToPath;

						if (subTrees) {

							// idToObjRef only needed if model is a fed model.
							// i.e. subTrees.length > 0

							mainTree.subModelIdToPath = {};

							subTrees.forEach((subtree) => {

								const subtreeIdToPath = idToPath.subModels.find((submodel) => {
									return subtree.model === submodel.model;
								});

								if (subtreeIdToPath) {
									subtree.idToPath = subtreeIdToPath.idToPath;
								}

								this.handleSubTree(
									subtree,
									mainTree,
									subTreesById,
									awaitedSubTrees
								);
							});
						}

					}

					mainTree.subTreesById = subTreesById;

					return Promise.all(awaitedSubTrees).then(() => {
						this.treeReady.resolve(mainTree);
						return mainTree;
					});

				})
				.catch((error) => {
					console.error('Error getting getIdToPath', error);
					this.reset();
				});

	}

	public getIdToPath() {

		const url = this.baseURL + 'tree_path.json';
		return this.APIService.get(url, {
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((response) => {
				return response.data;
			});

	}

	public handleSubTree(subtree: any, mainTree: any, subTreesById: any, awaitedSubTrees: any[]) {

		const treeId = subtree._id;
		this.idToObjRef = this.genIdToObjRef(mainTree.nodes, undefined);

		// attach the sub tree back on main tree
		if (this.idToObjRef[treeId] && subtree.url) {

			const getSubTree = this.APIService.get(subtree.url)
				.then((res) => {

					this.attachStatus(res, subtree, this.idToObjRef);

					subtree.buf = res.data.mainTree;

					const subTree = subtree.buf.nodes;
					const subTreeId = subTree._id;

					subTree.parentId = treeId;

					// Correct main tree using incoming subtree for federation
					const nodeIdsToUpdate = this.idToObjRef[subTree.parentId].path.split('__');

					for (let i = nodeIdsToUpdate.length - 1; i >= 0; i--) {
						const nodeToUpdate = this.idToObjRef[nodeIdsToUpdate[i]];

						if (nodeToUpdate.children) {
							this.updateParentVisibilityByChildren(nodeToUpdate);
						} else if (nodeIdsToUpdate.length - 1 === i) {
							nodeToUpdate.toggleState = subTree.toggleState;
						}
					}

					Object.assign(mainTree.subModelIdToPath, subtree.idToPath);

					this.idToObjRef[treeId].children = [subTree];
					this.idToObjRef[treeId].hasSubModelTree = true;
					subTreesById[subTreeId] = subTree;

				})
				.catch((res) => {
					this.attachStatus(res, subtree, this.idToObjRef);
					console.warn('Subtree issue: ', res);
				});

			awaitedSubTrees.push(getSubTree);

		}

	}

	public attachStatus(res: any, tree: any, idToObjRef: any) {
		if (res.status === 401) {
			tree.status = 'NO_ACCESS';
		}

		if (res.status === 404) {
			tree.status = 'NOT_FOUND';
		}

		if (tree.status) {
			idToObjRef[tree._id].status = tree.status;
		}
	}

	public search(searchString: string, revision: string) {
		let url;
		if (!revision) {
			url = `${this.baseURL}searchtree.json?searchString=${searchString}`;
		} else {
			url = `${this.baseURL}searchtree.json?searchString=${searchString}&rev=${revision}`;
		}
		return this.APIService.get(url);
	}

	public genMap(leaf: any, items: any) {

		const leafId = leaf._id;
		const sharedId = leaf.shared_id;

		if (leaf) {

			if (leaf.children) {
				leaf.children.forEach((child) => {
					this.genMap(child, items);
				});
			}
			items.uidToSharedId[leafId] = sharedId;
			items.sharedIdToUid[sharedId] = leafId;
			if (leaf.meta) {
				items.oIdToMetaId[leafId] = leaf.meta;
			}
		}

		return items;

	}

	public getMap() {

		// only do this once!
		if (!this.generatedMaps) {
			this.treeReady.promise.then((tree) => {
				this.treeMap = {
					oIdToMetaId: {},
					sharedIdToUid: {},
					uidToSharedId: {}
				};
				this.treeMap.idToMeshes = this.idToMeshes;
				this.generatedMaps = this.genMap(tree.nodes, this.treeMap);
				this.treeMapReady.resolve(this.generatedMaps);
			});
		}

		return this.treeMapReady.promise;

	}

	public getCurrentSelectedNodesAsArray() {
		return Object.keys(this.currentSelectedNodes).map((key) => this.currentSelectedNodes[key]);
	}

	public getCurrentSelectedNodes() {
		return this.currentSelectedNodes;
	}

	public setCurrentSelectedNodesFromArray(nodes) {
		this.currentSelectedNodes = {};
		for (let i = 0; i < nodes.length; i++) {
			this.currentSelectedNodes[nodes[i]._id] = nodes[i];
		}
	}

	public setCurrentSelectedNodes(nodes) {
		this.currentSelectedNodes = nodes;
	}

	public getNodesToShow() {
		return this.nodesToShow;
	}

	public getSubTreesById() {
		return this.subTreesById;
	}

	public setSubTreesById(value) {
		this.subTreesById = value;
	}

	public getCachedIdToPath() {
		return this.idToPath;
	}

	public setCachedIdToPath(value) {
		this.idToPath = value;
	}

	public setSubModelIdToPath(value) {
		this.subModelIdToPath = value;
	}

	/**
	 * Initialise the tree nodes to show to the first node.
	 * @param nodes	Array of root node to show.
	 */
	public initNodesToShow() {
		this.nodesToShow = [this.allNodes];
		this.nodesToShow[0].level = 0;
		this.nodesToShow[0].selected = this.SELECTION_STATES.unselected;
		this.expandTreeNode(this.nodesToShow[0]);
	}

	/**
	 * Get map of meshes and associated colours from an array of nodes
	 */
	public getMeshMapFromNodes(nodes: any) {

		if (!Array.isArray(nodes)) {
			console.error('getMeshMapFromNodes nodes is not an array: ', nodes);
			return;
		}

		const idToMeshes = this.treeMap.idToMeshes;

		if (!idToMeshes) {
			console.error('getMeshMapFromNodes - idToMeshes is not defined: ', idToMeshes);
			return;
		}

		const highlightMap = {};

		let stack = nodes;

		while (stack.length > 0) {

			const childNode = stack.pop();
			if (childNode === undefined) {
				console.error('childNode is undefined');
				continue;
			}

			const model = childNode.model || childNode.project;
			const key = childNode.account + '@' + model;

			if (highlightMap[key] === undefined) {
				highlightMap[key] = {};
			}

			// Check top level and then check if sub model of fed
			let meshes = childNode.type === 'mesh' ? [childNode._id] : idToMeshes[childNode._id];

			if (meshes === undefined && idToMeshes[key]) {
				meshes = idToMeshes[key][childNode._id];
			}

			if (meshes !== undefined) {

				if (highlightMap[key].meshes === undefined) {
					highlightMap[key].meshes = meshes;
				} else {
					highlightMap[key].meshes = highlightMap[key].meshes.concat(meshes);
				}

			} else if (childNode.children) {
				// This should only happen in federations.
				// Traverse down the tree to find submodel nodes
				stack = stack.concat(childNode.children);
			}
		}

		return highlightMap;
	}

	/**
	 * Helper function for updateParentVisibility which updates toggleState for given node only.
	 * @param node	Node to update.
	 */
	public updateParentVisibilityByChildren(node: any) {
		if (node.children) {
			let visibleChildCount = 0;
			let parentOfInvisibleChildCount = 0;

			for (let i = 0; 0 === parentOfInvisibleChildCount && node.children && i < node.children.length; i++) {
				switch (node.children[i].toggleState) {
					case this.VISIBILITY_STATES.visible:
						visibleChildCount++;
						break;
					case this.VISIBILITY_STATES.parentOfInvisible:
						parentOfInvisibleChildCount++;
						break;
				}
			}

			if (parentOfInvisibleChildCount > 0) {
				node.toggleState = this.VISIBILITY_STATES.parentOfInvisible;
			} else if (node.children.length === visibleChildCount) {
				node.toggleState = this.VISIBILITY_STATES.visible;
			} else if (0 === visibleChildCount) {
				this.setNodeSelection(node, this.SELECTION_STATES.unselected);
				this.ViewerService.unhighlightObjects({
					account: node.account,
					model: node.model,
					ids: node.meshes
				});
				node.toggleState = this.VISIBILITY_STATES.invisible;
			} else {
				node.toggleState = this.VISIBILITY_STATES.parentOfInvisible;
			}
		}
	}

	/**
	 * Update toggleState of given node based on its children and
	 * traverse up the tree if necessary and call updateModelVisibility
	 * @param node	Node to update.
	 */
	public updateParentVisibility(node: any) {

		const nodes = [node];

		while (nodes.length > 0) {
			const currentNode = nodes.pop();

			// Store the state before it's potentially changed
			// by updateParentVisibility
			const priorToggleState = currentNode.toggleState;

			this.updateParentVisibilityByChildren(currentNode);

			if (priorToggleState !== currentNode.toggleState || this.isLeafNode(currentNode)) {
				const path = this.getPath(currentNode._id);

				if (path && path.length > 1) {
					// Fast forward up path for parentOfInvisible state
					if (this.VISIBILITY_STATES.parentOfInvisible === currentNode.toggleState) {
						for (let i = path.length - 2; i >= 0; i--) {
							const parentNode = this.getNodeById(path[i]);
							parentNode.toggleState = this.VISIBILITY_STATES.parentOfInvisible;
						}
					} else {
						nodes.push(this.getNodeById(path[path.length - 2]));
					}
				}
			}
		}

	}

	/**
	 * Toggle a node to expand or collapse it
	 * @param event the click event
	 * @param nodeId the id of the node to toggle
	 */
	public toggleNodeExpansion(event: any, nodeId: string) {

		if (event) {
			event.stopPropagation();
		}

		const nodeToExpand = this.getNodeById(nodeId);
		if (nodeToExpand.children && nodeToExpand.children.length > 0) {
			if (nodeToExpand.expanded) {
				this.collapseTreeNode(nodeToExpand);
			} else {
				this.expandTreeNode(nodeToExpand);
			}
		}
	}

	/**
	 * Return a normalised path fo ra given object ID
	 * This will fix paths for federations.
	 * @param objectID the id of the node to get a path for
	 */
	public getPath(objectID: string) {
		let path;

		if (this.idToPath[objectID]) {
			// If the Object ID is on the main tree then use that path
			path = this.idToPath[objectID].split('__');
		} else if (this.subModelIdToPath[objectID]) {
			// Else check the submodel for the id for the path
			path = this.subModelIdToPath[objectID].split('__');
			const subtree = this.subTreesById[path[0]];
			const parentPath = this.idToObjRef[subtree.parentId].path.split('__');
			path = parentPath.concat(path);
		} else {
			path = this.getNodeById(objectID).path.split('__');
		}

		return path;
	}

	/**
	 * Hide a collection of nodes.
	 * @param nodes	Array of nodes to be hidden.
	 */
	public hideTreeNodes(nodes: any[]) {
		this.setTreeNodeStatus(nodes, this.VISIBILITY_STATES.invisible);
		this.updateModelVisibility();
	}

	/**
	 * Show a collection of nodes.
	 * @param nodes	Array of nodes to be shown.
	 */
	public showTreeNodes(nodes: any[]) {
		this.setTreeNodeStatus(nodes, this.VISIBILITY_STATES.visible);
		this.updateModelVisibility();
	}

	/**
	 * Hide all tree nodes.
	 */
	public hideAllTreeNodes(updateModel) {
		this.setTreeNodeStatus([this.allNodes], this.VISIBILITY_STATES.invisible);
		if (updateModel) {
			this.updateModelVisibility();
		}
	}

	/**
	 * Show all tree nodes.
	 */
	public showAllTreeNodes(updateModel) {
		this.setTreeNodeStatus([this.allNodes], this.VISIBILITY_STATES.visible);

		// It's not always necessary to update the model
		// say we are resetting the state to then show/hide specific nodes
		if (updateModel) {
			this.updateModelVisibility();
		}
	}

	/**
	 * Hide selected objects
	 */
	public hideSelected() {

		const selected = this.getCurrentSelectedNodesAsArray();
		if (selected && selected.length) {
			this.hideTreeNodes(selected);
		}

	}

	/**
	 * Isolate selected objects by hiding all other objects.
	 */
	public isolateSelected() {

		const selectedNodes = this.getCurrentSelectedNodesAsArray();

		// Hide all
		this.hideAllTreeNodes(true); // We can just reset the state without hiding in the UI
		// Show selected
		if (selectedNodes) {
			this.showTreeNodes(selectedNodes);
			this.setCurrentSelectedNodesFromArray(selectedNodes);
		}
	}

	/**
	 * @returns	True if IFC spaces are not hidden or node is not an IFC space.
	 */
	public canShowNode(node: any) {
		return !(this.state.hideIfc && (
			(node.defaultState && this.VISIBILITY_STATES.invisible === node.defaultState) ||
			this.getHiddenByDefaultNodes().indexOf(node) !== -1));
	}

	/**
	 * @returns	True if node claims it has no children.
	 */
	public isLeafNode(node: any) {
		return !node.children || !node.children || node.children.length === 0;
	}

	/**
	 * Handle visibility changes from tree service to viewer service.
	 * @param clickedIds	Collection of ids to show/hide.
	 * @param visible	Set ids to visibile.
	 */
	public handleVisibility(clickedIds: any, visible: boolean) {

		const objectIds = {};

		for (const id in clickedIds) {
			if (id) {
				const account = clickedIds[id].account;
				const model = clickedIds[id].model || clickedIds[id].project; // TODO: Kill .project from backend
				const key = account + '@' + model;

				if (!objectIds[key]) {
					objectIds[key] = [];
				}

				objectIds[key].push(id);
			}
		}

		// Update viewer object visibility
		for (const key in objectIds) {
			if (key) {
				const vals = key.split('@');
				const account = vals[0];
				const model = vals[1];

				if (this.ViewerService.viewer) {

					this.ViewerService.switchObjectVisibility(
						account,
						model,
						objectIds[key],
						visible
					);

				}

			}
		}
	}

	/**
	 * Unselect all selected items and clear the array
	 */
	public clearCurrentlySelected() {

		this.ViewerService.clearHighlights();
		this.DocsService.closeDocs();

		const visitedNodes = {};

		for (const id in this.currentSelectedNodes) {

			if (!id || visitedNodes[id]) { continue; }

			const currentNode = this.currentSelectedNodes[id];

			currentNode.selected = this.SELECTION_STATES.unselected;

			// Skip over any parent that has been visited
			const parentPath = this.getPath(currentNode._id);
			parentPath.pop(); // Remove the node itself

			for (let i = parentPath.length - 1; i >= 0; i--) {
				const parentId = parentPath[i];
				if (visitedNodes[parentId]) {
					break;
				}
				visitedNodes[parentId] = true;
				this.getNodeById(parentId).selected =  this.SELECTION_STATES.unselected;
			}

			visitedNodes[currentNode._id] = true;
		}

		this.currentSelectedNodes = {};
	}

	/**
	 * Set selection status of node.
	 * @param node node to set selection status of
	 * @param selectedState the new selection state of the node
	 */
	public setNodeSelection(node: any, selectedState: number) {

		let nodes: any[] = [node];

		const select = selectedState === this.SELECTION_STATES.selected;
		while (nodes.length) {
			const currentNode = nodes.pop();
			if (currentNode) {
				if (currentNode.toggleState !== this.VISIBILITY_STATES.invisible) {

					if (!select) {
						currentNode.selected = this.SELECTION_STATES.unselected;
						if (this.currentSelectedNodes[currentNode._id]) {
							delete this.currentSelectedNodes[currentNode._id];
						}
					} else if (currentNode.toggleState === this.VISIBILITY_STATES.parentOfInvisible) {
						currentNode.selected = this.SELECTION_STATES.parentOfUnselected;
					} else {
						currentNode.selected = this.SELECTION_STATES.selected;
						this.currentSelectedNodes[currentNode._id] = currentNode;
					}

					if (currentNode.children && currentNode.children.length) {
						nodes = nodes.concat(currentNode.children);
					}
				}
			}
		}

		this.setSelectionOnParentNodes(node, selectedState);

	}

	/**
	 * Return a map of currently selected meshes
	 */
	public getCurrentMeshHighlights() {
		return this.onReady().then(() => {
			return this.getMeshMapFromNodes(this.getCurrentSelectedNodesAsArray());
		});
	}

	public nodesClicked(nodes: any[], skipExpand?: boolean) {
		const addGroup = this.MultiSelectService.isAccumMode();
		const removeGroup = this.MultiSelectService.isDecumMode();
		const multi = addGroup || removeGroup;

		if (!multi) {
			// If it is not multiselect mode, remove all highlights
			this.clearCurrentlySelected();
		}

		if (removeGroup) {
			this.deselectNodes(nodes);
		} else {
			this.selectNodes(nodes, skipExpand);
		}
	}

	/**
	 * Deselect a nodes in the tree.
	 * @param nodes	Node to select.
	 */
	public deselectNodes(nodes: any[]) {
		nodes = this.sanitiseNodeArray(nodes);
		const actionNodes = [];
		for (let i = 0; i < nodes.length; i++) {
			if (nodes[i].selected !== this.SELECTION_STATES.unselected) {
				this.setNodeSelection(nodes[i], this.SELECTION_STATES.unselected);
				actionNodes.push(nodes[i]);
			}
		}

		return this.onReady().then(() => {

			const highlightMap = this.getMeshMapFromNodes(actionNodes);

			for (const key in highlightMap) {
				if (!highlightMap.hasOwnProperty(key)) {
					continue;
				}

				const vals = key.split('@');
				const account = vals[0];
				const model = vals[1];

				this.ViewerService.unhighlightObjects({
					account,
					model,
					ids: highlightMap[key].meshes
				});

			}

			return highlightMap;
		});

	}

	/**
	 * Select nodes in the tree.
	 * @param nodes	Nodes to select.
	 * @param colour the colour array for selection in the viewer
	 */
	public selectNodes(nodes: any[], skipExpand?: boolean, colour?: number[]): any {

		if (!nodes || nodes.length === 0) {
			return Promise.resolve('No nodes specified');
		}

		nodes = this.sanitiseNodeArray(nodes);

		for (let i = 0; i < nodes.length; i++) {
			this.setNodeSelection(nodes[i], this.SELECTION_STATES.selected);
		}

		const lastNode = nodes[nodes.length - 1];
		this.handleMetadata(lastNode);

		if (!skipExpand) {
			this.expandToNode(lastNode);
		}
		return this.onReady().then(() => {
			const highlightMap = this.getMeshMapFromNodes(nodes);
			for (const key in highlightMap) {

				if (highlightMap[key].meshes) {
					const meshes = highlightMap[key].meshes.filter((mesh) => {
						return this.idToNodeMap[mesh].selected === this.SELECTION_STATES.selected;
					});

					if (meshes.length > 0) {
						const vals = key.split('@');
						const account = vals[0];
						const model = vals[1];
						// Separately highlight the children
						// but only for multipart meshes
						this.ViewerService.highlightObjects({
							account,
							ids: meshes,
							colour,
							model,
							multi: true,
							source: 'tree',
							forceReHighlight : true
						});
					}

				}

			}
			return highlightMap;

		});
	}

	/**
	 * Show metadata in the metadata panel if necessary
	 * @param node the node to show the metadata for
	 */
	public handleMetadata(node: any) {

		if (node && node.meta) {
			this.DocsService.displayDocs(
				node.account,
				node.model || node.project,
				node.meta
			);
		}

	}

	/**
	 * Get a series of nodes with unique ID bu a series of objects that contain a shared_id
	 * @param objects the array of shared id objects
	 */
	public getNodesFromSharedIds(objects: any) {
		if (!objects || objects.length === 0) {
			return Promise.resolve([]);
		}

		return this.onReady().then(() => {

			const nodes = [];

			for (let i = 0; i < objects.length; i++) {
				for (let j = 0; objects[i].shared_ids && j < objects[i].shared_ids.length; j++) {
					const objUid = this.treeMap.sharedIdToUid[objects[i].shared_ids[j]];
					const node = this.getNodeById(objUid);
					if (node) {
						nodes.push(node);
					}
				}
				if (objects[i].shared_id) {
					const objUid = this.treeMap.sharedIdToUid[objects[i].shared_id];
					const node = this.getNodeById(objUid);
					if (node) {
						nodes.push(node);
					}
				}
			}

			return nodes;
		});
	}

	/**
	 * Show a series of nodes by an array of shared IDs (rather than unique IDs)
	 * @param objects	Nodes to show
	 */
	public showNodesBySharedIds(objects: any[]) {

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {
				this.showTreeNodes(nodes);
			})
			.catch((error) => {
				console.error(error);
			});

	}

	/**
	 * Select a series of nodes by an array of shared IDs (rather than unique IDs)
	 * @param objects	Nodes to select
	 * @param multi	Is multi select enabled
	 * @param colour the colour to highlight
	 * @param forceReHighlight force a rehighlighting to a new colour (overrides toggle)
	 */
	public selectNodesBySharedIds(objects: any[],  colour?: number[]) {

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {
				return this.selectNodes(nodes, false, colour);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	/**
	 * Select a series of nodes by an array of uniqueIDs
	 * @param ids ids to click
	 */
	public nodesClickedByIds( ids: string[]) {
		return this.onReady().then(() => {
			const nodes = ids.map((id) => this.getNodeById(id));
			return this.nodesClicked(nodes);
		}).catch((error) => {
			console.error(error);
		});
	}

	/**
	 * Select a series of nodes by an array of shared IDs (rather than unique IDs)
	 * @param objects	Nodes to select
	 */
	public nodesClickedBySharedIds(objects: any[]) {

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {
				return this.nodesClicked(nodes);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	/**
	 * Isolate selected objects by their shared IDs
	 * @param objects an array of objects with shared_id properties
	 */
	public isolateNodesBySharedIds(objects) {

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {
				this.setCurrentSelectedNodesFromArray(nodes);

				this.isolateSelected();

			})
			.catch((error) => {
				console.error(error);
			});

	}

	/**
	 * Hide series of nodes by an array of shared IDs (rather than unique IDs)
	 * @param objects objects to hide
	 */
	public hideNodesBySharedIds(objects: any[]) {

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {
				this.hideTreeNodes(nodes);
			})
			.catch((error) => {
				console.error(error);
			});

	}

	/**
	 * @returns	List of nodes that are hidden by default (usu. IFC space).
	 */
	public getHiddenByDefaultNodes() {
		return this.hiddenByDefaultNodes;
	}

	/**
	 * @returns	Value of IFC spaces hidden.
	 */
	public getHideIfc() {
		return this.state.hideIfc;
	}

	/**
	 * @param value	Are IFC spaces hidden.
	 */
	public setHideIfc(value: boolean) {
		this.state.hideIfc = value;
	}

	/**
	 * @param id	ID of node.
	 * @returns	Node with corresponding ID.
	 */
	public getNodeById(id: string) {
		return this.idToNodeMap[id];
	}

	/**
	 * Sets the collection of all nodes and calls generateIdToNodeMap().
	 * @param nodes	Collection of all nodes.
	 */
	public setAllNodes(root) {
		this.allNodes = root;
		this.idToNodeMap = {};
		this.hiddenByDefaultNodes = [];
		let processNodes = [root];

		while (processNodes.length > 0) {
			const node = processNodes.pop();

			this.idToNodeMap[node._id] = node;

			if (node.toggleState === this.VISIBILITY_STATES.invisible) {
				this.hiddenByDefaultNodes.push(node);
			}
			node.defaultState = node.toggleState;
			node.canExpand = node.children && node.children.length > 0;
			if (node.canExpand) {
				node.canExpand = false;
				for (let idx = 0; idx < node.children.length; ++idx) {
					const child = node.children[idx];
					if (!(child.type === 'mesh' && (!child.name || child.name === ''))) {
						// There is at least 1 child with name or not a mesh, allow expand
						node.canExpand = true;
						break;
					}
				}

				processNodes = processNodes.concat(node.children);
			} else if (node.type === 'mesh' && (!node.name || node.name === '')) {
				node.ignore = true;
			}

		}
	}

	/**
	 * @returns	Collection of all nodes.
	 */
	public getAllNodes() {
		return this.allNodes;
	}

	/**
	 * Given a node expand the UI tree to that node and select it
	 * @param path the path array to traverse down
	 * @param level the level to start expanding at (generally the root node)
	 */
	private expandToNode(nodeToExpand: any) {
		const path = nodeToExpand ?  this.getPath(nodeToExpand._id) : undefined;

		if (path) {
			let selectedIndex;
			for (let i = 0; i < path.length; i++) {
				const node = this.getNodeById(path[i]);

				this.expandTreeNode(node, true, path[i + 1]);

				// If it's the last node in the path
				// scroll to it
				if (i === path.length - 1) {
					selectedIndex = this.nodesToShow.indexOf(node);

					if (selectedIndex === -1) {
						// Sometimes we have an edge case where an object doesn't exist in the tree
						// because it has no name. It is often objects like a window, so what we do
						// is select its parent object to highlight that instead
						const specialNodeParent = this.getNodeById(path[i - 1]);
						selectedIndex =  this.nodesToShow.indexOf(specialNodeParent);
					}
				}
			}

			this.selectedIndex = selectedIndex;
			return Promise.resolve(selectedIndex);
		} else {
			return Promise.reject('Failed to find path for node');
		}

	}

		/**
	* Collapse a given tree node in the UI
	* @param nodeToCollapse the node to collapse
	*/
	private collapseTreeNode(nodeToCollapse: any) {

		if (nodeToCollapse.expanded) {

			const startIdx = this.nodesToShow.indexOf(nodeToCollapse) + 1;
			const startLevel = nodeToCollapse.level;
			nodeToCollapse.expanded = false;

			let idx = startIdx;

			// collapse every descendent
			while (this.nodesToShow.length > idx && this.nodesToShow[idx].level > startLevel) {
				this.nodesToShow[idx++].expanded = false;
			}

			const beyondCollapsed = this.nodesToShow.length === idx ? [] : this.nodesToShow.slice(idx);
			this.nodesToShow = this.nodesToShow.slice(0, startIdx).concat(beyondCollapsed);
		}
	}

	/**
	 * Expand a given tree node in the UI
	 * @param nodeToExpand the path array to traverse down
	 */
	private expandTreeNode(nodeToExpand: any, collapseChildren?: boolean, exemptChild?: any) {

		if (!nodeToExpand.expanded && nodeToExpand.children && nodeToExpand.children.length > 0) {

			const nodeToExpandIndex = this.nodesToShow.indexOf(nodeToExpand);
			const numChildren = nodeToExpand.children.length;

			const childrenToAdd = [];

			let position = 0; // We don't want to use i as some childNodes aren't displayed (no name)
			for (let i = 0; i < numChildren; i++) {

				const childNode = nodeToExpand.children[i];
				childNode.level = nodeToExpand.level + 1;

				if (childNode && childNode.hasOwnProperty('name')) {
					if (this.nodesToShow.indexOf(childNode) === -1) {
						childrenToAdd.push(childNode);
						position++;
					}
				}

				if (collapseChildren && exemptChild !== childNode._id) {
					this.collapseTreeNode(childNode);
				}

			}

			// using slice + concat instead of splice to avoid really slow processing when numChildren is massive (e.g. 100000)
			this.nodesToShow = this.nodesToShow.slice(0, nodeToExpandIndex + 1)
					.concat(childrenToAdd, this.nodesToShow.slice(nodeToExpandIndex + 1));
			nodeToExpand.expanded = true;
		}

	}

	/**
	 *  Return the array, sanitised - switching any hidden children to
	 *  it's parent node.
	 *  @param an array of nodes
	 *  @return an array of nodes where any hidden node would be replaced by its parents
	 */
	private sanitiseNodeArray(nodes: any[]) {
		return nodes.map((node) => {
			if (node) {
				if (node.ignore) {
					const path = node.path.split('__');
					return this.getNodeById(path[path.length - 2]);

				} else {
					return node;
				}
			}

		});
	}

	/**
	 * Set the selection state of a nodes parents to represent it's children
	 * @param currentNode the node who's parents to traverse up
	 * @param triggerState the state of the child who triggered this update
	 */
	private setSelectionOnParentNodes(currentNode: any, triggerState: number): any[] {
		const parentPath = this.getPath(currentNode._id);
		parentPath.pop(); // Remove the node itself
		const seenParents = [];

		for (let i = parentPath.length - 1; i >= 0; i--) {
			const parentNode = this.getNodeById(parentPath[i]);
			seenParents.push(parentNode);

			let sameState = true;

			for (let j = 0; j < parentNode.children.length; j++) {
				const n = parentNode.children[j];
				if (n.selected !== undefined) {
					sameState = sameState && (n.selected === triggerState);
					if (!sameState) {
						break;
					}
				}
			}

			if (sameState) {
				// if all siblings has the same state as the triggerState, then parent should take up the same state
				parentNode.selected = triggerState;
			} else {
				// some siblings have different state, so parent must be a parent of unselected.
				parentNode.selected = this.SELECTION_STATES.parentOfUnselected;
			}
		}

		return seenParents;
	}

	private setTreeNodeStatus(nodes: any[], visibility: string) {
		if (nodes.length && visibility === this.VISIBILITY_STATES.invisible) {
			this.deselectNodes(nodes);
		}
		nodes.forEach((node) => {
			if (node && (this.VISIBILITY_STATES.parentOfInvisible === visibility || visibility !== node.toggleState)) {
				let children = [];
				const leafNodes = [];
				const parentNode = node;

				if (node.children) {
					children = children.concat(node.children);
				} else {
					children = [node];
				}

				if (node.type === 'mesh') {
					this.meshesToUpdate.add(node);
				}

				while (children.length > 0) {
					const child = children.pop();

					if (child.toggleState !== visibility) {
						if (child.type === 'mesh') {
							this.meshesToUpdate.add(child);
						}

						if (child.children) {
							children = children.concat(child.children);
						}
					}

					if (!child.hasOwnProperty('defaultState')) {
						// FIXME: why can't this be merged with if defaultState exists?
						if (visibility === this.VISIBILITY_STATES.visible && this.canShowNode(child)) {
							child.toggleState = this.VISIBILITY_STATES.visible;
						} else {
							this.setNodeSelection(child, this.SELECTION_STATES.unselected);
							child.toggleState = this.VISIBILITY_STATES.invisible;
						}
					} else {
						if (visibility === this.VISIBILITY_STATES.visible) {
							child.toggleState = (this.getHideIfc()) ? child.defaultState : this.VISIBILITY_STATES.visible;
						} else {
							this.setNodeSelection(child, this.SELECTION_STATES.unselected);
							child.toggleState = this.VISIBILITY_STATES.invisible;
						}
					}
				}

				this.updateParentVisibility(parentNode);
			}
		});
	}

	/**
	 * Apply changes to the viewer.
	 * @param node	Node to toggle visibility. All children will also be toggled.
	 */
	private updateModelVisibility() {

		return this.onReady().then(() => {

			if (this.meshesToUpdate.size > 0) {
				const hidden = {};
				const shown = {};

				this.meshesToUpdate.forEach((meshNode) => {
					const model = meshNode.model || meshNode.project;
					const key = meshNode.account + '@' + model;

					if (meshNode.toggleState === this.VISIBILITY_STATES.invisible) {
						hidden[meshNode._id] = meshNode;
					} else {
						shown[meshNode._id] = meshNode;
					}
				});

				this.handleVisibility(hidden, false);
				this.handleVisibility(shown, true);
			}
			this.meshesToUpdate.clear();
		});
	}
}

export const TreeServiceModule = angular
	.module('3drepo')
	.service('TreeService', TreeService);
