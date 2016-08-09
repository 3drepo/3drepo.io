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

		vm.units = [
			{value: 'light-year', name: 'Light year'},
			{value: 'meter', name: 'meter'}
		];

		vm.mapTile = {};
		vm.projectName = $location.search().proj;


		UtilsService.doGet(vm.account + "/" + vm.projectName + ".json")
		.then(function (response) {
			//console.log(response);
			if (response.status === 200) {

				
			} else if (response.status === 401){

			}
		});

		vm.save = function(){
			console.log('Saving...');
		}
	}
}());
