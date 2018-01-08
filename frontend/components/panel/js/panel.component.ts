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

class PanelController implements ng.IController {

	public static $inject: string[] = [
		"$window",
		"$scope",
		"$timeout",

		"PanelService",
		"EventService",
	];

	public maxHeightAvailable;
	public panelTopBottomGap;
	public contentItems;
	public showPanel;
	public activate;
	public itemGap;
	public panelToolbarHeight;
	public contentItemsShown;
	public position;

	constructor(
		private $window: ng.IWindowService,
		private $scope: ng.IScope,
		private $timeout: ng.ITimeoutService,

		private PanelService: any,
		private EventService: any,
	) {}

	public $onInit() {

		this.maxHeightAvailable = this.$window.innerHeight - this.panelTopBottomGap;
		this.contentItems = [];
		this.showPanel = true;
		this.activate = true;

		this.panelTopBottomGap = 55,
		this.itemGap = 20,
		this.panelToolbarHeight = 40,
		this.contentItemsShown = [];

		this.resize(); // We need to set the correct height for the issues
		this.bindEvents();

		this.contentItems = this.PanelService.issuesPanelCard[this.position];
		this.setupShownCards();
		this.hideLastItemGap();

		// Setup watchers for this component
		this.watchers();

	}

	public watchers() {

		this.$scope.$watch("vm.contentItems", (newValue: any, oldValue: any) => {
			if (oldValue.length && newValue.length) {
				for (let i = 0; i < newValue.length; i ++) {

					if (newValue[i].show !== oldValue[i].show) {
						console.log(this.contentItems);
						this.setupShownCards();
						// this.getContentItemShownFromType();
						break;
					}

				}
			}
		}, true);

		this.$scope.$watch(this.EventService.currentEvent, (event: any) => {

			if (event.type === this.EventService.EVENT.TOGGLE_ELEMENTS) {
				this.showPanel = !this.showPanel;
			} else if (event.type === this.EventService.EVENT.PANEL_CONTENT_ADD_MENU_ITEMS) {

				const item = this.contentItems.find((content) => {
					return content.type === event.value.type;
				});

				// TODO: This is ugly, why are we doing this?
				if (item && item.menu && event.value) {
					event.value.menu.forEach((newItem) => {
						const exists = item.menu.find((oldItem) => {
							return oldItem.role === newItem.role;
						});
						if (!exists) {
							item.menu.push(newItem);
						}
					});
				}

			}
		});

	}

	public bindEvents() {

		/*
		* Mouse down
		*/
		angular.element(document).bind("mousedown", (event) => {
			// If we have clicked on a canvas, we are probably moving the model around
			if (event.target.tagName === "CANVAS") {
				this.activate = false;
				this.$scope.$apply();
			}
		});

		/*
		* Mouse up
		*/
		angular.element(document).bind("mouseup", () => {
			this.activate = true;
			this.$scope.$apply();
		});

		/*
		* Watch for screen resize
		*/
		angular.element(this.$window).bind("resize", () => {
			this.resize();
		});

	}

	public resize() {
		this.maxHeightAvailable = this.$window.innerHeight - this.panelTopBottomGap;
		this.calculateContentHeights();
	}

	/**
	 * The last card should not have a gap so that scrolling in resized window works correctly
	 */
	public hideLastItemGap() {
		let lastFound: boolean = false;

		for (let i = (this.contentItems.length - 1); i >= 0; i -= 1) {
			if (this.contentItems[i].show) {
				if (!lastFound) {
					this.contentItems[i].showGap = false;
					lastFound = true;
				} else {
					this.contentItems[i].showGap = true;
				}
			}
		}
	}

	public togglePanel(contentType: string) {

		// Get the content item
		for (let i = 0; i < this.contentItems.length; i += 1) {
			if (contentType === this.contentItems[i].type) {

				// Toggle panel show and update number of panels showing count
				this.contentItems[i].show = !this.contentItems[i].show;

				// Resize any shown panel contents
				if (this.contentItems[i].show) {
					this.contentItemsShown.push(this.contentItems[i]);
					this.calculateContentHeights();
				} else {
					for (let j = (this.contentItemsShown.length - 1); j >= 0; j -= 1) {
						if (this.contentItemsShown[j].type === contentType) {
							this.contentItemsShown.splice(j, 1);
						}
					}
					this.contentItems[i].showGap = false;
					this.calculateContentHeights();
				}
				break;
			}
		}

		this.hideLastItemGap();
	}

