import { IScope, ITimeoutService } from "angular";
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
	private currentSelectedNodes;
	private highlightSelectedViewerObject: boolean;
	private clickedHidden;
	private clickedShown;
	private lastParentWithName = null;
	private nodes;
	private allNodes;
	private nodesToShow;
	private showNodes;
	private showTree;
	private showFilterList;
	private currentFilterItemSelected = null;
	private viewerSelectedObject;
	private showProgress;
	private progressInfo;
	private visible;
	private invisible;
	private subTreesById;
	private idToPath;
	private subModelIdToPath;
	private filterItemsFound;
	private topIndex;
	private toggledNode;
	private infiniteItemsTree;
	private infiniteItemsFilter;
	private onContentHeightRequest;

	constructor(
		private $scope: IScope,
		private $timeout: ITimeoutService,

		private TreeService,
		private EventService,
		private MultiSelectService,
		private ViewerService,
	) {

		this.promise = null,
		this.highlightSelectedViewerObject = true
		//this.currentSelectedNodes = [],
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
		//this.currentSelectedNodes = [];
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
							this.TreeService.expandToSelection(path, 0, undefined);
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
				this.nodes = this.allNodes;
				this.showTree = true;
				this.showProgress = false;
				this.TreeService.setSubTreesById(event.value.subTreesById);
				this.TreeService.setCachedIdToPath(event.value.idToPath);

				this.TreeService.setSubModelIdToPath(event.value.subModelIdToPath);

				this.initNodesToShow();
				this.TreeService.expandFirstNode();
				this.setupInfiniteScroll();
				this.setContentHeight(this.TreeService.getNodesToShow());
			} else if (event.type === this.EventService.EVENT.STATE_CHANGED) {
				// TODO
				//event.value.path = vm.getPath(event.value._id);
				//event.value.path = "__" + event.value._id;
				//vm.toggleTreeNode(event.value);
			}
		});

		this.$scope.$watch("vm.filterText", (newValue) => {
			const noFilterItemsFoundHeight = 82;

			if (this.TreeService.isDefined(newValue)) {
				if (newValue.toString() === "") {
					this.showTree = true;
					this.showFilterList = false;
					this.showProgress = false;
					this.nodes = this.TreeService.getNodesToShow();
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

		this.$scope.$watch(() => {return this.TreeService.state},
			(state) => {
				if (state) {
					angular.extend(this, state);
				}
			},
		true);
		
		this.$scope.$watch(() => {return this.TreeService.highlightMap},
			(highlightMap) => {

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
			});
		
		this.$scope.$watch(() => {return this.clickedHidden},
			(clickedHidden) => {

				let objectIdsToHide = [];

				for (const id in clickedHidden) {
					const account = clickedHidden[id].account;
					const model = clickedHidden[id].project;
					const key = account + "@" + model;

					if (!objectIdsToHide[key]) {
						objectIdsToHide[key] = [];
					}

					objectIdsToHide[key].push(id);
				}

				// Update viewer object visibility
				for (const key in objectIdsToHide) {
					if (key) {
						const vals = key.split("@");
						const account = vals[0];
						const model = vals[1];

						this.ViewerService.switchObjectVisibility(
							account,
							model,
							objectIdsToHide[key],
							false
						);
					}
				}
			},
		true);
		
		this.$scope.$watch(() => {return this.clickedShown},
			(clickedShown) => {

				let objectIdsToShow = [];

				for (const id in clickedShown) {
					const account = clickedShown[id].account;
					const model = clickedShown[id].project;
					const key = account + "@" + model;

					if (!objectIdsToShow[key]) {
						objectIdsToShow[key] = [];
					}

					objectIdsToShow[key].push(id);
				}

				// Update viewer object visibility
				for (const key in objectIdsToShow) {
					if (key) {
						const vals = key.split("@");
						const account = vals[0];
						const model = vals[1];

						this.ViewerService.switchObjectVisibility(
							account,
							model,
							objectIdsToShow[key],
							true
						);
					}
				}
			},
		true);
		
		this.$scope.$watch(() => {return this.TreeService.selectionData},
			(selectionData) => {
				if (selectionData) {
					let selectedIndex = selectionData.selectedIndex;
					let selectedId = selectionData.selectedId;
				
					this.setContentHeight(this.TreeService.getNodesToShow());
					this.TreeService.setShowNodes(true);
					this.$timeout(() => {
						// Redraw the tree

						// Resize virtual repeater

						// Taken from kseamon's comment - https://github.com/angular/material/issues/4314
						this.$scope.$broadcast("$md-resize");
						this.topIndex = selectedIndex;
					});

					this.$timeout(() => {
						const el = document.getElementById(selectedId);
						if (el) {
							el.scrollIntoView();
						}
					});
				}
			});
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
	 * Expand a node to show its children.
	 * @param event
	 * @param _id
	 */
	public expand(event, _id) {
		this.TreeService.expand(event, _id);
		
		// Redraw the tree if needed
		if (!this.TreeService.isShowNodes()) {
			this.$timeout(() => {
				this.TreeService.setShowNodes(true);
				// Resize virtual repeater
				// Taken from kseamon's comment - https://github.com/angular/material/issues/4314
				this.$scope.$broadcast("$md-resize");
			});
		}
		
		this.setContentHeight(this.TreeService.getNodesToShow());
	}

	public toggleTreeNode(node) {
		this.TreeService.toggleTreeNode(node);
	}

	public setupInfiniteScroll() {
		// Infinite items
		this.infiniteItemsTree = {
			numLoaded_: 0,
			toLoad_: 0,

			getItemAtIndex(index) {
				if (index > this.numLoaded_) {
					this.fetchMoreItems(index);
					return null;
				}

				if (index < this.nodesToShow.length) {
					return this.nodesToShow[index];
				} else {
					return null;
				}
			},

			getLength() {
				return this.numLoaded_ + 5;
			},

			fetchMoreItems(index) {
				if (this.toLoad_ < index) {
					this.toLoad_ += 500;
					this.$timeout(() => {}, 300).then(() => {
						this.numLoaded_ = this.toLoad_;
					});
				}
			},
		};
	}

	/**
	 * Selected a node in the tree
	 *
	 * @param node
	 */
	public selectNode(node) {
		this.TreeService.selectNode(node);
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
	},
	controller: TreeController,
	controllerAs: "vm",
	templateUrl: "templates/tree.html",
};

export const TreeComponentModule = angular
	.module("3drepo")
	.component("tree", TreeComponent);
