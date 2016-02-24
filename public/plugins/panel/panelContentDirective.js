/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("panelContent", panelContent);

    function panelContent() {
        return {
            restrict: 'E',
            templateUrl: 'panelContent.html',
            scope: {
                position: "=",
                contentData: "=",
				onHeightRequest: "&"
            },
            controller: PanelContentCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PanelContentCtrl.$inject = ["$scope", "$element", "$compile", "$timeout", "serverConfig", "EventService", "StateManager"];

    function PanelContentCtrl($scope, $element, $compile, $timeout, serverConfig, EventService, StateManager) {
        var vm = this,
            content = "",
            contentItem = "",
            currentSortIndex,
            filter = null,
			currentHeight = 0,
			contentHeightExtra = 20,
			toggledContentHeight = 0,
			maxHeight,
			maxPossibleHeight,
			atMaxHeight = false,
			heightChange = 0,
			setHeight = 0, // The height set by the content
			otherContentHeight = 0, // The height of all the other panel contents
			panelGap = 40; // The total of the top and bottom gap for the panel in the page

		vm.issuesUrl = serverConfig.apiUrl(StateManager.state.account + "/" + StateManager.state.project + "/issues.html");

        vm.showHelp = false;
		vm.showFilter = false;
		vm.addStatus = false;
		vm.visibleStatus = false;
		vm.showClearFilterButton = false;

		$scope.$watch("vm.contentData.type", function (newValue) {
			if (angular.isDefined(newValue)) {
				content = angular.element($element[0].querySelector('#content'));
				contentItem = angular.element(
					"<" + vm.contentData.type + " " +
						"filter-text='vm.filterText' " +
						"height='vm.contentHeight' " +
						"show='vm.contentData.show' " +
						"show-add='vm.addStatus' " +
						"visible='vm.visibleStatus' " +
						"on-set-content-height='vm.setContentHeight(height)' " +
						"options='vm.contentData.options' " +
						"on-content-height-request='vm.onContentHeightRequest(height)' " +
						"selected-option='vm.selectedOption'>" +
					"</" + vm.contentData.type + ">"
				);
				content.append(contentItem);
				$compile(contentItem)($scope);

				// If the panel content appears by default inform other default panel contents
				/*
				if (vm.contentData.show) {
					$timeout(function () {
						EventService.send(
							EventService.EVENT.PANEL_CONTENT_TOGGLED,
							{
								position: vm.position,
								type: vm.contentData.type,
								show: vm.contentData.show,
								contentHeight: vm.contentData.maxHeight
							}
						);
					});
				}
				*/
			}
		});

		$scope.$watch("vm.contentData.options", function (newValue) {
			vm.hasOptions = (angular.isDefined(newValue));
		});

		$scope.$watch("vm.filterInputText", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (filter !== null) {
					$timeout.cancel(filter);
				}
				filter = $timeout(function() {
					vm.filterText = vm.filterInputText;
					vm.showClearFilterButton = (vm.filterInputText !== "");
				}, 500);
			}
		});

		$scope.$watch("vm.contentData.minHeight", function (newValue) {
			vm.contentHeight = newValue;
		});

		$scope.$watch("vm.filterText", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.filterInputText = newValue;
			}
		});

		$scope.$watch(EventService.currentEvent, function (event) {
			var offset = 48;

			if (event.type === EventService.EVENT.TOGGLE_HELP) {
				vm.showHelp = !vm.showHelp;
			}
			else if ((event.type === EventService.EVENT.PANEL_CONTENT_TOGGLED) &&
					 (event.value.position === vm.position) &&
					 (event.value.type !== vm.contentData.type)) {
				// Calculate the height of the content when other content is toggled
				if (vm.contentData.hasOwnProperty("minHeight")) {
					toggledContentHeight = event.value.contentHeight + contentHeightExtra; // The height of some other content toggled

					if (event.value.show)  {
						// An other content is shown
						otherContentHeight += toggledContentHeight;
						if ((otherContentHeight + vm.contentHeight) > maxPossibleHeight) {
							vm.contentHeight -= toggledContentHeight;
						}
					}
					else {
						// An other content is hidden
						otherContentHeight -= toggledContentHeight;
						if ((otherContentHeight + setHeight) < maxPossibleHeight) {
							vm.contentHeight = setHeight;
						}
						else {
							if (vm.contentHeight !== vm.contentData.minHeight) {
								vm.contentHeight += toggledContentHeight;
							}
						}
					}

					if (vm.contentHeight < vm.contentData.minHeight) {
						vm.contentHeight = vm.contentData.minHeight;
					}

					currentHeight = vm.contentHeight;
				}
			}
			else if (event.type === EventService.EVENT.WINDOW_HEIGHT_CHANGE) {
				if (event.value.change === 0) {
					maxHeight = event.value.height - panelGap - offset;
					maxPossibleHeight = event.value.height - panelGap - offset;
				}
				else if (vm.contentData.hasOwnProperty("minHeight")) {
					heightChange = event.value.change;
					if ((setHeight >= (maxHeight - heightChange - otherContentHeight))) {
						currentHeight = maxHeight - heightChange - otherContentHeight;
						if (currentHeight > vm.contentData.minHeight) {
							vm.contentHeight = currentHeight;
						}
					}
				}
			}
		});

		vm.toggleAdd = function (event) {
			event.stopPropagation();
			vm.addStatus = !vm.addStatus;
		};

		vm.toggleFilter = function (event) {
			event.stopPropagation();
			vm.showFilter = !vm.showFilter;
		};

		vm.toggleVisible = function (event) {
			event.stopPropagation();
			vm.visibleStatus = !vm.visibleStatus;
		};

		vm.doPrint = function(event) {
			event.stopPropagation();
		};

		vm.openMenu = function($mdOpenMenu, ev) {
			$mdOpenMenu(ev);
		};

		vm.optionSelected = function (index) {
			if (vm.contentData.options[index].toggle) {
				vm.contentData.options[index].selected = !vm.contentData.options[index].selected;
				vm.selectedOption = vm.contentData.options[index];
			}
			else {
				if (index !== currentSortIndex) {
					if (angular.isDefined(currentSortIndex)) {
						vm.contentData.options[currentSortIndex].selected = false;
						vm.contentData.options[currentSortIndex].firstSelected = false;
						vm.contentData.options[currentSortIndex].secondSelected = false;
					}
					currentSortIndex = index;
					vm.contentData.options[currentSortIndex].selected = true;
					vm.contentData.options[currentSortIndex].firstSelected = true;
				}
				else {
					vm.contentData.options[currentSortIndex].firstSelected = !vm.contentData.options[currentSortIndex].firstSelected;
					vm.contentData.options[currentSortIndex].secondSelected = !vm.contentData.options[currentSortIndex].secondSelected;
				}
				vm.selectedOption = vm.contentData.options[currentSortIndex];
			}

			// 'Reset' vm.selectedOption so that selecting the same option can be registered down the line
			$timeout(function () {
				vm.selectedOption = undefined;
			});
		};

		vm.clearFilter = function () {
			vm.filterInputText = "";
		};

		/**
		 * Sets the height of the content from the content's directive.
		 * @param height
		 */
		vm.setContentHeight = function (height) {
			if (height < (maxHeight - heightChange)) {
				setHeight = height;
				vm.contentHeight = height;
				atMaxHeight = false;
			}
			else {
				setHeight = maxHeight;
				vm.contentHeight = (maxHeight - heightChange);
				atMaxHeight = true;
			}
			currentHeight = vm.contentHeight;
		};

		/**
		 * A content item is requesting a height change
		 * @param height
		 */
		vm.onContentHeightRequest = function (height) {
			vm.onHeightRequest({contentItem: vm.contentData, height: height});
		};
	}
}());
