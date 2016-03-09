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

		/**
		 * Create the card content
		 */
		function createCardContent () {
			var i, length,
				content = angular.element($element[0].querySelector('#content')),
				contentItem,
				element;

			element =
				"<" + vm.contentData.type + " " +
				"show='vm.contentData.show' " +
				"on-set-content-height='vm.setContentHeight(height)' " +
				"height='vm.contentHeight' ";

			// Only add attributes when needed
			for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
				switch (vm.contentData.options[i]) {
					case "filter":
						element += "filter-text='vm.filterText' ";
						break;
					case "add":
						element += "show-add='vm.showAdd' ";
						break;
					case "visible":
						element += "visible='vm.visible' ";
						break;
					case "menu":
						element += "selected-menu-option='vm.selectedMenuOption' ";
						break;
				}
			}

			element += "></" + vm.contentData.type + ">";

			contentItem = angular.element(element);
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

			for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
				option = null;
				switch (vm.contentData.options[i]) {
					case "filter":
						option = angular.element(
							"<panel-card-option-filter show-filter='vm.showFilter'></panel-card-option-filter>"
						);
						break;

					case "add":
						option = angular.element(
							"<panel-card-option-add show-add='vm.showAdd'></panel-card-option-add>"
						);
						break;

					case "print":
						option = angular.element(
							"<panel-card-option-print></panel-card-option-print>"
						);
						break;

					case "visible":
						option = angular.element(
							"<panel-card-option-visible visible='vm.visible'></panel-card-option-visible>"
						);
						break;

					case "menu":
						option = angular.element(
							"<panel-card-option-menu menu='vm.contentData.menu' selected-menu-option='vm.selectedMenuOption'></panel-card-option-menu>"
						);
						break;
				}

				// Create the element
				if (option !== null) {
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
				filter = angular.element(
					"<panel-card-filter show-filter='vm.showFilter' filter-text='vm.filterText'></panel-card-filter>"
				);
				filterContainer.append(filter);
				$compile(filter)($scope);
			}
		}
	}
}());
