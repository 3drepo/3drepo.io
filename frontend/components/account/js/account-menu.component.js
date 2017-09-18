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
		.component("accountMenu", {
			restrict: "EA",
			templateUrl: "templates/account-menu.html",
			controller: AccountMenuCtrl,
			controllerAs: "vm"
		});

	AccountMenuCtrl.$inject = ["AuthService", "EventService", "ViewerService"];

	function AccountMenuCtrl (AuthService, EventService, ViewerService) {
		var vm = this;


		vm.$onInit = function() {
			vm.userAccount = AuthService.getUsername();
		};
		
		/**
		 * Open menu
		 *
		 * @param $mdOpenMenu
		 * @param ev
		 */
		vm.openMenu = function ($mdOpenMenu, ev) {
			$mdOpenMenu(ev);
		};

		/**
		 * Show user models
		 */
		vm.showTeamspaces = function () {
			ViewerService.reset();
			EventService.send(EventService.EVENT.SHOW_TEAMSPACES);
		};

		/**
		 * Logout
		 */
		vm.logout = function () {
			AuthService.logout();
		};

		vm.openUserManual = function(){
			window.open("http://3drepo.org/models/3drepo-io-user-manual/", "_blank");
		};
	}
}());
