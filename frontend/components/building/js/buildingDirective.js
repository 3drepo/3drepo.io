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
		.directive("building", building);

	function building() {
		return {
			restrict: "EA",
			templateUrl: "building.html",
			scope: {
				show: "=",
				visible: "=",
				onContentHeightRequest: "&"
			},
			controller: BuildingCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	BuildingCtrl.$inject = ["$scope", "$timeout", "EventService", "$http"];

	function BuildingCtrl($scope, $timeout, EventService, $http) {
		var vm = this;
		vm.meta = {};
		/*
		 * Init
		 */

		/*
		 * Watch for show/hide of card
		 */
		$scope.$watch("vm.show", function (newValue) {

		});

		/*
		 * Toggle the clipping plane
		 */
		$scope.$watch("vm.visible", function (newValue) {

		});




		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.VIEWER.OS_BUILDING_CLICK) {

				vm.testdata = event.value.id;
				var url = '/api/os/building-meta/' + event.value.id;
				$http.get(url)
					.then(
						function(data) {
							vm.meta = data.data;
						},
						function (err) {
							console.trace(err);
						}
					);
				}
		});
	}
}());
