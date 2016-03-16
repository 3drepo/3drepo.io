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
				onShowFilter: "&"
            },
            controller: PanelCardCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    PanelCardCtrl.$inject = ["$scope", "$element", "$compile"];

    function PanelCardCtrl($scope, $element, $compile) {
        var vm = this,
            filter = null,
			contentHeight;

        vm.showHelp = false;
		vm.showFilter = false;
		vm.addStatus = false;
		vm.visibleStatus = false;
		vm.showClearFilterButton = false;

		/*
		 * Watch type on contentData to create content and tool bar options
		 */
		$scope.$watch("vm.contentData.type", function (newValue) {
			if (angular.isDefined(newValue)) {
				createCardContent();
				createToolbarOptions();
				createFilter();
				vm.statusIcon = vm.contentData.icon;
			}
		});

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
				"account='vm.account' " +
				"project='vm.project' " +
				"branch='vm.branch' " +
				"revision='vm.revision' ";

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
							"<panel-card-option-print account='vm.account' project='vm.project'></panel-card-option-print>"
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
			vm.statusIcon = "fa-arrow-left";
			vm.hideSelectedItem = false; // So that a change to this value is propagated
		};

		/**
		 * Content wants to show it's main content
		 */
		vm.hideItem = function () {
			vm.statusIcon = vm.contentData.icon;
			vm.hideSelectedItem = true;
			vm.addStatus = false;
		};
	}
}());
