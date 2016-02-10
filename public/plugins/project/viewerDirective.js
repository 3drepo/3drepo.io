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

	viewer.$inject = ["$compile", "StateManager"];

	function viewer($compile, StateManager) {
		return {
			restrict: "E",
			scope: {
				manager: "=",
				handle:  "@"
			},
			link: link,
			controller: ViewerCtrl,
			controllerAs: 'v',
			bindToController: true
		};

		function link (scope, element, attrs)
		{

			scope.account = angular.isUndefined(attrs.account) ?
							StateManager.state.account :
							attrs.account;

			scope.project = angular.isUndefined(attrs.project) ?
							StateManager.state.project :
							attrs.project;

			scope.branch  = angular.isUndefined(attrs.branch) ?
							StateManager.state.branch :
							attrs.branch;

			scope.revision = angular.isUndefined(attrs.revision) ?
							StateManager.state.revision :
							attrs.revision;

			scope.name     = angular.isUndefined(attrs.name) ?
							"viewer" : attrs.name;

		}
	}

	ViewerCtrl.$inject = ["$scope", "$element", "StateManager", "ViewerService"];

	function ViewerCtrl ($scope, $element, StateManager, ViewerService)
	{
		var v = this;
		var state = StateManager.state;

		$scope.viewer = v.manager.getDefaultViewer();
		ViewerService.init(v.manager, $scope.viewer);

		$scope.$watchGroup(["state.branch", "state.revision"], function() {
			ViewerService.loadModel();
		});

	}
}());