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
	public selectionData;
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
	private hideIfc;
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
		this.state.lastParentWithName = null;
		this.state.showNodes = true;
		this.state.visible = {};
		this.state.invisible = {};
		this.state.idToPath = {};
		this.allNodes = [];
		this.currentSelectedNodes = [];
		this.clickedHidden = {}; // or reset?
		this.clickedShown = {}; // or reset?
		this.nodesToShow = [];
		this.subTreesById = {};
		this.subModelIdToPath = {};
		this.highlightMapUpdateTime = Date.now();
		this.hideIfc = true;
		this.highlightSelectedViewerObject = true;
	}

	public setHighlightSelected(value) {
		this.highlightSelectedViewerObject = value;
	}

	public resetHighlightMap() {
		this.highlightMap = null;
	}

	public setHighlightMap(value) {
		this.highlightMap = value;
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

						// let invisibleNodes = 0;
						// let visibleNodes = 0;
						// let parentOfInvisible = 0;

						if (idToPath && idToPath.treePaths) {

							mainTree.idToPath = idToPath.treePaths.idToPath;

							if (subTrees) {

								// idToObjRef only needed if model is a fed model.
								// i.e. subTrees.length > 0

								mainTree.subModelIdToPath = {};

								subTrees.forEach((subtree) => {

									// switch(subtree.toggleState) {
									// 	case "invisible": 
									// 		invisibleNodes++;
									// 	case "visible":
									// 		visibleNodes++;
									// 	case "parentOfInvisible":
									// 		parentOfInvisible++;
									// }

									
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

							// if (mainTree.nodes.length === invisibleNodes && invisibleNodes > 0) {
							// 	mainTree.nodes.toggleState = "invisible";
							// } else if (parentOfInvisible > 0 || invisibleNodes > 0) {
							// 	mainTree.nodes.toggleState = "parentOfInvisible";
							// } else {
							// 	mainTree.nodes.toggleState = "visible";
							// }
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
					// console.log("Subtree and parent:", subTree.parent, subTree);

					// if (subTree.toggleState === "invisible" && subTree.parent.toggleState === "visible") {
					// 	subTree.parent.toggleState = "parentOfInvisible";
					// }

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

	public getLastParentWithName() {
		return this.state.lastParentWithName;
	}

	public resetLastParentWithName() {
		this.state.lastParentWithName = null;
	}

	public getNodesToShow() {
		return this.nodesToShow;
	}

	public setShowNodes(value) {
		this.state.showNodes = value;
	}

	public isShowNodes() {
		return this.state.showNodes;
	}

	public resetVisible() {
		this.state.visible = {};
	}

	public resetInvisible() {
		this.state.invisible = {};
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
			console.log("HAS NO TOGGLE STATE SET: ", this.nodesToShow);
			this.nodesToShow[0].toggleState = "visible";
		}
	}

	/**
	 * Show the first set of children using the expand function but deselect the child used for this.
	 */
	public expandFirstNode() {
		this.expand(null, this.nodesToShow[0]._id);
		// this.nodesToShow[0].children[0].selected = false;
	}

	/**
	 * Traverse children of a node recursively
	 */
	public traverseNode(node: any, callback) {
		callback(node);
		if (node.children) {
			node.children.forEach((child) => {
				this.traverseNode(child, callback);
			});
		}
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

		// const start = performance.now();
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
				// concat is slow!
				Array.prototype.push.apply(nodes[key], meshes);
			}
		} else if (node.children) {
			// This should only happen in federations.
			// Traverse down the tree to find submodel nodes
			node.children.forEach((child) => {
				this.traverseNodeAndPushId(child, nodes, idToMeshes);
			});
		} else {
			// TODO: Is this a valid state?
			// console.error("Meshes and node.children were both not defined", meshes, node.children);
		}

		const end = performance.now();
		// console.log("traverseNodeAndPushId took: ", end - start, "ms");

	}


	/**
	 * Set the toggle state of a node
	 */
	public updateParentVisibility(node: any) {

		const start = performance.now();
		const showableLeaf = this.canShowNode(node) && this.isLeafNode(node);
		//if (showableLeaf || node.toggleState === "visible" || node.toggleState === "parentOfInvisible") {
		///node.toggleState = visibility;
		//}

		let path = this.getPath(node._id);

		// Get node parent
		if (path && path.length > 0) {

			const lastParent = this.getNodeById(path[path.length - 1]);
			const submodelRootParent = this.getNodeById(path[0]);

			// We can skip up parent nodes if we know it has mixed 
			// shown and hidden children
			let hasParentOfInvisibleChild = false;

			// Set the toggle state of the nodes above
			for (let i = (path.length - 1); i >= 0; i--) {
				
				const parentNode = this.getNodeById(path[i]);

				if (parentNode.children === undefined || parentNode.children.length === 0) {
					continue;
				}

				if (hasParentOfInvisibleChild) {
					parentNode.toggleState = "parentOfInvisible";
				}

				let numInvisible = 0;
				let numParentInvisible = 0;
				let numVisible = 0;

				for (let j = 0; j < parentNode.children.length; j++) {
					if (parentNode.children[j].toggleState === "invisible" ) {
						numInvisible++;
					} else if (parentNode.children[j].toggleState === "parentOfInvisible" ) {
						numParentInvisible++;
					} else {
						numVisible++;
					}

					// If we have mixed visible and invisible/parentOfInvisible we know
					// it's parentOfInvisible
					if (numVisible > 0 && (numInvisible > 0 || numParentInvisible > 0) ) {
						hasParentOfInvisibleChild = true;
						break;
					}
				}

				if (numInvisible === parentNode.children.length) {
					parentNode.toggleState = "invisible";
				} else if ((numParentInvisible + numInvisible) > 0) {
					parentNode.toggleState = "parentOfInvisible";
				} else {
					parentNode.toggleState = "visible";
				}

			}
		}

		this.toggleNode(node);
		const end = performance.now();
		//console.log("updateParentVisibility", end - start, "ms");
	}

	/*
	* See if id in each ids is a sub string of path
	*/
	public matchPath(ids, path) {

		for (let i = 0; i < ids.length; i++) {
			if (path.indexOf(ids[i]) !== -1) {
				return true;
			}
		}

		return false;
	}

	public isDefined(value) {
		return value !== undefined && value !== null;
	}

	/**
	 * Expand a node to show its children.
	 */
	public expand(event, nodeId) {
		const start = performance.now();

		if (event) {
			event.stopPropagation();
		}

		const nodeToExpand = this.getNodeById(nodeId);

		// Find node index
		const index = this.nodesToShow.indexOf(nodeToExpand);

		if (index === -1 || !nodeToExpand.hasChildren) {
			return;
		}

		if (nodeToExpand.expanded) {

			this.collapseTreeNode(nodeToExpand, index);

		} else {

			this.expandTreeNode(nodeToExpand, index);

		}

		const end = performance.now();
		//console.log("expand took: ", end - start, "ms");
	}

	public collapseTreeNode(nodeToCollapse: any, index: number) {

		let endOfSplice = false;
		const nodeIds = [nodeToCollapse._id];

		// if the target itself contains subModelTree
		if (nodeToCollapse.hasSubModelTree) {
			// node containing sub model tree must have only one child
			// TODO - do we still need getSubTreesById?
			const subTreesById = this.getSubTreesById();
			const subModelNode = subTreesById[nodeToCollapse.children[0]._id];
			nodeIds.push(subModelNode._id);
		}

		const next = index + 1;
		while (!endOfSplice) {

			if (
				this.isDefined(this.nodesToShow[next]) &&
				this.matchPath(nodeIds, this.nodesToShow[next].path)
			) {

				if (this.nodesToShow[next].hasSubModelTree) {

					// TODO - do we still need getSubTreesById?
					const subTreesById = this.getSubTreesById();
					const subModelNode = subTreesById[this.nodesToShow[next].children[0]._id];
					nodeIds.push(subModelNode._id);
				}

				const splicedNode = this.nodesToShow.splice(next, 1);

			} else {
				endOfSplice = true;
			}

		}

		nodeToCollapse.expanded = false;

	}

	public expandTreeNode(nodeToExpand: any, index: number, multi: boolean) {

		if (!nodeToExpand.children || nodeToExpand.children.length === 0) {
			return;
		}

		const numChildren = nodeToExpand.children.length;

		for (let i = 0; i < numChildren; i += 1) {

			nodeToExpand.children[i].expanded = false;

			// A child node only "hasChildren", i.e. expandable, if any of it's children have a name
			nodeToExpand.children[i].level = nodeToExpand.level + 1;
			nodeToExpand.children[i].hasChildren = false;

			const hasChildrenProp = ("children" in nodeToExpand.children[i]);
			const hasChildrenLen = hasChildrenProp && (nodeToExpand.children[i].children.length > 0);

			if (hasChildrenLen) {

				for (let j = 0, jLength = nodeToExpand.children[i].children.length; j < jLength; j++) {
					if (nodeToExpand.children[i].children[j].hasOwnProperty("name")) {
						nodeToExpand.children[i].hasChildren = true;
						break;
					}
				}

			}

			if (nodeToExpand.children[i].hasOwnProperty("name")) {
				if (this.nodesToShow.indexOf(nodeToExpand.children[i]) === -1) {
					this.nodesToShow.splice(index + i + 1, 0, nodeToExpand.children[i]);
				}
			}

		}

		nodeToExpand.expanded = true;
	}

	public expandToSelection(path, level: number, noHighlight: boolean, multi: boolean) {

		let selectedIndex;
		let selectedId;

		// Cut it to the level provided
		path = path.slice(level, path.length);

		for (let i = 0; i < path.length; i++) {
			const node = this.getNodeById(path[i]);
			const index = this.nodesToShow.indexOf(node);
			this.expandTreeNode(node, index);

			// If it's the last node in the path
			// scroll to it
			if (i === path.length - 1) {
				selectedIndex = this.nodesToShow.indexOf(node);
				selectedId = this.nodesToShow[selectedIndex]._id;
			}

		}

		if (!noHighlight) {
			this.selectNode(this.nodesToShow[selectedIndex], multi);
		}

		this.selectionData = {
			selectedIndex,
			selectedId,
		};
	}

	public getPath(objectID) {

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

	public setNodeVisibility(nodes, visibility) {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			this.setTreeNodeStatus(node, visibility);
		}
	}

	/**
	 * Hide a collection of nodes.
	 * @param nodes	Array of nodes to be hidden.
	 */
	public hideTreeNodes(nodes) {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (node.toggleState !== "invisible") {
				this.setTreeNodeStatus(node, "invisible");
			}
		}
	}

	/**
	 * Show a collection of nodes.
	 * @param nodes	Array of nodes to be shown.
	 */
	public showTreeNodes(nodes) {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (node.toggleState !== "visible") {
				this.setTreeNodeStatus(node, "visible");
			}
		}
	}


	public setTreeNodeStatus(node: any, visibility: string) {

		const children = [node];
		Array.prototype.push.apply(children, children[0].children);

		while (children.length) {
			const child = children.pop();

			if (child.children && child.toggleState !== visibility) {
				Array.prototype.push.apply(children, child.children);
			}

			if (visibility === "visible" && this.canShowNode(child)) {
				child.toggleState = "visible";
			} else {
				child.toggleState = "invisible";
			}
		
		}

		this.updateParentVisibility(node);

	}

	/**
	 * Hide all tree nodes.
	 */
	public hideAllTreeNodes() {
		const start = performance.now();

		this.setTreeNodeStatus(this.allNodes[0], "invisible");

		const stop = performance.now();
		console.log("hideAllTreeNodes: ", stop - start, "ms");
	}

	/**
	 * Show all tree nodes.
	 */
	public showAllTreeNodes() {

		const start = performance.now();

		this.setTreeNodeStatus(this.allNodes[0], "visible");

		if (this.hideIfc) {
			this.getHiddenByDefaultNodes()
				.forEach(this.updateParentVisibility.bind(this));
		}

		const stop = performance.now();
		console.log("showAllTreeNodes: ", stop - start, "ms");
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
		return !(this.hideIfc && this.getHiddenByDefaultNodes().includes(node));
	}

	/**
	 * @returns	True if node claims it has no children.
	 */
	public isLeafNode(node: any) {
		return !node.children || !node.hasChildren || node.children.length === 0;
	}

	/**
	 * Update the state of clickedHidden and clickedShown, which are used by tree component
	 * to apply changes to the viewer.
	 * @param node	Node to toggle visibility. All children will also be toggled.
	 */
	public toggleNode(node) {
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
	public selectNode(node: any, multi: boolean) {

		if (node) {
			const sameNodeIndex = this.currentSelectedNodes.findIndex((element) => {
				return element._id === node._id;
			});

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

			this.getMap().then((treeMap) => {
				const map = {};
				this.currentSelectedNodes.forEach((n) => {
					this.traverseNodeAndPushId(n, map, treeMap.idToMeshes);
				});

				this.highlightMapUpdateTime = Date.now();
				this.highlightMap = map;
			});
		}

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
		return this.hideIfc;
	}

	/**
	 * @param value	Are IFC spaces hidden.
	 */
	public setHideIfc(value: boolean) {
		this.hideIfc = value;
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
