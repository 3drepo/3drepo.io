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

	public highlightSelectedViewerObject = false;
	public highlightMap;
	public highlightMapUpdateTime;
	public selectionData;
	public visibilityUpdateTime;

	private state;

	private treeReady;
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

	constructor(
		private $q: IQService,
		private APIService,
	) {
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
		this.treeReady = this.$q.defer();
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
		if (this.treeMap) {
			return Promise.resolve(this.treeMap);
		} else {
			this.treeMap = {
				oIdToMetaId: {},
				sharedIdToUid: {},
				uidToSharedId: {},
			};
			return this.treeReady.promise.then((tree) => {
				this.treeMap.idToMeshes = this.idToMeshes;
				return this.genMap(tree.nodes, this.treeMap);
			});

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
			this.nodesToShow[0].toggleState = "visible";
		}
	}

	/**
	 * Show the first set of children using the expand function but deselect the child used for this.
	 */
	public expandFirstNode() {
		this.expandToSelection(this.nodesToShow[0].children[0].path.split("__"), 0, true, false);
		this.nodesToShow[0].children[0].selected = false;
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
		const model = node.model || node.project;
		const key = this.getAccountModelKey(node.account, model);
		let meshes = idToMeshes[node._id];
		if (idToMeshes[key]) {
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

	public getVisibleArray(account: string, model: string) {
		const key = this.getAccountModelKey(account, model);
		if (!this.state.visible[key]) {
			this.state.visible[key] = new Set();
		}

		return this.state.visible[key];
	}

	public getInvisibleArray(account: string, model: string) {
		const key = this.getAccountModelKey(account, model);
		if (!this.state.invisible[key]) {
			this.state.invisible[key] = new Set();
		}

		return this.state.invisible[key];
	}

	/**
	 * Set the toggle state of a node
	 */
	public setToggleState(node: any, visibility: string) {

		const modelId = node.model || node.project; // TODO: Remove project from backend
		const visible = this.getVisibleArray(node.account, modelId);
		const invisible = this.getInvisibleArray(node.account, modelId);

		if (!node.children && ((node.type || "mesh") === "mesh")) {
			if (visibility === "invisible") {
				if (invisible.has(node._id)) {
					invisible.delete(node._id);
				} else {
					invisible.add(node._id);
				}

				visible.delete(node._id);
			} else {
				if (visible.has(node._id)) {
					visible.delete(node._id);
				} else {
					visible.add(node._id);
				}

				invisible.delete(node._id);
			}
		}

		node.toggleState = visibility;
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
	public expand(event, _id) {

		let i;
		let j;
		let jLength;
		let numChildren = 0;
		let index = -1;
		let endOfSplice = false;
		const numChildrenToForceRedraw = 3;

		event.stopPropagation();

		// Find node index
		for (i = 0; i < this.nodesToShow.length; i += 1) {
			if (this.nodesToShow[i]._id === _id) {
				index = i;
				break;
			}
		}

		const _ids = [_id];
		const nodeToExpand = this.nodesToShow[index];

		if (index === -1 || !nodeToExpand.hasChildren) {
			return;
		}

		if (nodeToExpand.expanded) {
			// Collapse

			// if the target itself contains subModelTree
			if (nodeToExpand.hasSubModelTree) {
				// node containing sub model tree must have only one child
				// TODO - do we still need getSubTreesById?
				const subTreesById = this.getSubTreesById();
				const subModelNode = subTreesById[nodeToExpand.children[0]._id];
				_ids.push(subModelNode._id);
			}

			const next = index + 1;
			while (!endOfSplice) {

				if (
					this.isDefined(this.nodesToShow[next]) &&
					this.matchPath(_ids, this.nodesToShow[next].path)
				) {

					if (this.nodesToShow[next].hasSubModelTree) {
						// TODO - do we still need getSubTreesById?
						const subTreesById = this.getSubTreesById();
						const subModelNode = subTreesById[this.nodesToShow[next].children[0]._id];
						_ids.push(subModelNode._id);
					}

					this.nodesToShow.splice(next, 1);

				} else {
					endOfSplice = true;
				}

			}

		} else {
			// Expand
			numChildren = nodeToExpand.children.length;

			// If the node has a large number of children then force a redraw of the tree to get round the display problem
			if (numChildren >= numChildrenToForceRedraw) {
				this.state.showNodes = false;
			}

			for (i = 0; i < numChildren; i += 1) {
				// For federation - handle node of model that cannot be viewed or has been deleted
				// That node will be below level 0 only
				if (
					(nodeToExpand.level === 0) &&
					nodeToExpand.children[i].hasOwnProperty("children") &&
					nodeToExpand.children[i].children[0].hasOwnProperty("status")
				) {

					nodeToExpand.children[i].status = nodeToExpand.children[i].children[0].status;

				} else {

					// Normal tree node
					nodeToExpand.children[i].expanded = false;

					// If the child node does not have a toggleState set it to visible
					if (!nodeToExpand.children[i].hasOwnProperty("toggleState")) {
						this.setToggleState(nodeToExpand.children[i], "visible");
					}

				}

				// A child node only "hasChildren", i.e. expandable, if any of it's children have a name
				nodeToExpand.children[i].level = nodeToExpand.level + 1;
				nodeToExpand.children[i].hasChildren = false;

				const hasChildrenProp = ("children" in nodeToExpand.children[i]);
				const hasChildrenLen = hasChildrenProp && (nodeToExpand.children[i].children.length > 0);

				if (hasChildrenLen) {

					for (j = 0, jLength = nodeToExpand.children[i].children.length; j < jLength; j++) {
						if (nodeToExpand.children[i].children[j].hasOwnProperty("name")) {
							nodeToExpand.children[i].hasChildren = true;
							break;
						}
					}

				}

				if (nodeToExpand.children[i].hasOwnProperty("name")) {
					this.nodesToShow.splice(index + i + 1, 0, nodeToExpand.children[i]);
				}

			}

		}

		nodeToExpand.expanded = !nodeToExpand.expanded;

	}

	/**
	 * Expand the tree and highlight the node corresponding to the object selected in the viewer.
	 */
	public expandToSelection(path, level, noHighlight, multi: boolean) {
		let i;
		let j;
		let length;
		let childrenLength;
		let selectedId = path[path.length - 1];
		let selectedIndex = 0;
		let selectionFound = false;

		// Force a redraw of the tree to get round the display problem
		this.state.showNodes = false;
		let condLoop = true;
		for (i = 0, length = this.nodesToShow.length; i < length && condLoop; i++) {
			if (this.nodesToShow[i]._id === path[level]) {

				this.state.lastParentWithName = this.nodesToShow[i];

				this.nodesToShow[i].expanded = true;
				this.nodesToShow[i].selected = false;
				childrenLength = this.nodesToShow[i].children.length;

				if (level === (path.length - 2)) {
					selectedIndex = i;
				}

				let childWithNameCount = 0;

				for (j = 0; j < childrenLength; j += 1) {
					// Set child to not expanded
					this.nodesToShow[i].children[j].expanded = false;

					if (this.nodesToShow[i].children[j]._id === selectedId) {

						if (this.nodesToShow[i].children[j].hasOwnProperty("name")) {
							this.nodesToShow[i].children[j].selected = true;
							if (!noHighlight) {
								this.selectNode(this.nodesToShow[i].children[j], multi);
							}
							this.state.lastParentWithName = null;
							selectedIndex = i + j + 1;

						} else if (!noHighlight) {
							// If the selected mesh doesn't have a name highlight the parent in the tree
							// highlight the parent in the viewer

							this.selectNode(this.nodesToShow[i], multi);
							selectedId = this.nodesToShow[i]._id;
							selectedIndex = i;
							this.state.lastParentWithName = null;
							selectedId = this.nodesToShow[i]._id;
						}

						condLoop = false;
					} else {
						// This will clear any previously selected node
						this.nodesToShow[i].children[j].selected = false;
					}

					// Only set the toggle state once when the node is listed
					if (!this.nodesToShow[i].children[j].hasOwnProperty("toggleState")) {
						this.setToggleState(this.nodesToShow[i].children[j], "visible");
					}

					// Determine if child node has childern
					this.nodesToShow[i].children[j].hasChildren = false;
					if (("children" in this.nodesToShow[i].children[j]) && (this.nodesToShow[i].children[j].children.length > 0)) {
						for (let k = 0, jLength = this.nodesToShow[i].children[j].children.length; k < jLength; k++) {
							if (this.nodesToShow[i].children[j].children[k].hasOwnProperty("name")) {
								this.nodesToShow[i].children[j].hasChildren = true;
								break;
							}
						}
					}

					// Set current selected node
					if (this.nodesToShow[i].children[j].selected) {
						selectionFound = true;

					}

					this.nodesToShow[i].children[j].level = level + 1;

					if (this.nodesToShow[i].hasChildren && this.nodesToShow[i].children[j].hasOwnProperty("name")) {

						this.nodesToShow.splice(i + childWithNameCount + 1, 0, this.nodesToShow[i].children[j]);
						childWithNameCount++;
					}

				}
			}
		}

		const selectionData = {
			selectedIndex,
			selectedId,
		};

		if (level < (path.length - 2)) {
			this.expandToSelection(path, (level + 1), undefined, multi);
		} else if (level === (path.length - 2)) {
			// Trigger tree redraw
			this.selectionData = selectionData;
		}

		return selectionData;
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

	/**
	 * Hide a collection of nodes.
	 * @param nodes	Array of nodes to be hidden.
	 */
	public hideTreeNodes(nodes) {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			if (node.toggleState !== "invisible") {
				this.toggleTreeNode(node, true);
			}
		}
	}

	/**
	 * Hide all tree nodes.
	 */
	public hideAllTreeNodes() {
		const rootNode = this.allNodes[0];
		while (rootNode && rootNode.toggleState !== "invisible") {
			this.toggleTreeNode(rootNode, false);
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
				this.toggleTreeNode(node, true);
			}
		}
	}

	/**
	 * Show all tree nodes.
	 */
	public showAllTreeNodes() {
		const rootNode = this.allNodes[0];
		while (rootNode && rootNode.toggleState !== "visible") {
			this.toggleTreeNode(rootNode, false);
		}
	}

	/**
	 * Show all tree nodes and hide IFCs if necessary.
	 */
	public showAllTreeNodesAndIFCs() {
		this.showAllTreeNodes();
		if (this.hideIfc) {
			this.hideTreeNodes(this.getHiddenByDefaultNodes());
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
			this.getCurrentSelectedNodes().forEach((selectedNode) => {
				this.toggleTreeNode(selectedNode, true);
			});
		}
	}

	/**
	 * Toggle visibility of a node.
	 * @param node		Node to be toggled.
	 * @param fastforward	Skip update of parent mode visibility if 'node' is not a leaf node. Use when toggling many nodes.
	 */
	public toggleTreeNode(node: any, fastforward: boolean) {

		let path;
		let lastParent = node;
		let submodelRootParent = node;
		let nodeToggleState = "visible";
		let numInvisible = 0;
		let numParentInvisible = 0;

		this.state.toggledNode = node;

		// toggle yourself
		this.setToggleState(node, (node.toggleState === "visible") ? "invisible" : "visible");
		nodeToggleState = node.toggleState;

		this.updateClickedHidden(node);
		this.updateClickedShown(node);

		const stack = [node];
		let head = null;

		while (stack.length > 0) {
			head = stack.pop();

			if (node !== head) {
				this.setToggleState(head, nodeToggleState);
			}

			if (head.children) {
				for (let i = 0; i < head.children.length; i++) {
					stack.push(head.children[i]);
				}
			}
		}

		// a__b .. c__d
		// toggle parent
		path = node.path.split("__");
		path.splice(path.length - 1, 1);

		// Get node parent
		if (path.length > 0 && (!fastforward || (!node.children || node.children.length === 0))) {

			lastParent = this.getNodeById(path[path.length - 1]);
			submodelRootParent = this.getNodeById(path[0]);

			if (submodelRootParent.parent) {
				// Get node parent and reconstruct the path in case it is a fed model
				path = submodelRootParent.parent.path.split("__").concat(path);
			}

			// Set the toggle state of the nodes above
			for (let i = (path.length - 1); i >= 0; i--) {
				const parentNode = this.getNodeById(path[i]);

				numInvisible = parentNode.children.reduce(
					(total, child) => {
						return child.toggleState === "invisible" ? total + 1 : total;
					},
					0);
				numParentInvisible = parentNode.children.reduce(
					(total, child) => {
						return child.toggleState === "parentOfInvisible" ? total + 1 : total;
					},
					0);

				if (numInvisible === parentNode.children.length) {
					parentNode.toggleState = "invisible";
				} else if ((numParentInvisible + numInvisible) > 0) {
					parentNode.toggleState = "parentOfInvisible";
				} else {
					if (fastforward) {
						parentNode.toggleState = "visible";
					} else {
						this.setToggleState(parentNode, "visible");
					}
				}

			}
		}

		this.toggleNode(node);
	}

	/**
	 * Toggle visibility of a node given its id.
	 * @param id	ID of node.
	 */
	public toggleTreeNodeById(id) {
		const node = this.getNodeById(id);
		this.toggleTreeNode(node, false);
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

	}

	public resetHidden() {
		for (const id in this.clickedHidden) {
			if (id) {
				this.toggleTreeNodeById(id);
			}
		}
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

	public toggleFilterNode(item) {
		this.setToggleState(item, (item.toggleState === "visible") ? "invisible" : "visible");
		item.path = item._id;
		this.toggleNode(item);
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
		this.visibilityUpdateTime = Date.now();
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
		this.visibilityUpdateTime = Date.now();
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
