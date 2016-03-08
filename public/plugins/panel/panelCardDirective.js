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
        .directive("panelCard", panelCard);

    function panelCard() {
        return {
            restrict: 'E',
            templateUrl: 'panelCard.html',
            scope: {
                position: "=",
                contentData: "="
            },
            controller: PanelCardCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PanelCardCtrl.$inject = ["$scope", "$element", "$compile", "$timeout", "$window", "serverConfig", "EventService", "StateManager"];

    function PanelCardCtrl($scope, $element, $compile, $timeout, $window, serverConfig, EventService, StateManager) {
        var vm = this,
            currentSortIndex,
            filter = null,
			currentHeight = 0,
			contentHeightExtra = 20,
			toggledContentHeight = 0,
			minimized = false,
			maxHeight,
			maxPossibleHeight,
			atMaxHeight = false,
			heightChange = 0,
			setHeight = 0, // The height set by the content
			otherContentHeight = 0, // The height of all the other panel contents
			panelGap = 40; // The total of the top and bottom gap for the panel in the page


        vm.showHelp = false;
		vm.showFilter = false;
		vm.addStatus = false;
		vm.visibleStatus = false;
		vm.showClearFilterButton = false;

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

		/*
		 * Watch type on contentData to create content and tool bar options
		 */
		$scope.$watch("vm.contentData.type", function (newValue) {
			if (angular.isDefined(newValue)) {
				createCardContent();
				createToolbarOptions();
				createFilter();
			}
		});

		$scope.$watch("vm.contentData.minHeight", function (newValue) {
			vm.contentHeight = newValue;
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
					if (!minimized) {
						if ((setHeight >= (maxHeight - heightChange - otherContentHeight))) {
							currentHeight = maxHeight - heightChange - otherContentHeight;
							if (currentHeight > vm.contentData.minHeight) {
								vm.contentHeight = currentHeight;
							}
						}
					}
				}
			}
		});

		vm.toolbarClick = function () {
			if (vm.contentData.hasOwnProperty("minHeight")) {
				if (minimized) {
					vm.contentHeight = currentHeight;
					minimized = false;
				}
				else {
					vm.contentHeight = vm.contentData.minHeight;
					minimized = true;
				}
			}
		};

		vm.menuItemSelected = function (index) {
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


		/**
		 * Create the card content
		 */
		function createCardContent () {
			var content = angular.element($element[0].querySelector('#content')),
				contentItem;

			contentItem = angular.element(
				"<" + vm.contentData.type + " " +
				"filter-text='vm.filterText' " +
				"height='vm.contentHeight' " +
				"show='vm.contentData.show' " +
				"show-add='vm.addStatus' " +
				"visible='vm.visibleStatus' " +
				"on-set-content-height='vm.setContentHeight(height)' " +
				"options='vm.contentData.options' " +
				"selected-option='vm.selectedOption'>" +
				"</" + vm.contentData.type + ">"
			);
			content.append(contentItem);
			$compile(contentItem)($scope);
		}

		/**
		 * Create the tool bar options
		 */
		function createToolbarOptions () {
			var i,
				length,
				options = angular.element($element[0].querySelector('#options')),
				option;

			console.log(vm.contentData);
			for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
				// Filter
				if (vm.contentData.options[i] === "filter") {
					// Element
					option = angular.element(
						"<md-button class='md-icon-button' aria-label='Filter' ng-click='vm.toggleFilter($event)'>" +
						"<md-icon class='fa fa-search'></md-icon>" +
						"</md-button>"
					);
					options.append(option);
					$compile(option)($scope);
					// Function
					vm.toggleFilter = function (event) {
						event.stopPropagation();
						vm.showFilter = !vm.showFilter;
					};
				}

				// Add
				else if (vm.contentData.options[i] === "add") {
					// Element
					option = angular.element(
						"<md-button class='md-icon-button' aria-label='Add' ng-click='vm.toggleAdd($event)'>" +
						"<md-icon class='fa fa-pencil'></md-icon>" +
						"</md-button>"
					);
					options.append(option);
					$compile(option)($scope);
					// Function
					vm.toggleAdd = function (event) {
						event.stopPropagation();
						vm.addStatus = !vm.addStatus;
					};
				}

				// Print
				else if (vm.contentData.options[i] === "print") {
					// Element
					option = angular.element(
						"<md-button class='md-icon-button' aria-label='Print' ng-click='vm.doPrint($event)'>" +
						"<md-icon class='fa fa-print'></md-icon>" +
						"</md-button>"
					);
					options.append(option);
					$compile(option)($scope);
					// Function
					vm.doPrint = function(event) {
						event.stopPropagation();
						$window.open(serverConfig.apiUrl(StateManager.state.account + "/" + StateManager.state.project + "/issues.html"), "_blank");
					};
				}

				// Visible
				else if (vm.contentData.options[i] === "visible") {
					// Element
					option = angular.element(
						"<md-button class='md-icon-button' aria-label='Visibility' ng-click='vm.toggleVisible($event)'>" +
						"<md-icon class='fa fa-eye' ng-if='vm.visibleStatus'></md-icon>" +
						"<md-icon class='fa fa-eye-slash' ng-if='!vm.visibleStatus'></md-icon>" +
						"</md-button>"
					);
					options.append(option);
					$compile(option)($scope);
					// Function
					vm.toggleVisible = function (event) {
						event.stopPropagation();
						vm.visibleStatus = !vm.visibleStatus;
					};
				}

				// Menu
				else if (vm.contentData.options[i] === "menu") {
					// Element
					option = angular.element(
						"<md-menu md-position-mode='target-right target' md-offset='2 14'>" +
							"<md-button class='md-icon-button' aria-label='Menu' ng-click='$mdOpenMenu($event)'>" +
								"<md-icon class='fa fa-ellipsis-v'></md-icon>" +
							"</md-button>" +
							"<md-menu-content width='4'>" +
								"<md-menu-item ng-repeat='menuItem in vm.contentData.menu'>" +
									"<md-button ng-click='vm.menuItemSelected($index)'>" +
										"<div layout='row'>" +
											"<md-icon class='fa fa-check' ng-if='menuItem.selected'></md-icon>" +
											"<p flex=''>{{menuItem.label}}</p>" +
											"<md-icon class='fa {{menuItem.firstSelectedIcon}}' ng-if='menuItem.firstSelected'></md-icon>" +
											"<md-icon class='fa {{menuItem.secondSelectedIcon}}' ng-if='menuItem.secondSelected'></md-icon>" +
										"</div>" +
									"</md-button>" +
								"</md-menu-item>" +
							"</md-menu-content>" +
						"</md-menu>"
					);
					options.append(option);
					$compile(option)($scope);
				}
			}
		}

		/**
		 * Create the filter element
		 */
		function createFilter () {
			var filterContainer = angular.element($element[0].querySelector('#filterContainer')),
				filter;
			if (vm.contentData.options.indexOf("filter") !== -1) {
				// Element
				filter = angular.element(
					"<div class='panelCardFilter' layout='row' ng-if='vm.showFilter'>" +
						"<div flex='85'>" +
							"<md-input-container md-no-float=''>" +
								"<input type='text' ng-model='vm.filterInputText' placeholder='Filter'>" +
							"</md-input-container>" +
						"</div>" +
						"<div flex='15' ng-if='vm.showClearFilterButton'>" +
							"<md-button class='md-icon-button' ng-click='vm.clearFilter()' aria-label='Clear filter'>" +
								"<md-icon class='fa fa-times-circle'></md-icon>" +
							"</md-button>" +
							"</md-input-container>" +
						"</div>" +
					"</div>"
				);
				filterContainer.append(filter);
				$compile(filter)($scope);

				// Functions and watches
				vm.clearFilter = function () {
					vm.filterInputText = "";
				};

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

				$scope.$watch("vm.filterText", function (newValue) {
					if (angular.isDefined(newValue)) {
						vm.filterInputText = newValue;
					}
				});

			}
		}
	}
}());
