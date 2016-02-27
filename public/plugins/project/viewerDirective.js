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
				manager: "="
			},
			link: link,
			controller: ViewerCtrl,
			controllerAs: "v",
			bindToController: true
		};

		function coalesceWithState(scope, attrs, name)
		{
			if (attrs[name] === "")
			{
				scope.fromState[name] = true;
				scope[name] = StateManager.state[name];
			} else {
				scope[name] = attrs[name];	
			}
		}

		function link (scope, element, attrs)
		{
			scope.fromState = {};
			
			coalesceWithState(scope, attrs, "account");
			coalesceWithState(scope, attrs, "project");
			coalesceWithState(scope, attrs, "branch");
			coalesceWithState(scope, attrs, "revision");

			scope.name     = attrs.name;

			scope.init();
		}
	}

	ViewerCtrl.$inject = ["$scope", "$element", "StateManager", "EventService"];

	function ViewerCtrl ($scope, $element, StateManager, EventService)
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
			v.viewer.loadModel($scope.account, $scope.project, $scope.branch, $scope.revision);
		};
		
		$scope.init = function() {
			v.viewer = new Viewer($scope.name, $element[0], v.manager, eventCallback, errCallback);
			
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

		$scope.state = StateManager.state;

		var watchGroup = [];
		
		for(var stateVar in $scope.fromState)
		{
			if ($scope.fromState.hasOwnProperty(stateVar)) {
				watchGroup.push("state." + stateVar);
			}
		}
		
		$scope.$watchGroup(watchGroup, function(oldValue, newValue) {
			if (newValue.length)
			{
				$scope.account = $scope.fromState.account ? StateManager.state.account : $scope.account;
				$scope.project = $scope.fromState.project ? StateManager.state.project : $scope.project;
				$scope.branch = $scope.fromState.branch ? StateManager.state.branch : $scope.branch;			
				$scope.revision = $scope.fromState.revision ? StateManager.state.revision : $scope.revision;
			
				$scope.reload();
			}	
		});
				
		$scope.$watch(EventService.currentEvent, function(event) {
			if (event.type === EventService.EVENT.PROJECT_SETTINGS_READY)
			{
				if (event.value.account === $scope.account && event.value.project === $scope.project)
				{
					v.viewer.updateSettings(event.value.settings);
				}
			}
		});
	}
}());