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
		.directive("bidProjectSummary", bidProjectSummary);

	function bidProjectSummary() {
		return {
			restrict: 'E',
			templateUrl: 'bidProjectSummary.html',
			scope: {},
			controller: BidProjectSummaryCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidProjectSummaryCtrl.$inject = ["$location", "Auth", "ProjectService"];

	function BidProjectSummaryCtrl($location, Auth, ProjectService) {
		var vm = this,
			promise;

		vm.Auth = Auth;

		// Get the project summary
		promise = ProjectService.getProjectSummary();
		promise.then(function (data) {
			vm.projectSummary = data.data;
		});

		vm.home = function () {
			$location.path("/" + Auth.username, "_self").search({});
		};
	}
}());
