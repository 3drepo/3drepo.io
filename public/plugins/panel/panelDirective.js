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

    PanelCtrl.$inject = ["$scope", "$element", "$window", "$timeout", "EventService"];

    function PanelCtrl ($scope, $element, $window, $timeout, EventService) {
        var vm = this,
            i = 0,
            length = 0,
			initialWindowHeight = $window.innerHeight,
			maxPanelHeight = $window.innerHeight - 90,
			numPanelsShowing = 0,
			fixedContentHeightTotal = 0;

		vm.contentItems = [];
        vm.showPanel = true;
		vm.window = $window;
		vm.activate = true;

		$scope.$watch("vm.window.innerHeight", function (newValue) {
			sendWindowHeightChangeEvent(newValue);
		});

		function sendWindowHeightChangeEvent (height) {
			$element.css("height", (height).toString() + "px");

			EventService.send(
				EventService.EVENT.WINDOW_HEIGHT_CHANGE,
				{height: height, change: (initialWindowHeight - height)}
			);
		}

        $scope.$watch(EventService.currentEvent, function (event) {
            if (event.type === EventService.EVENT.PANEL_CONTENT_SETUP) {
				vm.contentItems = (event.value[vm.position]);
				hideLastItemGap();

				$timeout(function () {
					sendWindowHeightChangeEvent(initialWindowHeight);
				});

				for (var i = 0; i < vm.contentItems.length; i += 1) {
					//vm.contentItems[i].height = 200;
					if (vm.contentItems[i].show) {
						numPanelsShowing += 1;
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
		 * @param contentType
		 */
		vm.buttonClick = function (contentType) {
			var contentItem;

			// Get the content item
            for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
                if (contentType === vm.contentItems[i].type) {
					contentItem = vm.contentItems[i];

					// Toggle panel show and update number of panels shwoing count
                    vm.contentItems[i].show = !vm.contentItems[i].show;
					if (vm.contentItems[i].show) {
						numPanelsShowing += 1;
					}
					else {
						numPanelsShowing -= 1;
						vm.contentItems[i].showGap = false;
					}

					// Send an event with the content item show status
					EventService.send(
						EventService.EVENT.PANEL_CONTENT_TOGGLED,
						{
							position: vm.position,
							type: vm.contentItems[i].type,
							show: vm.contentItems[i].show,
							contentHeight: vm.contentItems[i].height
						}
					);

					// Do a height request if showing
					if (contentItem.show) {
						vm.heightRequest(contentItem, contentItem.height);
					}

					// Update fixed height content total
					/*
					if (contentItem.fixedHeight) {
						fixedContentHeightTotal += contentItem.height;
					}
					*/

					break;
                }
            }
			hideLastItemGap();
        };

		/**
		 * A panel content is requesting a height change
		 * Change the heights of any shown panels if necessary§
		 * @param contentItem
		 * @param height
		 */
		vm.heightRequest = function (contentItem, height) {
			var i, length,
				itemGap = 30,
				maxContentItemHeight = Math.floor(maxPanelHeight / numPanelsShowing) - ((numPanelsShowing - 1) * itemGap) - fixedContentHeightTotal;
			console.log(height, maxContentItemHeight);
			//contentItem.height = height;

			for (i = 0, length = vm.contentItems.length; i < length; i += 1) {
				if (vm.contentItems[i].show) {
					// Only consider shown items
					if (vm.contentItems[i].type !== contentItem.type) {
						// Other shown content
						if (vm.contentItems[i].height > maxContentItemHeight) {
							// Reduce height of any other content with a height greater than the average maximum
							vm.contentItems[i].height = maxContentItemHeight;
						}
					}
					else {
						// Content requesting
						if (contentItem.fixedHeight) {
							contentItem.height = height;
						}
						else {
							if (height > maxContentItemHeight) {
								contentItem.height = maxContentItemHeight;
							}
							else {
								contentItem.height = height;
							}
						}
					}
				}
			}
		};
    }
}());
