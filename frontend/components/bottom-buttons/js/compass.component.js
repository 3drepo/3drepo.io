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

	function compassLoaded(event)
	{
		// Zoom in on compass
		document.getElementById("Axes").runtime.showAll();
	}

	function compassMove(event)
	{
		// Axes should rotate inversely to orientation
		// of camera
		event.orientation[1] = -event.orientation[1];

		// Fix transformation from viewpoint basis
		viewer.transformEvent(event, event.target, false);

		// Set rotation of the overlying group
		document.getElementById("AxesTrans").setAttribute("rotation", event.orientation.toString());
	}

	angular.module("3drepo")
		.component("compass", compass);

	function compass () {
		return {
			restrict: "E",
			templateUrl: "compass.html",
			bindings: {},
			controller: CompassCtrl,
			controllerAs: "cc"		
		};
	}

	CompassCtrl.$inject = ["$scope", "EventService"];

	function CompassCtrl ($scope, EventService)
	{
		$scope.$watch(EventService.currentEvent, function(event)
		{
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.VIEWER.START_LOADING) {
					EventService.send(EventService.EVENT.VIEWER.REGISTER_VIEWPOINT_CALLBACK, { callback: compassMove });
				}
			}
		});
	}
}());

