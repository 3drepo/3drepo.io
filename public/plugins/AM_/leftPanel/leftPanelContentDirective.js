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
        .directive("leftPanelContent", leftContentPanel);

    function leftContentPanel() {
        return {
            restrict: 'E',
            templateUrl: 'leftPanelContent.html',
            scope: {
                contentItem: "=",
                showContent: "="
            },
            controller: LeftPanelContentCtrl,
            controllerAs: 'lpc',
            bindToController: true
        };
    }

    LeftPanelContentCtrl.$inject = ["$scope", "$element", "$compile", "EventService"];

    function LeftPanelContentCtrl($scope, $element, $compile, EventService) {
        var lpc = this,
            content = "",
            contentItem = "",
            filterWatch = null;
        lpc.class = "leftPanelContentUnselected";
        lpc.filterText  = "";

        function uppercaseFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function setupFilterWatch() {
            filterWatch = $scope.$watch(EventService.currentEvent, function (event) {
                if (event.type === EventService.EVENT.FILTER) {
                    lpc.filterText = event.value;
                }
            });
        }

        $scope.$watch("lpc.contentItem", function (newValue) {
            if (angular.isDefined(newValue)) {
                lpc.title = uppercaseFirstLetter(lpc.contentItem);
                content = angular.element($element[0].querySelector('#content'));
                contentItem = angular.element(
                    "<" + lpc.contentItem + " filter-text='lpc.filterText'></" + lpc.contentItem + ">"
                );
                content.append(contentItem);
                $compile(contentItem)($scope);
                if (newValue === "tree") {
                    lpc.class = "leftPanelContentSelected";
                    setupFilterWatch();
                }
            }
        });

        $scope.$watch(EventService.currentEvent, function (event) {
            if ((angular.isDefined(event)) && (event.type === EventService.EVENT.LEFT_PANEL_CONTENT_CLICK) && (event.value !== lpc.contentItem)) {
                lpc.class = "leftPanelContentUnselected";
                if (filterWatch !== null) {
                    filterWatch(); // Cancel filter watch
                }
            }
        });

        lpc.click = function () {
            if (lpc.class === "leftPanelContentUnselected") {
                EventService.send(EventService.EVENT.LEFT_PANEL_CONTENT_CLICK, lpc.contentItem);
                lpc.class = "leftPanelContentSelected";
                setupFilterWatch();
            }
            else {
                lpc.class = "leftPanelContentUnselected";
                filterWatch();
            }
        }
    }
}());
