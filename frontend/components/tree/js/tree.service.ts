import { IQService } from "angular";

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

	constructor(
		private $q: IQService,
		private APIService,
	) {
		this.reset();

	}

	public reset() {
		this.treeReady = this.$q.defer();
		this.treeMapReady = null;
		this.state = {};

		this.state.idToPath = {};
		this.state.hideIfc = true;
		this.allNodes = [];
		this.currentSelectedNodes = [];
		this.clickedHidden = {}; // or reset?
		this.clickedShown = {}; // or reset?
		this.nodesToShow = [];
		this.subTreesById = {};
		this.subModelIdToPath = {};
		this.highlightMapUpdateTime = Date.now();
		this.highlightSelectedViewerObject = true;
	}

	/**
	 * @param value	True if OBJECT_SELECTED should be handled by component
	 */
	public setHighlightSelected(value: boolean) {
		this.highlightSelectedViewerObject = value;
	}

	/**
	 * Resets highlight map to prevent extra triggers of handleSelection.
	 * TODO: DEPRECATE? timestamp used instead to check state sync.
	 */
	public resetHighlightMap() {
		this.highlightMap = null;
	}

	/**
	 * Sets highlight map and updates highlightMapUpdateTime.
	 * @param value	Map of highlighted objects.
	 */
	public setHighlightMap(value: any) {
		this.highlightMap = value;
		this.highlightMapUpdateTime = Date.now();
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
		this.getTrees(url, setting);
		this.getIdToMeshes();

		return this.treeReady.promise;

	}

	public getIdToMeshes() {
		const url = this.baseURL + "idToMeshes.json";
		this.APIService.get(url, {
			headers: {
				"Content-Type": "application/json",
			},
		}).then((json) => {
			this.idToMeshes = json.data.idToMeshes;
		}).catch((error) => {
			console.error("Failed to get Id to Meshes:", error);
		});
	}

	public getTrees(url: string, setting: any) {

		this.APIService.get(url, {
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

				this.getIdToPath()
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

						Promise.all(awaitedSubTrees).then(() => {
							return this.treeReady.resolve(mainTree);
						});

					});

			})
			.catch((error) => {

				console.error("Tree Init Error:", error);

			});
	}

	public getIdToPath() {

		const url = this.baseURL + "tree_path.json";
		return this.APIService.get(url, {
			headers: {
				"Content-Type": "application/json",
			},
		}).
			then((response) => {
				return response.data;
			});

	}

	public handleSubTree(subtree: any, mainTree: any, subTreesById: any, awaitedSubTrees: any[]) {

		const treeId = subtree._id;
		const idToObjRef = this.genIdToObjRef(mainTree.nodes, undefined);

		// attach the sub tree back on main tree
		if (idToObjRef[treeId] && subtree.url) {

			const getSubTree = this.APIService.get(subtree.url)
				.then((res) => {

					this.attachStatus(res, subtree, idToObjRef);

					subtree.buf = res.data.mainTree;

					const subTree = subtree.buf.nodes;
					const subTreeId = subTree._id;

					subTree.parent = idToObjRef[treeId];

					// Correct main tree using incoming subtree for federation
					let nodeIdsToUpdate = subTree.parent.path.split("__");

					for (let i = nodeIdsToUpdate.length - 1; i >= 0; i--) {
						const nodeToUpdate = idToObjRef[nodeIdsToUpdate[i]];

						if (nodeToUpdate.children) {
							this.updateParentVisibilityByChildren(nodeToUpdate);
						} else if (nodeIdsToUpdate.length - 1 === i) {
							nodeToUpdate.toggleState = subTree.toggleState;
						}
					}

					Object.assign(mainTree.subModelIdToPath, subtree.idToPath);

					idToObjRef[treeId].children = [subTree];
					idToObjRef[treeId].hasSubModelTree = true;
					subTreesById[subTreeId] = subTree;

				})
				.catch((res) => {
					this.attachStatus(res, subtree, idToObjRef);
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

	public search(searchString: string) {
		const url = `${this.baseURL}searchtree.json?searchString=${searchString}`;
		return this.APIService.get(url);
	}

	public genMap(leaf: any, items: any) {

		const leafId = leaf._id;
		const sharedId = leaf.shared_id;
		const subTreePromises  = [];
		if (leaf) {

			if (leaf.children) {
				leaf.children.forEach((child) => {
					subTreePromises.push(this.genMap(child, items));
				});
			}
			items.uidToSharedId[leafId] = sharedId;
			items.sharedIdToUid[sharedId] = leafId;
			if (leaf.meta) {
				items.oIdToMetaId[leafId] = leaf.meta;
			}
		}

		return Promise.all(subTreePromises).then(() => {
				return items;
			},
		);
	}

	public getMap() {
		// only do this once!
		if (this.treeMapReady) {
			return this.treeMapReady;
		} else {
			this.treeMap = {
				oIdToMetaId: {},
				sharedIdToUid: {},
				uidToSharedId: {},
			};
			this.treeMapReady = this.treeReady.promise.then((tree) => {
				this.treeMap.idToMeshes = this.idToMeshes;
				return this.genMap(tree.nodes, this.treeMap);
			});
			return this.treeMapReady;

		}

	}

	public getCurrentSelectedNodes() {
		return this.currentSelectedNodes;
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
		return this.state.idToPath;
	}

	public setCachedIdToPath(value) {
		this.state.idToPath = value;
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

		// Only make the top node visible if it does not have a toggleState
		if (!this.nodesToShow[0].hasOwnProperty("toggleState")) {
			this.updateParentVisibility(this.nodesToShow[0]);
		}
	}

	/**
	 * Show the first set of children using the expand function but deselect the child used for this.
	 */
	public expandFirstNode() {
		this.toggleNodeExpansion(null, this.nodesToShow[0]._id);
	}

	public getAccountModelKey(account: string, model: string) {
		return account + "@" + model;
	}

	/**
	 * Add all child id of a node recursively, the parent node's id will also be added.
	 */
	public traverseNodeAndPushId(node: any, nodes: any, idToMeshes: any) {

		if (!node) {
			console.error("traverseNodeAndPushId - idToMeshes is not defined: ", idToMeshes);
			return;
		}

		if (!idToMeshes) {
			console.error("traverseNodeAndPushId node is null: ", node);
			return;
		}

		const model = node.model || node.project;
		const key = this.getAccountModelKey(node.account, model);
		let meshes = idToMeshes[node._id];
		if (key && idToMeshes[key]) {
			// the node is within a sub model
			meshes = idToMeshes[key][node._id];
		}
		if (meshes) {
			if (!nodes[key]) {
				nodes[key] = meshes;
			} else {
				nodes[key] = nodes[key].concat(meshes);
			}
		} else if (node.children) {
			// This should only happen in federations.
			// Traverse down the tree to find submodel nodes
			node.children.forEach((child) => {
				this.traverseNodeAndPushId(child, nodes, idToMeshes);
			});
		}
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
			} else {
				node.toggleState = "parentOfInvisible";
			}
		}
	}

	/**
	 * Update toggleState of given node based on its children and
	 * traverse up the tree if necessary and call updateClicked
	 * @param node	Node to update.
	 */
	public updateParentVisibility(node: any) {

		if (node) {
			const priorToggleState = node.toggleState;

			this.updateParentVisibilityByChildren(node);

			const path = this.getPath(node._id);
			if (path && path.length > 1) {
				const parentNode = this.getNodeById(path[path.length - 2]);
				this.updateParentVisibility(parentNode);
			}
		}

		this.updateClicked(node);
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

			for (let i = 0; i < numChildren; i++) {

				nodeToExpand.children[i].expanded = false;
				nodeToExpand.children[i].level = nodeToExpand.level + 1;

				if (nodeToExpand.children[i].hasOwnProperty("name")) {
					if (this.nodesToShow.indexOf(nodeToExpand.children[i]) === -1) {
						this.nodesToShow.splice(nodeToExpandIndex + i + 1, 0, nodeToExpand.children[i]);
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
			this.expandTreeNode(node);

			// If it's the last node in the path
			// scroll to it
			if (i === path.length - 1) {
				selectedIndex = this.nodesToShow.indexOf(node);

				if (selectedIndex === -1) {
					// Sometimes we have an edge case where an object doesn't exist in the tree
					// because it has no name. It is often objects like a window, so what we do
					// is select its parent object to highlight that instead
					const specialNodeParent = this.getNodeById(path[i-1]);
					selectedIndex =  this.nodesToShow.indexOf(specialNodeParent)
				}
			}
		}

		if (!noHighlight) {
			this.selectNode(this.nodesToShow[selectedIndex], multi, true).then(() => {
				this.selectedIndex = selectedIndex;
			});
		} else {
			this.selectedIndex = selectedIndex;
		}

	}

	/**
	 * Return a normalised path fo ra given object ID
	 * This will fix paths for federations.
	 * @param objectID the id of the node to get a path for
	 */
	public getPath(objectID: string) {

		let path;
		if (this.state.idToPath[objectID]) {
			// If the Object ID is on the main tree then use that path
			path = this.state.idToPath[objectID].split("__");
		} else if (this.subModelIdToPath[objectID]) {
			// Else check the submodel for the id for the path
			path = this.subModelIdToPath[objectID].split("__");
			const parentPath = this.subTreesById[path[0]].parent.path.split("__");
			path = parentPath.concat(path);
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
			if (node.toggleState !== visibility) {
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
	}

	/**
	 * Show a collection of nodes.
	 * @param nodes	Array of nodes to be shown.
	 */
	public showTreeNodes(nodes: any[]) {
		this.setVisibilityOfNodes(nodes, "visible");
	}

	public setTreeNodeStatus(node: any, visibility: string) {

		if (node) {
			const priorToggleState = node.toggleState;

 			let children = [node];
			let parentNode = node;

			if (node.children) {
				children = children.concat(node.children);
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
					}
				} else {
					if (visibility === "visible") {
						child.toggleState = (this.getHideIfc()) ? child.defaultState : "visible";
					} else {
						child.toggleState = "invisible";
					}
				}
			}

			this.updateParentVisibility(parentNode);
		}
	}

	/**
	 * Hide all tree nodes.
	 */
	public hideAllTreeNodes() {
		this.setTreeNodeStatus(this.allNodes[0], "invisible");
	}

	/**
	 * Show all tree nodes.
	 */
	public showAllTreeNodes() {
		this.setTreeNodeStatus(this.allNodes[0], "visible");
	}

	/**
	 * Save current toggleState as defaultState.
	 * @param node	Root tree node to set.
	 */
	public saveDefaultNodeState(node: any) {
		if (node) {
			node.defaultState = node.toggleState;

			for (let i = 0; node.children && i < node.children.length; i++) {
				this.saveDefaultNodeState(node.children[i]);
			}
		}
	}

	/**
	 * Isolate selected objects by hiding all other objects.
	 */
	public isolateSelected() {
		// Hide all
		this.hideAllTreeNodes();
		// Show selected
		if (this.getCurrentSelectedNodes()) {
			this.showTreeNodes(this.getCurrentSelectedNodes());
		}
	}

	/**
	 * @returns	True if IFC spaces are not hidden or node is not an IFC space.
	 */
	public canShowNode(node: any) {
		return !(this.state.hideIfc && this.getHiddenByDefaultNodes().indexOf(node) !== -1);
	}

	/**
	 * @returns	True if node claims it has no children.
	 */
	public isLeafNode(node: any) {
		return !node.children || !node.children || node.children.length === 0;
	}

	/**
	 * Update the state of clickedHidden and clickedShown, which are used by tree component
	 * to apply changes to the viewer.
	 * @param node	Node to toggle visibility. All children will also be toggled.
	 */
	public updateClicked(node) {
		const childNodes = {};

		this.getMap().then((treeMap) => {
			this.traverseNodeAndPushId(node, childNodes, treeMap.idToMeshes);
			for (const key in childNodes) {
				if (key) {
					childNodes[key].forEach((id) => {
						const n = this.getNodeById(id);
						if (n) {
							this.updateClickedHidden(n);
							this.updateClickedShown(n);
						}
					});
				}
			}
		});

		this.visibilityUpdateTime = Date.now();

	}

	/**
	 * Unselect all selected items and clear the array
	 */
	public clearCurrentlySelected() {
		if (this.currentSelectedNodes) {
			this.currentSelectedNodes.forEach((selectedNode) => {
				selectedNode.selected = false;
			});
		}
		this.currentSelectedNodes = [];
	}

	/**
	 * Select a node in the tree.
	 * @param node	Node to select.
	 * @param multi	Is multi select enabled.
	 */
	public selectNode(node: any, multi: boolean, final: boolean) {

		if (node) {
			const sameNodeIndex = this.currentSelectedNodes.indexOf(node);

			if (multi) {
				if (sameNodeIndex > -1) {
					// Multiselect mode and we selected the same node - unselect it
					this.currentSelectedNodes[sameNodeIndex].selected = false;
					this.currentSelectedNodes.splice(sameNodeIndex, 1);
				} else {
					node.selected = true;
					this.currentSelectedNodes.push(node);
				}
			} else {
				// If it is not multiselect mode, remove all highlights
				this.clearCurrentlySelected();
				node.selected = true;
				this.currentSelectedNodes.push(node);
			}

			if (!final) {
				return Promise.resolve();
			} else {
				return this.getMap().then((treeMap) => {
					const map = {};
					this.currentSelectedNodes.forEach((n) => {
						this.traverseNodeAndPushId(n, map, treeMap.idToMeshes);
					});

					this.setHighlightMap(map);
				});
			}
		}

		return Promise.reject("No node specified");
	}

	/**
	 * Toggle node from clickedHidden collection.
	 * @param node	Node to toggle.
	 */
	public updateClickedHidden(node) {
		if (node.toggleState === "invisible") {
			this.clickedHidden[node._id] = node;
		} else {
			delete this.clickedHidden[node._id];
		}
	}

	/**
	 * Toggle node from clickedShown collection.
	 * @param node	Node to toggle.
	 */
	public updateClickedShown(node) {
		if (node.toggleState === "visible") {
			this.clickedShown[node._id] = node;
		} else {
			delete this.clickedShown[node._id];
		}
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
		this.idToNodeMap = [];
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
			nodes.forEach((node) => {
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
			});
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
