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
        .directive("leftPanel", leftPanel);

    function leftPanel () {
        return {
            restrict: 'E',
            templateUrl: 'leftPanel.html',
            scope: {},
            controller: LeftPanelCtrl,
            controllerAs: 'lp',
            bindToController: true
        };
    }

    LeftPanelCtrl.$inject = ["$scope", "$element", "$compile", "EventService"];

    function LeftPanelCtrl ($scope, $element, $compile, EventService) {
        var lp = this,
            items = angular.element($element[0].querySelector("#items")),
            content = "",
            i = 0,
            length = 0;
        lp.contentItems = [];
        lp.showFilter = true;

        $scope.$watch(EventService.currentEvent, function (event) {
            if (event.type === EventService.EVENT.LEFT_PANEL_CONTENT_SETUP) {
                for (i = 0, length = event.value.length; i < length; i += 1) {
                    if (event.value[i] === "tree") {
                        lp.contentItems.push({type: event.value[i], show: true});
                    }
                    else {
                        lp.contentItems.push({type: event.value[i], show: false});
                    }
                    content = angular.element(
                        "<left-panel-content " +
                            "content-item='lp.contentItems[" + i + "].type' " +
                            "show-content='lp.contentItems[" + i + "].show'>" +
                        "</left-panel-content>"
                    );
                    items.append(content);
                    $compile(content)($scope);
                }
            }
            else if (event.type === EventService.EVENT.LEFT_BUTTON_CLICK) {
                lp.showFilter = false;
                for (i = 0, length = lp.contentItems.length; i < length; i += 1) {
                    if (event.value === lp.contentItems[i].type) {
                        lp.contentItems[i].show = !lp.contentItems[i].show;
                    }
                    if (!lp.showFilter && lp.contentItems[i].show) {
                        lp.showFilter = true;
                    }
                }
            }
        });
    }
}());
