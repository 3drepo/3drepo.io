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
            selectedColour = "#FBC02D",
            unselectedColour = "#FFFFFF",
            selectedButtonIndex = null;

        /*
         * Init
         */
        vm.buttons = [
            {
                label: "Scribble",
                icon: "gesture",
                iconColour: unselectedColour,
                click: buttonClick
            },
            {
                label: "Pin",
                icon: "pin_drop",
                iconColour: unselectedColour,
                click: buttonClick
            }
        ];

        /*
         * Setup event watch
         */
        $scope.$watch(EventService.currentEvent, function(event) {
            if ((event.type === EventService.EVENT.TOGGLE_ISSUE_ADD) && (!event.value.on)) {
                addingPinIssue = false;
                addingScribbleIssue = false;
            }
        });

        /**
         * Set up adding an issue with scribble
         */
        function setupAddIssueWithScribble () {
            addingScribbleIssue = !addingScribbleIssue;
            addingPinIssue = false;
            EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: addingScribbleIssue, type: "scribble"});
        }

        /**
         * Set up adding an issue with a pin
         */
        function setupAddIssueWithPin () {
            addingPinIssue = !addingPinIssue;
            addingScribbleIssue = false;
            EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: addingPinIssue, type: "pin"});
        }
        
        function buttonClick (index) {
            // Change button icon colours
            if (selectedButtonIndex === null) {
                selectedButtonIndex = index;
                vm.buttons[index].iconColour = selectedColour;
            }
            else if (index !== selectedButtonIndex) {
                vm.buttons[selectedButtonIndex].iconColour = unselectedColour;
                selectedButtonIndex = index;
                vm.buttons[selectedButtonIndex].iconColour = selectedColour;
            }
            else {
                vm.buttons[selectedButtonIndex].iconColour = unselectedColour;
                selectedButtonIndex = null;
            }

            // Call button functions
            switch (vm.buttons[index].label) {
                case "Scribble" :
                    setupAddIssueWithScribble();
                    break;

                case "Pin" :
                    setupAddIssueWithPin();
                    break;
            }
        }
    }
}());
