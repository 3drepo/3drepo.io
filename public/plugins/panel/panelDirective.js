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
            buttons = angular.element($element[0].querySelector("#buttons")),
            content = "",
            element = "",
            i = 0,
            length = 0,
            currentEvent = null;
        pl.contentItems = [];
        pl.hideFilter = false;
        pl.showPanel = true;
        pl.panelIsSetUp = false;

        // Panel setup coming from login
        currentEvent = EventService.currentEvent();
        if (currentEvent.type === EventService.EVENT.PANEL_CONTENT_SETUP) {
            setupPanels(currentEvent.value[pl.position]);
        }

        $scope.$watch(EventService.currentEvent, function (event) {
            if (event.type === EventService.EVENT.PANEL_CONTENT_SETUP) {
                setupPanels(event.value[pl.position]);
            }
            else if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
                pl.showPanel = !pl.showPanel;
            }
        });

        function setupPanels (content) {
            if (!pl.panelIsSetUp) {
                for (i = 0, length = content.length; i < length; i += 1) {
                    pl.contentItems.push(content[i]);

                    // Content items
                    element = angular.element(
                        "<panel-content " +
                            "position='pl.position' " +
                            "content-item='pl.contentItems[" + i + "].type' " +
                            "content-title='pl.contentItems[" + i + "].title' " +
                            "show-content='pl.contentItems[" + i + "].show' " +
                            "help='pl.contentItems[" + i + "].help' " +
                            "icon='pl.contentItems[" + i + "].icon' " +
                            "has-filter='pl.contentItems[" + i + "].hasFilter' " +
                            "can-add='pl.contentItems[" + i + "].canAdd' " +
                            "options='pl.contentItems[" + i + "].options'>" +
                        "</panel-content>"
                    );
                    items.append(element);
                    $compile(element)($scope);

                    // Buttons
                    if (pl.contentItems[i].hasOwnProperty("icon")) {
                        element = angular.element(
                            "<md-button " +
                            "class='md-fab md-primary md-mini' " +
                            "ng-click=pl.buttonClick('" + pl.contentItems[i].type + "') " +
                            "aria-label='{{pl.contentItems[" + i + "].title}}'>" +
                            "<md-icon " +
                                "class='fa' " +
                                "md-font-icon='{{pl.contentItems[" + i + "].icon}}'>" +
                            "</md-icon>" +
                            "</md-button>"
                        );
                        buttons.append(element);
                        $compile(element)($scope);
                    }
                }
                pl.panelIsSetUp = true;
            }
        }

        pl.buttonClick = function (contentType) {
            pl.hideFilter = true; // Hide the filter if no content is shown
            for (i = 0, length = pl.contentItems.length; i < length; i += 1) {
                if (contentType === pl.contentItems[i].type) {
                    pl.contentItems[i].show = !pl.contentItems[i].show;
                }
                if (pl.hideFilter && pl.contentItems[i].show) {
                    pl.hideFilter = false;
                }
            }
        };
    }
}());
