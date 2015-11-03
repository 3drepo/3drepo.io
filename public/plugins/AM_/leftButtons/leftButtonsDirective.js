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
        .directive("leftButtons", leftButtons);

    function leftButtons () {
        return {
            restrict: 'E',
            templateUrl: 'leftButtons.html',
            scope: {},
            controller: LeftButtonsCtrl,
            controllerAs: 'lb',
            bindToController: true
        };
    }

    LeftButtonsCtrl.$inject = ["$scope", "EventService"];

    function LeftButtonsCtrl ($scope, EventService) {
        var lb = this,
            i = 0,
            length = 0,
            button = {};
        lb.buttons = [];

        $scope.$watch(EventService.currentEvent, function (event) {
            if (event.type === EventService.EVENT.LEFT_PANEL_CONTENT_SETUP) {
                for (i = 0, length = event.value.length; i < length; i += 1) {
                    button = {content: event.value};
                    switch (event.value[i]) {
                        case "tree":
                            button.icon = "fa-tree";
                            break;
                        case "viewpoints":
                            button.icon = "fa-street-view";
                            break;
                        case "meta":
                            button.icon = "fa-map-o";
                            break;
                        case "pdf":
                            button.icon = "fa-file-pdf-o";
                            break;
                    }
                    lb.buttons.push(button);
                }
            }
        });

        lb.click = function (index) {
            EventService.send(EventService.EVENT.LEFT_BUTTON_CLICK, lb.buttons[index].content[index]);
        }
    }
}());
