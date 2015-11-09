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
                icon: "="
            },
            controller: PanelContentCtrl,
            controllerAs: 'pc',
            bindToController: true
        };
    }

    PanelContentCtrl.$inject = ["$scope", "$element", "$compile", "EventService"];

    function PanelContentCtrl($scope, $element, $compile, EventService) {
        var pc = this,
            content = "",
            contentItem = "",
            filterWatch = null;
        pc.class = "panelContentUnselected";
        pc.showHelp = false;
        pc.filterText = "";

        function setupFilterWatch() {
            filterWatch = $scope.$watch(EventService.currentEvent, function (event) {
                if (event.type === EventService.EVENT.FILTER) {
                    pc.filterText = event.value;
                }
            });
        }

        $scope.$watch("pc.contentItem", function (newValue) {
            if (angular.isDefined(newValue)) {
                content = angular.element($element[0].querySelector('#content'));
                contentItem = angular.element(
                    "<" + pc.contentItem + " filter-text='pc.filterText'></" + pc.contentItem + ">"
                );
                content.append(contentItem);
                $compile(contentItem)($scope);
                if (newValue === "tree") {
                    pc.class = "panelContentSelected";
                    setupFilterWatch();
                }
            }
        });

        $scope.$watch("pc.contentTitle", function (newValue) {
            if (angular.isDefined(newValue)) {
                pc.showTitleBar = (newValue !== "");
            }
        });

        $scope.$watch(EventService.currentEvent, function (event) {
            if ((event.type === EventService.EVENT.PANEL_CONTENT_CLICK) && (event.value.position === pc.position)) {
                if (event.value.contentItem !== pc.contentItem) {
                    pc.class = "panelContentUnselected";
                    if (filterWatch !== null) {
                        filterWatch(); // Cancel filter watch
                    }
                }
            }
            else if (event.type === EventService.EVENT.TOGGLE_HELP) {
                pc.showHelp = !pc.showHelp;
            }
        });

        pc.click = function () {
            if (pc.class === "panelContentUnselected") {
                EventService.send(
                    EventService.EVENT.PANEL_CONTENT_CLICK,
                    {
                        position: pc.position,
                        contentItem: pc.contentItem
                    }
                );
                pc.class = "panelContentSelected";
                setupFilterWatch();
            }
            else {
                pc.class = "panelContentUnselected";
                filterWatch();
            }
        };
    }
}());
