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
			restrict: 'EA',
			templateUrl: 'account.html',
			scope: {},
			controller: AccountCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountCtrl.$inject = ["AccountService"];

	function AccountCtrl(AccountService) {
		var vm = this,
			promise;

		/*
		 * Get the account data
		 */
		promise = AccountService.getData();
		promise.then(function (data) {
			if (data.statusText === "OK") {
				vm.username = data.data.username;
				vm.firstName = data.data.firstName;
				vm.lastName = data.data.lastName;
				vm.email = data.data.email;
				vm.projectsGrouped = data.data.projectsGrouped;
			}
		});
	}
}());
