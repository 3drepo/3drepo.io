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
	.directive("viewer", viewer);

	viewer.$inject = ["StateManager"];

	function viewer(StateManager) {
		return {
			restrict: "E",
			scope: { 
				manager: "=",
				name: "=",
				account: "=",
				project: "=",
				branch: "=",
				revision: "="
			},
			controller: ViewerCtrl,
			controllerAs: "v",
			bindToController: true
		};
	}

	ViewerCtrl.$inject = ["$scope", "$element", "EventService"];

	function ViewerCtrl ($scope, $element, EventService)
	{
		var v = this;

		function errCallback(errorType, errorValue)
		{
			EventService.sendError(errorType, errorValue);
		}
		
		function eventCallback(type, value)
		{
			EventService.send(type, value);
		}
		
		$scope.reload = function() {
			v.viewer.loadModel(v.account, v.project, v.branch, v.revision);
		};
		
		$scope.init = function() {
			v.viewer = new Viewer(v.name, $element[0], v.manager, eventCallback, errCallback);
			
			// TODO: Move this so that the attachment is contained
			// within the plugins themselves.
			// Comes free with oculus support and gamepad support
			v.oculus     = new Oculus(v.viewer);
			v.gamepad    = new Gamepad(v.viewer);
						
			v.gamepad.init();

			v.collision  = new Collision(v.viewer);

			v.viewer.init();
			
			$scope.reload();
		};
		$scope.init();

		$scope.$watch(EventService.currentEvent, function(event) {
			if (event.type === EventService.EVENT.PROJECT_SETTINGS_READY)
			{
				if (event.value.account === v.account && event.value.project === v.project)
				{
					v.viewer.updateSettings(event.value.settings);
				}
			}
		});
	}
}());