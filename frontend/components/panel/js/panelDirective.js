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
        .directive("panel", panel);

    function panel () {
        return {
            restrict: "E",
            templateUrl: "panel.html",
            scope: {
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
            controllerAs: "vm",
            bindToController: true
        };
    }

    PanelCtrl.$inject = ["$scope", "$window", "$timeout", "EventService"];

    function PanelCtrl ($scope, $window, $timeout, EventService) {
        var vm = this,
			panelTopBottomGap = 55,
			maxHeightAvailable = $window.innerHeight - panelTopBottomGap,
			itemGap = 20,
			panelToolbarHeight = 40,
			contentItemsShown = [];

		/*
		 * Init
		 */
		vm.$onInit = function() {

			vm.contentItems = [];
			vm.showPanel = true;
			vm.window = $window;
			vm.activate = true;
		
		}

		/*
		 * Watch for events
		 */
		
        $scope.$watch(EventService.currentEvent, function (event) {

			var i;
            if (event.type === EventService.EVENT.PANEL_CONTENT_SETUP) {
				vm.contentItems = (event.value[vm.position]);
				setupShownCards();
				hideLastItemGap();
				setupContentItemsWatch();
			}
            else if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
                vm.showPanel = !vm.showPanel;
            } 
            else if (event.type === EventService.EVENT.PANEL_CONTENT_ADD_MENU_ITEMS) {


            	var item = vm.contentItems.find(function(item){
            		return item.type === event.value.type
            	});

            	if(item){
            		item.menu = item.menu.concat(event.value.menu);
            	}
            
            }
        });

		/**
		 * The last card should not have a gap so that scrolling in resized window works correctly
		 */
		function hideLastItemGap () {
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
		}

		/*
		 * Mouse down
		 */
		angular.element(document).bind('mousedown', function (event) {
			// If we have clicked on a canvas, we are probably moving the model around
			if (event.target.tagName === "CANVAS")
			{
				vm.activate = false;
				$scope.$apply();
			}
		});

		/*
		 * Mouse up
		 */
		angular.element(document).bind('mouseup', function () {
			vm.activate = true;
			$scope.$apply();
		});

		/**
		 * Panel toggle button clicked
		 *
		 * @param contentType
		 */
		vm.buttonClick = function (contentType) {
			var i, j, length, contentItem;

			// Get the content item
            for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
                if (contentType === vm.contentItems[i].type) {
					contentItem = vm.contentItems[i];

					// Toggle panel show and update number of panels showing count
                    vm.contentItems[i].show = !vm.contentItems[i].show;

					// Resize any shown panel contents
					if (vm.contentItems[i].show) {
						contentItemsShown.push(vm.contentItems[i]);
						calculateContentHeights();
					}
					else {
						for (j = (contentItemsShown.length - 1); j >= 0; j -= 1) {
							if (contentItemsShown[j].type === contentType) {
								contentItemsShown.splice(j, 1);
							}
						}
						vm.contentItems[i].showGap = false;
						calculateContentHeights();
					}
					break;
                }
            }

			hideLastItemGap();
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
			calculateContentHeights();
		};

		/**
		 * Start the recursive calculation of the content heghts
		 */
		function calculateContentHeights() {
			var tempContentItemsShown = angular.copy(contentItemsShown);
			assignHeights(maxHeightAvailable, tempContentItemsShown, null);
			$timeout(function () {
				$scope.$apply();
			});
		}

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
				maxContentItemHeight = (availableHeight - (panelToolbarHeight * contentItems.length) - (itemGap * (contentItems.length - 1))) / contentItems.length,
				prev = null,
				contentItem;

			if (Array.isArray(previousContentItems) && (previousContentItems.length === contentItems.length)) {
				// End the recurse by dividing out the remaining space to remaining content
				for (i = (contentItems.length - 1); i >= 0; i-= 1) {
					contentItem = getContentItemShownFromType(contentItems[i].type);
					// Flexible content shouldn't have a size smaller than its minHeight
					// or a requested height that is less than the minHeight
					if (maxContentItemHeight < contentItem.minHeight) {
						if (contentItem.requestedHeight < contentItem.minHeight) {
							contentItem.height = contentItem.requestedHeight;
						}
						else {
							contentItem.height = contentItem.minHeight;
							availableHeight -= contentItem.height + panelToolbarHeight + itemGap;
							contentItems.splice(i, 1);
							assignHeights(availableHeight, contentItems, prev);
						}
					}
					else {
						contentItem.height = maxContentItemHeight;
					}
				}
			}
			else {
				// Let content have requested height if less than max available for each
				prev = angular.copy(contentItems);
				for (i = (contentItems.length - 1); i >= 0; i-= 1) {
					if ((contentItems[i].requestedHeight < maxContentItemHeight) ||
						(contentItems[i].fixedHeight)) {
						contentItem = getContentItemShownFromType(contentItems[i].type);
						contentItem.height = contentItems[i].requestedHeight;
						availableHeight -= contentItem.height + panelToolbarHeight + itemGap;
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
		function getContentItemShownFromType (type) {
			var i, length;
			for (i = 0, length = contentItemsShown.length; i < length; i += 1) {
				if (contentItemsShown[i].type === type) {
					return contentItemsShown[i];
				}
			}
		}

		/**
		 * Setup the cards to show
		 */
		function setupShownCards () {
			var i, length;

			contentItemsShown = [];
			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				if (vm.contentItems[i].show) {
					contentItemsShown.push(vm.contentItems[i]);
				}
			}
		}

		/*
		 * Watch vm.contentItems for any cards shown or hidden
		 */
		function setupContentItemsWatch() {
			var i, length;

			$scope.$watch("vm.contentItems", function (newValue, oldValue) {
				for (i = 0, length = newValue.length; i < length; i += 1) {
					if (newValue[i].show !== oldValue[i].show) {
						setupShownCards();
						hideLastItemGap();
						break;
					}
				}
			}, true);
		}

		/*
		 * Watch for screen resize
		 */
		angular.element($window).bind("resize", function() {
			maxHeightAvailable = $window.innerHeight - panelTopBottomGap;
			calculateContentHeights();
		});
	}
}());
