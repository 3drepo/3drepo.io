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
		.directive("logout", logout);

	function logout() {
		return {
			restrict: 'EA',
			templateUrl: 'logout.html',
			scope: {},
			controller: LogoutCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	LogoutCtrl.$inject = ["$scope", "Auth", "StateManager"];

	function LogoutCtrl ($scope, Auth, StateManager) {
		var vm = this;

		vm.logout = function () {
			Auth.logout().then(
				function _logoutCtrlLogoutSuccess () {
					$scope.errorMessage = null;
					StateManager.state.account = null;
					StateManager.updateState();
				},
				function _logoutCtrlLogoutFailure (reason) {
					$scope.errorMessage = reason;
					StateManager.updateState();
				}
			);
		};
	}
}());
