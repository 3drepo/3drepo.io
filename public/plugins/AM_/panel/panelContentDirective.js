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
        .directive("panelContent", panelContent);

    function panelContent() {
        return {
            restrict: 'E',
            templateUrl: 'panelContent.html',
            scope: {
                position: "=",
                contentItem: "=",
                contentTitle: "=",
                showContent: "=",
                help: "=",
                icon: "=",
                hasFilter: "=",
                canAdd: "=",
                options: "="
            },
            controller: PanelContentCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PanelContentCtrl.$inject = ["$scope", "$element", "$compile", "$timeout", "EventService"];

    function PanelContentCtrl($scope, $element, $compile, $timeout, EventService) {
        var vm = this,
            content = "",
            contentItem = "",
            i = 0,
            length = 0,
            currentSortIndex,
            filter = null,
            last = {
                bottom: false,
                top: true,
                left: true,
                right: false
            };
        vm.showHelp = false;
        vm.filterText = "";
        vm.height = "minHeight";
        vm.addStatus = false;
        vm.toastPosition = angular.extend({}, last);
        vm.showClearFilterButton = false;

        $scope.$watch("vm.contentItem", function (newValue) {
            if (angular.isDefined(newValue)) {
                content = angular.element($element[0].querySelector('#content'));
                contentItem = angular.element(
                    "<" + vm.contentItem + " " +
                        "filter-text='vm.filterText' " +
                        "height='vm.height' " +
                        "show='vm.showContent' " +
                        "show-add='vm.addStatus' " +
                        "options='vm.options' " +
                        "selected-option='vm.selectedOption'>" +
                    "</" + vm.contentItem + ">"
                );
                content.append(contentItem);
                $compile(contentItem)($scope);
                if ((newValue === "tree") || (newValue === "issues")) {
                    vm.height = "maxHeight";
                }
            }
        });

        $scope.$watch("vm.contentTitle", function (newValue) {
            if (angular.isDefined(newValue)) {
                vm.showTitleBar = (newValue !== "");
            }
        });

        $scope.$watch("vm.options", function (newValue) {
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

        $scope.$watch("vm.filterText", function (newValue) {
            if (angular.isDefined(newValue)) {
                vm.filterInputText = newValue;
            }
        });

        $scope.$watch(EventService.currentEvent, function (event) {
            if ((event.type === EventService.EVENT.PANEL_CONTENT_CLICK) && (event.value.position === vm.position)) {
                if (event.value.contentItem !== vm.contentItem) {
                    vm.height = "minHeight";
                }
            }
            else if (event.type === EventService.EVENT.TOGGLE_HELP) {
                vm.showHelp = !vm.showHelp;
            }
        });

        vm.click = function () {
            if (vm.height === "minHeight") {
                EventService.send(
                    EventService.EVENT.PANEL_CONTENT_CLICK,
                    {
                        position: vm.position,
                        contentItem: vm.contentItem
                    }
                );
                vm.height = "maxHeight";
            }
            else {
                vm.height = "minHeight";
            }
        };

        vm.toggleAdd = function (event) {
            event.stopPropagation();
            vm.addStatus = !vm.addStatus;
        };

        vm.openMenu = function($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };

        vm.optionSelected = function (index) {
            if (vm.options[index].toggle) {
                vm.options[index].selected = !vm.options[index].selected;
                vm.selectedOption = vm.options[index];
            }
            else {
                if (index !== currentSortIndex) {
                    if (angular.isDefined(currentSortIndex)) {
                        vm.options[currentSortIndex].selected = false;
                        vm.options[currentSortIndex].firstSelected = false;
                        vm.options[currentSortIndex].secondSelected = false;
                    }
                    currentSortIndex = index;
                    vm.options[currentSortIndex].selected = true;
                    vm.options[currentSortIndex].firstSelected = true;
                }
                else {
                    vm.options[currentSortIndex].firstSelected = !vm.options[currentSortIndex].firstSelected;
                    vm.options[currentSortIndex].secondSelected = !vm.options[currentSortIndex].secondSelected;
                }
                vm.selectedOption = vm.options[currentSortIndex];
            }

            // 'Reset' vm.selectedOption so that selecting the same option can be registered down the line
            $timeout(function () {
                vm.selectedOption = undefined;
            });
        };

        vm.clearFilter = function () {
            vm.filterInputText = "";
        };
    }
}());
