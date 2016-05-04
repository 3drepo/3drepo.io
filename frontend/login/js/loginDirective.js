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

	LoginCtrl.$inject = ["$scope", "$mdDialog", "Auth", "EventService", "serverConfig"];

	function LoginCtrl($scope, $mdDialog, Auth, EventService, serverConfig) {
		var vm = this,
			enterKey = 13;
		
		vm.captchaKey = "6LfSDR8TAAAAACBaw6FY5WdnqOP0nfv3z8­cALAI";

		/*
		 * Init
		 */
		vm.user = {username: "", password: ""};
		vm.register = {username: "", email: "", password: ""};
		vm.version = serverConfig.apiVersion;
		vm.logo = "/public/images/3drepo-logo-white.png";

		if (angular.isDefined(serverConfig.backgroundImage))
		{
			vm.enterpriseLogo = serverConfig.backgroundImage;
		}

		/**
		 * Attempt to login
		 *
		 * @param {Object} event
		 */
		vm.login = function(event) {
			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					Auth.login(vm.user.username, vm.user.password);
				}
			}
			else {
				Auth.login(vm.user.username, vm.user.password);
			}
		};
		
		/**
		 * Attempt to register
		 *
		 * @param {Object} event
		 */
		vm.register = function(event) {
			/*
			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					Auth.register(vm.register.username, vm.register.email, vm.register.password);
				}
			}
			else {
				Auth.register(vm.register.username, vm.register.email, vm.register.password);
			}
			*/
		};

		vm.showTC = function () {
			
			$mdDialog.show({
				controller: tcDialogController,
				templateUrl: "tcDialog.html",
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: removeDialog
			});
		};

		/**
		 * Close the dialog
		 */
		$scope.closeDialog = function() {
			$mdDialog.cancel();
		};

		/**
		 * Close the dialog by not clicking the close button
		 */
		function removeDialog () {
			$scope.closeDialog();
		}

		function tcDialogController() {
		}

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
