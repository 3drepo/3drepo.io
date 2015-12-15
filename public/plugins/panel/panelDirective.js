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

    PanelCtrl.$inject = ["$scope", "$element", "EventService"];

    function PanelCtrl ($scope, $element, EventService) {
        var pl = this,
            i = 0,
            length = 0,
            currentEvent;

		pl.contentItems = [];
        pl.showPanel = true;

        // Panel setup coming from login
        currentEvent = EventService.currentEvent();
        if (currentEvent.type === EventService.EVENT.PANEL_CONTENT_SETUP) {
			pl.contentItems = currentEvent.value[pl.position];
			hideLastItemGap();
        }

        $scope.$watch(EventService.currentEvent, function (event) {
            if (event.type === EventService.EVENT.PANEL_CONTENT_SETUP) {
				pl.contentItems = (event.value[pl.position]);
				hideLastItemGap();
            }
            else if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
                pl.showPanel = !pl.showPanel;
            }
			else if (event.type === EventService.EVENT.WINDOW_HEIGHT_CHANGE) {
				$element.css("height", (event.value.height - 97).toString() + "px");
			}
        });

		// The last card should not have a gap so that scrolling in resized window works correctly
		function hideLastItemGap () {
			var lastFound = false;
			for (i = (pl.contentItems.length - 1); i >= 0; i -= 1) {
				if (pl.contentItems[i].show) {
					if (!lastFound) {
						pl.contentItems[i].showGap = false;
						lastFound = true;
					} else {
						pl.contentItems[i].showGap = true;
					}
				}
			}
		}

		pl.buttonClick = function (contentType) {
            for (i = 0, length = pl.contentItems.length; i < length; i += 1) {
                if (contentType === pl.contentItems[i].type) {
                    pl.contentItems[i].show = !pl.contentItems[i].show;
					if (!pl.contentItems[i].show) {
						pl.contentItems[i].showGap = false;
					}
					EventService.send(
						EventService.EVENT.PANEL_CONTENT_TOGGLED,
						{
							position: pl.position,
							type: pl.contentItems[i].type,
							show: pl.contentItems[i].show,
							contentHeight: pl.contentItems[i].maxHeight
						}
					);
                }
            }
			hideLastItemGap();
        };
    }
}());
