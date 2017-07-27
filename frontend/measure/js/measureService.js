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
		.factory("MeasureService", MeasureService);

	MeasureService.$inject = ["EventService", "$timeout", "$rootScope"];

	function MeasureService (EventService, $timeout, $rootScope) {

			var moveCallback = undefined;

			var mouseMoveCallback = function(evt)
			{
				if (typeof moveCallback !== 'undefined')
				{
					moveCallback(evt);
				}
			};
			
			// Initialise when the service is created
			EventService.send(EventService.EVENT.VIEWER.REGISTER_MOUSE_MOVE_CALLBACK, {
				callback: mouseMoveCallback
			});

			// and when the viewer is reloaded.
			$rootScope.$watch(EventService.currentEvent, function(event) {
				if (event.type === EventService.EVENT.VIEWER.LOADED) {
					EventService.send(EventService.EVENT.VIEWER.REGISTER_MOUSE_MOVE_CALLBACK, {
						callback: mouseMoveCallback
					});
				}
			});
		
			var registerCallback = function(callback)
			{
				moveCallback = callback;
			};

			var unregisterCallback = function(callback)
			{
				moveCallback = undefined;
			};

			return {
				registerCallback: registerCallback,
				unregisterCallback: unregisterCallback
			};
	}
}());