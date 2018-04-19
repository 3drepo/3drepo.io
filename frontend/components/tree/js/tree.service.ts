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
		"$q",
		"APIService",
		"ViewerService",
		"DocsService",
	];

	public highlightSelectedViewerObject;
	public highlightMap;
	public highlightMapUpdateTime;
	public selectionDataUpdateTime;
	public visibilityUpdateTime;
	public selectedIndex;
	public treeReady;

	private state;
	private treeMap = null;
	private idToMeshes;
	private baseURL;

	private allNodes;
	private currentSelectedNodes;
	private clickedHidden;
	private clickedShown;
	private nodesToShow;
	private subTreesById;
	private subModelIdToPath;
	private idToNodeMap;
	private shownByDefaultNodes;
	private hiddenByDefaultNodes;
	private treeMapReady;
	private generatedMaps;
	private ready;
	private idToPath;
	private idToObjRef;

	constructor(
		private $q: ng.IQService,
		private APIService,
		private ViewerService,
		private DocsService,
	) {
		this.reset();

	}

	public reset() {

		this.ready = this.$q.defer();
		this.treeReady = this.$q.defer();
		this.treeMapReady = this.$q.defer();
		this.generatedMaps = null;

		this.state = {};
		this.state.hideIfc = true;
		this.allNodes = [];
		this.idToPath = {};
		this.currentSelectedNodes = [];
		this.clickedHidden = {}; // or reset?
		this.clickedShown = {}; // or reset?
		this.nodesToShow = [];
		this.subTreesById = {};
		this.subModelIdToPath = {};
		this.idToObjRef = {};
		this.highlightMapUpdateTime = Date.now();
		this.highlightSelectedViewerObject = true;
	}

	public onReady() {
		return this.ready.promise;
	}

	/**
	 * @param value	True if OBJECT_SELECTED should be handled by component
	 */
	public setHighlightSelected(value: boolean) {
		this.highlightSelectedViewerObject = value;
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
		branch = branch ? branch : "master";

		// revision = revision ? revision : "head";

		if (!revision) {
			this.baseURL = account + "/" + model + "/revision/master/head/";
		} else {
			this.baseURL = account + "/" + model + "/revision/" + revision + "/";
		}

		const url = this.baseURL + "fulltree.json";

		const meshesAndTrees = [
			this.getIdToMeshes(),
			this.getTrees(url, setting),
		];

		return Promise.all(meshesAndTrees)
			.then((meshAndTreeData) => {
				const tree = meshAndTreeData[1];
				this.setAllNodes([tree.nodes]);
				this.setSubTreesById(tree.subTreesById);
				this.setCachedIdToPath(tree.idToPath);
				this.setSubModelIdToPath(tree.subModelIdToPath);
				return this.getMap().then(() => {
					this.ready.resolve(tree);
					return tree;
				});
			})
			.catch((error) => {
				console.error("Error resolving tree(s): ", error);
			});

	}

	public getIdToMeshes() {

		const url = this.baseURL + "idToMeshes.json";
		const options = {
			headers: {
				"Content-Type": "application/json",
			},
		};

		return this.APIService.get(url, options)
			.then((json) => {
				this.idToMeshes = json.data.idToMeshes;
			})
			.catch((error) => {
				console.error("Failed to get Id to Meshes:", error);
			});

	}

	public getTrees(url: string, setting: any) {

		return this.APIService.get(url, {
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((json) => {

				const mainTree = json.data.mainTree;

				// TODO: This needs sorting out.

				// replace model id with model name in the tree if it is a federate model
				if (setting.federate) {

					mainTree.nodes.name = setting.name;
					mainTree.nodes.children.forEach((child) => {
						const name = child.name.split(":");
						const subModel = setting.subModels.find((m) => {
							return m.model === name[1];
						});

						if (subModel) {
							name[1] = subModel.name;
							child.name = name.join(":");
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
				console.error("Tree Init Error:", error);
				this.reset();
			});
	}

	public handleIdToPath(mainTree, subTrees, subTreesById) {
		return this.getIdToPath()
				.then((idToPath) => {

					const awaitedSubTrees = [];

					if (idToPath && idToPath.treePaths) {

						mainTree.idToPath = idToPath.treePaths.idToPath;

						if (subTrees) {

							// idToObjRef only needed if model is a fed model.
							// i.e. subTrees.length > 0

							mainTree.subModelIdToPath = {};

							subTrees.forEach((subtree) => {

								const subtreeIdToPath = idToPath.treePaths.subModels.find((submodel) => {
									return subtree.model === submodel.model;
								});

								if (subtreeIdToPath) {
									subtree.idToPath = subtreeIdToPath.idToPath;
								}

								this.handleSubTree(
									subtree,
									mainTree,
									subTreesById,
									awaitedSubTrees,
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
					console.error("Error getting getIdToPath", error);
					this.reset();
				});

	}

	public getIdToPath() {

		const url = this.baseURL + "tree_path.json";
		return this.APIService.get(url, {
			headers: {
				"Content-Type": "application/json",
			},
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
					const nodeIdsToUpdate = this.idToObjRef[subTree.parentId].path.split("__");

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
					console.warn("Subtree issue: ", res);
				});

			awaitedSubTrees.push(getSubTree);

		}

	}

	public attachStatus(res: any, tree: any, idToObjRef: any) {
		if (res.status === 401) {
			tree.status = "NO_ACCESS";
		}

		if (res.status === 404) {
			tree.status = "NOT_FOUND";
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
					uidToSharedId: {},
				};
				this.treeMap.idToMeshes = this.idToMeshes;
				this.generatedMaps = this.genMap(tree.nodes, this.treeMap);
				this.treeMapReady.resolve(this.generatedMaps);
			});
		}

		return this.treeMapReady.promise;

	}

	public getCurrentSelectedNodes() {
		return this.currentSelectedNodes;
	}

	public setCurrentSelectedNodes(nodes) {
		this.currentSelectedNodes = nodes;
	}

	public getClickedHidden() {
		return this.clickedHidden;
	}

	public resetClickedHidden() {
		this.clickedHidden = {};
	}

	public getClickedShown() {
		return this.clickedShown;
	}

	public resetClickedShown() {
		this.clickedShown = {};
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
	public initNodesToShow(nodes) {
		// TODO: Is it a good idea to save tree state within each node?
		this.nodesToShow = nodes;
		this.nodesToShow[0].level = 0;
		this.nodesToShow[0].expanded = false;
		this.nodesToShow[0].selected = false;
		this.nodesToShow[0].hasChildren = this.nodesToShow[0].children;
	}

	/**
	 * Show the first set of children using the expand function but deselect the child used for this.
	 */
	public expandFirstNode() {
		if (this.nodesToShow.length > 0) {
			this.toggleNodeExpansion(null, this.nodesToShow[0]._id);
		}
	}

	/**
	 * Get map of meshes and associated colours from an array of nodes
	 */
	public getMeshMapFromNodes(nodes: any, idToMeshes: any, colour?: number[]) {

		if (!Array.isArray(nodes)) {
			console.error("getMeshMapFromNodes nodes is not an array: ", nodes);
			return;
		}

		if (!idToMeshes) {
			console.error("getMeshMapFromNodes - idToMeshes is not defined: ", idToMeshes);
			return;
		}

		const highlightMap = {};

		let stack = nodes;

		while (stack.length > 0) {

			const childNode = stack.pop();
			const model = childNode.model || childNode.project;
			const key = childNode.account + "@" + model;

			if (highlightMap[key] === undefined) {
				highlightMap[key] = {};
			}

			if (highlightMap[key].colour === undefined) {
				highlightMap[key].colour = colour;
			}

			// Check top level and then check if sub model of fed
			let meshes = idToMeshes[childNode._id];

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
					case "visible":
						visibleChildCount++;
						break;
					case "parentOfInvisible":
						parentOfInvisibleChildCount++;
						break;
				}
			}

			if (parentOfInvisibleChildCount > 0) {
				node.toggleState = "parentOfInvisible";
			} else if (node.children.length === visibleChildCount) {
				node.toggleState = "visible";
			} else if (0 === visibleChildCount) {
				node.toggleState = "invisible";
				this.setNodeSelection(node, false);
			} else {
				node.toggleState = "parentOfInvisible";
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

		while (nodes && nodes.length > 0) {
			const currentNode = nodes.pop();

			// Store the state before it's potentially changed
			// by updateParentVisibility
			const priorToggleState = currentNode.toggleState;

			this.updateParentVisibilityByChildren(currentNode);

			if (priorToggleState !== currentNode.toggleState || this.isLeafNode(currentNode)) {
				const path = this.getPath(currentNode._id);

				if (path && path.length > 1) {
					// Fast forward up path for parentOfInvisible state
					if ("parentOfInvisible" === currentNode.toggleState) {
						for (let i = path.length - 2; i >= 0; i--) {
							const parentNode = this.getNodeById(path[i]);
							parentNode.toggleState = "parentOfInvisible";
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

		// Find node index
		const nodeIndex = this.nodesToShow.indexOf(nodeToExpand);

		if (nodeIndex !== -1 && nodeToExpand.children && nodeToExpand.children.length > 0) {
			if (nodeToExpand.expanded) {
				this.collapseTreeNode(nodeToExpand);
			} else {
				this.expandTreeNode(nodeToExpand);
			}
		}
	}

	/**
	* Collapse a given tree node in the UI
	* @param nodeToCollapse the node to collapse
	*/
	public collapseTreeNode(nodeToCollapse: any) {

		let subNodes = [];
		if (nodeToCollapse.children) {
			subNodes = subNodes.concat(nodeToCollapse.children);
		}

		nodeToCollapse.expanded = false;

		while (subNodes.length > 0) {

			const subNodeToCollapse = subNodes.pop();

			// Collapse the node
			if (subNodeToCollapse.expanded) {
				// If it has children lets collapse those too
				if (subNodeToCollapse.children) {
					subNodes = subNodes.concat(subNodeToCollapse.children);
				}
				subNodeToCollapse.expanded = false;
			}

			// Remove the node from the visible tree
			const subNodeToCollapseIndex = this.nodesToShow.indexOf(subNodeToCollapse);

			if (subNodeToCollapseIndex !== -1) {
				this.nodesToShow.splice(subNodeToCollapseIndex, 1);
			}
		}
	}

	/**
	 * Expand a given tree node in the UI
	 * @param nodeToExpand the path array to traverse down
	 */
	public expandTreeNode(nodeToExpand: any) {

		if (nodeToExpand.children && nodeToExpand.children.length > 0) {

			const nodeToExpandIndex = this.nodesToShow.indexOf(nodeToExpand);
			const numChildren = nodeToExpand.children.length;

			let position = 0; // We don't want to use i as some childNodes aren't displayed (no name)
			for (let i = 0; i < numChildren; i++) {

				const childNode = nodeToExpand.children[i];
				childNode.level = nodeToExpand.level + 1;

				if (childNode && childNode.hasOwnProperty("name")) {
					if (this.nodesToShow.indexOf(childNode) === -1) {
						this.nodesToShow.splice(nodeToExpandIndex + position + 1, 0, childNode);
						position++;
					}
				}

			}
			nodeToExpand.expanded = true;
		}

	}

	/**
	 * Given a node expand the UI tree to that node and select it
	 * @param path the path array to traverse down
	 * @param level the level to start expanding at (generally the root node)
	 * @param noHighlight whether no highlighting should take place
	 * @param multi wether multiple nodes are selected in the selection
	 */
	public expandToSelection(path: any[], level: number, noHighlight: boolean, multi: boolean) {

		let selectedIndex;

		// Cut it to the level provided
		path = path.slice(level, path.length);

		for (let i = 0; i < path.length; i++) {
			const node = this.getNodeById(path[i]);
			const nextNode = this.getNodeById(path[i + 1]);

			this.expandTreeNode(node);

			// Collapse all the children that aren't next
			// down the expansion path
			if (node.children) {
				node.children.forEach((n) => {
					if (n !== nextNode || nextNode === undefined) {
						this.collapseTreeNode(n);
					}
				});
			}

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

		if (!noHighlight) {

			return this.selectNodes([this.nodesToShow[selectedIndex]], multi, undefined, false).then(() => {
				this.selectedIndex = selectedIndex;
				return selectedIndex;
			});

		}

		this.selectedIndex = selectedIndex;
		return Promise.resolve(selectedIndex);

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
			path = this.idToPath[objectID].split("__");
		} else if (this.subModelIdToPath[objectID]) {
			// Else check the submodel for the id for the path
			path = this.subModelIdToPath[objectID].split("__");
			const subtree = this.subTreesById[path[0]];
			const parentPath = this.idToObjRef[subtree.parentId].path.split("__");
			path = parentPath.concat(path);
		} else {
			path = this.getNodeById(objectID).path.split("__");
		}

		return path;
	}

	/**
	 * Set the given visibility of a set of nodes
	 * @param nodes	Array of nodes to be hidden.
	 */
	public setVisibilityOfNodes(nodes: any[], visibility: string) {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (node && node.toggleState !== visibility) {
				this.setTreeNodeStatus(node, visibility);
			}
		}
	}

	/**
	 * Hide a collection of nodes.
	 * @param nodes	Array of nodes to be hidden.
	 */
	public hideTreeNodes(nodes: any[]) {
		this.setVisibilityOfNodes(nodes, "invisible");
		this.updateModelVisibility(this.allNodes[0]);
	}

	/**
	 * Show a collection of nodes.
	 * @param nodes	Array of nodes to be shown.
	 */
	public showTreeNodes(nodes: any[]) {
		this.setVisibilityOfNodes(nodes, "visible");
		this.updateModelVisibility(this.allNodes[0]);
	}

	public setTreeNodeStatus(node: any, visibility: string) {

		if (node && ("parentOfInvisible" === visibility || visibility !== node.toggleState)) {
			const priorToggleState = node.toggleState;

			let children = [];
			const leafNodes = [];
			const parentNode = node;

			if (node.children) {
				children = children.concat(node.children);
			} else {
				children = [node];
			}

			while (children.length > 0) {
				const child = children.pop();

				if (child.children && child.toggleState !== visibility) {
					children = children.concat(child.children);
				}

				if (!child.hasOwnProperty("defaultState")) {
					if (visibility === "visible" && this.canShowNode(child)) {
						child.toggleState = "visible";
					} else {
						child.toggleState = "invisible";
						this.setNodeSelection(child, false);
					}
				} else {
					if (visibility === "visible") {
						child.toggleState = (this.getHideIfc()) ? child.defaultState : "visible";
					} else {
						child.toggleState = "invisible";
						this.setNodeSelection(child, false);
					}
				}
			}

			this.updateParentVisibility(parentNode);
		}
	}

	/**
	 * Hide all tree nodes.
	 */
	public hideAllTreeNodes(updateModel) {
		this.setTreeNodeStatus(this.allNodes[0], "invisible");
		if (updateModel) {
			this.updateModelVisibility(this.allNodes[0]);
		}
	}

	/**
	 * Show all tree nodes.
	 */
	public showAllTreeNodes(updateModel) {
		this.setTreeNodeStatus(this.allNodes[0], "visible");

		// It's not always necessary to update the model
		// say we are resetting the state to then show/hide specific nodes
		if (updateModel) {
			this.updateModelVisibility(this.allNodes[0]);
		}
	}

	/**
	 * Hide selected objects
	 */
	public hideSelected() {

		const selected = this.getCurrentSelectedNodes().concat();
		if (selected && selected.length) {
			this.hideTreeNodes(selected);
		}

	}

	/**
	 * Isolate selected objects by hiding all other objects.
	 */
	public isolateSelected() {

		const selectedNodes = this.getCurrentSelectedNodes().concat();

		// Hide all
		this.hideAllTreeNodes(false); // We can just reset the state without hiding in the UI
		// Show selected
		if (selectedNodes) {
			this.setCurrentSelectedNodes(selectedNodes);
			this.showTreeNodes(selectedNodes);
		}
	}

	/**
	 * @returns	True if IFC spaces are not hidden or node is not an IFC space.
	 */
	public canShowNode(node: any) {
		return !(this.state.hideIfc && (
			(node.defaultState && "invisible" === node.defaultState) ||
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
				const key = account + "@" + model;

				if (!objectIds[key]) {
					objectIds[key] = [];
				}

				objectIds[key].push(id);
			}
		}

		// Update viewer object visibility
		for (const key in objectIds) {
			if (key) {
				const vals = key.split("@");
				const account = vals[0];
				const model = vals[1];

				if (this.ViewerService.viewer) {

					this.ViewerService.switchObjectVisibility(
						account,
						model,
						objectIds[key],
						visible,
					);
				}

			}
		}
	}

	/**
	 * Update the state of clickedHidden and clickedShown, which are used by tree component
	 * to apply changes to the viewer.
	 * @param node	Node to toggle visibility. All children will also be toggled.
	 */
	public updateModelVisibility(node) {

		return this.ready.promise.then(() => {

			const childNodes = this.getMeshMapFromNodes([node], this.treeMap.idToMeshes);

			for (const key in childNodes) {
				if (!key) {
					continue;
				}
				const childMeshes = childNodes[key].meshes;

				if (!childMeshes) {
					continue;
				}

				for (let i = 0; i < childMeshes.length; i++) {

					const id  = childMeshes[i];
					const childNode = this.getNodeById(id);

					if (childNode) {

						if (childNode.toggleState === "invisible") {
							this.clickedHidden[childNode._id] = childNode;
						} else {
							delete this.clickedHidden[childNode._id];
						}

						if (childNode.toggleState === "visible") {
							this.clickedShown[childNode._id] = childNode;
						} else {
							delete this.clickedShown[childNode._id];
						}

					}
				}
			}

			this.handleVisibility(this.getClickedHidden(), false);
			this.handleVisibility(this.getClickedShown(), true);

		});

	}

	/**
	 * Unselect all selected items and clear the array
	 */
	public clearCurrentlySelected() {

		this.ViewerService.clearHighlights();
		this.DocsService.closeDocs();

		if (this.currentSelectedNodes) {
			for (let i = 0; i < this.currentSelectedNodes.length; i++) {
				this.currentSelectedNodes[i].selected = false;
			}
		}

		this.currentSelectedNodes = [];
	}

	/**
	 * Set selection status of node.
	 * @param node	Node to set selection status of
	 * @param select whether the node should be selected or not
	 */
	public setNodeSelection(node: any, select: boolean) {

		// If node
		if (node.selected === select) {
			return;
		}

		const nodeIndex = this.currentSelectedNodes.indexOf(node);

		if (select) {
			if (nodeIndex === -1) {
				node.selected = true;
				this.currentSelectedNodes.push(node);
			}
		} else {
			if (nodeIndex > -1) {
				this.currentSelectedNodes[nodeIndex].selected = false;
				this.currentSelectedNodes.splice(nodeIndex, 1);
			}
		}
	}

	public getMeshHighlights(nodes) {
		return this.ready.promise.then(() => {
			return this.getMeshMapFromNodes(nodes, this.treeMap.idToMeshes);
		});
	}

	public getCurrentMeshHighlightsFromViewer() {
		const objectsDefer = this.$q.defer();

		// Get selected objects
		this.ViewerService.getObjectsStatus({
			promise: objectsDefer,
		});
		return objectsDefer.promise;
	}

	/**
	 * Return a map of currently selected meshes
	 */
	public getCurrentMeshHighlights() {
		const objectsPromise = this.$q.defer();
		return this.getMeshHighlights(this.currentSelectedNodes.concat());
	}

	/**
	 * Deselect a nodes in the tree.
	 * @param nodes	Node to select.
	 */
	public deselectNodes(nodes: any[]) {

		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			this.setNodeSelection(node, false);
		}

		return this.unhighlightNodes(nodes);

	}

	/**
	 * Select nodes in the tree.
	 * @param nodes	Nodes to select.
	 * @param multi	Is multi select enabled.
	 * @param colour the colour array for selection in the viewer
	 * @param forceReHighlight whether to force highlighting (for example in a different colour)
	 */
	public selectNodes(nodes: any[], multi: boolean, colour: number[], forceReHighlight: boolean) {
		if (!multi) {
			// If it is not multiselect mode, remove all highlights
			this.clearCurrentlySelected();
		}

		if (!nodes || nodes.length === 0) {
			return Promise.resolve("No nodes specified");
		}

		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];

			if (!node) {
				continue;
			}

			const shouldSelect = !multi || forceReHighlight || !node.selected;
			this.setNodeSelection(node, shouldSelect);

		}

		const lastNode = nodes[nodes.length - 1] ;
		this.handleMetadata(lastNode);

		return this.highlightNodes(nodes, multi, colour, forceReHighlight);

	}

	/**
	 * Show metadata in the metadata panel if necessary
	 * @param node the node to show the metadata for
	 */
	public handleMetadata(node) {

		if (node && node.meta) {
			this.DocsService.displayDocs(
				node.account,
				node.model || node.project,
				node.meta,
			);
		}

	}

	/**
	 * Unhighlight a set of nodes in the viewer
	 * @param nodes	Nodes to unhighlight in the viewer
	 */
	public unhighlightNodes(nodes: any) {
		return this.ready.promise.then(() => {

			const highlightMap = this.getMeshMapFromNodes(nodes, this.treeMap.idToMeshes, undefined);

			for (const key in highlightMap) {
				if (!highlightMap.hasOwnProperty(key)) {
					continue;
				}

				const vals = key.split("@");
				const account = vals[0];
				const model = vals[1];

				this.ViewerService.unhighlightObjects({
					account,
					model,
					ids: highlightMap[key].meshes,
				});
			}

			return highlightMap;
		});
	}

	/**
	 * Call the highlighting in the viewer
	 * @param nodes	Nodes to highlight in the model.
	 * @param multi	Is multi select enabled.
	 * @param colour the colour to highlight
     * @param forceReHighlight force a rehighlighting to a new colour (overrides toggle)
	 */
	public highlightNodes(nodes: any, multi: boolean, colour: number[], forceReHighlight: boolean) {

		return this.ready.promise.then(() => {
			const highlightMap = this.getMeshMapFromNodes(nodes, this.treeMap.idToMeshes, colour);

			// Update viewer highlights
			if (!multi) {
				this.ViewerService.clearHighlights();
			}

			for (const key in highlightMap) {
				if (!highlightMap.hasOwnProperty(key) ||
					!highlightMap[key].meshes ||
					highlightMap[key].meshes.length === 0) {
					continue;
				}

				const vals = key.split("@");
				const account = vals[0];
				const model = vals[1];
				// Separately highlight the children
				// but only for multipart meshes
				this.ViewerService.highlightObjects({
					account,
					ids: highlightMap[key].meshes,
					colour: highlightMap[key].colour,
					model,
					multi: true,
					source: "tree",
					forceReHighlight,
				});

			}

			return highlightMap;

		});
	}

	/**
	 * Get a series of nodes with unique ID bu a series of objects that contain a shared_id
	 * @param objects the array of shared id objects
	 */
	public getNodesFromSharedIds(objects) {
		if (!objects || objects.length === 0) {
			return Promise.resolve([]);
		}

		return this.getMap().then(() => {

			const nodes = [];

			for (let i = 0; i < objects.length; i++) {
				const objUid = this.treeMap.sharedIdToUid[objects[i].shared_id];
				const node = this.getNodeById(objUid);
				if (node) {
					nodes.push(node);
				}
			}

			return nodes;

		});
	}

	/**
	 * Show a series of nodes by an array of shared IDs (rather than unique IDs)
	 * @param objects	Nodes to show
	 */
	public showTreeNodesBySharedIds(objects: any[]) {

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {
				this.setVisibilityOfNodes(nodes, "visible");
				this.updateModelVisibility(this.allNodes[0]);
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
	public selectNodesBySharedIds(objects: any[], multi: boolean,  colour: number[], forceReHighlight: boolean) {

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {
				return this.selectNodes(nodes, multi, colour, forceReHighlight);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	/**
	 * Highlight a series of nodes based on shared IDs (rather than unique IDs)
	 * @param objects	Nodes to select
	 * @param multi	Is multi select enabled
	 * @param colour the colour to highlight
	 * @param forceReHighlight force a rehighlighting to a new colour (overrides toggle)
	 */
	public highlightNodesBySharedId(
		objects: any[], multi: boolean, colour: number[], forceReHighlight: boolean,
	) {
		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {
				this.highlightNodes(nodes, multi, colour, forceReHighlight);
			})
			.catch((error) => {
				console.error(error);
			});

	}

	/**
	 * Isolate selected objects by their shared IDs
	 * @param objects an array of objects with shared_id properties
	 */
	public isolateNodesBySharedId(objects) {

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {

				// Hide all
				this.hideAllTreeNodes(false); // We can just reset the state without hiding in the UI
				// Show selected

				this.setCurrentSelectedNodes(nodes);
				this.showTreeNodes(nodes);

			})
			.catch((error) => {
				console.error(error);
			});

	}

	/**
	 * Hide series of nodes by an array of shared IDs (rather than unique IDs)
	 * @param objects objects to hide
	 */
	public hideBySharedId(objects: any[]) {

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {

				this.hideTreeNodes(nodes);

			})
			.catch((error) => {
				console.error(error);
			});

	}

	/**
	 * Show a series of nodes by an array of shared IDs (rather than unique IDs)
	 * @param objects objects to show
	 */
	public showBySharedId(objects: any[]) {

		if (!objects || objects.length === 0) {
			return;
		}

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {

				this.hideAllTreeNodes(false);
				this.showTreeNodes(nodes);

			})
			.catch((error) => {
				console.error(error);
			});

	}

	/**
	 * Highlight a series of nodes by an array of shared IDs (rather than unique IDs)
	 * @param objects objects to show
	 */
	public highlightsBySharedId(objects: any) {

		return this.getNodesFromSharedIds(objects)
			.then((nodes) => {

				if (nodes && nodes.length) {

					const selectedIndex = this.selectNodes(nodes, true, undefined, true);

					const lastNodeId = nodes[nodes.length - 1]._id;
					const lastNodePath = this.getPath(lastNodeId);

					this.expandToSelection(lastNodePath, 0, true, true);
					return selectedIndex;
				}

			})
			.catch((error) => {
				console.error(error);
			});

	}

	/**
	 * @returns	List of leaf nodes that are shown by default.
	 */
	public getShownByDefaultNodes() {
		return this.shownByDefaultNodes;
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
	 * Creates a map of IDs to nodes, array of nodes shown by default, and
	 * nodes hidden by default.
	 */
	public generateIdToNodeMap() {
		this.idToNodeMap = {};
		this.shownByDefaultNodes = [];
		this.hiddenByDefaultNodes = [];
		this.recurseIdToNodeMap(this.allNodes);
	}

	/**
	 * Helper function for generateIdToNodeMap().
	 * @param nodes	Collection of nodes to add to idToNodeMap.
	 */
	public recurseIdToNodeMap(nodes) {
		if (nodes) {
			for (let i = 0; i < nodes.length; i++) {

				const node = nodes[i];

				if (node._id) {
					this.idToNodeMap[node._id] = node;
					if (node.toggleState === "visible" && (!node.children || node.children.length === 0)) {
						this.shownByDefaultNodes.push(node);
					}
					if (node.toggleState === "invisible") {
						this.hiddenByDefaultNodes.push(node);
					}
					node.defaultState = node.toggleState;
					this.recurseIdToNodeMap(node.children);
				}

			}

		}
	}

	/**
	 * Sets the collection of all nodes and calls generateIdToNodeMap().
	 * @param nodes	Collection of all nodes.
	 */
	public setAllNodes(nodes) {
		this.allNodes = nodes;
		this.generateIdToNodeMap();
	}

	/**
	 * @returns	Collection of all nodes.
	 */
	public getAllNodes() {
		return this.allNodes;
	}

}

export const TreeServiceModule = angular
	.module("3drepo")
	.service("TreeService", TreeService);
