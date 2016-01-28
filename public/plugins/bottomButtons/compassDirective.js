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

var toggleElements;

(function () {
	"use strict";

	function compassLoaded(event)
	{
		// Zoom in on compass
		$("#Axes")[0].runtime.showAll();
	};

	function compassMove(origEvent, event)
	{
		// Axes should rotate inversely to orientation
		// of camera
		event.orientation[1] = event.orientation[1] * -1;

		// Fix transformation from viewpoint basis
		viewer.transformEvent(event, event.target, false);

		// Set rotation of the overlying group
		$("#AxesTrans")[0].setAttribute("rotation", event.orientation.toString());

		$("#AxesTrans")[0].addEventListener("mousedown", onMouseDown);
		$("#AxesTrans")[0].addEventListener("mouseup", onMouseUp);

	}

	function compassChange(event)
	{
		// Axes should rotate inversely to orientation
		// of camera
		event.orientation[1] = event.orientation[1] * -1;
	}

	angular.module("3drepo")
		.directive("compass", compass);

	function compass () {
		return {
			restrict: "E",
			templateUrl: "compass.html",
			scope: {},
			controller: CompassCtrl,
			controllerAs: "cc",
			bindToController: true,
		};
	}

	CompassCtrl.$inject = ["$scope", "ViewerService", "EventService", "$element"];

	function CompassCtrl ($scope, ViewerService, EventService, $element)
	{
		var cc = this, defaultViewer = ViewerService.defaultViewer;

		toggleElements = function () {
			EventService.send(EventService.EVENT.TOGGLE_ELEMENTS);
			$scope.$apply();
		};

		ViewerService.defaultViewer.onViewpointChanged(compassMove);
	};

}());

