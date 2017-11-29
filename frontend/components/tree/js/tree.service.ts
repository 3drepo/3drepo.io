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
	public visibilityMap;
	public selectionData;

	private state;

	private treeReady;
	private treeMap = null;
	private idToMeshes;
	private baseURL;

	constructor(
		private $q: IQService,
		private APIService,
	) {
		this.state = {};
		this.state.currentSelectedNodes = [];
		this.state.clickedHidden = {}; // or reset?
		this.state.clickedShown = {}; // or reset?
		this.state.lastParentWithName = null;
		this.state.nodesToShow = [];
		this.state.showNodes = true;
		this.state.visible = {};
		this.state.invisible = {};
		this.state.toggledNode = null;
		this.state.subTreesById = {};
		this.state.idToPath = {};
		this.state.subModelIdToPath = {};
	}

	public setHighlightSelected(value) {
		this.highlightSelectedViewerObject = value;
	}

	public setHighlightMap(value) {
		this.highlightMap = value;
	}

	public genIdToObjRef(tree, map) {

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

	public init(account, model, branch, revision, setting) {
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

	public getTrees(url, setting) {

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

						const getSubTrees = [];

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
										getSubTrees,
									);
								});
							}

						}

						mainTree.subTreesById = subTreesById;

						Promise.all(getSubTrees).then(() => {
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

	public handleSubTree(subtree, mainTree, subTreesById, getSubTrees) {

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

			getSubTrees.push(getSubTree);

		}

	}

	public attachStatus(res, tree, idToObjRef) {
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

	public search(searchString) {
		const url = this.baseURL + "searchtree.json?searchString=" + searchString;
		return this.APIService.get(url);
	}

	public genMap(leaf, items) {

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
		return this.state.currentSelectedNodes;
	}

	public resetClickedHidden() {
		this.state.clickedHidden = {};
	}

	public resetClickedShown() {
		this.state.clickedShown = {};
	}

	public getLastParentWithName() {
		return this.state.lastParentWithName;
	}

	public resetLastParentWithName() {
		this.state.lastParentWithName = null;
	}

	public getNodesToShow() {
		return this.state.nodesToShow;
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
		return this.state.subTreesById;
	}

	public setSubTreesById(value) {
		this.state.subTreesById = value;
	}

	public getCachedIdToPath() {
		return this.state.idToPath;
	}

	public setCachedIdToPath(value) {
		this.state.idToPath = value;
	}

	public setSubModelIdToPath(value) {
		this.state.subModelIdToPath = value;
	}

	// Following functions are from tree.component.ts
	
	/**
	 * Initialise the tree nodes to show to the first node
	 */
	public initNodesToShow(nodes) {
		//TODO: Is it a good idea to save tree state within each node?
		this.state.nodesToShow = nodes;
		this.state.nodesToShow[0].level = 0;
		this.state.nodesToShow[0].expanded = false;
		this.state.nodesToShow[0].selected = false;
		this.state.nodesToShow[0].hasChildren = this.state.nodesToShow[0].children;

		// Only make the top node visible if it does not have a toggleState
		if (!this.state.nodesToShow[0].hasOwnProperty("toggleState")) {
			this.state.nodesToShow[0].toggleState = "visible";
		}
	}

	/**
	 * Show the first set of children using the expand function but deselect the child used for this
	 */
	public expandFirstNode() {
		this.expandToSelection(this.state.nodesToShow[0].children[0].path.split("__"), 0, true);
		this.state.nodesToShow[0].children[0].selected = false;
	}

	/**
	 * traverse children of a node recursively
	 * @param {Object} node
	 * @param {Function} callback
	 */
	public traverseNode(node, callback) {
		callback(node);
		if (node.children) {
			node.children.forEach((child) => {
				this.traverseNode(child, callback);
			});
		}
	}

	private getAccountModelKey(account, model) {
		return account + "@" + model;
	}

	/**
	 * Add all child id of a node recursively, the parent node's id will also be added.
	 * @param {Object} node
	 * @param {Array} nodes Array to push the nodes to
	 */
	public traverseNodeAndPushId(node, nodes) {
		this.traverseNode(node, (n) => {
			if (!n.children && ((n.type || "mesh") === "mesh")) {
				const key = this.getAccountModelKey(n.account, n.model || n.project); // TODO: Remove project from backend
				if (!nodes[key]) {
					nodes[key] = [];
				}

				nodes[key].push(n._id);
			}
		});
	}

	public getVisibleArray(account, model) {
		const key = this.getAccountModelKey(account, model);
		if (!this.state.visible[key]) {
			this.state.visible[key] = new Set();
		}

		return this.state.visible[key];
	}

	public getInvisibleArray(account, model) {
		const key = this.getAccountModelKey(account, model);
		if (!this.state.invisible[key]) {
			this.state.invisible[key] = new Set();
		}

		return this.state.invisible[key];
	}

	/**
	 * Set the toggle state of a node
	 * @param {Object} node Node to change the visibility for
	 * @param {String} visibility Visibility to change to
	 */
	public setToggleState(node, visibility) {

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
	 * @param event
	 * @param _id
	 */
	public expand(event, _id) {
		let i, length,
			j, jLength,
			numChildren = 0,
			index = -1,
			endOfSplice = false,
			numChildrenToForceRedraw = 3;

		event.stopPropagation();

		// Find node index
		for (i = 0, length = this.state.nodesToShow.length; i < length; i += 1) {
			if (this.state.nodesToShow[i]._id === _id) {
				index = i;
				break;
			}
		}
		const _ids = [_id];
		// Found
		if (index !== -1) {
			if (this.state.nodesToShow[index].hasChildren) {
				if (this.state.nodesToShow[index].expanded) {
					// Collapse

					// if the target itself contains subModelTree
					if (this.state.nodesToShow[index].hasSubModelTree) {
						// node containing sub model tree must have only one child
						// TODO - do we still need getSubTreesById?
						const subTreesById = this.getSubTreesById();
						const subModelNode = subTreesById[this.state.nodesToShow[index].children[0]._id];
						_ids.push(subModelNode._id);
					}

					while (!endOfSplice) {

						if (this.isDefined(this.state.nodesToShow[index + 1]) && this.matchPath(_ids, this.state.nodesToShow[index + 1].path)) {

							if (this.state.nodesToShow[index + 1].hasSubModelTree) {
								// TODO - do we still need getSubTreesById?
								const subTreesById = this.getSubTreesById();
								const subModelNode = subTreesById[this.state.nodesToShow[index + 1].children[0]._id];
								_ids.push(subModelNode._id);
							}

							this.state.nodesToShow.splice(index + 1, 1);

						} else {
							endOfSplice = true;
						}
					}
				} else {
					// Expand
					numChildren = this.state.nodesToShow[index].children.length;

					// If the node has a large number of children then force a redraw of the tree to get round the display problem
					if (numChildren >= numChildrenToForceRedraw) {
						this.state.showNodes = false;
					}

					for (i = 0; i < numChildren; i += 1) {
						// For federation - handle node of model that cannot be viewed or has been deleted
						// That node will be below level 0 only
						if ((this.state.nodesToShow[index].level === 0) &&
							this.state.nodesToShow[index].children[i].hasOwnProperty("children") &&
							this.state.nodesToShow[index].children[i].children[0].hasOwnProperty("status")) {

							this.state.nodesToShow[index].children[i].status = this.state.nodesToShow[index].children[i].children[0].status;

						} else {
							// Normal tree node
							this.state.nodesToShow[index].children[i].expanded = false;

							// If the child node does not have a toggleState set it to visible
							if (!this.state.nodesToShow[index].children[i].hasOwnProperty("toggleState")) {
								this.setToggleState(this.state.nodesToShow[index].children[i], "visible");
							}

						}

						// A child node only "hasChildren", i.e. expandable, if any of it's children have a name
						this.state.nodesToShow[index].children[i].level = this.state.nodesToShow[index].level + 1;
						this.state.nodesToShow[index].children[i].hasChildren = false;
						if (("children" in this.state.nodesToShow[index].children[i]) && (this.state.nodesToShow[index].children[i].children.length > 0)) {
							for (j = 0, jLength = this.state.nodesToShow[index].children[i].children.length; j < jLength; j++) {
								if (this.state.nodesToShow[index].children[i].children[j].hasOwnProperty("name")) {
									this.state.nodesToShow[index].children[i].hasChildren = true;
									break;
								}
							}
						}

						if (this.state.nodesToShow[index].children[i].hasOwnProperty("name")) {
							this.state.nodesToShow.splice(index + i + 1, 0, this.state.nodesToShow[index].children[i]);
						}

					}

				}
				this.state.nodesToShow[index].expanded = !this.state.nodesToShow[index].expanded;
			}
		}
	}

	/**
	 * Expand the tree and highlight the node corresponding to the object selected in the viewer.
	 * @param path
	 * @param level
	 */
	public expandToSelection(path, level, noHighlight) {
		let i, j, length, childrenLength, selectedId = path[path.length - 1], selectedIndex = 0, selectionFound = false;

		// Force a redraw of the tree to get round the display problem
		this.state.showNodes = false;
		let condLoop = true;
		for (i = 0, length = this.state.nodesToShow.length; i < length && condLoop; i++) {
			if (this.state.nodesToShow[i]._id === path[level]) {

				this.state.lastParentWithName = this.state.nodesToShow[i];

				this.state.nodesToShow[i].expanded = true;
				this.state.nodesToShow[i].selected = false;
				childrenLength = this.state.nodesToShow[i].children.length;

				if (level === (path.length - 2)) {
					selectedIndex = i;
				}

				let childWithNameCount = 0;

				for (j = 0; j < childrenLength; j += 1) {
					// Set child to not expanded
					this.state.nodesToShow[i].children[j].expanded = false;

					if (this.state.nodesToShow[i].children[j]._id === selectedId) {

						if (this.state.nodesToShow[i].children[j].hasOwnProperty("name")) {
							this.state.nodesToShow[i].children[j].selected = true;
							if (!noHighlight) {
								this.selectNode(this.state.nodesToShow[i].children[j], false);
							}
							this.state.lastParentWithName = null;
							selectedIndex = i + j + 1;

						} else if (!noHighlight) {
							// If the selected mesh doesn't have a name highlight the parent in the tree
							// highlight the parent in the viewer

							this.selectNode(this.state.nodesToShow[i], false);
							selectedId = this.state.nodesToShow[i]._id;
							selectedIndex = i;
							this.state.lastParentWithName = null;
							selectedId = this.state.nodesToShow[i]._id;
						}

						condLoop = false;
					} else {
						// This will clear any previously selected node
						this.state.nodesToShow[i].children[j].selected = false;
					}

					// Only set the toggle state once when the node is listed
					if (!this.state.nodesToShow[i].children[j].hasOwnProperty("toggleState")) {
						this.setToggleState(this.state.nodesToShow[i].children[j], "visible");
					}

					// Determine if child node has childern
					this.state.nodesToShow[i].children[j].hasChildren = false;
					if (("children" in this.state.nodesToShow[i].children[j]) && (this.state.nodesToShow[i].children[j].children.length > 0)) {
						for (let k = 0, jLength = this.state.nodesToShow[i].children[j].children.length; k < jLength; k++) {
							if (this.state.nodesToShow[i].children[j].children[k].hasOwnProperty("name")) {
								this.state.nodesToShow[i].children[j].hasChildren = true;
								break;
							}
						}
					}

					// Set current selected node
					if (this.state.nodesToShow[i].children[j].selected) {
						selectionFound = true;

					}

					this.state.nodesToShow[i].children[j].level = level + 1;

					if (this.state.nodesToShow[i].hasChildren && this.state.nodesToShow[i].children[j].hasOwnProperty("name")) {

						this.state.nodesToShow.splice(i + childWithNameCount + 1, 0, this.state.nodesToShow[i].children[j]);
						childWithNameCount++;
					}

				}
			}
		}

		let selectionData = {
			selectedIndex: selectedIndex,
			selectedId: selectedId
		};

		if (level < (path.length - 2)) {
			this.TreeService.expandToSelection(path, (level + 1), undefined);
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
		} else if (this.state.subModelIdToPath[objectID]) {
			// Else check the submodel for the id for the path
			path = this.state.subModelIdToPath[objectID].split("__");
			const parentPath = this.state.subTreesById[path[0]].parent.path.split("__");
			path = parentPath.concat(path);
		}

		return path;

	}

	public toggleTreeNode(node) {

		let path;
		let hasParent;
		let lastParent = node;
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

		for (let i = 0; i < this.state.nodesToShow.length; i++) {
			// Get node parent
			if (this.state.nodesToShow[i]._id === path[path.length - 1]) {

				lastParent = this.state.nodesToShow[i];
				hasParent = true;

			} else if (lastParent.parent) {

				// Get node parent and reconstruct the path in case it is a fed model
				lastParent = lastParent.parent;
				path = lastParent.path.split("__").concat(path);
				hasParent = true;
			}
		}

		// Set the toggle state of the nodes above
		if (hasParent) {
			for (let i = (path.length - 1); i >= 0; i -= 1) {
				for (let j = 0, nodesLength = this.state.nodesToShow.length; j < nodesLength; j += 1) {
					if (this.state.nodesToShow[j]._id === path[i]) {
						numInvisible = this.state.nodesToShow[j].children.reduce(
							(total, child) => {
								return child.toggleState === "invisible" ? total + 1 : total;
							},
							0);
						numParentInvisible = this.state.nodesToShow[j].children.reduce(
							(total, child) => {
								return child.toggleState === "parentOfInvisible" ? total + 1 : total;
							},
							0);

						if (numInvisible === this.state.nodesToShow[j].children.length) {
							this.state.nodesToShow[j].toggleState = "invisible";
						} else if ((numParentInvisible + numInvisible) > 0) {
							this.state.nodesToShow[j].toggleState = "parentOfInvisible";
						} else {
							this.setToggleState(this.state.nodesToShow[j], "visible");
						}
					}
				}
			}
		}

		this.toggleNode(node);
	}

	public toggleTreeNodeByUid(uid) {
		const path = this.getPath(uid);
		const selectionData = this.expandToSelection(path, 0, undefined);
		const node = this.state.nodesToShow[selectionData.selectedIndex];;
		//this.setToggleState(node, "invisible");
		this.toggleTreeNode(node);
	}

	public toggleNode(node) {
		const childNodes = [];

		this.traverseNodeAndPushId(node, childNodes);

		this.visibilityMap = childNodes;
	}

	/**
	 * Unselect all selected items and clear the array
	 */
	public clearCurrentlySelected() {
		if (this.state.currentSelectedNodes) {
			this.state.currentSelectedNodes.forEach((selectedNode) => {
				selectedNode.selected = false;
			});
		}
		this.state.currentSelectedNodes = [];
	}

	/**
	 * Selected a node in the tree
	 *
	 * @param node
	 */
	public selectNode(node, multi) {

		const sameNodeIndex = this.state.currentSelectedNodes.findIndex((element) => {
			return element._id === node._id;
		});

		if (multi) {
			if (sameNodeIndex > -1) {
				// Multiselect mode and we selected the same node - unselect it
				this.state.currentSelectedNodes[sameNodeIndex].selected = false;
				this.state.currentSelectedNodes.splice(sameNodeIndex, 1);
			} else {
				node.selected = true;
				this.state.currentSelectedNodes.push(node);
			}
		} else {
			// If it is not multiselect mode, remove all highlights.
			//TODO
			//this.ViewerService.clearHighlights();
			this.clearCurrentlySelected();
			node.selected = true;
			this.state.currentSelectedNodes.push(node);
		}

		const map = [];

		this.traverseNodeAndPushId(node, map);

		const objectToHighlight =  {
			account: node.account,
			id: node._id,
			model: node.model || node.project, // TODO: Remove project from backend
			name: node.name,
			noHighlight : true,
			source: "tree",
		};

		this.highlightMap = map;
	}

	public toggleFilterNode(item) {
		this.setToggleState(item, (item.toggleState === "visible") ? "invisible" : "visible");
		item.path = item._id;
		this.toggleNode(item);
	}

	public updateClickedHidden(node) {
		if (node.toggleState === "invisible") {
			this.state.clickedHidden[node._id] = node;
		} else {
			delete this.state.clickedHidden[node._id];
		}
	}

	public updateClickedShown(node) {
		if (node.toggleState === "visible") {
			this.state.clickedShown[node._id] = node;
		} else {
			delete this.state.clickedShown[node._id];
		}
	}

}

export const TreeServiceModule = angular
	.module("3drepo")
	.service("TreeService", TreeService);
