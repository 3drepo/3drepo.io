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
            restrict: 'E',
            templateUrl: 'panel.html',
            scope: {
                position: "@"
            },
            controller: PanelCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PanelCtrl.$inject = ["$scope", "$window", "EventService"];

    function PanelCtrl ($scope, $window, EventService) {
        var vm = this,
            i = 0,
            length = 0,
			lastWindowHeight = $window.innerHeight,
			panelTopBottomGap = 40,
			maxHeightAvailable = $window.innerHeight - panelTopBottomGap,
			numPanelsShowing = 0,
			numNonFixedHeightPanelsShowing = 0,
			fixedContentHeightTotal = 0,
			itemGap = 20,
			panelToolbarHeight = 48,
			numFiltersShown = 0,
			filterHeight = 50,
			panelContentsOccupyFullHeight = false,
			totalOccupiedHeight = 0;

		vm.contentItems = [];
        vm.showPanel = true;
		vm.window = $window;
		vm.activate = true;

        $scope.$watch(EventService.currentEvent, function (event) {
            if (event.type === EventService.EVENT.PANEL_CONTENT_SETUP) {
				vm.contentItems = (event.value[vm.position]);
				hideLastItemGap();

				for (var i = 0; i < vm.contentItems.length; i += 1) {
					if (vm.contentItems[i].show) {
						numPanelsShowing += 1;
						if (!vm.contentItems[i].fixedHeight) {
							numNonFixedHeightPanelsShowing += 1;
						}
					}
				}
            }
            else if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
                vm.showPanel = !vm.showPanel;
            }
        });

		// The last card should not have a gap so that scrolling in resized window works correctly
		function hideLastItemGap () {
			var lastFound = false;
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

		angular.element(document).bind('mousedown', function (event) {
			// If we have clicked on a canvas, we are probably moving the model around
			if (event.target.tagName === "CANVAS")
			{
				vm.activate = false;
				$scope.$apply();
			}
		});

		angular.element(document).bind('mouseup', function (event) {
			vm.activate = true;
			$scope.$apply();
		});

		/**
		 * Panel toggle button clicked
		 *
		 * @param contentType
		 */
		vm.buttonClick = function (contentType) {
			var contentItem;

			// Get the content item
            for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
                if (contentType === vm.contentItems[i].type) {
					contentItem = vm.contentItems[i];

					// Toggle panel show and update number of panels showing count
                    vm.contentItems[i].show = !vm.contentItems[i].show;

					// Resize any shown panel contents
					if (vm.contentItems[i].show) {
						numPanelsShowing += 1;
						if (vm.contentItems[i].fixedHeight) {
							fixedContentHeightTotal += contentItem.height;
						}
						else {
							numNonFixedHeightPanelsShowing += 1;
						}

						vm.heightRequest(contentItem, contentItem.height);
					}
					else {
						numPanelsShowing -= 1;
						if (vm.contentItems[i].fixedHeight) {
							fixedContentHeightTotal -= contentItem.height;
						}
						else {
							numNonFixedHeightPanelsShowing -= 1;
						}

						vm.contentItems[i].showGap = false;

						resizeShownPanelContents();
					}

					// Send an event with the content item show status
					/*
					EventService.send(
						EventService.EVENT.PANEL_CONTENT_TOGGLED,
						{
							position: vm.position,
							type: vm.contentItems[i].type,
							show: vm.contentItems[i].show,
							contentHeight: vm.contentItems[i].height
						}
					);
					*/

					break;
                }
            }
			hideLastItemGap();
        };

		/**
		 * A panel content is requesting a height change
		 * Change the heights of any shown panels if necessary
		 *
		 * @param contentItem
		 * @param height
		 */
		vm.heightRequest = function (contentItem, height) {
			var i, length,
				maxNonFixedContentItemHeight = getMaxNonFixedContentItemHeight();

			// Keep a note of the requested height to use when a panel content is hidden
			contentItem.requestedHeight = height;

			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				// Only consider shown items
				if (vm.contentItems[i].show) {
					// Other shown content
					if (vm.contentItems[i].type !== contentItem.type) {
						if (vm.contentItems[i].height > maxNonFixedContentItemHeight) {
							// Reduce height of any other content with a height greater than the average maximum
							vm.contentItems[i].height = maxNonFixedContentItemHeight;
						}
					}
					else {
						// Content requesting
						if (contentItem.fixedHeight) {
							contentItem.height = height;
						}
						else {
							if (height > maxNonFixedContentItemHeight) {
								contentItem.height = maxNonFixedContentItemHeight;
							}
							else {
								contentItem.height = height;
								panelContentsOccupyFullHeight = false;
							}
						}
					}
				}
			}
		};

		/**
		 * Resize shown panel contents after a panel content is hidden
		 */
		function resizeShownPanelContents () {
			var i, length,
				maxNonFixedContentItemHeight = getMaxNonFixedContentItemHeight();

			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				if (vm.contentItems[i].show && !vm.contentItems[i].fixedHeight && (vm.contentItems[i].requestedHeight > maxNonFixedContentItemHeight)) {
					vm.contentItems[i].height = maxNonFixedContentItemHeight;
				}
			}
		}

		/**
		 * Get the maximum height for non fixed height panel content
		 *
		 * maxHeightAvailable - maximum available screen height
		 * numPanelsShowing - total number of panel contents to show
		 * panelToolbarHeight - height of the tool bar of a panel content
		 * itemGap - gap between each panel content
		 * fixedContentHeightTotal - total height of all panel content with fixed height
		 * numNonFixedHeightPanelsShowing  - total number of panel contents with non fixed height
		 *
		 * @returns {number}
		 */
		function getMaxNonFixedContentItemHeight () {
			return (
				maxHeightAvailable -
				(numPanelsShowing * panelToolbarHeight) -
				((numPanelsShowing - 1) * itemGap) -
				fixedContentHeightTotal -
				numFiltersShown * filterHeight
				) /
				numNonFixedHeightPanelsShowing;
		}

		function getTotalOccupiedHeight () {
			var i, length;

			totalOccupiedHeight = 0;

			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				if (vm.contentItems[i].show) {
					totalOccupiedHeight += panelToolbarHeight + vm.contentItems[i].height;
					if (i !== 0) {
						totalOccupiedHeight += itemGap;
					}
				}
			}

			return totalOccupiedHeight;
		}

		// Handle changes to the browser screen height
		$scope.$watch("vm.window.innerHeight", function (newValue) {
			if (getTotalOccupiedHeight() >= maxHeightAvailable) {
				resizeShownPanelContentsOnWindowResize(newValue - lastWindowHeight);
			}
			lastWindowHeight = newValue;

			maxHeightAvailable = newValue - panelTopBottomGap;
		});

		/**
		 * Resize all shown non fixed height panel contents when the browser height changes
		 *
		 * @param heightChange
		 */
		function resizeShownPanelContentsOnWindowResize (heightChange) {
			var i, length,
				maxNonFixedContentItemHeight,
				nonFixedHeightPanelContentHeightChange = heightChange / numNonFixedHeightPanelsShowing;

			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				if (vm.contentItems[i].show && !vm.contentItems[i].fixedHeight) {
					vm.contentItems[i].height += nonFixedHeightPanelContentHeightChange;

					// Make sure the height of the content doesn't exceed it's allowed height
					maxNonFixedContentItemHeight = getMaxNonFixedContentItemHeight();
					if (vm.contentItems[i].requestedHeight >= maxNonFixedContentItemHeight) {
						if (vm.contentItems[i].height > maxNonFixedContentItemHeight) {
							vm.contentItems[i].height = maxNonFixedContentItemHeight;
						}
					}
					else {
						if (vm.contentItems[i].height > vm.contentItems[i].requestedHeight) {
							vm.contentItems[i].height = vm.contentItems[i].requestedHeight;
						}
					}
				}
			}
		}

		/**
		 * Keep a count of all panel content filters shown
		 *
		 * @param show
		 */
		vm.showFilter = function (show) {
			numFiltersShown += show ? 1 : -1;
			resizeShownPanelContents();
		};
	}
}());
