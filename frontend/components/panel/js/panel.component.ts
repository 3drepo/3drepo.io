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
		'$window',
		'$scope',
		'$timeout',

		'PanelService',
		'EventService',
		'GroupsService',
		'TreeService'
	];

	public maxHeightAvailable;
	public panelTopBottomGap;
	public bottomButtonGap;
	public contentItems;
	public showPanel;
	public activate;
	public itemGap;
	public panelToolbarHeight;
	public contentItemsShown: any[];
	public position;

	private highlightBackground;

	constructor(
		private $window: ng.IWindowService,
		private $scope: ng.IScope,
		private $timeout: ng.ITimeoutService,

		private PanelService: any,
		private EventService: any,
		private GroupsService: any,
		private TreeService: any
	) {}

	public $onInit() {

		this.highlightBackground = '#3171B6';
		this.contentItems = [];
		this.showPanel = true;
		this.activate = true;

		this.panelTopBottomGap = 55,
		this.bottomButtonGap = 64;
		this.itemGap = 30,
		this.panelToolbarHeight = 40,
		this.contentItemsShown = [];
		this.maxHeightAvailable = this.$window.innerHeight - this.panelTopBottomGap - this.bottomButtonGap;

		this.resize(); // We need to set the correct height for the issues
		this.bindEvents();

		this.PanelService.reset();
		this.contentItems = this.PanelService.panelCards[this.position];

		this.setupShownCards();
		this.hideLastItemGap();

		// Setup watchers for this component
		this.watchers();

	}

	public $onDestroy() {
		this.PanelService.reset();
		this.contentItems = [];
	}

	public watchers() {

		this.$scope.$watch('vm.contentItems', (newValue: any, oldValue: any) => {
			if (newValue && newValue.length) {
				this.setupShownCards();
			}

		}, true);

		// Watcher to setup new menus as they come in
		this.$scope.$watch(() =>  this.PanelService.panelCards[this.position],
			(newPanels) => {
				if (newPanels && newPanels.length) {
					this.contentItems = newPanels;
				}
			}, true);

		this.$scope.$watch(() => this.TreeService.getHideIfc(),
			(hideIfc) => {
				this.PanelService.setHideIfc(hideIfc);
			});

		this.$scope.$watch(() => this.GroupsService.state.overrideAll,
			(overrideAll) => {
				this.PanelService.setOverrideAll(overrideAll);
			});
	}

	public bindEvents() {

		/*
		* Mouse down
		*/
		angular.element(document).bind('mousedown', (event) => {
			// If we have clicked on a canvas, we are probably moving the model around
			if (event.target.tagName === 'CANVAS') {
				this.activate = false;
			}
		});

		/*
		* Mouse up
		*/
		angular.element(document).bind('mouseup', () => {
			this.activate = true;
		});

		/*
		* Watch for screen resize
		*/
		angular.element(window as any).bind('resize', () => {
			this.resize();
		});

	}

	public resize() {
		this.maxHeightAvailable = this.$window.innerHeight - this.panelTopBottomGap - this.bottomButtonGap;
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
		for (let i = 0; i < this.contentItems.length; i++) {
			if (contentType === this.contentItems[i].type) {

				console.log('contentType',contentType);
				// Toggle panel show and update number of panels showing count
				this.contentItems[i].show = !this.contentItems[i].show;

				// Resize any shown panel contents
				if (this.contentItems[i].show) {
					this.contentItemsShown.push(this.contentItems[i]);
				} else {
					for (let j = (this.contentItemsShown.length - 1); j >= 0; j -= 1) {
						if (this.contentItemsShown[j].type === contentType) {
							this.contentItemsShown.splice(j, 1);
						}
					}
					this.contentItems[i].showGap = false;
				}
				this.calculateContentHeights();
				break;
			}
		}

		this.hideLastItemGap();
		this.updatePanelButtons();
	}

	public updatePanelButtons() {
		for (let i = 0; i < this.contentItems.length; i++) {
			this.contentItems[i].bgColour = (this.contentItems[i].show) ? this.highlightBackground : '';
		}
	}

	// *** This method is angular-binded to the panel-cards contained in the panel component ***
	public heightRequest(contentItem: any, height: number) {
		contentItem.requestedHeight = height; // Keep a note of the requested height
		if (height > this.maxHeightAvailable) {
			contentItem.height = this.maxHeightAvailable; // Prevent excessive requests
		} else {
			contentItem.height = height; // Initially set the height to the requested height
		}

		this.calculateContentHeights();
	}

	/**
	 *  Calculate content heights
	 */
	public calculateContentHeights() {
		this.maxHeightAvailable = this.$window.innerHeight - this.panelTopBottomGap - this.bottomButtonGap;

		const spaceUsedInGaps = this.itemGap * ( this.contentItemsShown.length - 1);
		let availableHeight = this.maxHeightAvailable - spaceUsedInGaps;

		const orderedContentItems = this.contentItemsShown.concat([]).sort((a, b) => {
			return a.requestedHeight + a.panelToolbarHeight - b.requestedHeight - b.panelTakenHeight;
		});

		let itemsLeftToCalculateSpace = this.contentItemsShown.length;

		orderedContentItems.forEach((c) => {
			const takenHeight = c.panelTakenHeight;
			const spaceDivisions =  availableHeight / itemsLeftToCalculateSpace;
			itemsLeftToCalculateSpace--;
			const newHeight = Math.max(Math.min((c.requestedHeight || c.minHeight), spaceDivisions - takenHeight), c.minHeight);
			c.height = isNaN(newHeight) ? availableHeight : newHeight;
			availableHeight -= c.height + takenHeight;
		});
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
		this.updatePanelButtons();
		this.$timeout().then(() => {
			angular.element(window as any).triggerHandler('resize');
		});
	}

}

export const PanelComponent: ng.IComponentOptions = {
	bindings: {
		account:  '=',
		branch:   '=',
		model:  '=',
		modelSettings: '=',
		isLiteMode: '=',
		position: '@',
		revision: '=',
		selectedObjects: '=',
		setInitialSelectedObjects: '&'
	},
	controller: PanelController,
	controllerAs: 'vm',
	templateUrl: 'templates/panel.html'
};

export const PanelComponentModule = angular
	.module('3drepo')
	.component('panel', PanelComponent);
