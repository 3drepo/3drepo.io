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
        .factory('EventService', EventService);

    function EventService () {
        var EVENT = {
            FILTER: "EVENT_FILTER",
            FULL_SCREEN_ENTER: "EVENT_FULL_SCREEN_ENTER",
            GLOBAL_CLICK: "EVENT_GLOBAL_CLICK",
			OBJECT_SELECTED: "EVENT_OBJECT_SELECTED",
            PANEL_CONTENT_CLICK: "EVENT_LEFT_PANEL_CONTENT_CLICK",
            PANEL_CONTENT_SETUP: "EVENT_PANEL_CONTENT_SETUP",
			PANEL_CONTENT_TOGGLED: "EVENT_PANEL_CONTENT_TOGGLED",
			SHOW_QR_CODE_READER: "EVENT_SHOW_QR_CODE_READER",
            TOGGLE_ELEMENTS: "EVENT_TOGGLE_ELEMENTS",
            TOGGLE_HELP: "EVENT_TOGGLE_HELP",
			WINDOW_HEIGHT_CHANGE: "EVENT_WINDOW_HEIGHT_CHANGE"
        };

        var currentEvent = "";

        var send = function (type, value) {
            currentEvent = {type: type, value: value};
        };

        return {
            EVENT: EVENT,
            currentEvent: function() {return currentEvent;},
            send: send
        };
    }
}());
