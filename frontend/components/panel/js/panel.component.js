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
		.component("panel", {
			restrict: "E",
			templateUrl: "templates/panel.html",
			bindings: {
				account:  "=",
				model:  "=",
				branch:   "=",
				revision: "=",
				position: "@",
				keysDown: "=",
				modelSettings: "=",
				treeMap: "=",
				selectedObjects: "=",
				setInitialSelectedObjects: "&"
			},
			controller: PanelCtrl,
			controllerAs: "vm"
		});

	PanelCtrl.$inject = ["$scope", "$window", "$timeout", "EventService", "PanelService"];

	function PanelCtrl ($scope, $window, $timeout, EventService, PanelService) {
		var vm = this;

		/*
		 * Init
		 */
		vm.$onInit = function() {

			vm.maxHeightAvailable = $window.innerHeight - vm.panelTopBottomGap;
			vm.contentItems = [];
			vm.showPanel = true;
			vm.window = $window;
			vm.activate = true;

			vm.panelTopBottomGap = 55,
			vm.itemGap = 20,
			vm.panelToolbarHeight = 40,
			vm.contentItemsShown = [];
			
			vm.resize(); // We need to set the correct height for the issues
			vm.bindEvents();

			vm.contentItems = PanelService.issuesPanelCard[vm.position];
			vm.setupShownCards();
			vm.hideLastItemGap();
			
		};

		$scope.$watch("vm.contentItems", function (newValue, oldValue) {

			if (oldValue.length && newValue.length) {
				for (var i = 0; i < newValue.length; i ++) {

					if (newValue[i].show !== oldValue[i].show) {
						vm.setupShownCards();
						vm.getContentItemShownFromType();
						break;
					}

				}
			}

		}, true);

		vm.bindEvents = function() {
			/*
			* Mouse down
			*/
			angular.element(document).bind("mousedown", function (event) {
				// If we have clicked on a canvas, we are probably moving the model around
				if (event.target.tagName === "CANVAS") {
					vm.activate = false;
					$scope.$apply();
				}
			});

			/*
			* Mouse up
			*/
			angular.element(document).bind("mouseup", function () {
				vm.activate = true;
				$scope.$apply();
			});

			/*
			* Watch for screen resize
			*/
			angular.element($window).bind("resize", function() {
				vm.resize();
			});

		};

		vm.resize = function() {
			vm.maxHeightAvailable = $window.innerHeight - vm.panelTopBottomGap;
			vm.calculateContentHeights();
		};

		/*
		 * Watch for events
		 */
		
		$scope.$watch(EventService.currentEvent, function (event) {

			if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
				vm.showPanel = !vm.showPanel;
			} else if (event.type === EventService.EVENT.PANEL_CONTENT_ADD_MENU_ITEMS) {

				var item = vm.contentItems.find(function(content){
					return content.type === event.value.type;
				});

				if(item){
					item.menu = item.menu.concat(event.value.menu);
				}
			
			}
		});

		/**
		 * The last card should not have a gap so that scrolling in resized window works correctly
		 */
		vm.hideLastItemGap = function() {
			var i, lastFound = false;

			for (i = (vm.contentItems.length - 1); i >= 0; i -= 1) {
				if (vm.contentItems[i].show) {
					if (!lastFound) {
						vm.contentItems[i].showGap = false;
						lastFound = true;
					} else {
						vm.contentItems[i].showGap = true;
					}
				}
			}
		};


		/**
		 * Panel toggle button clicked
		 *
		 * @param contentType
		 */
		vm.buttonClick = function (contentType) {

			// Get the content item
			for (var i = 0; i < vm.contentItems.length; i += 1) {
				if (contentType === vm.contentItems[i].type) {
					
					// Toggle panel show and update number of panels showing count
					vm.contentItems[i].show = !vm.contentItems[i].show;

					// Resize any shown panel contents
					if (vm.contentItems[i].show) {
						vm.contentItemsShown.push(vm.contentItems[i]);
						vm.calculateContentHeights();
					} else {
						for (var j = (vm.contentItemsShown.length - 1); j >= 0; j -= 1) {
							if (vm.contentItemsShown[j].type === contentType) {
								vm.contentItemsShown.splice(j, 1);
							}
						}
						vm.contentItems[i].showGap = false;
						vm.calculateContentHeights();
					}
					break;
				}
			}

			vm.hideLastItemGap();
		};

		/**
		 * A panel content is requesting a height change - change the heights of any shown panels
		 *
		 * @param {Object} contentItem
		 * @param {Number} height
		 */
		vm.heightRequest = function (contentItem, height) {
			contentItem.requestedHeight = height; // Keep a note of the requested height
			contentItem.height = height; // Initially set the height to the requested height
			vm.calculateContentHeights();
		};

		/**
		 * Start the recursive calculation of the content heghts
		 */
		vm.calculateContentHeights = function() {
			var tempContentItemsShown = angular.copy(vm.contentItemsShown);
			assignHeights(vm.maxHeightAvailable, tempContentItemsShown, null);
			$timeout(function () {
				$scope.$apply();
			});
		};

		/**
		 * Recursively calculate the heights for each content item
		 *
		 * @param {Number} heightAvailable
		 * @param {Array} contentItems
		 * @param {Array} previousContentItems
		 */
		function assignHeights(heightAvailable, contentItems, previousContentItems) {
			var i,
				availableHeight = heightAvailable,
				maxContentItemHeight = (availableHeight - (vm.panelToolbarHeight * contentItems.length) - (vm.itemGap * (contentItems.length - 1))) / contentItems.length,
				prev = null,
				contentItem;

			if (Array.isArray(previousContentItems) && (previousContentItems.length === contentItems.length)) {
				// End the recurse by dividing out the remaining space to remaining content
				for (i = (contentItems.length - 1); i >= 0; i-= 1) {
					contentItem = vm.getContentItemShownFromType(contentItems[i].type);
					// Flexible content shouldn't have a size smaller than its minHeight
					// or a requested height that is less than the minHeight
					if (maxContentItemHeight < contentItem.minHeight) {
						if (contentItem.requestedHeight < contentItem.minHeight) {
							contentItem.height = contentItem.requestedHeight;
						} else {
							contentItem.height = contentItem.minHeight;
							availableHeight -= contentItem.height + vm.panelToolbarHeight + vm.itemGap;
							contentItems.splice(i, 1);
							assignHeights(availableHeight, contentItems, prev);
						}
					} else {
						contentItem.height = maxContentItemHeight;
					}
				}
			} else {
				// Let content have requested height if less than max available for each
				prev = angular.copy(contentItems);
				for (i = (contentItems.length - 1); i >= 0; i-= 1) {
					if ((contentItems[i].requestedHeight < maxContentItemHeight) ||
						(contentItems[i].fixedHeight)) {
						contentItem = vm.getContentItemShownFromType(contentItems[i].type);
						contentItem.height = contentItems[i].requestedHeight;
						availableHeight -= contentItem.height + vm.panelToolbarHeight + vm.itemGap;
						contentItems.splice(i, 1);
					}
				}

				if (contentItems.length > 0) {
					assignHeights(availableHeight, contentItems, prev);
				}
			}
		}

		/**
		 * Get the shown content item with the passed type
		 *
		 * @param type
		 * @returns {Object}
		 */
		vm.getContentItemShownFromType = function(type) {
			var i, length;
			for (i = 0, length = vm.contentItemsShown.length; i < length; i += 1) {
				if (vm.contentItemsShown[i].type === type) {
					return vm.contentItemsShown[i];
				}
			}
		};

		/**
		 * Setup the cards to show
		 */
		vm.setupShownCards = function() {
			var i, length;

			vm.contentItemsShown = [];
			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				if (vm.contentItems[i].show) {
					vm.contentItemsShown.push(vm.contentItems[i]);
				}
			}
		};

	}
}());
