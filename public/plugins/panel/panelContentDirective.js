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
				onHeightRequest: "&",
				onShowFilter: "&"
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
			contentHeight;

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
						"show='vm.contentData.show' " +
						"show-add='vm.addStatus' " +
						"visible='vm.visibleStatus' " +
						"options='vm.contentData.options' " +
						"on-content-height-request='vm.onContentHeightRequest(height)' " +
						"selected-option='vm.selectedOption'>" +
					"</" + vm.contentData.type + ">"
				);
				content.append(contentItem);
				$compile(contentItem)($scope);
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
			if (event.type === EventService.EVENT.TOGGLE_HELP) {
				vm.showHelp = !vm.showHelp;
			}
		});

		vm.toggleAdd = function (event) {
			event.stopPropagation();
			vm.addStatus = !vm.addStatus;
		};

		vm.toggleFilter = function (event) {
			event.stopPropagation();
			vm.showFilter = !vm.showFilter;
			vm.onShowFilter({show: vm.showFilter});
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

		/**
		 * Clear the filter text input
		 */
		vm.clearFilter = function () {
			vm.filterInputText = "";
		};

		/**
		 * A content item is requesting a height change
		 * @param height
		 */
		vm.onContentHeightRequest = function (height) {
			contentHeight = height;
			vm.onHeightRequest({contentItem: vm.contentData, height: contentHeight});
		};
	}
}());
