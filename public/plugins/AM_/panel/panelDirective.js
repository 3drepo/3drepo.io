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
        .directive("panel", panel);

    function panel () {
        return {
            restrict: 'E',
            templateUrl: 'panel.html',
            scope: {
                position: "@"
            },
            controller: PanelCtrl,
            controllerAs: 'pl',
            bindToController: true
        };
    }

    PanelCtrl.$inject = ["$scope", "$element", "$compile", "EventService"];

    function PanelCtrl ($scope, $element, $compile, EventService) {
        var pl = this,
            items = angular.element($element[0].querySelector("#items")),
            content = "",
            contentElement = "",
            i = 0,
            length = 0;
        pl.contentItems = [];
        pl.hideFilter = false;
        pl.showPanel = true;

        $scope.$watch(EventService.currentEvent, function (event) {
            if ((event.type === EventService.EVENT.PANEL_CONTENT_SETUP) && (event.value.position === pl.position)) {
                content = event.value.content;
                for (i = 0, length = content.length; i < length; i += 1) {
                    if (content[i] === "tree") {
                        pl.contentItems.push({type: content[i], show: true});
                    }
                    else {
                        pl.contentItems.push({type: content[i], show: true});
                    }
                    contentElement = angular.element(
                        "<panel-content " +
                            "content-item='pl.contentItems[" + i + "].type' " +
                            "show-content='pl.contentItems[" + i + "].show'>" +
                        "</panel-content>"
                    );
                    items.append(contentElement);
                    $compile(contentElement)($scope);
                }
            }
            else if (event.type === EventService.EVENT.RIGHT_BUTTON_CLICK) {
                pl.hideFilter = true; // Hide the filter if no content is shown
                for (i = 0, length = pl.contentItems.length; i < length; i += 1) {
                    if (event.value === pl.contentItems[i].type) {
                        pl.contentItems[i].show = !pl.contentItems[i].show;
                    }
                    if (pl.hideFilter && pl.contentItems[i].show) {
                        pl.hideFilter = false;
                    }
                }
            }
            else if (event.type === EventService.EVENT.TOGGLE_FULL_SCREEN) {
                pl.showPanel = !pl.showPanel;
            }
        });
    }
}());
