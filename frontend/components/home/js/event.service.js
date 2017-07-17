/**
 *	Copyright (C) 2014 3D Repo Ltd
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
		.factory("EventService", EventService);

	EventService.$inject = ["$timeout"];

	function EventService ($timeout) {
		var EVENT = {
			AUTO_META_DATA: "EVENT_AUTO_META_DATA",
			FILTER: "EVENT_FILTER",
			FULL_SCREEN_ENTER: "EVENT_FULL_SCREEN_ENTER",
			GET_ISSUE_AREA_PNG: "EVENT_GET_ISSUE_AREA_PNG",
			GLOBAL_CLICK: "EVENT_GLOBAL_CLICK",
			ISSUE_AREA_PNG: "EVENT_ISSUE_AREA_PNG",
			MEASURE_MODE: "EVENT_MEASURE_MODE",
			MULTI_SELECT_MODE: "EVENT_MULTI_SELECT_MODE",
			OBJECT_SELECTED: "EVENT_OBJECT_SELECTED",
			PIN_DROP_MODE: "EVENT_PIN_DROP_MODE",
			PIN_SELECTED: "EVENT_PIN_SELECTED",
			PANEL_CONTENT_CLICK: "EVENT_LEFT_PANEL_CONTENT_CLICK",
			PANEL_CARD_ADD_MODE: "EVENT_PANEL_CARD_ADD_MODE",
			PANEL_CARD_EDIT_MODE: "EVENT_PANEL_CARD_EDIT_MODE",
			PANEL_CONTENT_SETUP: "EVENT_PANEL_CONTENT_SETUP",
			PANEL_CONTENT_TOGGLED: "EVENT_PANEL_CONTENT_TOGGLED",
			UPDATE_CLIPPING_PLANES: "EVENT_UPDATE_CLIPPING_PLANES",
			SET_SUBMODEL_TRANS_INFO: "EVENT_SET_SUBMODEL_TRANS_INFO",
			SET_ISSUE_AREA_MODE: "EVENT_SET_ISSUE_AREA_MODE",
			SHOW_MODELS: "EVENT_SHOW_MODELS",
			SHOW_QR_CODE_READER: "EVENT_SHOW_QR_CODE_READER",
			TOGGLE_ELEMENTS: "EVENT_TOGGLE_ELEMENTS",
			TOGGLE_HELP: "EVENT_TOGGLE_HELP",
			TOGGLE_ISSUE_ADD: "EVENT_TOGGLE_ISSUE_ADD",
			TOGGLE_ISSUE_AREA: "EVENT_TOGGLE_ISSUE_AREA",
			TOGGLE_ISSUE_AREA_DRAWING: "EVENT_TOGGLE_ISSUE_AREA_DRAWING",
			WINDOW_HEIGHT_CHANGE: "EVENT_WINDOW_HEIGHT_CHANGE",
			PANEL_CONTENT_ADD_MENU_ITEMS: "PANEL_CONTENT_ADD_MENU_ITEMS",
			RESET_SELECTED_OBJS: "EVENT_RESET_SELECTED_OBJS",

			// Events to control the viewer manager
			CREATE_VIEWER: "EVENT_CREATE_VIEWER",
			CLOSE_VIEWER: "EVENT_CLOSE_VIEWER",

			// Specific to the javascript viewer
			// populated by the viewer.js script
			VIEWER: Viewer.EVENT,

			// Ready signals
			MODEL_SETTINGS_READY: "EVENT_MODEL_SETTINGS_READY",
			REVISIONS_LIST_READY: "EVENT_REVISIONS_LIST_READY",
			TREE_READY: "EVENT_TREE_READY",

			// User logs in and out
			USER_LOGGED_IN: "EVENT_USER_LOGGED_IN",
			USER_LOGGED_OUT: "EVENT_USER_LOGGED_OUT",

			// Not authorized
			USER_NOT_AUTHORIZED: "EVENT_USER_NOT_AUTHORIZED",

			// State changes
			GO_HOME: "EVENT_GO_HOME",
			CLEAR_STATE: "EVENT_CLEAR_STATE",
			SET_STATE: "EVENT_SET_STATE",
			STATE_CHANGED: "EVENT_STATE_CHANGED",
			SELECT_ISSUE: "EVENT_SELECT_ISSUE",
			UPDATE_STATE: "EVENT_UPDATE_STATE",
			ISSUES_READY: "EVENT_ISSUES_READY"
		};

		var ERROR = {
			DUPLICATE_VIEWER_NAME: "ERROR_DUPLICATE_VIEWER_NAME"
		};

		var currentEvent = {};
		var currentError = {};

		var send = function (type, value) {
			var stack = (new Error()).stack;
			$timeout(function() {
				if (angular.isUndefined(type))
				{
					console.trace("UNDEFINED EVENT TYPE" + type);
					
				} else {
					currentEvent = {type: type, value: value, stack: stack};
				}
			});
		};

		var sendError = function(type, value) {
			$timeout(function() {
				if (angular.isUndefined(type))
				{
					console.trace("UNDEFINED ERROR TYPE");
				} else {
					//console.log(type + " : " + JSON.stringify(value));
					currentError = {type: type, value: value};
				}
			});
		};

		return {
			EVENT: EVENT,
			ERROR: ERROR,
			currentEvent: function() {return currentEvent;},
			currentError: function() {return currentError;},
			send: send,
			sendError: sendError
		};
	}
}());
