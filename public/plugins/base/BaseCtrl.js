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

(function() {
	"use strict";

	angular.module("3drepo")
	.config([
	"$stateProvider",
	"$locationProvider",
	function($stateProvider, $locationProvider) {
		$stateProvider.state("base", {
			name : "base",
			resolve: {
				StateManager: "StateManager",
				init : function(StateManager) { StateManager.refresh("base"); }
			}
		});

		// Removes Angular's # at the end of the URL
		$locationProvider.html5Mode(true);
	}])
	.factory("BaseData", ["StateManager", "uiState", function(StateManager, uiState) {
		var o = {};

		o.refresh = function () {
			// In the base we reset all the UI components
			for (var uicomp in o.uiComps) {
				if (StateManager.ui.hasOwnProperty(uicomp)) {
					StateManager.ui[uicomp] = false;
				}
			}

			for (var statevar in StateManager.state) {
				if (StateManager.state.hasOwnProperty(statevar))
				{
					StateManager.state[statevar] = null;
				}
			}
		};

		o.uiComps = [];

		for(var k in uiState)
		{
			if (k.hasOwnProperty(k)) {
				for(var i = 0; i < uiState[k].length; i++)
				{
					var plugin = uiState[k][i];

					if (o.uiComps.indexOf(plugin) === -1)
					{
						o.uiComps.push(plugin);
					}
				}
			}
		}

		return o;
	}])
	.controller("BaseCtrl", ["$scope", "serverConfig", "StateManager", "Auth", "pageConfig", "$window", function($scope, serverConfig, StateManager, Auth, pageConfig, $window)
	{
		$scope.ui		= StateManager.ui;
		$scope.Data		= StateManager.Data;
		$scope.state	= StateManager.state;

		// This is used to update the information in the Auth service
		$scope.$watchGroup(["state.account", "state.project"], function() {
			// If the project has changed then we need to update the list of groups
			if ($scope.state.account && $scope.state.project)
			{
				Auth.loadProjectRoles($scope.state.account, $scope.state.project);
			}
		});

		$window.logoClick = function()
		{
			pageConfig.goDefault();
		};

		$scope.goAccount = function()
		{
			StateManager.setState({ "account" : Auth.username }, {"clearState" : true});
			StateManager.updateState();
		};

		$scope.$on("notAuthorized", function() {
			$scope.goAccount();
		});


		$scope.backgroundImage = serverConfig.backgroundImage;
	}])
	.run(["StateManager", function(StateManager) {
		StateManager.registerPlugin("base", "BaseData", function () {
			return "base"; // Always valid
		});
	}])

	// Inspired by Ben Lesh"s answer - http://stackoverflow.com/a/12936046/782358
	.factory("clickOutsideService", function ($document) {
		return function($scope, expr) {
			var clickCB = function() {
				$scope.$apply(expr);
			};

			$document.on("click", clickCB);

			$scope.$on("$destroy", function(){
				$document.off("click", clickCB);
			});
		};
	})

	.directive("clickOutside", function ($document, clickOutsideService) {
		return {
			restrict: "A",
			link: function(scope, element, attr) {
				var clickCB = function(event) {
					event.stopPropagation();
				};
				element.on("click", clickCB);

				scope.$on("$destroy", function(){
					element.off("click", clickCB);
				});

				clickOutsideService(scope, attr.clickOutside);
			}
		};
	});
}());
