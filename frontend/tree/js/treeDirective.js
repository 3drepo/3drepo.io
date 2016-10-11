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

(function () {
	"use strict";

	angular.module("3drepo")
		.directive("tree", tree);

	function tree() {
		return {
			restrict: "EA",
			templateUrl: "tree.html",
			scope: {
				account:  "=",
				project:  "=",
				branch:   "=",
				revision: "=",
				filterText: "=",
				onContentHeightRequest: "&"
			},
			controller: TreeCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	TreeCtrl.$inject = ["$scope", "$timeout", "TreeService", "EventService"];

	/**
	 *
	 * @param $scope
	 * @param $timeout
	 * @param TreeService
	 * @param EventService
	 * @constructor
	 */
	function TreeCtrl($scope, $timeout, TreeService, EventService) {
		var vm = this,
			promise = null,
			i = 0,
			length = 0,
			currentSelectedNode = null,
			currentScrolledToNode = null,
			highlightSelectedViewerObject = true,
			clickedHidden = {}, // Nodes that have actually been clicked to hide
			clickedShown = {}, // Nodes that have actually been clicked to show
			multiSelectMode = false;

		/*
		 * Init
		 */
		vm.nodes = [];
		vm.showNodes = true;
		vm.showTree = true;
		vm.showFilterList = false;
		vm.currentFilterItemSelected = null;
		vm.viewerSelectedObject = null;
		vm.showProgress = true;
		vm.progressInfo = "Loading full tree structure";
		vm.onContentHeightRequest({height: 70}); // To show the loading progress
		vm.visible   = [];
		vm.invisible = [];

		/*
		 * Get all the tree nodes
		 */
		promise = TreeService.init(vm.account, vm.project, vm.branch, vm.revision);
		promise.then(function (data) {
			vm.allNodes = [];
			vm.allNodes.push(data.nodes);
			vm.nodes = vm.allNodes;
			vm.showTree = true;
			vm.showProgress = false;

			vm.idToPath = data.idToPath;
			initNodesToShow();
			setupInfiniteScroll();
			setContentHeight(vm.nodesToShow);
		});

		/**
		 * Set the content height.
		 * The height of a node is dependent on its name length and its level.
		 *
		 * @param {Array} nodesToShow
		 */
		function setContentHeight (nodesToShow) {
			var i, length,
				height = 0,
				nodeMinHeight = 42,
				maxStringLength = 35, maxStringLengthForLevel = 0,
				lineHeight = 18, levelOffset = 2;

			for (i = 0, length = nodesToShow.length; i < length ; i += 1) {
				maxStringLengthForLevel = maxStringLength - (nodesToShow[i].level * levelOffset);
				if (nodesToShow[i].hasOwnProperty("name")) {
					height += nodeMinHeight + (lineHeight * Math.floor(nodesToShow[i].name.length / maxStringLengthForLevel));
				}
				else {
					height += nodeMinHeight + lineHeight;
				}
			}
			vm.onContentHeightRequest({height: height});
		}

		/**
		 * Initialise the tree nodes to show to the first node
		 */
		function initNodesToShow () {
			vm.nodesToShow = [vm.allNodes[0]];
			vm.nodesToShow[0].level = 0;
			vm.nodesToShow[0].expanded = false;
			vm.nodesToShow[0].hasChildren = true;
			vm.nodesToShow[0].selected = false;
			/*
			// Only make the top node visible if it was not previously clicked hidden
			if (!wasClickedHidden(vm.nodesToShow[0])) {
				vm.nodesToShow[0].toggleState = "visible";
			}
			*/
			// Only make the top node visible if it does not have a toggleState
			if (!vm.nodesToShow[0].hasOwnProperty("toggleState")) {
				vm.nodesToShow[0].toggleState = "visible";
			}
		}

		/**
		 * Set the toggle state of a node
		 * @param {Object} node Node to change the visibility for
		 * @param {String} visibility Visibility to change to
		 */
		vm.setToggleState = function(node, visibility)
		{
			var idx = -1;

			// TODO: This function is probably in-efficient
			if (visibility === "invisible")
			{
				if ((idx = vm.invisible.indexOf(node._id)) !== -1)
				{
					vm.invisible.splice(idx,1);
				} else {
					vm.invisible.push(node._id);
				}

				if ((idx = vm.visible.indexOf(node._id)) !== -1)
				{
					vm.visible.splice(idx, 1);
				}
			} else {
				if ((idx = vm.visible.indexOf(node._id)) !== -1)
				{
					vm.visible.splice(idx,1);
				} else {
					vm.visible.push(node._id);
				}

				if ((idx = vm.invisible.indexOf(node._id)) !== -1)
				{
					vm.invisible.splice(idx, 1);
				}

			}

			node.toggleState = visibility;
		};

		/**
		 * Expand a node to show its children.
		 * @param _id
		 */
		vm.expand = function (_id) {
			var i, length,
				j, jLength,
				numChildren = 0,
				index = -1,
				endOfSplice = false,
				numChildrenToForceRedraw = 3;

			// Find node index
			for (i = 0, length = vm.nodesToShow.length; i < length; i += 1) {
				if (vm.nodesToShow[i]._id === _id) {
					index = i;
					break;
				}
			}

			// Found
			if (index !== -1) {
				if (vm.nodesToShow[index].hasChildren) {
					if (vm.nodesToShow[index].expanded) {
						// Collapse
						while (!endOfSplice) {
							if (angular.isDefined(vm.nodesToShow[index + 1]) && vm.nodesToShow[index + 1].path.indexOf(_id) !== -1) {
								vm.nodesToShow.splice(index + 1, 1);
							} else {
								endOfSplice = true;
							}
						}
					} else {
						// Expand
						numChildren = vm.nodesToShow[index].children.length;

						// If the node has a large number of children then force a redraw of the tree to get round the display problem
						if (numChildren >= numChildrenToForceRedraw) {
							vm.showNodes = false;
						}

						for (i = 0; i < numChildren; i += 1) {
							// For federation - handle node of project that cannot be viewed or has been deleted
							// That node will be below level 0 only
							if ((vm.nodesToShow[index].level === 0) &&
								vm.nodesToShow[index].children[i].hasOwnProperty("children") &&
								vm.nodesToShow[index].children[i].children[0].hasOwnProperty("status")) {
								vm.nodesToShow[index].children[i].status = vm.nodesToShow[index].children[i].children[0].status;
							}
							else {
								// Normal tree node
								vm.nodesToShow[index].children[i].expanded = false;

								/*
								 // If the child node was not clicked hidden set its toggle state to visible
								 if (!wasClickedHidden(vm.nodesToShow[index].children[i])) {
								 vm.setToggleState(vm.nodesToShow[index].children[i], "visible");
								 }
								 */
								// If the child node does not have a toggleState set it to visible
								if (!vm.nodesToShow[index].children[i].hasOwnProperty("toggleState")) {
									vm.setToggleState(vm.nodesToShow[index].children[i], "visible");
								}
								// A node should relect the state of any path relative
								else if (((vm.nodesToShow[index].children[i].toggleState === "invisible") ||
									(vm.nodesToShow[index].children[i].toggleState === "parentOfInvisible")) &&
									pathRelativeWasClickShown(vm.nodesToShow[index].children[i])) {
									vm.setToggleState(vm.nodesToShow[index].children[i], "visible");
								}
							}

							// A child node only "hasChildren", i.e. expandable, if any of it's children have a name
							vm.nodesToShow[index].children[i].level = vm.nodesToShow[index].level + 1;
							vm.nodesToShow[index].children[i].hasChildren = false;
							if (("children" in vm.nodesToShow[index].children[i]) && (vm.nodesToShow[index].children[i].children.length > 0)) {
								for (j = 0, jLength = vm.nodesToShow[index].children[i].children.length; j < jLength; j++) {
									if (vm.nodesToShow[index].children[i].children[j].hasOwnProperty("name")) {
										vm.nodesToShow[index].children[i].hasChildren = true;
										break;
									}
								}
							}

							vm.nodesToShow.splice(index + i + 1, 0, vm.nodesToShow[index].children[i]);
						}

						// Redraw the tree if needed
						if (!vm.showNodes) {
							$timeout(function () {
								vm.showNodes = true;
							});
						}
					}
					vm.nodesToShow[index].expanded = !vm.nodesToShow[index].expanded;
				}
			}

			setContentHeight(vm.nodesToShow);
		};

		/**
		 * Expand the tree and highlight the node corresponding to the object selected in the viewer.
		 * @param path
		 * @param level
		 */
		function expandToSelection(path, level) {
			var i, j, length, childrenLength, selectedId = path[path.length - 1], selectedIndex = 0, selectionFound = false;

			// Force a redraw of the tree to get round the display problem
			vm.showNodes = false;

			for (i = 0, length = vm.nodesToShow.length; i < length; i += 1) {
				if (vm.nodesToShow[i]._id === path[level]) {
					vm.nodesToShow[i].expanded = true;
					vm.nodesToShow[i].selected = false;
					childrenLength = vm.nodesToShow[i].children.length;

					if (level === (path.length - 2)) {
						selectedIndex = i;
					}

					for (j = 0; j < childrenLength; j += 1) {
						// Set child to not expanded
						vm.nodesToShow[i].children[j].expanded = false;

						if (vm.nodesToShow[i].children[j]._id === selectedId) {
							// If the selected mesh doesn't have a name highlight the parent in the tree
							// highlight the parent in the viewer
							if (vm.nodesToShow[i].children[j].hasOwnProperty("name")) {
								vm.nodesToShow[i].children[j].selected = true;
							}
							else {
								vm.selectNode(vm.nodesToShow[i]);
							}
						}
						else {
							// This will clear any previously selected node
							vm.nodesToShow[i].children[j].selected = false;
						}

						// Only set the toggle state once when the node is listed
						if (!vm.nodesToShow[i].children[j].hasOwnProperty("toggleState")) {
							vm.setToggleState(vm.nodesToShow[i].children[j], "visible");
						}

						// Determine if child node has childern
						if ("children" in vm.nodesToShow[i].children[j]) {
							vm.nodesToShow[i].children[j].hasChildren = vm.nodesToShow[i].children[j].children.length > 0;
						}
						else {
							vm.nodesToShow[i].children[j].hasChildren = false;
						}

						// Set current selected node
						if (vm.nodesToShow[i].children[j].selected) {
							selectionFound = true;
							currentSelectedNode = vm.nodesToShow[i].children[j];
						}

						// Determine if more expansion is required
						if ((level === (path.length - 2)) && !selectionFound) {
							selectedIndex += 1;
						}
						vm.nodesToShow[i].children[j].level = level + 1;
						vm.nodesToShow.splice(i + j + 1, 0, vm.nodesToShow[i].children[j]);
					}
				}
			}
			if (level < (path.length - 2)) {
				expandToSelection(path, (level + 1));
			} else if (level === (path.length - 2)) {
				vm.topIndex = selectedIndex - 2;
				setContentHeight(vm.nodesToShow);
				// Redraw the tree
				$timeout(function () {
					vm.showNodes = true;
				});
			}
		}

		$scope.$watch(EventService.currentEvent, function(event) {
			if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
				if ((event.value.source !== "tree") && highlightSelectedViewerObject)
				{
					var objectID = event.value.id;

					if (objectID)
					{
						var path = vm.idToPath[objectID].split("__");

						initNodesToShow();
						expandToSelection(path, 0);
					}
				}
			}
			else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
				// Remove highlight from any selected node in the tree
				if (currentSelectedNode !== null) {
					currentSelectedNode.selected = false;
					currentSelectedNode = null;
					if (vm.currentFilterItemSelected !== null) {
						vm.currentFilterItemSelected.class = "";
						vm.currentFilterItemSelected = null;
					}
				}
			}
			else if ((event.type === EventService.EVENT.PANEL_CARD_ADD_MODE) ||
					 (event.type === EventService.EVENT.PANEL_CARD_EDIT_MODE)) {
				// If another card is in modify mode don't show a node if an object is clicked in the viewer
				highlightSelectedViewerObject = !event.value.on;
			}
			else if (event.type === EventService.EVENT.MULTI_SELECT_MODE) {
				multiSelectMode = event.value;
			}
		});

		vm.toggleTreeNode = function (node) {
			var i, j,
				nodesLength,
				path,
				parent = null,
				nodeToggleState = "visible",
				numInvisible = 0,
				numParentInvisible = 0;

			vm.toggledNode = node;

			path = node.path.split("__");
			path.splice(path.length - 1, 1);

			for (i = 0, nodesLength = vm.nodesToShow.length; i < nodesLength; i += 1) {
				// Set node toggle state
				if (vm.nodesToShow[i]._id === node._id) {
					vm.setToggleState(vm.nodesToShow[i], (vm.nodesToShow[i].toggleState === "visible") ? "invisible" : "visible");
					nodeToggleState = vm.nodesToShow[i].toggleState;
					updateClickedHidden(vm.nodesToShow[i]);
					updateClickedShown(vm.nodesToShow[i]);
				}
				// Set children to node toggle state
				else if (vm.nodesToShow[i].path.indexOf(node._id) !== -1) {
					vm.setToggleState(vm.nodesToShow[i], nodeToggleState);
				}
				// Get node parent
				if (vm.nodesToShow[i]._id === path[path.length - 1]) {
					parent = vm.nodesToShow[i];
				}
			}

			// Set the toggle state of the nodes above
			if (parent !== null) {
				for (i = (path.length - 1); i >= 0; i -= 1) {
					for (j = 0, nodesLength = vm.nodesToShow.length; j < nodesLength; j += 1) {
						if (vm.nodesToShow[j]._id === path[i]) {
							numInvisible = vm.nodesToShow[j].children.reduce(
								function (total, child) {
									return child.toggleState === "invisible" ? total + 1 : total;
								},
								0);
							numParentInvisible = vm.nodesToShow[j].children.reduce(
								function (total, child) {
									return child.toggleState === "parentOfInvisible" ? total + 1 : total;
								},
								0);

							if (numInvisible === vm.nodesToShow[j].children.length) {
								vm.setToggleState(vm.nodesToShow[j], "invisible");
							} else if ((numParentInvisible + numInvisible) > 0) {
								vm.setToggleState(vm.nodesToShow[j], "parentOfInvisible");
							} else {
								vm.setToggleState(vm.nodesToShow[j], "visible");
							}
						}
					}
				}
			}
			toggleNode(node);
		};

		var toggleNode = function (node) {
			var childNodes = [];
			var pathArr = [];
			var idx = 0, i = 0;

			for (var obj in vm.idToPath) {
				if (vm.idToPath.hasOwnProperty(obj) && (vm.idToPath[obj].indexOf(node.path) !== -1)) {
					pathArr = vm.idToPath[obj].split("__");
					childNodes.push(pathArr[pathArr.length - 1]);
				}
			}

			if (node.toggleState === "invisible")
			{
				for(i = 0; i < childNodes.length; i++)
				{
					if (vm.invisible.indexOf(childNodes[i]) === -1)
					{
						vm.invisible.push(childNodes[i]);
					}

					idx = vm.visible.indexOf(childNodes[i]);
					if (idx !== -1)
					{
						vm.visible.splice(idx,1);
					}
				}
			} else {
				for(i = 0; i < childNodes.length; i++)
				{
					if (vm.visible.indexOf(childNodes[i]) === -1)
					{
						vm.visible.push(childNodes[i]);
					}

					idx = vm.invisible.indexOf(childNodes[i]);
					if (idx !== -1)
					{
						vm.invisible.splice(idx,1);
					}
				}
			}

			EventService.send(EventService.EVENT.VIEWER.SWITCH_OBJECT_VISIBILITY, {
				source: "tree",
				account: node.account,
				project: node.project,
				name: node.name,
				visible_ids: vm.visible,
				invisible_ids: vm.invisible
			});
		};

		function setupInfiniteScroll() {
			// Infinite items
			vm.infiniteItemsTree = {
				numLoaded_: 0,
				toLoad_: 0,

				getItemAtIndex: function (index) {
					if (index > this.numLoaded_) {
						this.fetchMoreItems_(index);
						return null;
					}

					if (index < vm.nodesToShow.length) {
						return vm.nodesToShow[index];
					} else {
						return null;
					}
				},

				getLength: function () {
					return this.numLoaded_ + 5;
				},

				fetchMoreItems_: function (index) {
					if (this.toLoad_ < index) {
						this.toLoad_ += 500;
						$timeout(angular.noop, 300).then(angular.bind(this, function () {
							this.numLoaded_ = this.toLoad_;
						}));
					}
				}
			};
		}

		$scope.$watch("vm.filterText", function (newValue) {
			var noFilterItemsFoundHeight = 82;

			if (angular.isDefined(newValue)) {
				if (newValue.toString() === "") {
					vm.showTree = true;
					vm.showFilterList = false;
					vm.showProgress = false;
					vm.nodes = vm.nodesToShow;
					setContentHeight(vm.nodes);
				} else {
					vm.showTree = false;
					vm.showFilterList = false;
					vm.showProgress = true;
					vm.progressInfo = "Filtering tree for objects";

					promise = TreeService.search(newValue);
					promise.then(function (json) {
						vm.showFilterList = true;
						vm.showProgress = false;
						vm.nodes = json.data;
						if (vm.nodes.length > 0) {
							vm.filterItemsFound = true;
							for (i = 0, length = vm.nodes.length; i < length; i += 1) {
								vm.nodes[i].index = i;
								vm.nodes[i].toggleState = "visible";
								vm.nodes[i].class = "unselectedFilterItem";
								vm.nodes[i].level = 0;
							}
							setupInfiniteItemsFilter();
							setContentHeight(vm.nodes);
						}
						else {
							vm.filterItemsFound = false;
							vm.onContentHeightRequest({height: noFilterItemsFoundHeight});
						}
					});
				}
			}
		});

		/**
		 * Selected a node in the tree
		 *
		 * @param node
		 */
		vm.selectNode = function (node) {
			// Remove highlight from the current selection and highlight this node if not the same
			if (currentSelectedNode !== null) {
				currentSelectedNode.selected = false;
				if (currentSelectedNode._id === node._id) {
					currentSelectedNode = null;
				}
				else {
					node.selected = true;
					currentSelectedNode = node;
				}
			}
			else {
				node.selected = true;
				currentSelectedNode = node;
			}

			// Remove highlight from the current selection in the viewer and highlight this object if not the same
			if (currentSelectedNode === null) {
				EventService.send(EventService.EVENT.VIEWER.BACKGROUND_SELECTED);
			}
			else {
				var map = [];
				var pathArr = [];
				for (var obj in vm.idToPath) {
					if (vm.idToPath.hasOwnProperty(obj) && (vm.idToPath[obj].indexOf(node._id) !== -1)) {
						pathArr = vm.idToPath[obj].split("__");
						map.push(pathArr[pathArr.length - 1]);
					}
				}

				// Select the parent node in the group for cards and viewer
				EventService.send(EventService.EVENT.VIEWER.OBJECT_SELECTED, {
					source: "tree",
					account: node.account,
					project: node.project,
					id: node._id,
					name: node.name
				});

				// Separately highlight the children
				// but only for multipart meshes
				if (document.getElementsByTagName("multipart").length)
				{
					EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, {
						source: "tree",
						account: node.account,
						project: node.project,
						ids: map
					});
				}
			}
		};

		vm.filterItemSelected = function (item) {
			if (vm.currentFilterItemSelected === null) {
				vm.nodes[item.index].class = "treeNodeSelected";
				vm.currentFilterItemSelected = item;
			} else if (item.index === vm.currentFilterItemSelected.index) {
				vm.nodes[item.index].class = "";
				vm.currentFilterItemSelected = null;
			} else {
				vm.nodes[vm.currentFilterItemSelected.index].class = "";
				vm.nodes[item.index].class = "treeNodeSelected";
				vm.currentFilterItemSelected = item;
			}

			var selectedNode = vm.nodes[item.index];

			vm.selectNode(selectedNode);
		};

		vm.toggleFilterNode = function (item) {
			vm.setToggleState(item, (item.toggleState === "visible") ? "invisible" : "visible");
			item.path = item._id;
			toggleNode(item);
		};

		function setupInfiniteItemsFilter() {
			vm.infiniteItemsFilter = {
				numLoaded_: 0,
				toLoad_: 0,
				getItemAtIndex: function (index) {
					if (index > this.numLoaded_) {
						this.fetchMoreItems_(index);
						return null;
					}

					if (index < vm.nodes.length) {
						return vm.nodes[index];
					} else {
						return null;
					}
				},
				getLength: function () {
					return this.numLoaded_ + 5;
				},
				fetchMoreItems_: function (index) {
					if (this.toLoad_ < index) {
						this.toLoad_ += 20;
						$timeout(angular.noop, 300).then(angular.bind(this, function () {
							this.numLoaded_ = this.toLoad_;
						}));
					}
				}
			};
		}

		/**
		 * If a node was clicked to hide, add it to a list of similar nodes
		 *
		 * @param {Object} node
		 */
		function updateClickedHidden (node) {
			if (node.toggleState === "invisible") {
				clickedHidden[node._id] = node;
			}
			else {
				delete clickedHidden[node._id];
			}
		}

		/**
		 * If a node was clicked to show, add it to a list of similar nodes
		 *
		 * @param {Object} node
		 */
		function updateClickedShown (node) {
			if (node.toggleState === "visible") {
				clickedShown[node._id] = node;
			}
			else {
				delete clickedShown[node._id];
			}
		}

		/**
		 * Check if a relative in the path was clicked to show
		 *
		 * @param {Object} node
		 */
		function pathRelativeWasClickShown (node) {
			var i, length,
				relativeWasClickShown = false,
				path = node.path.split("__");

			path.pop(); // Remove _id of node from path
			for (i = 0, length = path.length; i < length; i += 1) {
				if (clickedShown.hasOwnProperty(path[i])) {
					relativeWasClickShown = true;
					break;
				}
			}

			return relativeWasClickShown;
		}

		/**
		 * Check if a node was clicked to hide
		 *
		 * @param {Object} node
		 */
		function wasClickedHidden (node) {
			return clickedHidden.hasOwnProperty(node._id);
		}
	}
}());
