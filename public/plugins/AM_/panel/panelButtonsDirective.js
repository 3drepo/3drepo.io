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
        .directive("panelButtons", panelButtons);

    function panelButtons () {
        return {
            restrict: 'E',
            templateUrl: 'panelButtons.html',
            scope: {},
            controller: PanelButtonsCtrl,
            controllerAs: 'lb',
            bindToController: true
        };
    }

    PanelButtonsCtrl.$inject = ["$scope", "EventService"];

    function PanelButtonsCtrl ($scope, EventService) {
        var pb = this,
            i = 0,
            length = 0,
            button = {};
        pb.buttons = [];
        pb.showButtons = true;

        $scope.$watch(EventService.currentEvent, function (event) {
            if (event.type === EventService.EVENT.PANEL_CONTENT_SETUP) {
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
                    pb.buttons.push(button);
                }
            }
            else if (event.type === EventService.EVENT.TOGGLE_FULL_SCREEN) {
                pb.showButtons = !pb.showButtons;
            }
        });

        pb.click = function (index) {
            EventService.send(EventService.EVENT.LEFT_BUTTON_CLICK, pb.buttons[index].content[index]);
        };
    }
}());
