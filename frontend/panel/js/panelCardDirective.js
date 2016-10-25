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
            restrict: "E",
            templateUrl: "panelCard.html",
            scope: {
				account: "=",
				project: "=",
				branch: "=",
				revision: "=",
                position: "=",
                contentData: "=",
				onHeightRequest: "&",
				onShowFilter: "&",
				keysDown: "=",
				selectedObjects: "=",
				setInitialSelectedObjects: "&"
			},
            controller: PanelCardCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    PanelCardCtrl.$inject = ["$scope", "$element", "$compile", "EventService"];

    function PanelCardCtrl($scope, $element, $compile, EventService) {
        var vm = this,
            filter = null,
			contentHeight,
			options = angular.element($element[0].querySelector('#options')),
			currentHighlightedOptionIndex = -1;

		/*
		 * Init
		 */
        vm.showHelp = false;
		vm.showFilter = false;
		vm.visibleStatus = false;
		vm.showClearFilterButton = false;
		vm.showAdd = false;
		vm.hideMenuButton = false;

		/*
		 * Watch type on contentData to create content and tool bar options
		 */
		$scope.$watch("vm.contentData.type", function (newValue) {
			if (angular.isDefined(newValue)) {
				createCardContent();
				createToolbarOptions();
				createFilter();
				//createAdd();
				vm.statusIcon = vm.contentData.icon;
			}
		});

		/*
		 * Watch show on contentData to toggle elements off
		 */
		$scope.$watch("vm.contentData.show", function (newValue) {
			if ((angular.isDefined(newValue) && !newValue)) {
				vm.hideItem();
			}
		});

		/*
		 * Change toolbar options when toggling add functionality
		 */
		$scope.$watch("vm.showAdd", function (newValue) {
			if (angular.isDefined(newValue)) {
				toggleAdd(newValue);
			}
		});

		/*
		 * Watch for card in edit mode
		 */
		$scope.$watch("vm.showEdit", function (newValue) {
			if (angular.isDefined(newValue)) {
				EventService.send(EventService.EVENT.PANEL_CARD_EDIT_MODE, {on: newValue, type: vm.contentData.type});
			}
		});

		/*
		 * Set up event watching
		 */
		$scope.$watch(EventService.currentEvent, function(event) {
			if ((event.type === EventService.EVENT.TOGGLE_ISSUE_ADD) && (vm.contentData.type === "issues")) {
				toggleAdd(event.value.on);
				// Reset option highlight if the issue add is cancelled
				if (!event.value.on) {
					vm.contentData.options[currentHighlightedOptionIndex].color = "";
					currentHighlightedOptionIndex = -1;
				}
			}
			else if ((event.type === EventService.EVENT.PANEL_CARD_ADD_MODE) ||
					 (event.type === EventService.EVENT.PANEL_CARD_EDIT_MODE)) {
				// Only one card can be in modify mode at a time
				if (event.value.on && (event.value.type !== vm.contentData.type)) {
					vm.hideItem();
				}
			}
			else if ((event.type === EventService.EVENT.SET_ISSUE_AREA_MODE) && (vm.contentData.type === "issues")) {
				highlightOption(event.value);
			}
		});

		/*
		 * Watch for content item to hide itself
		 */
		$scope.$watch("vm.hideSelectedItem", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				vm.statusIcon = vm.contentData.icon;
			}
		});

		/**
		 * A content item is requesting a height change
		 * @param height
		 */
		vm.onContentHeightRequest = function (height) {
			contentHeight = height;
			vm.onHeightRequest({contentItem: vm.contentData, height: contentHeight});
		};

		/**
		 * Content wants to show an individual item
		 */
		vm.showItem = function () {
			vm.statusIcon = "arrow_back";
			vm.hideMenuButton = true;
			vm.hideSelectedItem = false; // So that a change to this value is propagated
		};

		/**
		 * Content wants to show it's main content
		 */
		vm.hideItem = function () {
			vm.statusIcon = vm.contentData.icon;
			vm.hideMenuButton = false;
			vm.hideSelectedItem = true;
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
				"on-content-height-request='vm.onContentHeightRequest(height)' " +
				"on-show-item='vm.showItem()' " +
				"hide-item='vm.hideSelectedItem' " +
				"show-edit='vm.showEdit' " +
				"account='vm.account' " +
				"project='vm.project' " +
				"branch='vm.branch' " +
				"revision='vm.revision' " +
				"keys-down='vm.keysDown' " +
				"selected-objects='vm.selectedObjects' " +
				"set-initial-selected-objects='vm.setInitialSelectedObjects({selectedObjects: selectedObjects})'";

			// Only add attributes when needed
			if (vm.contentData.hasOwnProperty("options")) {
				for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
					switch (vm.contentData.options[i].type) {
						case "filter":
							element += "filter-text='vm.filterText' ";
							break;
						case "visible":
							element += "visible='vm.visible' ";
							break;
						case "menu":
							element += "selected-menu-option='vm.selectedMenuOption' ";
							break;
					}
				}
			}
			if (vm.contentData.hasOwnProperty("add") && vm.contentData.add) {
				element += "show-add='vm.showAdd' can-add='vm.canAdd'";
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
			var i, length,
				option, optionElement;

			if (vm.contentData.hasOwnProperty("options")) {
				for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
					option = null;
					optionElement = "<panel-card-option-" + vm.contentData.options[i].type;
					optionElement += " id='panal_card_option_" + vm.contentData.options[i].type + "'";

					if(vm.contentData.options[i].type === 'menu'){
						optionElement += " ng-if='!vm.hideMenuButton'";
					} else {
						optionElement += " ng-if='vm.contentData.options[" + i + "].visible'";
					}
					
					vm.contentData.options[i].color = "";
					optionElement += " style='color:{{vm.contentData.options[" + i + "].color}}'";

					switch (vm.contentData.options[i].type) {
						case "filter":
							optionElement += " show-filter='vm.showFilter'";
							break;

						case "visible":
							optionElement += " visible='vm.visible'";
							break;

						case "menu":
							optionElement += "menu='vm.contentData.menu' selected-menu-option='vm.selectedMenuOption'";
							break;

						case "close":
							optionElement += "show='vm.contentData.show'";
							break;
					}

					optionElement += "><panel-card-option-" + vm.contentData.options[i].type + ">";
					option = angular.element(optionElement);

					// Create the element
					if (option !== null) {
						options.prepend(option);
						$compile(option)($scope);
					}
				}
			}
		}

		/**
		 * Add tool bar options
		 */
		function showToolbarOptions (addOptions, show) {
			var i, length;
			for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
				if (addOptions.indexOf(vm.contentData.options[i].type) !== -1) {
					vm.contentData.options[i].visible = show;
				}
			}
		}

		/**
		 * Create the filter element
		 */
		function createFilter () {
			var i, length,
				filterContainer = angular.element($element[0].querySelector('#filterContainer')),
				filter;
			if (vm.contentData.hasOwnProperty("options")) {
				for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
					if (vm.contentData.options[i].type === "filter") {
						filter = angular.element(
							"<panel-card-filter show-filter='vm.showFilter' filter-text='vm.filterText'></panel-card-filter>"
						);
						filterContainer.append(filter);
						$compile(filter)($scope);
						break;
					}
				}
			}
		}

		/**
		 * Create the add button
		 */
		function createAdd () {
			var panelCardContainer = angular.element($element[0].querySelector('#panelCardContainer')),
				add;
			if (vm.contentData.hasOwnProperty("add") && vm.contentData.add) {
				add = angular.element(
					"<panel-card-add show-add='vm.showAdd' ng-if='vm.canAdd'></panel-card-add>"
				);
				panelCardContainer.append(add);
				$compile(add)($scope);
			}
		}

		/**
		 * Handle adding content
		 * 
		 * @param {Boolean} on
         */
		function toggleAdd (on) {
			if (on) {
				if (vm.contentData.type === "issues") {
					showToolbarOptions(["filter", "menu"], false);
					//showToolbarOptions(["pin", "scribble", "erase"], true);
				}
				EventService.send(EventService.EVENT.PANEL_CARD_ADD_MODE, {on: true, type: vm.contentData.type});
			}
			else {
				if (vm.contentData.type === "issues") {
					//showToolbarOptions(["pin", "scribble", "erase"], false);
					showToolbarOptions(["filter", "menu"], true);
				}
				EventService.send(EventService.EVENT.PANEL_CARD_ADD_MODE, {on: false});
			}
		}

		/**
		 * Highlight a toolbar option
		 * @param option
		 */
		function highlightOption (option) {
			var i, length;

			if (vm.contentData.hasOwnProperty("options")) {
				for (i = 0, length = vm.contentData.options.length; i < length; i += 1) {
					if (vm.contentData.options[i].type === option) {
						if ((currentHighlightedOptionIndex !== -1) && (currentHighlightedOptionIndex !== i)) {
							vm.contentData.options[currentHighlightedOptionIndex].color = "";
							currentHighlightedOptionIndex = i;
							vm.contentData.options[i].color = "#FF9800";
						}
						else {
							currentHighlightedOptionIndex = i;
							vm.contentData.options[i].color = "#FF9800";
						}
						break;
					}
				}
			}
		}
	}
}());
