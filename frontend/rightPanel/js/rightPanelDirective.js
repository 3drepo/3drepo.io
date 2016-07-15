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
            addIssueMode = null,
            measureMode = false,
            highlightBackground = "#FF9800";

        /*
         * Init
         */
        vm.showPanel = true;
        vm.issueButtons = {
            "scribble": {
                label: "Scribble",
                icon: "border_color",
                background: ""
            },
            "erase": {
                label: "Erase",
                faIcon: "fa fa-eraser",
                background: ""
            },
            "pin": {
                label: "Pin",
                icon: "pin_drop",
                background: ""
            }
        };
        vm.measureBackground = "";

        /*
         * Setup event watch
         */
        $scope.$watch(EventService.currentEvent, function(event) {
            if ((event.type === EventService.EVENT.TOGGLE_ISSUE_AREA) && (!event.value.on)) {
                if (addIssueMode !== null) {
                    vm.issueButtons[addIssueMode].background = "";
                    addIssueMode = null;
                }
            }
            else if (event.type === EventService.EVENT.SET_ISSUE_AREA_MODE) {
                if (addIssueMode !== event.value) {
                    vm.issueButtons[addIssueMode].background = "";
                    addIssueMode = event.value;
                    vm.issueButtons[addIssueMode].background = highlightBackground;
                }
            }
            else if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
                vm.showPanel = !vm.showPanel;
            }
        });

        /**
         * Set up adding an issue with scribble
         */
        vm.issueButtonClick = function (buttonType) {
            // Turn off measure mode
            if (measureMode) {
                measureMode = false;
                vm.measureBackground = "";
                EventService.send(EventService.EVENT.MEASURE_MODE, measureMode);
            }


            if (addIssueMode === null) {
                addIssueMode = buttonType;
                vm.issueButtons[buttonType].background = highlightBackground;
                EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: true, type: buttonType});
            }
            else if (addIssueMode === buttonType) {
                addIssueMode = null;
                vm.issueButtons[buttonType].background = "";
                EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: false});
            }
            else {
                vm.issueButtons[addIssueMode].background = "";
                addIssueMode = buttonType;
                vm.issueButtons[addIssueMode].background = highlightBackground;
                EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, buttonType);
            }
        };

        vm.toggleMeasure = function () {
            // Turn off issue mode
            if (addIssueMode !== null) {
                EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: false});
            }

            measureMode = !measureMode;
            vm.measureBackground = measureMode ? highlightBackground : "";
            EventService.send(EventService.EVENT.MEASURE_MODE, measureMode);
        };
    }
}());
