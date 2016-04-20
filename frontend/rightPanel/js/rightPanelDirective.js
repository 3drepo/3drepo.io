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

    RightPanelCtrl.$inject = ["$scope", "EventService"];

    function RightPanelCtrl ($scope, EventService) {
        var vm = this,
            addingScribbleIssue = false,
            addingPinIssue = false,
            eraseButton;

        /*
         * Init
         */
        vm.buttons = [
            {
                type: "scribble",
                icon: "border_color",
                click: scribble,
                disabled: false
            },
            {
                type: "erase",
                icon: "texture",
                click: erase,
                disabled: true
            },
            {
                type: "pin",
                icon: "pin_drop",
                click: pin,
                disabled: false
            }
        ];
        eraseButton = vm.buttons[1];

        /*
         * Setup event watch
         */
        $scope.$watch(EventService.currentEvent, function(event) {
            if ((event.type === EventService.EVENT.TOGGLE_ISSUE_ADD) && (!event.value.on)) {
                addingPinIssue = false;
                addingScribbleIssue = false;
                eraseButton.disabled = true;
            }
        });

        /**
         * Set up adding an issue with scribble
         */
        function scribble () {
            addingScribbleIssue = !addingScribbleIssue;
            addingPinIssue = false;
            eraseButton.disabled = false;
            EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: addingScribbleIssue, type: "scribble"});
        }

        /**
         * Set add issue to erase mode
         */
        function erase () {
            EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, "erase");
        }

        /**
         * Set up adding an issue with a pin
         */
        function pin () {
            addingPinIssue = !addingPinIssue;
            addingScribbleIssue = false;
            eraseButton.disabled = false;
            EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: addingPinIssue, type: "pin"});
        }
    }
}());
