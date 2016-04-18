/**
 *	Copyright (C) 2016 3D Repo Ltd
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
        .directive("rightPanel", rightPanel);

    function rightPanel() {
        return {
            restrict: "E",
            scope: {},
            templateUrl: "rightPanel.html",
            controller: RightPanelCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    RightPanelCtrl.$inject = ["EventService"];

    function RightPanelCtrl (EventService) {
        var vm = this;

        function setupAddIssueWithScribble () {
            EventService.send(EventService.EVENT.SETUP_ISSUE_ADD, "scribble");
        }

        function setupAddIssueWithPin () {
            EventService.send(EventService.EVENT.SETUP_ISSUE_ADD, "pin");
        }

        vm.buttons = [
            {			
                label: "Scribble",
                icon: "gesture",
                click: setupAddIssueWithScribble
            },
            {
                label: "Pin",
                icon: "pin_drop",
                click: setupAddIssueWithPin
            }
        ]
    }
}());
