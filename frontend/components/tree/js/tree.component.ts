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

	public showProgress: boolean; // in pug

	private promise;
	private highlightSelectedViewerObject: boolean;
	private clickedHidden;
	private clickedShown;
	// private lastParentWithName = null;
	private nodes; // in pug
	private allNodes;
	private nodesToShow; // in pug
	private showTree; // in pug
	private showFilterList; // in pug
	private currentFilterItemSelected = null;
	private viewerSelectedObject;
	private progressInfo; // in pug
	private visible;
	private invisible;
	private idToPath;
	private filterItemsFound; // in pug
	private topIndex; // in pug
	private infiniteItemsFilter; // in pug
	private onContentHeightRequest;
	private hideIfc;
	private showNodes;
	private currentSelectedIndex;
	private searching;

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
		this.showNodes = true;
		this.nodes = [];
		this.showTree = true;
		this.showFilterList = false;
		this.TreeService.clearCurrentlySelected();
		this.viewerSelectedObject = null;
		this.showProgress = true;
		this.progressInfo = "Loading full tree structure";
		this.onContentHeightRequest({height: 70}); // To show the loading progress
		this.TreeService.resetClickedHidden(); // Nodes that have actually been clicked to hide
		this.TreeService.resetClickedShown(); // Nodes that have actually been clicked to show
		this.hideIfc = true;

		this.allNodes = [];

		this.watchers();

	}

	public $onDestroy() {
		this.TreeService.reset();
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

							this.TreeService.expandToSelection(path, 0, undefined, this.MultiSelectService.isMultiMode());

							// all these init and expanding unselects the selected, so let's select them again
							// FIXME: ugly as hell but this is the easiest solution until we refactor this.
							this.TreeService.getCurrentSelectedNodes().forEach((selectedNode) => {
								selectedNode.selected = true;
							});

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

				console.log("TREE_READY");
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
				this.setupInfiniteItemsFilter();

				this.TreeService.expandFirstNode();
				this.setContentHeight(this.fetchNodesToShow());
				this.$timeout(() => {}).then(() => {
					//this.TreeService.showAllTreeNodes();
					//this.TreeService.setVisibilityOfNodes(this.TreeService.getHiddenByDefaultNodes(), "invisible");
				});

			}
		});

		this.$scope.$watch("vm.filterText", (newValue) => {
			const noFilterItemsFoundHeight = 82;
			if (newValue !== undefined) {
				if (newValue.toString() === "") {
					this.showTreeInPane();
				} else if (!this.searching) {
					this.showTree = false;
					this.showFilterList = false;
					this.showProgress = true;
					this.progressInfo = "Filtering tree for objects";

					console.log("showProgress");

					this.searching = true;
					this.TreeService.search(newValue)
						.then((json) => {

							if (!this.showFilterList) {
								this.searching = false;
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
							}

						})
						.catch((error) => {
							this.showTreeInPane();
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
							this.TreeService.showAllTreeNodes();
							break;
						case "hideIfc":
							this.hideIfc = selectedOption.selected;
							this.TreeService.setHideIfc(this.hideIfc);
							if (this.hideIfc) {
								this.ViewerService.hideHiddenByDefaultObjects();
								this.TreeService.hideTreeNodes(this.TreeService.getHiddenByDefaultNodes());
							} else {
								this.ViewerService.showHiddenByDefaultObjects();
								this.TreeService.showTreeNodes(this.TreeService.getHiddenByDefaultNodes());
							}
							break;
						case "isolate":
							this.TreeService.isolateSelected();
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

					this.$timeout(() => {}).then(() => {
						this.topIndex = selectionData.selectedIndex;
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

			lastViewerUpdateTime = Date.now();

		}, 150);

	}

	public showTreeInPane() {
		this.searching = false;
		this.showTree = true;
		this.showFilterList = false;
		this.showProgress = false;
		this.nodes = this.fetchNodesToShow();
		this.setContentHeight(this.nodes);
	}

	/**
	 * Handle visibility changes from tree service to viewer service.
	 * @param clickedIds	Collection of ids to show/hide.
	 * @param visible	Set ids to visibile.
	 */
	public handleVisibility(clickedIds: any, visible: boolean) {
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
	 * Handle highlight changes from tree service to viewer service.
	 * @param highlightMap	Collection of ids to highlight.
	 */
	public handleSelection(highlightMap: any) {
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

		if (height === 0) {
			height = 70;
		}
		this.onContentHeightRequest({height});
		this.$scope.$broadcast("$md-resize");

	}

	/**
	 * Initialise the tree nodes to show to the first node
	 */
	public initNodesToShow() {
		if (this.allNodes.length) {
			this.TreeService.initNodesToShow([this.allNodes[0]]);
		}
	}

	/**
	 * Fetch nodesToShow from tree service and update nodesToShow in tree component.
	 * @returns	nodesToShow.
	 */
	public fetchNodesToShow() {
		this.nodesToShow = this.TreeService.getNodesToShow();
		return this.nodesToShow;
	}

	/**
	 * Expand a node to show its children.
	 */
	public toggleNodeExpansion(event, id) {
		this.TreeService.toggleNodeExpansion(event, id);
		this.setContentHeight(this.fetchNodesToShow());
	}

	public toggleTreeNode(node) {
		let newState = ("invisible" === node.toggleState) ? "visible" : "invisible";
		this.TreeService.setTreeNodeStatus(node, newState);
	}

	/**
	 * Selected a node in the tree
	 *
	 * @param node
	 */
	public selectNode(node) {
		this.TreeService.selectNode(node, this.MultiSelectService.isMultiMode(), true);
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
			this.TreeService.selectNode(selectedNode, this.MultiSelectService.isMultiMode(), true);
		}

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
					this.$timeout(() => {}, 0).then(() => {
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
