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
                canAdd: "=",
                options: "="
            },
            controller: PanelContentCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    PanelContentCtrl.$inject = ["$scope", "$element", "$compile", "$mdDialog", "EventService"];

    function PanelContentCtrl($scope, $element, $compile, $mdDialog, EventService) {
        var vm = this,
            content = "",
            contentItem = "",
            filterWatch = null,
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

        function setupFilterWatch() {
            filterWatch = $scope.$watch(EventService.currentEvent, function (event) {
                if (event.type === EventService.EVENT.FILTER) {
                    vm.filterText = event.value;
                }
            });
        }

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
                    setupFilterWatch();
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

        $scope.$watch(EventService.currentEvent, function (event) {
            if ((event.type === EventService.EVENT.PANEL_CONTENT_CLICK) && (event.value.position === vm.position)) {
                if (event.value.contentItem !== vm.contentItem) {
                    vm.height = "minHeight";
                    if (filterWatch !== null) {
                        filterWatch(); // Cancel filter watch
                    }
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
                setupFilterWatch();
            }
            else {
                vm.height = "minHeight";
                filterWatch();
            }
        };

        vm.toggleAdd = function (event) {
            event.stopPropagation();
            vm.addStatus = !vm.addStatus;
        };

        vm.openMenu = function($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        };

        vm.optionSelected = function (option) {
            vm.selectedOption = option;
        };
    }
}());
