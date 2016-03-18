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
		.directive("login", login);

	function login() {
		return {
			restrict: "EA",
			templateUrl: "login.html",
			scope: {},
			controller: LoginCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	LoginCtrl.$inject = ["$scope", "Auth", "EventService", "serverConfig"];

	function LoginCtrl($scope, Auth, EventService, serverConfig) {
		var vm = this;

		/*
		 * Init
		 */
		vm.user = { username: "", password: ""};
		vm.version = serverConfig.apiVersion;
		vm.backgroundImage = serverConfig.backgroundImage;
		vm.logo = "/public/images/3drepo-logo-white.png";
		//vm.enterpriseLogo = "/public/images/balfour-beatty-logo.jpg";

		/**
		 * Attempt to login
		 *
		 * @param {Object} event
		 */
		vm.login = function(event) {
			var enterKey = 13;

			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					Auth.login(vm.user.username, vm.user.password);
				}
			}
			else {
				Auth.login(vm.user.username, vm.user.password);
			}
		};

		/*
		 * Event watch
		 */
		$scope.$watch(EventService.currentEvent, function(event) {
			if (event.type === EventService.EVENT.USER_LOGGED_IN) {
				// Show an error message for incorrect login
				if (event.value.hasOwnProperty("error") && (event.value.error.place.indexOf("POST") !== -1)) {
					vm.errorMessage = event.value.error.message;
				}
			}
		});
	}
}());
