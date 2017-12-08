import { IScope, ITimeoutService } from "angular";
// import { TreeService } from "./tree.service";
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

class TreeController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$timeout",

		"TreeService",
		"EventService",
		"MultiSelectService",
		"ViewerService",
	];

	private promise;
	private highlightSelectedViewerObject: boolean;
	private clickedHidden;
	private clickedShown;
	private lastParentWithName = null;
	private nodes; // in pug
	private allNodes;
	private nodesToShow; // in pug
	private showNodes; // in pug
	private showTree; // in pug
	private showFilterList; // in pug
	private currentFilterItemSelected = null;
	private viewerSelectedObject;
	private showProgress; // in pug
	private progressInfo; // in pug
	private visible;
	private invisible;
	private idToPath;
	private filterItemsFound; // in pug
	private topIndex; // in pug
	private infiniteItemsFilter; // in pug
	private onContentHeightRequest;

	private currentSelectedId;
	private currentSelectedIndex;

	constructor(
		private $scope: IScope,
		private $timeout: ITimeoutService,

		private TreeService,
		private EventService,
		private MultiSelectService,
		private ViewerService,
	) {

		this.promise = null,
		this.highlightSelectedViewerObject = true;
	}

	public $onInit() {

		this.nodes = [];
		this.TreeService.setShowNodes(true);
		this.showTree = true;
		this.showFilterList = false;
		this.TreeService.clearCurrentlySelected();
		this.viewerSelectedObject = null;
		this.showProgress = true;
		this.progressInfo = "Loading full tree structure";
		this.onContentHeightRequest({height: 70}); // To show the loading progress
		this.TreeService.resetVisible();
		this.TreeService.resetInvisible();
		this.TreeService.resetClickedHidden(); // Nodes that have actually been clicked to hide
		this.TreeService.resetClickedShown(); // Nodes that have actually been clicked to show
		this.watchers();

	}

	public watchers() {
		this.$scope.$watch(this.EventService.currentEvent, (event: any) => {

			if (event.type === this.EventService.EVENT.VIEWER.OBJECT_SELECTED) {

				if ((event.value.source !== "tree") && this.TreeService.highlightSelectedViewerObject) {
					const objectID = event.value.id;

					if (objectID && this.TreeService.getCachedIdToPath()) {
						const path = this.TreeService.getPath(objectID);
						if (!path) {
							console.error("Couldn't find the object path");
						} else {
							this.initNodesToShow();
							this.TreeService.resetLastParentWithName();
							this.TreeService.expandToSelection(path, 0, undefined, this.MultiSelectService.isMultiMode());
							// all these init and expanding unselects the selected, so let's select them again
							// FIXME: ugly as hell but this is the easiest solution until we refactor this.
							this.TreeService.getCurrentSelectedNodes().forEach((selectedNode) => {
								selectedNode.selected = true;
							});
							if (this.TreeService.getLastParentWithName()) {
								this.TreeService.selectNode(this.TreeService.getLastParentWithName(), this.MultiSelectService.isMultiMode());
							}
						}
					}
				}

			} else if (event.type === this.EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
				this.TreeService.clearCurrentlySelected();
				if (this.currentFilterItemSelected !== null) {
					this.currentFilterItemSelected.class = "";
					this.currentFilterItemSelected = null;
				}
			} else if (event.type === this.EventService.EVENT.TREE_READY) {
				/*
				* Get all the tree nodes
				*/

				this.allNodes = [];
				this.allNodes.push(event.value.nodes);
				this.TreeService.setAllNodes(this.allNodes);
				this.nodes = this.allNodes;
				this.showTree = true;
				this.showProgress = false;
				this.TreeService.setSubTreesById(event.value.subTreesById);
				this.TreeService.setCachedIdToPath(event.value.idToPath);

				this.TreeService.setSubModelIdToPath(event.value.subModelIdToPath);

				this.initNodesToShow();
				this.TreeService.expandFirstNode();
				this.setupInfiniteItemsFilter();
				this.setContentHeight(this.fetchNodesToShow());
			}
		});

		this.$scope.$watch("vm.filterText", (newValue) => {
			const noFilterItemsFoundHeight = 82;

			if (this.TreeService.isDefined(newValue)) {
				if (newValue.toString() === "") {
					this.showTree = true;
					this.showFilterList = false;
					this.showProgress = false;
					this.nodes = this.fetchNodesToShow();
					this.setContentHeight(this.nodes);
				} else {
					this.showTree = false;
					this.showFilterList = false;
					this.showProgress = true;
					this.progressInfo = "Filtering tree for objects";

					this.TreeService.search(newValue)
						.then((json) => {
							this.showFilterList = true;
							this.showProgress = false;
							this.nodes = json.data;
							if (this.nodes.length > 0) {
								this.filterItemsFound = true;
								for (let i = 0; i < this.nodes.length; i ++) {
									this.nodes[i].index = i;
									this.nodes[i].toggleState = "visible";
									this.nodes[i].class = "unselectedFilterItem";
									this.nodes[i].level = 0;
								}
								this.setupInfiniteItemsFilter();
								this.setContentHeight(this.nodes);
							} else {
								this.filterItemsFound = false;
								this.onContentHeightRequest({height: noFilterItemsFoundHeight});
							}
						});
				}
			}
		});

		this.$scope.$watch("vm.selectedMenuOption", 
			(selectedOption: any) => {

				if (selectedOption && selectedOption.hasOwnProperty("value")) {
			
					// Menu option
					switch (selectedOption.value) {
						case "showAll":
							if (this.nodes[0] && this.nodes[0].toggleState !== "visible")
								this.TreeService.toggleTreeNode(this.nodes[0]);
							break;
						case "hideIfc":
							console.log("No IFC");
							break;
						case "isolate":
							// Hide all
							while (this.nodes[0] && this.nodes[0].toggleState !== "invisible")
								this.TreeService.toggleTreeNode(this.nodes[0]);
							// Show selected
							this.TreeService.getCurrentSelectedNodes().forEach((selectedNode) => {
								this.TreeService.toggleTreeNode(selectedNode);
							});
							break;
						default:
							console.error("Tree option menu selection unhandled");
					}
				}

			});

		// TODO - check for better way to sync state between component and service
		this.$scope.$watchCollection(() => this.TreeService.state,
			(state) => {
				if (state) {
					angular.extend(this, state);
				}
			});

		this.$scope.$watch(() => this.TreeService.selectionData,
			(selectionData) => {
				if (selectionData) {
					this.setContentHeight(this.fetchNodesToShow());
					this.TreeService.setShowNodes(true);
					this.$timeout(() => {
						// Redraw the tree

						// Resize virtual repeater

						// Taken from kseamon's comment - https://github.com/angular/material/issues/4314
						this.$scope.$broadcast("$md-resize");
						this.topIndex = selectionData.selectedIndex;
					});

					this.$timeout(() => {
						const el = document.getElementById(selectionData.selectedId);
						if (el) {
							el.scrollIntoView();
						}
					});
				}
			});

		// TODO - interval for redrawing highlights and object visibility is not ideal
		let lastViewerUpdateTime = Date.now();
		setInterval(() => {

			if (this.TreeService.highlightMapUpdateTime) {
				if (lastViewerUpdateTime < this.TreeService.highlightMapUpdateTime) {
					this.handleSelection(this.TreeService.highlightMap);
				}
			}

			if (this.TreeService.visibilityUpdateTime) {
				if (lastViewerUpdateTime < this.TreeService.visibilityUpdateTime) {
					this.handleVisibility(this.TreeService.getClickedHidden(), false);
					this.handleVisibility(this.TreeService.getClickedShown(), true);
				}
			}

			lastViewerUpdateTime = this.TreeService.highlightMapUpdateTime;

		}, 300);

	}

	/**
	 * Handle visibility changes from tree service to viewer service
	 */
	public handleVisibility(clickedIds, visible) {
		const objectIds = [];

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

				this.ViewerService.switchObjectVisibility(
					account,
					model,
					objectIds[key],
					visible,
				);
			}
		}
	}

	/**
	 * Handle highlight changes from tree service to viewer service
	 */
	public handleSelection(highlightMap) {
		// Update viewer highlights
		this.ViewerService.clearHighlights();

		for (const key in highlightMap) {
			if (key) {

				const vals = key.split("@");
				const account = vals[0];
				const model = vals[1];

				// Separately highlight the children
				// but only for multipart meshes
				this.ViewerService.highlightObjects({
					account,
					ids: highlightMap[key],
					model,
					multi: true,
					source: "tree",
				});
			}
		}

		// Reset highlight map to prevent extra triggers of handleSelection
		// (currently not needed as a timestamp is used to check sync)
		// this.TreeService.resetHighlightMap();
	}

	/**
	 * Set the content height.
	 * The height of a node is dependent on its name length and its level.
	 *
	 * @param {Array} nodesToShow
	 */
	public setContentHeight(nodesToShow) {
		let height = 0;
		let maxStringLengthForLevel = 0;
		const lineHeight = 18;
		const levelOffset = 2;
		const nodeMinHeight = 42;
		const maxStringLength = 35;

		for (let i = 0; i < nodesToShow.length ; i ++) {
			maxStringLengthForLevel = maxStringLength - (nodesToShow[i].level * levelOffset);
			if (nodesToShow[i].hasOwnProperty("name")) {
				height += nodeMinHeight + (lineHeight * Math.floor(nodesToShow[i].name.length / maxStringLengthForLevel));
			} else {
				height += nodeMinHeight + lineHeight;
			}
		}
		this.onContentHeightRequest({height});
	}

	/**
	 * Initialise the tree nodes to show to the first node
	 */
	public initNodesToShow() {
		this.TreeService.initNodesToShow([this.allNodes[0]]);
	}

	/**
	 * Fetch nodesToShow from tree service and update nodesToShow in tree component.
	 * Returns this.nodesToShow.
	 */
	public fetchNodesToShow() {
		this.nodesToShow = this.TreeService.getNodesToShow();
		return this.nodesToShow;
	}

	/**
	 * Expand a node to show its children.
	 */
	public expand(event, id) {

		// rAF fixes flickering as expand is computationally expensive
		requestAnimationFrame(() => {

			this.TreeService.expand(event, id);
			// Redraw the tree if needed
			if (!this.TreeService.isShowNodes()) {
				this.$timeout(() => {
					this.TreeService.setShowNodes(true);
				});
			}

			this.setContentHeight(this.fetchNodesToShow());
		});

	}

	public toggleTreeNode(node) {
		this.TreeService.toggleTreeNode(node);
	}

	/**
	 * Selected a node in the tree
	 *
	 * @param node
	 */
	public selectNode(node) {
		this.TreeService.selectNode(node, this.MultiSelectService.isMultiMode());
	}

	public filterItemSelected(item) {

		if (this.currentFilterItemSelected === null) {
			this.nodes[item.index].class = "treeNodeSelected";
			this.currentFilterItemSelected = item;
		} else if (item.index === this.currentFilterItemSelected.index) {
			this.nodes[item.index].class = "";
			this.currentFilterItemSelected = null;
		} else {
			this.nodes[this.currentFilterItemSelected.index].class = "";
			this.nodes[item.index].class = "treeNodeSelected";
			this.currentFilterItemSelected = item;
		}

		const selectedNode = this.nodes[item.index];

		if (selectedNode) {
			// TODO: This throws a unity error when filtering
			this.TreeService.selectNode(selectedNode, this.MultiSelectService.isMultiMode());
		}

	}

	public toggleFilterNode(item) {
		this.TreeService.toggleFilterNode(item);
	}

	public setupInfiniteItemsFilter() {
		this.infiniteItemsFilter = {
			numLoaded_: 0,
			toLoad_: 0,
			getItemAtIndex(index) {
				if (index > this.numLoaded_) {
					this.fetchMoreItems_(index);
					return null;
				}

				if (index < this.nodes.length) {
					return this.nodes[index];
				} else {
					return null;
				}
			},
			getLength() {
				return this.numLoaded_ + 5;
			},
			fetchMoreItems_(index) {
				if (this.toLoad_ < index) {
					this.toLoad_ += 20;
					this.$timeout(() => {}, 300).then(() => {
						this.numLoaded_ = this.toLoad_;
					});
				}
			},
		};
	}

}

export const TreeComponent: ng.IComponentOptions = {
	bindings: {
		account:  "=",
		branch:   "=",
		filterText: "=",
		model:  "=",
		onContentHeightRequest: "&",
		revision: "=",
		selectedMenuOption: "=",
	},
	controller: TreeController,
	controllerAs: "vm",
	templateUrl: "templates/tree.html",
};

export const TreeComponentModule = angular
	.module("3drepo")
	.component("tree", TreeComponent);
