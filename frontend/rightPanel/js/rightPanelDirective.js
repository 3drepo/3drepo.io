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
            addIssueMode = null;

        /*
         * Init
         */
        vm.issueButtons = [
            {
                type: "scribble",
                icon: "border_color",
                click: issueButtonClick
            },
            {
                type: "erase",
                faIcon: "fa fa-eraser",
                click: issueButtonClick
            },
            {
                type: "pin",
                icon: "pin_drop",
                click: issueButtonClick
            }
        ];

        /*
         * Setup event watch
         */
        $scope.$watch(EventService.currentEvent, function(event) {
            if (event.type === EventService.EVENT.TOGGLE_ISSUE_AREA) {
                addIssueMode = event.value.on ? event.value.type : null;
            }
        });

        /**
         * Set up adding an issue with scribble
         */
        function issueButtonClick (buttonType) {
            if (addIssueMode === null) {
                addIssueMode = buttonType;
                EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: true, type: buttonType});
            }
            else if (addIssueMode === buttonType) {
                addIssueMode = null;
                EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: false});
            }
            else {
                addIssueMode = buttonType;
                EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, buttonType);
            }
        }
    }
}());
