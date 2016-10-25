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
		.directive("accountProjectsetting", accountProjectsetting);

	function accountProjectsetting() {
		return {
			restrict: 'EA',
			templateUrl: 'accountProjectsetting.html',
			scope: {
				account: "=",
				showPage: "&",
				subscriptions: "="
			},
			controller: AccountProjectsettingCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProjectsettingCtrl.$inject = ["$scope", "$location", "UtilsService", "StateManager"];

	function AccountProjectsettingCtrl($scope, $location, UtilsService, StateManager) {
		var vm = this,
			promise;

		/**
		 * Go back to the repos page
		 */


		vm.goBack = function () {
			$location.search("project", null);
			vm.showPage({page: "repos"});
		};

		vm.units = server_config.units

		vm.mapTile = {};
		vm.projectName = $location.search().proj;


		UtilsService.doGet(vm.account + "/" + vm.projectName + ".json")
		.then(function (response) {

			if (response.status === 200 && response.data.properties) {

				if(response.data.properties.mapTile){

					response.data.properties.mapTile.lat && (vm.mapTile.lat = response.data.properties.mapTile.lat);
					response.data.properties.mapTile.lon && (vm.mapTile.lon = response.data.properties.mapTile.lon);
					response.data.properties.mapTile.y && (vm.mapTile.y = response.data.properties.mapTile.y);
					vm.projectType = response.data.type;
				}

				response.data.properties.unit && (vm.unit = response.data.properties.unit);
				vm.oldUnit = vm.unit;

			} else {
				vm.message = response.data.message;
			}


		});

		vm.save = function(){

			var data = {
				mapTile: vm.mapTile,
				unit: vm.unit
			};

			UtilsService.doPut(data, vm.account + "/" + vm.projectName +  "/settings")
			.then(function(response){
				if(response.status === 200){
					vm.message = 'Saved';
					vm.oldUnit = vm.unit;
				} else {
					vm.message = response.data.message;
				}


			})
		}
	}
}());
