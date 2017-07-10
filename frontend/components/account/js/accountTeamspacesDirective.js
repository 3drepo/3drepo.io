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
		.directive("accountTeamspaces", accountTeamspaces);

	function accountTeamspaces() {
		return {
			restrict: 'EA',
			templateUrl: 'accountTeamspaces.html',
			scope: {
				account: "=",
				accounts: "=",
				onShowPage: "&",
				quota: "=",
				subscriptions: "=",
				loading: "=",
				selectedIndex: "="
			},
			controller: AccountReposCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountReposCtrl.$inject = [];

	function AccountReposCtrl() {
		var vm = this;

		vm.showPage = function (page, callingPage, data) {
			vm.onShowPage({page: page, callingPage: callingPage, data: data});
		};

	}
}());
