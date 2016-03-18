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
		.directive("accountDir", accountDir);

	function accountDir() {
		return {
			restrict: "EA",
			templateUrl: "account.html",
			scope: {
				state: "=",
				account: "="
			},
			controller: AccountCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	AccountCtrl.$inject = ["$scope", "AccountService"];

	function AccountCtrl($scope, AccountService) {
		var vm = this,
			promise;

		console.log(vm);

		/*
		 * Get the account data
		 */
		$scope.$watch("vm.account", function()
		{
			if (vm.account)
			{
				promise = AccountService.getData(vm.account);
				promise.then(function (data) {
					vm.username        = data.username;
					vm.firstName       = data.firstName;
					vm.lastName        = data.lastName;
					vm.email           = data.email;
					vm.hasAvatar       = data.hasAvatar;
					vm.avatarURL       = data.avatarURL;
					vm.projectsGrouped = data.projectsGrouped;
				});
			} else {
				vm.username        = null;
				vm.firstName       = null;
				vm.lastName        = null;
				vm.email           = null;
				vm.projectsGrouped = null;
			}
		});
	}
}());