	public heightRequest(contentItem: any, height: number) {
		contentItem.requestedHeight = height; // Keep a note of the requested height
		contentItem.height = height; // Initially set the height to the requested height
		this.calculateContentHeights();
	}

	/**
	 * Start the recursive calculation of the content heghts
	 */
	public calculateContentHeights() {
		const tempContentItemsShown = angular.copy(this.contentItemsShown);
		this.assignHeights(this.maxHeightAvailable, tempContentItemsShown, null);
		this.$timeout(() => {
			this.$scope.$apply();
		});
	}

	public assignHeights(heightAvailable: number, contentItems: any[], previousContentItems: any[]) {

		let availableHeight = heightAvailable;
		const h = (this.panelToolbarHeight * contentItems.length);
		const g = (this.itemGap * (contentItems.length - 1));
		const maxContentItemHeight = (availableHeight - h - g) / contentItems.length;
		let prev = null;
		let contentItem;

		if (Array.isArray(previousContentItems) && (previousContentItems.length === contentItems.length)) {
			// End the recurse by dividing out the remaining space to remaining content
			for (let i = (contentItems.length - 1); i >= 0; i -= 1) {
				if (contentItems[i] && contentItems[i].type) {
					contentItem = this.getContentItemShownFromType(contentItems[i].type);
					// Flexible content shouldn't have a size smaller than its minHeight
					// or a requested height that is less than the minHeight
					if (maxContentItemHeight < contentItem.minHeight) {
						if (contentItem.requestedHeight < contentItem.minHeight) {
							contentItem.height = contentItem.requestedHeight;
						} else {
							contentItem.height = contentItem.minHeight;
							availableHeight -= contentItem.height + this.panelToolbarHeight + this.itemGap;
							contentItems.splice(i, 1);
							this.assignHeights(availableHeight, contentItems, prev);
						}
					} else {
						contentItem.height = maxContentItemHeight;
					}
				}
			}
		} else {
			// Let content have requested height if less than max available for each
			prev = angular.copy(contentItems);
			for (let i = (contentItems.length - 1); i >= 0; i -= 1) {
				if ((contentItems[i].requestedHeight < maxContentItemHeight) ||
					(contentItems[i].fixedHeight)) {
					contentItem = this.getContentItemShownFromType(contentItems[i].type);
					contentItem.height = contentItems[i].requestedHeight;
					availableHeight -= contentItem.height + this.panelToolbarHeight + this.itemGap;
					contentItems.splice(i, 1);
				}
			}

			if (contentItems.length > 0) {
				this.assignHeights(availableHeight, contentItems, prev);
			}
		}
	}

	/**
	 * Get the shown content item with the passed type
	 */
	public getContentItemShownFromType(type: any) {
		for (let i = 0; i < this.contentItemsShown.length; i += 1) {
			if (this.contentItemsShown[i].type === type) {
				return this.contentItemsShown[i];
			}
		}
	}

	/**
	 * Setup the cards to show
	 */
	public setupShownCards() {
		this.contentItemsShown = [];
		for (let i = 0; i < this.contentItems.length; i ++) {
			if (this.contentItems[i].show) {
				this.contentItemsShown.push(this.contentItems[i]);
			}
		}
	}

}

export const PanelComponent: ng.IComponentOptions = {
	bindings: {
		account:  "=",
		branch:   "=",
		keysDown: "=",
		model:  "=",
		modelSettings: "=",
		position: "@",
		revision: "=",
		selectedObjects: "=",
		setInitialSelectedObjects: "&",
	},
	controller: PanelController,
	controllerAs: "vm",
	templateUrl: "templates/panel.html",
};

export const PanelComponentModule = angular
	.module("3drepo")
	.component("panel", PanelComponent);
